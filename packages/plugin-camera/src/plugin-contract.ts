// Plugin contract, copied by shape since the backend package is private.
// Keep in sync with packages/backend/src/plugins/types.ts.

import type { Logger } from "@matter/general";
import type { EndpointType } from "@matter/main";

export interface PluginClusterConfig {
  clusterId: string;
  attributes: Record<string, unknown>;
}

export interface PluginDevice {
  id: string;
  name: string;
  deviceType?: string;
  endpointType?: EndpointType;
  clusters: PluginClusterConfig[];
  onAttributeWrite?(
    clusterId: string,
    attribute: string,
    value: unknown,
  ): Promise<void>;
}

export interface PluginStorage {
  get<T>(key: string, defaultValue?: T): Promise<T | undefined>;
  set<T>(key: string, value: T): Promise<void>;
  delete(key: string): Promise<void>;
  keys(): Promise<string[]>;
}

export interface PluginContext {
  registerDevice(device: PluginDevice): Promise<void>;
  unregisterDevice(deviceId: string): Promise<void>;
  updateDeviceState(
    deviceId: string,
    clusterId: string,
    attributes: Record<string, unknown>,
  ): void;
  registerDomainMapping(mapping: unknown): void;
  storage: PluginStorage;
  log: Logger;
  bridgeId: string;
}

export interface MatterHubPlugin {
  readonly name: string;
  readonly version: string;
  onStart(context: PluginContext): Promise<void>;
  onConfigure?(): Promise<void>;
  onShutdown?(reason?: string): Promise<void>;
  getConfigSchema?(): unknown;
  onConfigChanged?(config: Record<string, unknown>): Promise<void>;
}
