import {
  type HomeAssistantDeviceRegistry,
  type HomeAssistantEntityRegistry,
  type HomeAssistantEntityState,
  SensorDeviceClass,
} from "@home-assistant-matter-hub/common";
import { describe, expect, it } from "vitest";
import type { HomeAssistantRegistry } from "../home-assistant/home-assistant-registry.js";
import type { BridgeDataProvider } from "./bridge-data-provider.js";
import { BridgeRegistry } from "./bridge-registry.js";

const deviceId = "device-1";

function device(): HomeAssistantDeviceRegistry {
  return {
    id: deviceId,
    identifiers: [],
    name: "Device",
    labels: [],
  } as unknown as HomeAssistantDeviceRegistry;
}

function registryEntity(entityId: string): HomeAssistantEntityRegistry {
  return {
    area_id: null,
    categories: {},
    device_id: deviceId,
    disabled_by: null,
    entity_category: null,
    entity_id: entityId,
    has_entity_name: false,
    hidden_by: null,
    id: entityId,
    labels: [],
    name: null,
    original_name: entityId,
    platform: "test",
    translation_key: null,
    unique_id: entityId,
  } as unknown as HomeAssistantEntityRegistry;
}

function state(
  entityId: string,
  value: string,
  attributes: Record<string, unknown>,
): HomeAssistantEntityState {
  return {
    entity_id: entityId,
    state: value,
    attributes,
    context: { id: "ctx" },
    last_changed: "2026-01-01T00:00:00",
    last_updated: "2026-01-01T00:00:00",
  };
}

function sut(states: Record<string, HomeAssistantEntityState>) {
  const entities = Object.fromEntries(
    Object.keys(states).map((entityId) => [entityId, registryEntity(entityId)]),
  );
  const registry = {
    areas: new Map(),
    devices: { [deviceId]: device() },
    entities,
    labels: [],
    states,
  } as unknown as HomeAssistantRegistry;
  const dataProvider = {
    featureFlags: { autoBatteryMapping: true },
    filter: { include: [], exclude: [], includeMode: "any" },
  } as unknown as BridgeDataProvider;

  return new BridgeRegistry(registry, dataProvider);
}

describe("BridgeRegistry battery mapping", () => {
  it("skips numeric battery sensors whose current state is not resolvable", () => {
    const registry = sut({
      "sensor.battery_level": state("sensor.battery_level", "Unknown", {
        device_class: SensorDeviceClass.battery,
      }),
    });

    expect(registry.findBatteryEntityForDevice(deviceId)).toBeUndefined();
  });

  it("uses a same-device enum battery sensor when no numeric value is available", () => {
    const registry = sut({
      "sensor.battery_level": state("sensor.battery_level", "Unknown", {
        device_class: SensorDeviceClass.battery,
      }),
      "sensor.battery": state("sensor.battery", "full", {
        device_class: "enum",
      }),
    });

    expect(registry.findBatteryEntityForDevice(deviceId)).toBe(
      "sensor.battery",
    );
  });

  it("keeps valid numeric battery sensors preferred over enum fallback", () => {
    const registry = sut({
      "sensor.battery_level": state("sensor.battery_level", "74", {
        device_class: SensorDeviceClass.battery,
      }),
      "sensor.battery": state("sensor.battery", "full", {
        device_class: "enum",
      }),
    });

    expect(registry.findBatteryEntityForDevice(deviceId)).toBe(
      "sensor.battery_level",
    );
  });

  it("keeps binary battery fallback", () => {
    const registry = sut({
      "binary_sensor.low_battery": state("binary_sensor.low_battery", "off", {
        device_class: "battery",
      }),
    });

    expect(registry.findBatteryEntityForDevice(deviceId)).toBe(
      "binary_sensor.low_battery",
    );
  });
});
