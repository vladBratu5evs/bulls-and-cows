export interface GuessResult {
  bulls: number;
  cows: number;
}

export function evaluateGuess(secret: string, guess: string): GuessResult {
  const secretArr = secret.split('');
  const guessArr = guess.split('');

  const bulls = guessArr.filter(
    (char, index) => char === secretArr[index],
  ).length;

  const secretInventory = secretArr.reduce<Record<string, number>>(
    (acc, char) => {
      acc[char] = (acc[char] || 0) + 1;
      return acc;
    },
    {},
  );

  const totalMatches = guessArr.reduce<number>((count, char) => {
    if (secretInventory[char] && secretInventory[char] > 0) {
      secretInventory[char]--;
      return count + 1;
    }
    return count;
  }, 0);

  const cows = totalMatches - bulls;

  return { bulls, cows };
}
