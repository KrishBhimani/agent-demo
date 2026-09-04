import assert from "node:assert/strict";
import test from "node:test";

import { sumTo } from "../src/math.js";

test("sumTo returns the sum through the supplied number", () => {
  assert.equal(sumTo(5), 15);
});

test("sumTo returns zero for a negative number", () => {
  assert.equal(sumTo(-1), 0);
});
