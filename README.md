# agent-demo

A tiny JavaScript utility library used to demo an autonomous fork-and-fix agent.

- `src/math.js` — `sumTo(n)` (sum of 1..n)
- `src/text.js` — `capitalize(s)`
- `src/slug.js` — `slugify(input, options)`

## Slugify

Use `slugify` to turn text into a URL-friendly slug. It removes Unicode accents,
lowercases text, and collapses separators into hyphens. Pass `maxLength` to limit
the result without cutting off a word when a hyphen boundary is available.

```js
import { slugify } from "./src/slug.js";

slugify("Crème Brûlée");
// "creme-brulee"

slugify("hello wonderful world", { maxLength: 12 });
// "hello"
```

## Tests

Run the full test suite with:

```bash
npm test
```

## Semver

`src/semver.js` provides dependency-free semantic-version parsing, comparison, and
range matching. `parse(version)` accepts a leading `v` and ignores build metadata;
`compare(a, b)`, `satisfies(version, range)`, and `maxSatisfying(versions, range)`
follow npm-style precedence and prerelease handling.

| Range syntax | Meaning |
| --- | --- |
| `1.2.3`, `=1.2.3`, `>`, `>=`, `<`, `<=` | Exact versions and comparators |
| `^1.2.3` | Compatible versions (with special `0.x` bounds) |
| `~1.2.3`, `~1.2` | Patch-level compatible versions |
| `1`, `1.2`, `1.x`, `1.2.x`, `*` | Partial and wildcard versions |
| `1.2.3 - 2.3.4` | Inclusive hyphen range |
| `>=1.2.3 <2.0.0` | AND-combined comparators |
| `1.x || >=3.0.0` | OR-combined comparator sets |

Prerelease versions match only when their comparator set includes a prerelease on
the same major, minor, and patch version, matching npm's default behavior.

### CLI

Install the package to use `semver-lite`, or run the included script directly:

```bash
node bin/semver.js "^1.2.0 || >=3.0.0-rc.1" 1.1.9 1.2.0 1.9.9 2.0.0 3.0.0-rc.1
```

It prints satisfying versions in ascending order and exits with status 0 when at
least one version matches (or status 1 when none do).
