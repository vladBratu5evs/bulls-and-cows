import { describe, it, expect } from 'vitest';
import { isValidGuess } from './isValidGuess.js';

describe('isValidGuess', () => {
  it('should return a function', () => {
    const validate = isValidGuess('10', 2, 2);
    expect(typeof validate).toBe('boolean');
  });

  it('should return true for valid guesses', () => {
    expect(isValidGuess('123', 3, 10)).toBe(true);
    expect(isValidGuess('012345', 6, 10)).toBe(true);
    expect(isValidGuess('A1B', 3, 16)).toBe(true);
    expect(isValidGuess('10', 2, 2)).toBe(true);
  });

  it('should return false if length does not match', () => {
    expect(isValidGuess('123', 4, 10)).toBe(false);
    expect(isValidGuess('12345', 3, 10)).toBe(false);
    expect(isValidGuess('', 3, 10)).toBe(false);
  });

  it('should return false if characters are invalid for the given base', () => {
    expect(isValidGuess('123', 3, 3)).toBe(false);
    expect(isValidGuess('102', 3, 2)).toBe(false);
    expect(isValidGuess('12G', 3, 16)).toBe(false);
    expect(isValidGuess('-12', 3, 10)).toBe(false);
    expect(isValidGuess('1.2', 3, 10)).toBe(false);
  });

  it('should return false if there are duplicate characters', () => {
    expect(isValidGuess('112', 3, 10)).toBe(false);
    expect(isValidGuess('121', 3, 10)).toBe(false);
    expect(isValidGuess('ABA', 3, 16)).toBe(false);
  });
});
