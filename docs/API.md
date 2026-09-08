# API Reference

`agent-demo` provides small, dependency-free JavaScript utilities. Each utility
is exported from its source module and can be imported directly. Run the
following examples from the repository root.

## `sumTo(n)`

Import from `src/math.js`:

```js
import { sumTo } from "./src/math.js";
```

Returns the sum of the positive integers from `1` through `n`, inclusive. It
returns `0` when `n` is negative because the range contains no positive
integers.

```js
sumTo(5);
// 15

sumTo(-1);
// 0
```

## `capitalize(s)`

Import from `src/text.js`:

```js
import { capitalize } from "./src/text.js";
```

Returns a copy of a string with its first character converted to uppercase. An
empty string remains empty.

```js
capitalize("hello");
// "Hello"

capitalize("");
// ""
```

## `slugify(input, options)`

Import from `src/slug.js`:

```js
import { slugify } from "./src/slug.js";
```

Converts a string into a URL-friendly slug. It removes Unicode accents,
lowercases text, converts runs of non-alphanumeric characters to hyphens, and
trims leading and trailing hyphens.

`input` must be a string; otherwise, `slugify` throws a `TypeError`. The
optional `maxLength` setting defaults to `60`. When truncating a multiword slug,
`slugify` uses the last hyphen within the limit when one is available so it does
not cut off a word.

```js
slugify("Crème Brûlée");
// "creme-brulee"

slugify("hello wonderful world", { maxLength: 12 });
// "hello"
```
