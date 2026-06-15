import { describe, expect, it } from "vitest";
import {
  classifyController,
  computeControllerWarnings,
} from "./controller-compat.js";

describe("classifyController", () => {
  it("maps the known controller vendor ids", () => {
    expect(classifyController(4937)).toBe("apple"); // 0x1349
    expect(classifyController(24582)).toBe("google"); // 0x6006
    expect(classifyController(4631)).toBe("alexa"); // 0x1217
    expect(classifyController(4447)).toBe("aqara"); // 0x115F
  });

  it("returns undefined for non-controller vendors (HA hub, SmartThings, unknown)", () => {
    expect(classifyController(4939)).toBeUndefined(); // Home Assistant
    expect(classifyController(4362)).toBeUndefined(); // SmartThings
    expect(classifyController(99999)).toBeUndefined();
  });
});

describe("computeControllerWarnings", () => {
  it("warns when a commissioned controller does not support an exposed type", () => {
    // 0x002b (fan) is not supported on Apple Home
    const warnings = computeControllerWarnings(
      ["apple"],
      [{ entityId: "fan.office", deviceTypeId: 0x2b }],
    );
    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toMatchObject({
      entityId: "fan.office",
      controller: "apple",
      controllerLabel: "Apple Home",
    });
  });

  it("does not warn when the type is supported (fan on Google/Alexa)", () => {
    expect(
      computeControllerWarnings(
        ["google", "alexa"],
        [{ entityId: "fan.office", deviceTypeId: 0x2b }],
      ),
    ).toEqual([]);
  });

  it("does not warn for Aqara on types it supports that others reject", () => {
    // Aqara Home surfaces fans (0x002b), speakers (0x0022) and the newer
    // leak/rain detectors (0x0044) that Apple/Google/Alexa reject.
    expect(
      computeControllerWarnings(
        ["aqara"],
        [
          { entityId: "fan.office", deviceTypeId: 0x2b },
          { entityId: "media_player.kitchen", deviceTypeId: 0x22 },
          { entityId: "binary_sensor.leak", deviceTypeId: 0x44 },
        ],
      ),
    ).toEqual([]);
  });

  it("does not warn on partial or unknown, only on a hard no", () => {
    // generic switch (0x000f) is partial on Apple, no on Google
    const apple = computeControllerWarnings(
      ["apple"],
      [{ entityId: "event.btn", deviceTypeId: 0xf }],
    );
    expect(apple).toEqual([]);
    const google = computeControllerWarnings(
      ["google"],
      [{ entityId: "event.btn", deviceTypeId: 0xf }],
    );
    expect(google).toHaveLength(1);
  });

  it("ignores device types with no support data and supported core types", () => {
    expect(
      computeControllerWarnings(
        ["apple", "google", "alexa"],
        [
          { entityId: "light.kitchen", deviceTypeId: 0x100 }, // supported everywhere
          { entityId: "x.unknown", deviceTypeId: 0x9999 }, // not in the table
        ],
      ),
    ).toEqual([]);
  });

  it("flags the #365 detector types on every controller", () => {
    const warnings = computeControllerWarnings(
      ["apple", "google", "alexa"],
      [{ entityId: "binary_sensor.rain", deviceTypeId: 0x44 }],
    );
    // rain is no on all three
    expect(warnings.map((w) => w.controller).sort()).toEqual([
      "alexa",
      "apple",
      "google",
    ]);
    expect(warnings[0].note).toContain("#365");
  });
});
