import assert from "node:assert/strict";
import test from "node:test";

import { capitalize } from "../src/text.js";

test("capitalize uppercases the first letter", () => {
  assert.equal(capitalize("hello"), "Hello");
});

test("capitalize preserves an empty string", () => {
  assert.equal(capitalize(""), "");
});
