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
