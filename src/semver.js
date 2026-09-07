// Lightweight semantic-version parsing, comparison, and range matching.

const VERSION = /^v?(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/;
const PARTIAL = /^v?(0|[1-9]\d*|[xX*])(?:\.(0|[1-9]\d*|[xX*]))?(?:\.(0|[1-9]\d*|[xX*]))?(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/;

/**
 * Parse a semantic version. Build metadata does not affect precedence and is
 * intentionally omitted from the returned value.
 */
export function parse(version) {
  if (typeof version !== "string") {
    throw new TypeError("version must be a semantic version string");
  }

  const match = VERSION.exec(version);
  if (!match) {
    throw new TypeError("version must be a semantic version string");
  }

  const prerelease = match[4] ? match[4].split(".") : [];
  if (prerelease.some((identifier) => /^\d+$/.test(identifier) && identifier.length > 1 && identifier[0] === "0")) {
    throw new TypeError("version must be a semantic version string");
  }

  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
    prerelease,
  };
}

function compareIdentifiers(a, b) {
  const aNumeric = /^\d+$/.test(a);
  const bNumeric = /^\d+$/.test(b);

  if (aNumeric && bNumeric) {
    const aNumber = Number(a);
    const bNumber = Number(b);
    return aNumber === bNumber ? 0 : aNumber < bNumber ? -1 : 1;
  }
  if (aNumeric) return -1;
  if (bNumeric) return 1;
  return a === b ? 0 : a < b ? -1 : 1;
}

function compareParsed(a, b) {
  for (const key of ["major", "minor", "patch"]) {
    if (a[key] !== b[key]) return a[key] < b[key] ? -1 : 1;
  }

  if (a.prerelease.length === 0 || b.prerelease.length === 0) {
    if (a.prerelease.length === b.prerelease.length) return 0;
    return a.prerelease.length === 0 ? 1 : -1;
  }

  const length = Math.max(a.prerelease.length, b.prerelease.length);
  for (let index = 0; index < length; index++) {
    if (index === a.prerelease.length) return -1;
    if (index === b.prerelease.length) return 1;
    const result = compareIdentifiers(a.prerelease[index], b.prerelease[index]);
    if (result !== 0) return result;
  }
  return 0;
}

/** Compare two semantic versions by precedence. */
export function compare(a, b) {
  return compareParsed(parse(a), parse(b));
}

function isWildcard(part) {
  return part === undefined || part === "x" || part === "X" || part === "*";
}

function parsePartial(version) {
  const match = PARTIAL.exec(version);
  if (!match) throw new TypeError("invalid version in range");

  const [, major, minor, patch, prerelease] = match;
  if (isWildcard(major) && (minor !== undefined || patch !== undefined || prerelease !== undefined)) {
    throw new TypeError("invalid version in range");
  }
  if (isWildcard(minor) && (patch !== undefined || prerelease !== undefined)) {
    throw new TypeError("invalid version in range");
  }
  if (isWildcard(patch) && prerelease !== undefined) {
    throw new TypeError("invalid version in range");
  }

  const parts = [major, minor, patch];
  const firstWildcard = parts.findIndex(isWildcard);
  const specified = firstWildcard === -1 ? 3 : firstWildcard;
  const normalized = {
    major: specified > 0 ? Number(major) : 0,
    minor: specified > 1 ? Number(minor) : 0,
    patch: specified > 2 ? Number(patch) : 0,
    prerelease: prerelease ? prerelease.split(".") : [],
  };

  if (normalized.prerelease.some((identifier) => /^\d+$/.test(identifier) && identifier.length > 1 && identifier[0] === "0")) {
    throw new TypeError("invalid version in range");
  }

  return { version: normalized, specified };
}

function increment(version, position) {
  const next = { ...version, prerelease: [] };
  if (position === 0) {
    next.major += 1;
    next.minor = 0;
    next.patch = 0;
  } else if (position === 1) {
    next.minor += 1;
    next.patch = 0;
  } else {
    next.patch += 1;
  }
  return next;
}

function comparator(operator, version) {
  return { operator, version };
}

function expandPartial(operator, partial) {
  const { version, specified } = partial;
  if (specified === 3) return [comparator(operator || "=", version)];
  if (specified === 0) return [];

  const upper = increment(version, specified - 1);
  switch (operator) {
    case "":
    case "=":
      return [comparator(">=", version), comparator("<", upper)];
    case ">=":
      return [comparator(">=", version)];
    case ">":
      return [comparator(">=", upper)];
    case "<=":
      return [comparator("<", upper)];
    case "<":
      return [comparator("<", version)];
    default:
      throw new TypeError("invalid comparator");
  }
}

function expandCaret(partial) {
  const { version, specified } = partial;
  if (specified === 0) return [];

  let position;
  if (version.major > 0) position = 0;
  else if (specified === 1) position = 0;
  else if (version.minor > 0) position = 1;
  else position = 2;

  return [comparator(">=", version), comparator("<", increment(version, position))];
}

function expandTilde(partial) {
  const { version, specified } = partial;
  if (specified === 0) return [];
  return [comparator(">=", version), comparator("<", increment(version, specified === 1 ? 0 : 1))];
}

function expandToken(token) {
  const match = /^(\^|~|>=|<=|>|<|=)?(.+)$/.exec(token);
  if (!match) throw new TypeError("invalid comparator");

  const [, operator = "", version] = match;
  const partial = parsePartial(version);
  if (operator === "^") return expandCaret(partial);
  if (operator === "~") return expandTilde(partial);
  return expandPartial(operator, partial);
}

function expandHyphen(lower, upper) {
  const lowerPartial = parsePartial(lower);
  const upperPartial = parsePartial(upper);
  const comparators = [];

  if (lowerPartial.specified > 0) comparators.push(comparator(">=", lowerPartial.version));
  if (upperPartial.specified === 3) comparators.push(comparator("<=", upperPartial.version));
  else if (upperPartial.specified > 0) comparators.push(comparator("<", increment(upperPartial.version, upperPartial.specified - 1)));
  return comparators;
}

function parseSet(range) {
  const hyphen = /^\s*(\S+)\s+-\s+(\S+)\s*$/.exec(range);
  if (hyphen) return expandHyphen(hyphen[1], hyphen[2]);

  const tokens = range.trim().split(/\s+/).filter(Boolean);
  return tokens.flatMap(expandToken);
}

function parseRange(range) {
  if (typeof range !== "string") throw new TypeError("range must be a string");
  return range.split("||").map(parseSet);
}

function testComparator(version, { operator, version: target }) {
  const result = compareParsed(version, target);
  switch (operator) {
    case "=": return result === 0;
    case ">": return result > 0;
    case ">=": return result >= 0;
    case "<": return result < 0;
    case "<=": return result <= 0;
    default: return false;
  }
}

function allowsPrerelease(version, comparators) {
  return comparators.some(({ version: target }) => target.prerelease.length > 0
    && target.major === version.major
    && target.minor === version.minor
    && target.patch === version.patch);
}

/** Return whether a version satisfies at least one comparator set in a range. */
export function satisfies(version, range) {
  let parsed;
  let sets;
  try {
    parsed = parse(version);
    sets = parseRange(range);
  } catch {
    return false;
  }

  return sets.some((comparators) => comparators.every((item) => testComparator(parsed, item))
    && (parsed.prerelease.length === 0 || allowsPrerelease(parsed, comparators)));
}

/** Return the highest version in a list that satisfies a range, or null. */
export function maxSatisfying(versions, range) {
  let highest = null;
  for (const version of versions) {
    if (!satisfies(version, range)) continue;
    if (highest === null || compare(version, highest) > 0) highest = version;
  }
  return highest;
}
