import { CameraDevice } from "@matter/main/devices";
import { StreamUsage } from "@matter/types";
import { CameraAvStreamServer } from "./av-stream-server.js";
import type { WebRtcBridge } from "./webrtc-bridge.js";
import { CameraWebRtcProviderServer } from "./webrtc-provider-server.js";

// Builds the Matter Camera (0x0142) endpoint and injects the bridge + entity id.
// The capability defaults below are sane guesses, not verified on a controller.
export function createCameraEndpointType(
  bridge: WebRtcBridge,
  entityId: string,
) {
  return CameraDevice.with(
    CameraAvStreamServer,
    CameraWebRtcProviderServer,
  ).set({
    webRtcTransportProvider: {
      bridge,
      entityId,
      currentSessions: [],
      nextSessionId: 1,
    },
    cameraAvStreamManagement: {
      bridge,
      entityId,
      supportedStreamUsages: [StreamUsage.LiveView],
      streamUsagePriorities: [StreamUsage.LiveView],
      allocatedVideoStreams: [],
      allocatedAudioStreams: [],
      allocatedSnapshotStreams: [],
      maxConcurrentEncoders: 1,
      maxEncodedPixelRate: 3840 * 2160 * 30,
      maxNetworkBandwidth: 20000,
      currentFrameRate: 0,
      nextVideoStreamId: 1,
      nextAudioStreamId: 1,
      nextSnapshotStreamId: 1,
    },
  });
}
