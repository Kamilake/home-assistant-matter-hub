import {
  type ClimateDeviceAttributes,
  ClimateHvacMode,
  type HomeAssistantEntityState,
} from "@home-assistant-matter-hub/common";
import type { Agent } from "@matter/main";
import {
  FanControlServer,
  type FanControlServerConfig,
} from "../../../../behaviors/fan-control-server.js";
import { HomeAssistantEntityBehavior } from "../../../../behaviors/home-assistant-entity-behavior.js";
import { OnOffServer } from "../../../../behaviors/on-off-server.js";

const attributes = (entity: HomeAssistantEntityState) =>
  entity.attributes as ClimateDeviceAttributes;

// Preference order for the hvac_mode to restore when the companion Fan is
// switched off: a real operating mode, never off or fan_only.
const restoreModePreference: ClimateHvacMode[] = [
  ClimateHvacMode.cool,
  ClimateHvacMode.heat,
  ClimateHvacMode.heat_cool,
  ClimateHvacMode.auto,
  ClimateHvacMode.dry,
];

/** Pick the hvac_mode to restore when the Fan is turned off. Exported for tests. */
export function pickRestoreMode(
  hvacModes: ClimateHvacMode[] | undefined,
): ClimateHvacMode {
  const modes = hvacModes ?? [];
  for (const mode of restoreModePreference) {
    if (modes.includes(mode)) {
      return mode;
    }
  }
  const fallback = modes.find(
    (mode) => mode !== ClimateHvacMode.off && mode !== ClimateHvacMode.fan_only,
  );
  return fallback ?? ClimateHvacMode.cool;
}

/** The companion Fan reads on only while the AC is in fan_only. Exported for tests. */
export function isFanOnly(state: HomeAssistantEntityState): boolean {
  return state.state === ClimateHvacMode.fan_only;
}

function restoreModeFromAgent(agent: Agent): ClimateHvacMode {
  const entity = agent.get(HomeAssistantEntityBehavior).entity;
  return pickRestoreMode(attributes(entity.state).hvac_modes);
}

const config: FanControlServerConfig = {
  getPercentage: () => undefined,
  getStepSize: () => undefined,
  getAirflowDirection: () => undefined,
  isInAutoMode: (entity) =>
    attributes(entity).fan_mode?.toLowerCase() === "auto",
  getPresetModes: (entity) => attributes(entity).fan_modes ?? [],
  // Only report a current speed while in fan_only, so the Fan tile reads off
  // while the AC heats or cools and the two tiles do not contradict.
  getCurrentPresetMode: (entity) =>
    isFanOnly(entity) ? (attributes(entity).fan_mode ?? undefined) : undefined,
  supportsPercentage: () => false,
  // Swing stays on the AC tile; do not duplicate oscillation here.
  isOscillating: () => false,
  supportsOscillation: () => false,
  getWindMode: () => undefined,
  supportsWind: () => false,

  // Fan on/off (including speed-zero) mirrors the OnOff cluster below:
  // on => fan_only, off => restore a real mode so the AC keeps running.
  turnOff: (_value, agent) => ({
    action: "climate.set_hvac_mode",
    data: { hvac_mode: restoreModeFromAgent(agent) },
  }),
  turnOn: () => ({
    action: "climate.set_hvac_mode",
    data: { hvac_mode: ClimateHvacMode.fan_only },
  }),
  setAutoMode: () => ({
    action: "climate.set_fan_mode",
    data: { fan_mode: "auto" },
  }),
  setAirflowDirection: () => ({ action: "homeassistant.turn_on" }),
  // Speed change: set the AC fan_mode without leaving fan_only.
  setPresetMode: (presetMode) => ({
    action: "climate.set_fan_mode",
    data: { fan_mode: presetMode },
  }),
  setOscillation: () => ({ action: "homeassistant.turn_on" }),
  setWindMode: () => ({ action: "homeassistant.turn_on" }),
};

// OnOff cluster owns the fan_only operation (the actual reporter intent in
// #309): on => climate.set_hvac_mode fan_only, off => restore a real mode.
export const ClimateCompanionFanOnOffServer = OnOffServer({
  isOn: (entity) => isFanOnly(entity),
  turnOn: () => ({
    action: "climate.set_hvac_mode",
    data: { hvac_mode: ClimateHvacMode.fan_only },
  }),
  turnOff: (_value, agent) => ({
    action: "climate.set_hvac_mode",
    data: { hvac_mode: restoreModeFromAgent(agent) },
  }),
});

const features: ("MultiSpeed" | "Step" | "Auto")[] = [
  "MultiSpeed",
  "Step",
  "Auto",
];

export function ClimateCompanionFanControlServer() {
  return FanControlServer(config).with(...features);
}
