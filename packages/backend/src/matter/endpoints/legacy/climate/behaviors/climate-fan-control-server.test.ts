import { describe, expect, it } from "vitest";
import {
  rockSettingToSwingMode,
  swingModesToRockSupport,
  swingModeToRockSetting,
} from "./climate-fan-control-server.js";

describe("climate fan rocking", () => {
  it("maps HA swing modes to Matter rock support", () => {
    expect(swingModesToRockSupport(["off", "vertical"])).toEqual({
      rockLeftRight: undefined,
      rockUpDown: true,
    });
    expect(swingModesToRockSupport(["off", "horizontal"])).toEqual({
      rockLeftRight: true,
      rockUpDown: undefined,
    });
    expect(swingModesToRockSupport(["off", "both"])).toEqual({
      rockLeftRight: true,
      rockUpDown: true,
    });
  });

  it("maps HA swing mode to Matter rock setting", () => {
    expect(swingModeToRockSetting("off")).toEqual({});
    expect(swingModeToRockSetting("vertical")).toEqual({ rockUpDown: true });
    expect(swingModeToRockSetting("horizontal")).toEqual({
      rockLeftRight: true,
    });
    expect(swingModeToRockSetting("both")).toEqual({
      rockLeftRight: true,
      rockUpDown: true,
    });
  });

  it("maps Matter rock setting back to HA swing mode", () => {
    expect(rockSettingToSwingMode({})).toBe("off");
    expect(rockSettingToSwingMode({ rockUpDown: true })).toBe("vertical");
    expect(rockSettingToSwingMode({ rockLeftRight: true })).toBe("horizontal");
    expect(
      rockSettingToSwingMode({ rockLeftRight: true, rockUpDown: true }),
    ).toBe("both");
  });
});
