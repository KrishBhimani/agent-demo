import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import test from "node:test";

import { compare, maxSatisfying, parse, satisfies } from "../src/semver.js";

const cases = [
  ["1.2.3", "1.2.3", true],
  ["1.2.3", "1.2.4", false],
  ["=1.2.3", "1.2.3", true],
  [">1.2.3", "1.2.4", true],
  [">1.2.3", "1.2.3", false],
  [">=1.2.3", "1.2.3", true],
  ["<1.2.3", "1.2.2", true],
  ["<1.2.3", "1.2.3", false],
  ["<=1.2.3", "1.2.3", true],
  ["^1.2.3", "1.2.3", true],
  ["^1.2.3", "1.9.9", true],
  ["^1.2.3", "2.0.0", false],
  ["^0.2.3", "0.2.9", true],
  ["^0.2.3", "0.3.0", false],
  ["^0.0.3", "0.0.3", true],
  ["^0.0.3", "0.0.4", false],
  ["~1.2.3", "1.2.9", true],
  ["~1.2.3", "1.3.0", false],
  ["~1.2", "1.2.0", true],
  ["~1.2", "1.2.9", true],
  ["~1.2", "1.3.0", false],
  ["1.x", "1.0.0", true],
  ["1.x", "2.0.0", false],
  ["1.2.x", "1.2.9", true],
  ["1.2.x", "1.3.0", false],
  ["*", "99.99.99", true],
  ["1", "1.9.9", true],
  ["1", "2.0.0", false],
  ["1.2", "1.2.9", true],
  ["1.2", "1.3.0", false],
  ["1.2.3 - 2.3.4", "1.2.3", true],
  ["1.2.3 - 2.3.4", "2.3.4", true],
  ["1.2.3 - 2.3.4", "2.3.5", false],
  [">=1.2.3 <2.0.0", "1.5.0", true],
  [">=1.2.3 <2.0.0", "2.0.0", false],
  ["1.2.3 || 2.0.0", "2.0.0", true],
  ["1.2.3 || 2.0.0", "1.2.4", false],
  ["^1.0.0", "1.0.0-beta", false],
  [">=1.0.0-alpha", "1.0.0-beta", true],
  [">=1.0.0-alpha", "1.0.1-alpha", false],
  ["1.0.0-alpha", "1.0.0-alpha", true],
  ["1.0.0-alpha", "1.0.0-beta", false],
  ["^1.2.0 || >=3.0.0-rc.1", "3.0.0-rc.1", true],
  ["^1.2.0 || >=3.0.0-rc.1", "3.0.0-rc.0", false],
];

test("satisfies supports documented range syntax", () => {
  for (const [range, version, expected] of cases) {
    assert.equal(satisfies(version, range), expected, `${version} ${range}`);
  }
});

test("parse accepts v prefixes and ignores build metadata", () => {
  assert.deepEqual(parse("v1.2.3-beta.1+build.5"), {
    major: 1,
    minor: 2,
    patch: 3,
    prerelease: ["beta", "1"],
  });
  assert.throws(() => parse("1.2"), TypeError);
  assert.throws(() => parse("1.2.3-01"), TypeError);
});

test("compare follows semantic-version precedence", () => {
  assert.equal(compare("1.0.0-alpha", "1.0.0-alpha.1"), -1);
  assert.equal(compare("1.0.0-alpha.1", "1.0.0-alpha.beta"), -1);
  assert.equal(compare("1.0.0-1", "1.0.0-alpha"), -1);
  assert.equal(compare("1.0.0-rc.1", "1.0.0"), -1);
  assert.equal(compare("1.0.0+build.1", "1.0.0+build.2"), 0);
});

test("compare is antisymmetric for random semantic versions", () => {
  let seed = 0x12345678;
  const random = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 2 ** 32;
  };
  const randomVersion = () => {
    const base = `${Math.floor(random() * 10)}.${Math.floor(random() * 10)}.${Math.floor(random() * 10)}`;
    if (random() < 0.5) return base;
    const identifier = random() < 0.5 ? String(Math.floor(random() * 10)) : `rc${Math.floor(random() * 10)}`;
    return `${base}-${identifier}`;
  };

  for (let index = 0; index < 500; index++) {
    const a = randomVersion();
    const b = randomVersion();
    assert.equal(compare(a, b), -compare(b, a));
    assert.equal(compare(a, a), 0);
  }
});

test("maxSatisfying returns the highest matching version", () => {
  assert.equal(maxSatisfying(["1.2.0", "1.9.9", "2.0.0"], "^1.2.0"), "1.9.9");
  assert.equal(maxSatisfying(["2.0.0"], "^1.2.0"), null);
});

test("semver-lite CLI prints sorted matches and reports success", () => {
  const result = spawnSync(process.execPath, ["bin/semver.js", "^1.2.0", "1.9.9", "1.1.9", "1.2.0", "2.0.0"], {
    cwd: process.cwd(),
    encoding: "utf8",
  });

  assert.equal(result.status, 0);
  assert.equal(result.stdout, "1.2.0\n1.9.9\n");
});

test("semver-lite CLI reports failure when nothing matches", () => {
  const result = spawnSync(process.execPath, ["bin/semver.js", "^1.2.0", "2.0.0"], {
    cwd: process.cwd(),
    encoding: "utf8",
  });

  assert.equal(result.status, 1);
  assert.equal(result.stdout, "");
});

test("barrel export exposes semver alongside existing utilities", async () => {
  const utilities = await import("../src/index.js");
  assert.equal(utilities.satisfies("1.2.3", "^1.0.0"), true);
  assert.equal(utilities.sumTo(3), 6);
  assert.equal(utilities.capitalize("agent"), "Agent");
  assert.equal(utilities.slugify("Semver Lite"), "semver-lite");
});
