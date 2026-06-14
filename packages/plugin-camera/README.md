# Camera plugin (experimental)

Exposes a Home Assistant camera as a Matter Camera (0x0142) by bridging HA/go2rtc
WebRTC to the Matter `WebRtcTransportProvider`. Built on the HAMH plugin
custom-endpoint hook (`PluginDevice.endpointType`).

## Status: experimental, not verified working

This compiles against the pinned matter.js 0.17.2 and loads as a plugin. The
actual media path is **not** end-to-end tested:

- As of mid-2026 only **SmartThings** renders Matter cameras. Apple Home, Google
  Home and Alexa have announced support but not shipped it, so there is no way to
  validate this without a SmartThings hub plus a real camera.
- HA and the Matter controller each expect the *other* side to send the WebRTC
  offer, so media cannot be raw-relayed. The plugin runs two `werift` peers per
  session (one to HA, one to the controller) and forwards tracks. That relay, the
  SDP/ICE negotiation, and the deferred-offer path (which needs the
  `WebRtcTransportRequestor` client cluster) are unproven.

Treat this as a starting point to debug on hardware, not a finished feature.

## Config

| Key | Description |
|-----|-------------|
| `haUrl` | Home Assistant base URL (the plugin opens its own connection) |
| `haToken` | Long-lived access token |
| `cameras` | Comma-separated camera entity ids |

## Matter version

Uses `@matter/*` as peerDependencies pinned to 0.17.2. They must resolve to the
same matter.js instance HAMH runs, or the endpoint is rejected.
