# Standalone Devices

A standalone device is a single Home Assistant entity exposed as its own Matter device, with its own pairing code, instead of living inside a bridge. Some controllers (for example Apple Home with robot vacuums) handle a device better when it is not presented as a bridged child, so this gives each device a clean, independent identity.

Under the hood a standalone device is a bridge running in Server Mode that holds exactly one entity. The Standalone Devices page turns that into a simple per device workflow, and it works for any supported device type, not only robot vacuums. See [Supported Device Types](../supported-device-types.md) for the full list.

## When to use it

- A device type that a controller only handles well when it is not bridged, such as a robot vacuum in Apple Home.
- You want one entity to pair as its own Matter device with its own QR code.
- You want to keep a device separate from your main bridge.

A normal bridge is still the right choice for exposing many entities together behind a single pairing code.

## Create a standalone device

1. Open the web UI and go to **Standalone Devices** in the navigation.
2. Click **Add device**.
3. Enter a name and pick exactly one entity.
4. Click **Create**. A free Matter port is assigned automatically.

The new device appears in the list with its current status.

## Pair the device

1. In the list, open the device with the launch icon to see its details.
2. Scan the QR code, or type the manual pairing code, in your controller (Apple Home, Alexa, Google Home).

Each standalone device has its own pairing code, so you add it to your controller like any other Matter device.

## Notes and limits

- One entity per device. To expose more entities, create more standalone devices or use a normal bridge.
- Each device uses its own Matter port, assigned automatically when you create it.
- Deleting a standalone device removes its bridge, which unpairs it from your controllers.

## Relation to Server Mode

Standalone devices use the same Server Mode that powers single device bridges. You can still enable Server Mode by hand on a bridge through the bridge configuration if you prefer. The Standalone Devices page is just the simpler, device first way to do the same thing.
