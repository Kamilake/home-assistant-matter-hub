import type { MaybePromise } from "@matter/general";
import { EndpointNumber, FabricIndex, NodeId } from "@matter/main";
import { WebRtcTransportProviderServer } from "@matter/main/behaviors";
import type { WebRtcTransportProvider } from "@matter/main/clusters";
import { StreamUsage } from "@matter/types";
import type { WebRtcBridge } from "./webrtc-bridge.js";

// The 5 WebRtcTransportProvider commands, media delegated to WebRtcBridge.
// provideOffer is wired; solicitOffer's deferred-offer push is unverified.
export class CameraWebRtcProviderServer extends WebRtcTransportProviderServer {
  declare state: CameraWebRtcProviderServer.State;

  override solicitOffer(
    request: WebRtcTransportProvider.SolicitOfferRequest,
  ): MaybePromise<WebRtcTransportProvider.SolicitOfferResponse> {
    const id = this.state.nextSessionId++;
    this.trackSession(id, request.streamUsage, request.originatingEndpointId);
    // deferredOffer: the offer is delivered later via WebRtcTransportRequestor
    // (camera -> controller). That client-side push is not wired yet.
    void this.state.bridge
      .startSession(id, this.state.entityId)
      .catch(() => {});
    return { webRtcSessionId: id, deferredOffer: true };
  }

  override async provideOffer(
    request: WebRtcTransportProvider.ProvideOfferRequest,
  ): Promise<WebRtcTransportProvider.ProvideOfferResponse> {
    const id = request.webRtcSessionId ?? this.state.nextSessionId++;
    if (request.webRtcSessionId == null) {
      this.trackSession(
        id,
        request.streamUsage ?? StreamUsage.LiveView,
        request.originatingEndpointId ?? EndpointNumber(0),
      );
    }
    const answerSdp = await this.state.bridge.acceptControllerOffer(
      id,
      this.state.entityId,
      request.sdp,
    );
    // Spec returns the answer via the Requestor side, which matter.js does not
    // model here. The bridge holds it; this delivery path is unverified.
    void answerSdp;
    return { webRtcSessionId: id };
  }

  override provideAnswer(
    request: WebRtcTransportProvider.ProvideAnswerRequest,
  ): MaybePromise {
    return this.state.bridge.acceptControllerAnswer(
      request.webRtcSessionId,
      request.sdp,
    );
  }

  override async provideIceCandidates(
    request: WebRtcTransportProvider.ProvideIceCandidatesRequest,
  ): Promise<void> {
    for (const c of request.iceCandidates) {
      await this.state.bridge.addControllerIceCandidate(
        request.webRtcSessionId,
        c.candidate,
        c.sdpMid,
      );
    }
  }

  override async endSession(
    request: WebRtcTransportProvider.EndSessionRequest,
  ): Promise<void> {
    await this.state.bridge.endSession(request.webRtcSessionId);
    this.state.currentSessions = this.state.currentSessions.filter(
      (s) => s.id !== request.webRtcSessionId,
    );
  }

  private trackSession(
    id: number,
    streamUsage: StreamUsage,
    peerEndpointId: EndpointNumber,
  ): void {
    // Commands run online, so a session exists; read it structurally because
    // the public context type also covers the offline case.
    const session = (
      this.context as unknown as {
        session?: {
          peerNodeId?: NodeId;
          associatedFabric?: { fabricIndex: FabricIndex };
        };
      }
    ).session;
    this.state.currentSessions = [
      ...this.state.currentSessions,
      {
        id,
        peerNodeId: session?.peerNodeId ?? NodeId(0),
        peerEndpointId,
        streamUsage,
        metadataEnabled: false,
        fabricIndex: session?.associatedFabric?.fabricIndex ?? FabricIndex(0),
      },
    ];
  }
}

export namespace CameraWebRtcProviderServer {
  export class State extends WebRtcTransportProviderServer.State {
    bridge!: WebRtcBridge;
    entityId!: string;
    nextSessionId = 1;
  }
}
