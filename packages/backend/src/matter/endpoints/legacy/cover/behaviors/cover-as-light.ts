import {
  type CoverDeviceAttributes,
  CoverDeviceState,
  CoverSupportedFeatures,
  type HomeAssistantEntityState,
} from "@home-assistant-matter-hub/common";
import type { Agent } from "@matter/main";
import { GroupsServer, ScenesManagementServer } from "@matter/main/behaviors";
import { DimmableLightDevice } from "@matter/main/devices";
import type { HomeAssistantAction } from "../../../../../services/home-assistant/home-assistant-actions.js";
import { BasicInformationServer } from "../../../../behaviors/basic-information-server.js";
import { HomeAssistantEntityBehavior } from "../../../../behaviors/home-assistant-entity-behavior.js";
import { IdentifyServer } from "../../../../behaviors/identify-server.js";
import { LevelControlServer } from "../../../../behaviors/level-control-server.js";
import { OnOffServer } from "../../../../behaviors/on-off-server.js";
import { DefaultPowerSourceServer } from "../../../../behaviors/power-source-server.js";

// Cover exposed as a Dimmable Light so Alexa can still drive it: level is the
// open percentage, on/off is open/close (#372). Direct mapping, the cover
// invert/swap flags only apply to the real WindowCovering path.

const attributes = (entity: HomeAssistantEntityState) =>
  entity.attributes as CoverDeviceAttributes;

/** Cover openness as a 0..1 fraction, or null when it can't be determined. */
export function coverOpenness(entity: HomeAssistantEntityState): number | null {
  const position = attributes(entity).current_position;
  if (position != null) {
    return Math.min(1, Math.max(0, position / 100));
  }
  if (entity.state === CoverDeviceState.open) return 1;
  if (entity.state === CoverDeviceState.closed) return 0;
  return null;
}

/** Map a light level (0..1) to the matching cover service call. */
export function coverLevelAction(
  percent: number,
  supportsPosition: boolean,
): HomeAssistantAction {
  const position = Math.round(Math.min(1, Math.max(0, percent)) * 100);
  if (supportsPosition) {
    return { action: "cover.set_cover_position", data: { position } };
  }
  // No position support: treat the upper half as open, the lower half as close.
  return { action: position >= 50 ? "cover.open_cover" : "cover.close_cover" };
}

const supportsPositionControl = (agent: Agent): boolean => {
  const entity = agent.get(HomeAssistantEntityBehavior).entity.state;
  const supportedFeatures = attributes(entity).supported_features ?? 0;
  return (
    (supportedFeatures & CoverSupportedFeatures.support_set_position) !== 0
  );
};

const CoverAsLightOnOffServer = OnOffServer({
  isOn: (entity) => entity.state !== CoverDeviceState.closed,
  turnOn: () => ({ action: "cover.open_cover" }),
  turnOff: () => ({ action: "cover.close_cover" }),
});

const CoverAsLightLevelControlServer = LevelControlServer({
  getValuePercent: (entity) => coverOpenness(entity),
  moveToLevelPercent: (percent, agent) =>
    coverLevelAction(percent, supportsPositionControl(agent)),
});

const baseBehaviors = [
  IdentifyServer,
  BasicInformationServer,
  HomeAssistantEntityBehavior,
  GroupsServer,
  ScenesManagementServer,
  CoverAsLightOnOffServer,
  CoverAsLightLevelControlServer,
] as const;

export const CoverAsDimmableLightType = DimmableLightDevice.with(
  ...baseBehaviors,
);

export const CoverAsDimmableLightWithBatteryType = DimmableLightDevice.with(
  ...baseBehaviors,
  DefaultPowerSourceServer,
);
