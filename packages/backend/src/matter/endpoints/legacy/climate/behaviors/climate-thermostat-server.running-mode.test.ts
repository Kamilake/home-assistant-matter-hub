import {
  type ClimateDeviceAttributes,
  ClimateHvacAction,
  ClimateHvacMode,
  type HomeAssistantEntityState,
} from "@home-assistant-matter-hub/common";
import { Thermostat } from "@matter/main/clusters";
import { describe, expect, it } from "vitest";
import {
  getRunningModeFromHvacAction,
  hvacActionToRunningMode,
} from "./climate-thermostat-server.js";

const RM = Thermostat.ThermostatRunningMode;

function entity(
  action: ClimateHvacAction | undefined,
): HomeAssistantEntityState {
  return {
    entity_id: "climate.test",
    state: ClimateHvacMode.auto,
    context: { id: "ctx" },
    last_changed: "x",
    last_updated: "x",
    attributes: {
      hvac_action: action,
      hvac_modes: [ClimateHvacMode.cool, ClimateHvacMode.off],
    } as ClimateDeviceAttributes,
  };
}

describe("getRunningModeFromHvacAction (#309)", () => {
  it("maps cooling to Cool", () => {
    expect(
      getRunningModeFromHvacAction(entity(ClimateHvacAction.cooling)),
    ).toBe(RM.Cool);
  });

  it("maps heating, preheating and defrosting to Heat", () => {
    for (const action of [
      ClimateHvacAction.heating,
      ClimateHvacAction.preheating,
      ClimateHvacAction.defrosting,
    ]) {
      expect(getRunningModeFromHvacAction(entity(action))).toBe(RM.Heat);
    }
  });

  it("maps drying, fan, idle and off to Off", () => {
    for (const action of [
      ClimateHvacAction.drying,
      ClimateHvacAction.fan,
      ClimateHvacAction.idle,
      ClimateHvacAction.off,
    ]) {
      expect(getRunningModeFromHvacAction(entity(action))).toBe(RM.Off);
    }
  });

  it("returns Off when hvac_action is absent (IR/SmartIR ACs, jan666 case)", () => {
    expect(getRunningModeFromHvacAction(entity(undefined))).toBe(RM.Off);
  });

  it("has a mapping for every ClimateHvacAction value", () => {
    for (const action of Object.values(ClimateHvacAction)) {
      expect(hvacActionToRunningMode[action]).toBeDefined();
    }
  });
});
