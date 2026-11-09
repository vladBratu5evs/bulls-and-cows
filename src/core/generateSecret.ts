export function generateSecret(
  length: number,
  base: number,
  random: () => number = Math.random,
): string {
  if (length > base) {
    throw new Error(
      'Secret length cannot exceed the number of unique digits available in the base.',
    );
  }

  const digits: string[] = [];
  for (let i = 0; i < base; i++) {
    digits.push(i.toString(base));
  }

  const result: string[] = [];

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(random() * digits.length);
    const removed = digits.splice(randomIndex, 1);
    if (removed[0] !== undefined) {
      result.push(removed[0]);
    }
  }

  return result.join('');
}
