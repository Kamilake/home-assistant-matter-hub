import type { MaybePromise } from "@matter/general";
import { CameraAvStreamManagementServer } from "@matter/main/behaviors";
import { CameraAvStreamManagement } from "@matter/main/clusters";
import type { WebRtcBridge } from "./webrtc-bridge.js";

const Base = CameraAvStreamManagementServer.with("Video", "Audio", "Snapshot");

// The 8 CameraAvStreamManagement commands. Allocation is just bookkeeping (the
// real media comes from HA over WebRTC); captureSnapshot pulls a JPEG from HA.
export class CameraAvStreamServer extends Base {
  declare state: CameraAvStreamServer.State;

  override setStreamPriorities(
    request: CameraAvStreamManagement.SetStreamPrioritiesRequest,
  ): MaybePromise {
    this.state.streamUsagePriorities = request.streamPriorities;
  }

  override videoStreamAllocate(
    request: CameraAvStreamManagement.VideoStreamAllocateRequest,
  ): MaybePromise<CameraAvStreamManagement.VideoStreamAllocateResponse> {
    const videoStreamId = this.state.nextVideoStreamId++;
    this.state.allocatedVideoStreams = [
      ...this.state.allocatedVideoStreams,
      {
        videoStreamId,
        streamUsage: request.streamUsage,
        videoCodec: request.videoCodec,
        minFrameRate: request.minFrameRate,
        maxFrameRate: request.maxFrameRate,
        minResolution: request.minResolution,
        maxResolution: request.maxResolution,
        minBitRate: request.minBitRate,
        maxBitRate: request.maxBitRate,
        keyFrameInterval: request.keyFrameInterval,
        watermarkEnabled: request.watermarkEnabled,
        osdEnabled: request.osdEnabled,
        referenceCount: 1,
      },
    ];
    return { videoStreamId };
  }

  override videoStreamDeallocate(
    request: CameraAvStreamManagement.VideoStreamDeallocateRequest,
  ): MaybePromise {
    this.state.allocatedVideoStreams = this.state.allocatedVideoStreams.filter(
      (s) => s.videoStreamId !== request.videoStreamId,
    );
  }

  override audioStreamAllocate(
    request: CameraAvStreamManagement.AudioStreamAllocateRequest,
  ): MaybePromise<CameraAvStreamManagement.AudioStreamAllocateResponse> {
    const audioStreamId = this.state.nextAudioStreamId++;
    this.state.allocatedAudioStreams = [
      ...this.state.allocatedAudioStreams,
      {
        audioStreamId,
        streamUsage: request.streamUsage,
        audioCodec: request.audioCodec,
        channelCount: request.channelCount,
        sampleRate: request.sampleRate,
        bitRate: request.bitRate,
        bitDepth: request.bitDepth,
        referenceCount: 1,
      },
    ];
    return { audioStreamId };
  }

  override audioStreamDeallocate(
    request: CameraAvStreamManagement.AudioStreamDeallocateRequest,
  ): MaybePromise {
    this.state.allocatedAudioStreams = this.state.allocatedAudioStreams.filter(
      (s) => s.audioStreamId !== request.audioStreamId,
    );
  }

  override snapshotStreamAllocate(
    request: CameraAvStreamManagement.SnapshotStreamAllocateRequest,
  ): MaybePromise<CameraAvStreamManagement.SnapshotStreamAllocateResponse> {
    const snapshotStreamId = this.state.nextSnapshotStreamId++;
    this.state.allocatedSnapshotStreams = [
      ...this.state.allocatedSnapshotStreams,
      {
        snapshotStreamId,
        imageCodec: request.imageCodec,
        frameRate: request.maxFrameRate,
        minResolution: request.minResolution,
        maxResolution: request.maxResolution,
        quality: request.quality,
        referenceCount: 1,
        encodedPixels: false,
        hardwareEncoder: false,
      },
    ];
    return { snapshotStreamId };
  }

  override snapshotStreamDeallocate(
    request: CameraAvStreamManagement.SnapshotStreamDeallocateRequest,
  ): MaybePromise {
    this.state.allocatedSnapshotStreams =
      this.state.allocatedSnapshotStreams.filter(
        (s) => s.snapshotStreamId !== request.snapshotStreamId,
      );
  }

  override async captureSnapshot(
    request: CameraAvStreamManagement.CaptureSnapshotRequest,
  ): Promise<CameraAvStreamManagement.CaptureSnapshotResponse> {
    const data = await this.state.bridge.snapshot(this.state.entityId);
    return {
      data,
      imageCodec: CameraAvStreamManagement.ImageCodec.Jpeg,
      resolution: request.requestedResolution,
    };
  }
}

export namespace CameraAvStreamServer {
  export class State extends Base.State {
    bridge!: WebRtcBridge;
    entityId!: string;
    nextVideoStreamId = 1;
    nextAudioStreamId = 1;
    nextSnapshotStreamId = 1;
  }
}
