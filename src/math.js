// Small math utilities.

/**
 * Sum of the integers from 1 to n, inclusive.
 * Returns 0 for a negative n because the range contains no positive integers.
 * sumTo(5) === 1 + 2 + 3 + 4 + 5 === 15
 */
export function sumTo(n) {
  if (n < 0) {
    return 0;
  }

  let total = 0;
  for (let i = 1; i <= n; i++) {
    total += i;
  }
  return total;
}
