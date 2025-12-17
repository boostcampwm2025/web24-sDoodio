export function pickRandomUnique<T>(
  items: readonly T[],
  count: number,
  randomNumberGenerator: () => number = Math.random,
) {
  const safeCount = Math.max(0, Math.min(count, items.length));
  const arr = [...items];

  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(randomNumberGenerator() * (i + 1));
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }

  return arr.slice(0, safeCount);
}

export function createSeededRng(seed: number) {
  const modulus = 2147483647;
  const multiplier = 48271;

  let state = Math.floor(seed) % modulus;
  if (state <= 0) state += modulus - 1;

  return () => {
    state = (state * multiplier) % modulus;
    return state / modulus;
  };
}
