import { VacuumState } from "@home-assistant-matter-hub/common";
import { PowerSourceServer } from "../../../../behaviors/power-source-server.js";
import { getVacuumBatteryPercent } from "./vacuum-battery.js";

export const VacuumPowerSourceServer = PowerSourceServer({
  getBatteryPercent: getVacuumBatteryPercent,
  isCharging(entity) {
    const state = entity.state as VacuumState | "unavailable";
    // Vacuum is typically charging when docked
    return state === VacuumState.docked;
  },
});
