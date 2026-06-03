import {
  type ClimateDeviceAttributes,
  ClimateHvacMode,
  type HomeAssistantEntityState,
} from "@home-assistant-matter-hub/common";
import { describe, expect, it } from "vitest";
import {
  isFanOnly,
  pickRestoreMode,
} from "./climate-companion-fan-control-server.js";

function state(hvacState: ClimateHvacMode): HomeAssistantEntityState {
  return {
    entity_id: "climate.test",
    state: hvacState,
    context: { id: "ctx" },
    last_changed: "x",
    last_updated: "x",
    attributes: {} as ClimateDeviceAttributes,
  };
}

describe("pickRestoreMode (#309 companion fan)", () => {
  it("prefers cool over heat and the rest", () => {
    expect(
      pickRestoreMode([
        ClimateHvacMode.off,
        ClimateHvacMode.cool,
        ClimateHvacMode.heat,
        ClimateHvacMode.fan_only,
      ]),
    ).toBe(ClimateHvacMode.cool);
  });

  it("falls back to heat when cool is absent", () => {
    expect(
      pickRestoreMode([
        ClimateHvacMode.off,
        ClimateHvacMode.heat,
        ClimateHvacMode.fan_only,
      ]),
    ).toBe(ClimateHvacMode.heat);
  });

  it("uses heat_cool when neither cool nor heat is present", () => {
    expect(
      pickRestoreMode([
        ClimateHvacMode.off,
        ClimateHvacMode.heat_cool,
        ClimateHvacMode.fan_only,
      ]),
    ).toBe(ClimateHvacMode.heat_cool);
  });

  it("never returns off or fan_only", () => {
    expect(
      pickRestoreMode([
        ClimateHvacMode.off,
        ClimateHvacMode.dry,
        ClimateHvacMode.fan_only,
      ]),
    ).toBe(ClimateHvacMode.dry);
  });

  it("falls back to cool for an empty or fan-only-only list", () => {
    expect(pickRestoreMode([])).toBe(ClimateHvacMode.cool);
    expect(pickRestoreMode(undefined)).toBe(ClimateHvacMode.cool);
    expect(
      pickRestoreMode([ClimateHvacMode.off, ClimateHvacMode.fan_only]),
    ).toBe(ClimateHvacMode.cool);
  });
});

describe("isFanOnly (#309 companion fan)", () => {
  it("is true only while the AC is in fan_only", () => {
    expect(isFanOnly(state(ClimateHvacMode.fan_only))).toBe(true);
    expect(isFanOnly(state(ClimateHvacMode.cool))).toBe(false);
    expect(isFanOnly(state(ClimateHvacMode.off))).toBe(false);
    expect(isFanOnly(state(ClimateHvacMode.auto))).toBe(false);
  });
});
