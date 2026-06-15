import type { HomeAssistantEntityState } from "@home-assistant-matter-hub/common";
import { describe, expect, it } from "vitest";
import { coverLevelAction, coverOpenness } from "./cover-as-light.js";

function state(
  value: string,
  attributes: Record<string, unknown> = {},
): HomeAssistantEntityState {
  return {
    entity_id: "cover.test",
    state: value,
    attributes,
    context: { id: "ctx" },
    last_changed: "2026-01-01T00:00:00",
    last_updated: "2026-01-01T00:00:00",
  };
}

describe("coverOpenness", () => {
  it("uses current_position as the openness fraction", () => {
    expect(coverOpenness(state("open", { current_position: 50 }))).toBe(0.5);
    expect(coverOpenness(state("open", { current_position: 100 }))).toBe(1);
    expect(coverOpenness(state("closed", { current_position: 0 }))).toBe(0);
  });

  it("falls back to the open/closed state when there is no position", () => {
    expect(coverOpenness(state("open"))).toBe(1);
    expect(coverOpenness(state("closed"))).toBe(0);
    expect(coverOpenness(state("opening"))).toBeNull();
  });
});

describe("coverLevelAction", () => {
  it("maps the level to set_cover_position when position is supported", () => {
    expect(coverLevelAction(0.5, true)).toEqual({
      action: "cover.set_cover_position",
      data: { position: 50 },
    });
  });

  it("maps the level to open/close for covers without position support", () => {
    expect(coverLevelAction(0.8, false)).toEqual({
      action: "cover.open_cover",
    });
    expect(coverLevelAction(0.2, false)).toEqual({
      action: "cover.close_cover",
    });
  });
});
