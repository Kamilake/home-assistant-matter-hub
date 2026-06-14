import { Logger } from "@matter/general";
import { createCameraEndpointType } from "./camera-endpoint.js";
import type { MatterHubPlugin, PluginContext } from "./plugin-contract.js";
import { WebRtcBridge } from "./webrtc-bridge.js";

interface CameraPluginConfig {
  haUrl?: string;
  haToken?: string;
  // Comma-separated HA camera entity ids, e.g. "camera.front,camera.garage".
  cameras?: string;
}

// Exposes HA cameras as Matter Cameras via the plugin custom-endpoint hook.
// Experimental: the WebRTC media path is unverified (see README).
export default class CameraPlugin implements MatterHubPlugin {
  readonly name = "@home-assistant-matter-hub/plugin-camera";
  readonly version = "0.0.0";

  private readonly log = Logger.get("CameraPlugin");
  private bridge?: WebRtcBridge;

  constructor(private readonly config: CameraPluginConfig) {}

  async onStart(context: PluginContext): Promise<void> {
    const { haUrl, haToken, cameras } = this.config;
    if (!haUrl || !haToken) {
      this.log.warn("haUrl and haToken are required, no cameras exposed");
      return;
    }
    this.bridge = new WebRtcBridge({ haUrl, haToken });

    const entityIds = (cameras ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    for (const entityId of entityIds) {
      await context.registerDevice({
        id: entityId.replace(/\./g, "_"),
        name: entityId,
        endpointType: createCameraEndpointType(this.bridge, entityId),
        clusters: [],
      });
    }
  }

  async onShutdown(): Promise<void> {
    await this.bridge?.close();
    this.bridge = undefined;
  }

  getConfigSchema() {
    return {
      title: "Camera Plugin",
      description: "Expose Home Assistant cameras as Matter cameras.",
      properties: {
        haUrl: { type: "string", title: "Home Assistant URL", required: true },
        haToken: {
          type: "string",
          title: "Long-lived access token",
          required: true,
        },
        cameras: {
          type: "string",
          title: "Camera entity ids (comma-separated)",
        },
      },
    };
  }
}
