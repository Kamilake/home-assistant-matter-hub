import * as os from "node:os";
import { Logger } from "@matter/general";
import type { Environment } from "@matter/main";
import { MdnsService } from "@matter/main/protocol";
import { selectMdnsInterface } from "./select-mdns-interface.js";

const logger = Logger.get("Mdns");

export interface MdnsOptions {
  ipv4: boolean;
  networkInterface?: string;
}

export function mdns(env: Environment, options: MdnsOptions) {
  if (!options.networkInterface) {
    warnIfMisadvertising();
  }
  new MdnsService(env, {
    ipv4: options.ipv4,
    networkInterface: options.networkInterface,
  });
}

// With no interface configured, matter advertises on every interface and bakes
// each address into the operational records, so controllers can pick an
// unreachable Docker-internal address and show devices as offline (#361). We do
// not auto-pick the interface (which one is the LAN cannot be told reliably),
// but warn and suggest the LAN interface so the user can set it.
function warnIfMisadvertising() {
  const choice = selectMdnsInterface(os.networkInterfaces());
  if (!choice.suspicious) {
    return;
  }
  const suggestion = choice.selected
    ? ` Likely LAN interface: ${choice.selected}.`
    : "";
  const list = choice.external
    .map((i) => `${i.name} (${i.ipv4[0] ?? i.ipv6[0] ?? "?"})`)
    .join(", ");
  logger.warn(
    `Matter mDNS is advertising on several interfaces including likely Docker-internal ones, so controllers may show devices as offline (#361). Set mdns-network-interface to your LAN interface.${suggestion} Interfaces: ${list}.`,
  );
}
