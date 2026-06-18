import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { describe, expect, it } from "vitest";

// #287: the local @matter/node patch (patches/@matter__node@0.17.3.patch)
// routes subscription keepalives onto the subscription's own session instead
// of the most recently active session of the peer. These assertions fail
// loudly when an install lost the patch (CI cache miss, lockfile drift, or a
// version change that silently skipped it).
const require = createRequire(import.meta.url);

function serverSubscriptionPath(dist: "esm" | "cjs"): string {
  // resolve("@matter/node") lands on dist/cjs/index.js, walk to the pkg root
  const entry = require.resolve("@matter/node");
  const packageRoot = join(dirname(entry), "..", "..");
  return join(
    packageRoot,
    "dist",
    dist,
    "node",
    "server",
    "ServerSubscription.js",
  );
}

describe("@matter/node keepalive patch (#287)", () => {
  for (const dist of ["esm", "cjs"] as const) {
    it(`keeps the own-session routing in dist/${dist}`, () => {
      const source = readFileSync(serverSubscriptionPath(dist), "utf8");
      expect(source).toContain("!ownSession.isClosing && !ownSession.isClosed");
      // the peer-address fallback for dead sessions must stay in place
      expect(source).toContain("session ?? this.#peerAddress");
    });
  }
});
