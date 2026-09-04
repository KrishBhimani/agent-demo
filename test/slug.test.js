import assert from "node:assert/strict";
import test from "node:test";

import { slugify } from "../src/slug.js";

test("slugify removes accents after Unicode normalization", () => {
  assert.equal(slugify("Crème Brûlée"), "creme-brulee");
});

test("slugify removes combining marks", () => {
  assert.equal(slugify("Cafe\u0301"), "cafe");
});

test("slugify lowercases input", () => {
  assert.equal(slugify("MiXeD CaSe"), "mixed-case");
});

test("slugify replaces whitespace and punctuation runs with one hyphen", () => {
  assert.equal(slugify("one --- two!!! three"), "one-two-three");
});

test("slugify trims leading and trailing separators", () => {
  assert.equal(slugify("  -- Hello world --  "), "hello-world");
});

test("slugify preserves ASCII letters and numbers", () => {
  assert.equal(slugify("Version 2.0"), "version-2-0");
});

test("slugify returns an empty string for empty input", () => {
  assert.equal(slugify(""), "");
});

test("slugify rejects non-string input", () => {
  assert.throws(() => slugify(42), {
    name: "TypeError",
    message: "slugify input must be a string",
  });
});

test("slugify defaults to a maximum length of 60", () => {
  assert.equal(slugify("a".repeat(61)), "a".repeat(60));
});

test("slugify truncates at a preceding word boundary", () => {
  assert.equal(slugify("hello wonderful world", { maxLength: 12 }), "hello");
});

test("slugify truncates when maxLength is shorter than the first word", () => {
  assert.equal(slugify("hello world", { maxLength: 3 }), "hel");
});

test("slugify truncates a single long word when no boundary exists", () => {
  assert.equal(slugify("supercalifragilistic", { maxLength: 10 }), "supercalif");
});

test("slugify leaves a slug at the maximum length unchanged", () => {
  assert.equal(slugify("hello-world", { maxLength: 11 }), "hello-world");
});
