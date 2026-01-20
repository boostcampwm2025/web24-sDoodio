export const getRandomIndex = (length: number): number => {
  if (length <= 0) {
    return -1;
  }
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return array[0] % length;
};

export const getRandomElement = <T>(array: T[]): T | undefined => {
  if (array.length === 0) {
    return undefined;
  }
  const index = getRandomIndex(array.length);
  return array[index];
};
