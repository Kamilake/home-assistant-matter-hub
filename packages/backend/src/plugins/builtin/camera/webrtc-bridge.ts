import {
  type Connection,
  createConnection,
  createLongLivedTokenAuth,
} from "home-assistant-js-websocket";
import { RTCPeerConnection, type RTCRtpTransceiver } from "werift";

// Bridges an HA camera to a Matter controller. Both sides want to be the
// offerer, so we run two werift peers per session and forward the tracks.
// Experimental, not verified end to end.

export interface WebRtcBridgeConfig {
  /** HA base URL, e.g. http://homeassistant.local:8123 */
  haUrl: string;
  /** Long-lived access token for the HA connection. */
  haToken: string;
}

export interface MatterOffer {
  /** SDP offer to hand to the Matter controller (ProvideAnswer flow). */
  sdp: string;
  /** Local ICE candidates gathered for the controller peer. */
  iceCandidates: { candidate: string; sdpMid: string | null }[];
}

interface BridgeSession {
  entityId: string;
  haPeer: RTCPeerConnection;
  controllerPeer: RTCPeerConnection;
  haSessionId?: string;
}

export class WebRtcBridge {
  private connection?: Connection;
  private readonly sessions = new Map<number, BridgeSession>();

  constructor(private readonly config: WebRtcBridgeConfig) {}

  private async ha(): Promise<Connection> {
    if (this.connection) return this.connection;
    const auth = createLongLivedTokenAuth(
      this.config.haUrl,
      this.config.haToken,
    );
    this.connection = await createConnection({ auth });
    return this.connection;
  }

  // We offer to the controller; it answers. Pulls HA media first, then forwards.
  async startSession(
    matterSessionId: number,
    entityId: string,
  ): Promise<MatterOffer> {
    const haPeer = new RTCPeerConnection();
    const controllerPeer = new RTCPeerConnection();

    // Forward whatever HA sends us onto the controller peer.
    haPeer.onTrack.subscribe((track) => {
      const transceiver: RTCRtpTransceiver = controllerPeer.addTransceiver(
        track.kind,
        { direction: "sendonly" },
      );
      track.onReceiveRtp.subscribe((rtp) => transceiver.sender.sendRtp(rtp));
    });

    // 1) Offer to HA so HA answers and starts sending media to us.
    haPeer.addTransceiver("video", { direction: "recvonly" });
    haPeer.addTransceiver("audio", { direction: "recvonly" });
    const haOffer = await haPeer.createOffer();
    await haPeer.setLocalDescription(haOffer);
    const haAnswer = await this.requestHaWebRtc(entityId, haOffer.sdp);
    await haPeer.setRemoteDescription({ type: "answer", sdp: haAnswer });

    // 2) Build the controller-facing offer (controller will ProvideAnswer).
    const controllerOffer = await controllerPeer.createOffer();
    await controllerPeer.setLocalDescription(controllerOffer);

    const iceCandidates: { candidate: string; sdpMid: string | null }[] = [];
    controllerPeer.onIceCandidate.subscribe((c) => {
      if (c?.candidate)
        iceCandidates.push({
          candidate: c.candidate,
          sdpMid: c.sdpMid ?? null,
        });
    });

    this.sessions.set(matterSessionId, {
      entityId,
      haPeer,
      controllerPeer,
    });
    return { sdp: controllerOffer.sdp, iceCandidates };
  }

  // ProvideOffer flow: controller sent its offer. Pull HA media, answer it.
  // Returning the answer to the controller is the unverified Requestor path.
  async acceptControllerOffer(
    matterSessionId: number,
    entityId: string,
    controllerOfferSdp: string,
  ): Promise<string> {
    const haPeer = new RTCPeerConnection();
    const controllerPeer = new RTCPeerConnection();
    haPeer.onTrack.subscribe((track) => {
      const transceiver = controllerPeer.addTransceiver(track.kind, {
        direction: "sendonly",
      });
      track.onReceiveRtp.subscribe((rtp) => transceiver.sender.sendRtp(rtp));
    });
    this.sessions.set(matterSessionId, { entityId, haPeer, controllerPeer });

    // Pull media from HA (we offer, HA answers).
    haPeer.addTransceiver("video", { direction: "recvonly" });
    haPeer.addTransceiver("audio", { direction: "recvonly" });
    const haOffer = await haPeer.createOffer();
    await haPeer.setLocalDescription(haOffer);
    const haAnswer = await this.requestHaWebRtc(entityId, haOffer.sdp);
    await haPeer.setRemoteDescription({ type: "answer", sdp: haAnswer });

    // Answer the controller's offer.
    await controllerPeer.setRemoteDescription({
      type: "offer",
      sdp: controllerOfferSdp,
    });
    const answer = await controllerPeer.createAnswer();
    await controllerPeer.setLocalDescription(answer);
    return answer.sdp;
  }

  /** Apply the Matter controller's SDP answer to the controller peer. */
  async acceptControllerAnswer(
    matterSessionId: number,
    sdp: string,
  ): Promise<void> {
    const session = this.sessions.get(matterSessionId);
    if (!session) return;
    await session.controllerPeer.setRemoteDescription({ type: "answer", sdp });
  }

  /** Add a remote ICE candidate from the Matter controller. */
  async addControllerIceCandidate(
    matterSessionId: number,
    candidate: string,
    sdpMid: string | null,
  ): Promise<void> {
    const session = this.sessions.get(matterSessionId);
    if (!session) return;
    await session.controllerPeer.addIceCandidate({
      candidate,
      sdpMid: sdpMid ?? undefined,
    });
  }

  async endSession(matterSessionId: number): Promise<void> {
    const session = this.sessions.get(matterSessionId);
    if (!session) return;
    this.sessions.delete(matterSessionId);
    await session.haPeer.close();
    await session.controllerPeer.close();
    // Tell HA to stop the stream if we tracked an HA session id.
    if (session.haSessionId) {
      try {
        const conn = await this.ha();
        await conn.sendMessagePromise({
          type: "camera/webrtc/candidate",
          entity_id: session.entityId,
          session_id: session.haSessionId,
          candidate: { candidate: "" },
        });
      } catch {
        // best effort
      }
    }
  }

  // Grab a still JPEG via HA's camera proxy (for CaptureSnapshot).
  async snapshot(entityId: string): Promise<Uint8Array> {
    const url = `${this.config.haUrl}/api/camera_proxy/${entityId}`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${this.config.haToken}` },
    });
    if (!res.ok) {
      throw new Error(`HA camera_proxy ${entityId}: ${res.status}`);
    }
    return new Uint8Array(await res.arrayBuffer());
  }

  async close(): Promise<void> {
    for (const id of [...this.sessions.keys()]) {
      await this.endSession(id);
    }
    this.connection?.close();
    this.connection = undefined;
  }

  // Offer to HA's WebRTC, resolve on the first answer event off the same sub.
  private async requestHaWebRtc(
    entityId: string,
    offerSdp: string,
  ): Promise<string> {
    const conn = await this.ha();
    return new Promise<string>((resolve, reject) => {
      let settled = false;
      conn
        .subscribeMessage(
          (msg: { type?: string; answer?: string; session_id?: string }) => {
            if (msg.type === "answer" && msg.answer && !settled) {
              settled = true;
              const session = [...this.sessions.values()].find(
                (s) => s.entityId === entityId,
              );
              if (session && msg.session_id) {
                session.haSessionId = msg.session_id;
              }
              resolve(msg.answer);
            }
          },
          { type: "camera/webrtc/offer", entity_id: entityId, offer: offerSdp },
        )
        .catch(reject);
    });
  }
}
