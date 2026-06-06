import {
  type ClimateDeviceAttributes,
  ClimateHvacMode,
  type HomeAssistantEntityState,
} from "@home-assistant-matter-hub/common";
import { describe, expect, it } from "vitest";
import {
  fanOffAction,
  isFanOnly,
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

describe("fanOffAction (#309 companion fan)", () => {
  it("turns the AC off instead of forcing a cooling mode", () => {
    expect(fanOffAction()).toEqual({ action: "climate.turn_off" });
  });

  it("never switches the AC into a cooling or heating mode", () => {
    const action = fanOffAction();
    expect(action.action).not.toBe("climate.set_hvac_mode");
    expect(action.data).toBeUndefined();
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
