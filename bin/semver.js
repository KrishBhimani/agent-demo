#!/usr/bin/env node

import { compare, satisfies } from "../src/semver.js";

const [range, ...versions] = process.argv.slice(2);
const matches = versions.filter((version) => satisfies(version, range));
matches.sort(compare);

if (matches.length > 0) {
  process.stdout.write(`${matches.join("\n")}\n`);
}

process.exitCode = matches.length > 0 ? 0 : 1;
