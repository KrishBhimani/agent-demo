// Minimal test — both assertions fail until the two issues are fixed.
import assert from "node:assert";
import { sumTo } from "./src/math.js";
import { capitalize } from "./src/text.js";

assert.strictEqual(sumTo(5), 15, "sumTo(5) should be 15 (issue #1)");
assert.strictEqual(sumTo(-1), 0, "sumTo(-1) should be 0");
assert.strictEqual(capitalize("hello"), "Hello");
assert.strictEqual(capitalize(""), "", "capitalize('') should be '' (issue #2)");

console.log("all tests passed");
