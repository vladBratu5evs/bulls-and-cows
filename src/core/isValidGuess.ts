export function isValidGuess(
  guess: string,
  length: number,
  base: number,
): boolean {
  if (guess.length !== length) {
    return false;
  }
  if (new Set(guess.toUpperCase()).size !== length) {
    return false;
  }
  for (const char of guess) {
    const digitValue = parseInt(char, base);
    if (isNaN(digitValue)) {
      return false;
    }
  }

  return true;
}
