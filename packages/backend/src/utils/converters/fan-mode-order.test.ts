import { describe, expect, it } from "vitest";
import { toAscendingSpeedPresets } from "./fan-mode-order.js";

describe("toAscendingSpeedPresets (#309)", () => {
  it("leaves an already-ascending list unchanged", () => {
    expect(toAscendingSpeedPresets(["low", "medium", "high"])).toEqual([
      "low",
      "medium",
      "high",
    ]);
    expect(
      toAscendingSpeedPresets(["silent", "low", "medium", "high", "turbo"]),
    ).toEqual(["silent", "low", "medium", "high", "turbo"]);
  });

  it("corrects a descending list to ascending (the #309 SmartIR case)", () => {
    expect(toAscendingSpeedPresets(["high", "mid", "low"])).toEqual([
      "low",
      "mid",
      "high",
    ]);
    expect(
      toAscendingSpeedPresets(["turbo", "high", "medium", "low", "silent"]),
    ).toEqual(["silent", "low", "medium", "high", "turbo"]);
  });

  it("corrects an arbitrary permutation", () => {
    expect(toAscendingSpeedPresets(["high", "low", "mid"])).toEqual([
      "low",
      "mid",
      "high",
    ]);
  });

  it("orders numeric and levelN speeds by value", () => {
    expect(toAscendingSpeedPresets(["3", "2", "1"])).toEqual(["1", "2", "3"]);
    expect(toAscendingSpeedPresets(["level3", "level1", "level2"])).toEqual([
      "level1",
      "level2",
      "level3",
    ]);
  });

  it("returns the list unchanged when any token is not a known speed keyword", () => {
    expect(toAscendingSpeedPresets(["nest", "comfort", "boost"])).toEqual([
      "nest",
      "comfort",
      "boost",
    ]);
  });

  it("is stable for equal-rank tokens and handles edge lists", () => {
    // high and fast share rank 5, original order is preserved
    expect(toAscendingSpeedPresets(["high", "fast"])).toEqual(["high", "fast"]);
    expect(toAscendingSpeedPresets(["high"])).toEqual(["high"]);
    expect(toAscendingSpeedPresets([])).toEqual([]);
  });
});
