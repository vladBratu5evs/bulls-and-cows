// evaluateGuess.test.ts
import { describe, test, expect } from 'vitest';
import { evaluateGuess } from './evaluateGuess.js';

describe('evaluateGuess', () => {
  test('returns 4 bulls for an exact match', () => {
    expect(evaluateGuess('1234', '1234')).toEqual({ bulls: 4, cows: 0 });
  });

  test('returns 0 bulls and 0 cows for a complete mismatch', () => {
    expect(evaluateGuess('1234', '5678')).toEqual({ bulls: 0, cows: 0 });
  });

  test('returns only cows when digits match but positions are wrong', () => {
    expect(evaluateGuess('1234', '4321')).toEqual({ bulls: 0, cows: 4 });
  });

  test('returns a mix of bulls and cows', () => {
    expect(evaluateGuess('1234', '1423')).toEqual({ bulls: 1, cows: 3 });
  });

  test('handles repeated digits correctly without double-counting', () => {
    expect(evaluateGuess('1122', '1234')).toEqual({ bulls: 1, cows: 1 });
  });
});
