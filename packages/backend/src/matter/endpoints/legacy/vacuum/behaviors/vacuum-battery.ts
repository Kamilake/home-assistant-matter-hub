import type {
  HomeAssistantEntityState,
  VacuumDeviceAttributes,
} from "@home-assistant-matter-hub/common";
import type { Agent } from "@matter/main";
import { EntityStateProvider } from "../../../../../services/bridges/entity-state-provider.js";
import { HomeAssistantEntityBehavior } from "../../../../behaviors/home-assistant-entity-behavior.js";

// Battery percent from the mapped battery sensor if one is set (Roomba, Xiaomi,
// Deebot), otherwise the vacuum's own battery attribute. Shared so the power
// source and the operational state read the same value (#377).
export function getVacuumBatteryPercent(
  entity: HomeAssistantEntityState,
  agent: Agent,
): number | null {
  const mapped = agent.get(HomeAssistantEntityBehavior).state.mapping
    ?.batteryEntity;
  if (mapped) {
    const battery = agent.env
      .get(EntityStateProvider)
      .getBatteryPercent(mapped);
    if (battery != null) return Math.max(0, Math.min(100, battery));
  }
  const attrs = entity.attributes as VacuumDeviceAttributes;
  const raw = attrs.battery_level ?? attrs.battery;
  if (raw == null) return null;
  if (typeof raw === "number") return raw;
  const parsed = Number.parseFloat(String(raw));
  return Number.isNaN(parsed) ? null : parsed;
}
