import { describe, expect, it } from "vitest";
import { selectMdnsInterface } from "./select-mdns-interface.js";

function v4(address: string, internal = false) {
  return { family: "IPv4", address, internal };
}
function v6(address: string, internal = false) {
  return { family: "IPv6", address, internal };
}

describe("selectMdnsInterface", () => {
  it("picks the single LAN interface on a HA OS add-on host (Sandspit87)", () => {
    const choice = selectMdnsInterface({
      lo: [v4("127.0.0.1", true), v6("::1", true)],
      end0: [v4("10.0.0.209"), v6("fe80::847:3c14:f0bf:afd6")],
      docker0: [v4("172.30.232.1")],
      hassio: [v4("172.30.32.1")],
      veth0: [v6("fe80::1")],
    });
    expect(choice.selected).toBe("end0");
    expect(choice.suspicious).toBe(true);
    expect(choice.dockerLike).toEqual(
      expect.arrayContaining(["docker0", "hassio", "veth0"]),
    );
  });

  it("stays ambiguous on a plain bridged container (mwdle) but flags it", () => {
    const choice = selectMdnsInterface({
      lo: [v4("127.0.0.1", true)],
      eth0: [v4("172.16.20.3")],
      eth1: [v4("192.168.0.4"), v6("fe80::1775:a8db:7db:e108")],
    });
    expect(choice.selected).toBeUndefined();
    expect(choice.suspicious).toBe(true);
    expect(choice.external.map((i) => i.name)).toEqual(["eth0", "eth1"]);
  });

  it("does not flag a clean single-NIC host", () => {
    const choice = selectMdnsInterface({
      lo: [v4("127.0.0.1", true)],
      eth0: [v4("192.168.1.5"), v6("fe80::5")],
    });
    expect(choice.selected).toBe("eth0");
    expect(choice.suspicious).toBe(false);
    expect(choice.dockerLike).toEqual([]);
  });

  it("does not auto-pick when two real LAN NICs are present", () => {
    const choice = selectMdnsInterface({
      lo: [v4("127.0.0.1", true)],
      eth0: [v4("192.168.1.5")],
      eth1: [v4("10.0.0.5")],
    });
    expect(choice.selected).toBeUndefined();
    expect(choice.suspicious).toBe(false);
  });

  it("suggests a genuine 172.x single-NIC LAN", () => {
    const choice = selectMdnsInterface({
      lo: [v4("127.0.0.1", true)],
      eth0: [v4("172.20.5.5")],
    });
    expect(choice.selected).toBe("eth0");
    expect(choice.suspicious).toBe(true);
  });

  it("ignores link-local-only interfaces when suggesting", () => {
    const choice = selectMdnsInterface({
      lo: [v4("127.0.0.1", true)],
      awdl0: [v6("fe80::aaaa")],
      eth0: [v4("192.168.1.5")],
    });
    expect(choice.selected).toBe("eth0");
    expect(choice.external.map((i) => i.name)).toEqual(["eth0"]);
  });

  it("treats br-* as a real LAN bridge, not Docker", () => {
    const choice = selectMdnsInterface({
      lo: [v4("127.0.0.1", true)],
      "br-lan": [v4("192.168.1.5")],
    });
    expect(choice.selected).toBe("br-lan");
    expect(choice.dockerLike).toEqual([]);
  });
});
