import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type {
  EntityMappingConfig,
  HomeAssistantEntityInformation,
} from "@home-assistant-matter-hub/common";
import { Environment, VariableService } from "@matter/general";
import { Endpoint, VendorId } from "@matter/main";
import { ServerNode } from "@matter/main/node";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { BridgeDataProvider } from "../../../../services/bridges/bridge-data-provider.js";
import {
  type HomeAssistantAction,
  HomeAssistantActions,
} from "../../../../services/home-assistant/home-assistant-actions.js";
import { HomeAssistantConfig } from "../../../../services/home-assistant/home-assistant-config.js";
import { AggregatorEndpoint } from "../../aggregator-endpoint.js";
import { FanDevice } from "./index.js";

// #387 opt-in: Apple Home's power button writes percentSetting=100 before
// turning on. With fanRestoreSpeedOnPowerOn the bridge ignores that injected
// value while the fan is off and restores the last speed instead.

let dir: string;
let env: Environment;
let calls: HomeAssistantAction[];

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "hamh-fan-restore-"));
  env = new Environment("test", Environment.default);
  env.get(VariableService).set("storage.path", dir);
  calls = [];
  env.set(HomeAssistantActions, {
    call(action: HomeAssistantAction) {
      calls.push(action);
    },
    // biome-ignore lint/suspicious/noExplicitAny: test stub
  } as any);
  env.set(
    BridgeDataProvider,
    new BridgeDataProvider({
      id: "b",
      name: "b",
      port: 0,
      filter: { include: [], exclude: [], includeMode: "any" },
      basicInformation: {
        vendorId: 0xfff1,
        vendorName: "t",
        productName: "t",
        productLabel: "t",
        hardwareVersion: 1,
        softwareVersion: 1,
        // biome-ignore lint/suspicious/noExplicitAny: test fixture
      } as any,
      // biome-ignore lint/suspicious/noExplicitAny: test fixture
    } as any),
  );
  env.set(HomeAssistantConfig, {
    unitSystem: { temperature: "°C" },
    // biome-ignore lint/suspicious/noExplicitAny: test stub
  } as any);
});

afterEach(() => {
  rmSync(dir, { recursive: true, force: true });
});

function fanEntity(): HomeAssistantEntityInformation {
  const full = {
    entity_id: "fan.test",
    state: "off",
    attributes: {
      friendly_name: "Fan",
      supported_features: 1,
      percentage: 0,
      percentage_step: 1,
    },
    context: { id: "ctx" },
    last_changed: "2026-01-01T00:00:00",
    last_updated: "2026-01-01T00:00:00",
  };
  // biome-ignore lint/suspicious/noExplicitAny: test fixture
  return { entity_id: "fan.test", state: full as any };
}

// Mount an off fan with a remembered speed of 24, then have a controller write
// percentSetting=100 while off (the Apple Home power button). Returns the
// percentage HAMH sends to HA.
async function powerOnPercentage(
  mapping: EntityMappingConfig,
): Promise<number | undefined> {
  const server = await ServerNode.create({
    // biome-ignore lint/suspicious/noExplicitAny: env valid at runtime
    environment: env as any,
    id: "fan-restore-node",
    network: { port: 0 },
    commissioning: { passcode: 20202021, discriminator: 3840 },
    basicInformation: { vendorId: VendorId(0xfff1), productId: 0x8000 },
  });
  const aggregator = new AggregatorEndpoint("aggregator");
  await server.add(aggregator);
  const endpoint = new Endpoint(
    FanDevice({ entity: fanEntity(), mapping } as never),
    { id: "fan" },
  );
  await aggregator.add(endpoint);

  calls.length = 0;
  await endpoint.act((agent) => {
    // biome-ignore lint/suspicious/noExplicitAny: drive the controller write
    const fc = (agent as any).fanControl;
    fc.lastNonZeroPercent = 24; // remembered speed from before it was turned off
    fc.targetPercentSettingChanged(100, 0, { subject: {} });
  });
  await server.close().catch(() => {});

  const setPct = calls.find((c) => c.action === "fan.set_percentage");
  return (setPct?.data as { percentage?: number } | undefined)?.percentage;
}

describe("fan restore speed on power-on (#387)", () => {
  it("restores the last speed when the flag is on", async () => {
    const pct = await powerOnPercentage({
      entityId: "fan.test",
      fanRestoreSpeedOnPowerOn: true,
    });
    expect(pct).toBe(24);
  });

  it("keeps the controller value when the flag is off", async () => {
    const pct = await powerOnPercentage({ entityId: "fan.test" });
    expect(pct).toBe(100);
  });
});
