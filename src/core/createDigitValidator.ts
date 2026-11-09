export function createDigitValidator(base: number): (char: string) => boolean {
  const ALL_VALID_CHARS = '0123456789abcdef';
  const allowedChars = ALL_VALID_CHARS.slice(0, base);
  return (char: string): boolean => {
    if (char.length !== 1) {
      return false;
    }
    return allowedChars.includes(char.toLowerCase());
  };
}
