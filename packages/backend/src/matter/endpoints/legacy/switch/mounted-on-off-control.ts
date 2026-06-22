import { GroupsServer, ScenesManagementServer } from "@matter/main/behaviors";
import { MountedOnOffControlDevice } from "@matter/main/devices";
import { BasicInformationServer } from "../../../behaviors/basic-information-server.js";
import { HomeAssistantEntityBehavior } from "../../../behaviors/home-assistant-entity-behavior.js";
import { IdentifyServer } from "../../../behaviors/identify-server.js";
import { OnOffServer } from "../../../behaviors/on-off-server.js";

// #380 experiment: expose an HA switch as Mounted On/Off Control (0x010F) to see
// if Google shows a switch instead of a plug (0x010A) or light (0x0100).
export const MountedOnOffControlType = MountedOnOffControlDevice.with(
  BasicInformationServer,
  IdentifyServer,
  HomeAssistantEntityBehavior,
  GroupsServer,
  ScenesManagementServer,
  OnOffServer(),
);
