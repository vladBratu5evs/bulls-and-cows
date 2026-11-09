import { describe, it, expect } from 'vitest';
import { generateSecret } from './generateSecret.js';

describe('generateSecret', () => {
  it('should generate a secret string of the specified length', () => {
    const result = generateSecret(4, 10);
    expect(result).toBeTypeOf('string');
    expect(result).toHaveLength(4);
  });

  it('should only contain unique digits within the specified base system', () => {
    const length = 6;
    const base = 10;
    const result = generateSecret(length, base);

    const uniqueChars = new Set(result.split(''));
    expect(uniqueChars.size).toBe(length);

    result.split('').forEach((char: string) => {
      const num = parseInt(char, base);
      expect(num).toBeGreaterThanOrEqual(0);
      expect(num).toBeLessThan(base);
    });
  });

  it('should be deterministic when given a mock random function', () => {
    const mockRandom = () => 0.25;

    const firstCall = generateSecret(4, 10, mockRandom);
    const secondCall = generateSecret(4, 10, mockRandom);

    expect(firstCall).toBe(secondCall);
    expect(firstCall).toBe('2341');
  });

  it('should preserve leading zeros correctly', () => {
    const mockRandom = () => 0;

    const result = generateSecret(4, 10, mockRandom);

    expect(result).toBe('0123');
    expect(result.startsWith('0')).toBe(true);
  });

  it('should work correctly with higher bases like hexadecimal', () => {
    const length = 5;
    const base = 16;
    const result = generateSecret(length, base);

    expect(result).toHaveLength(length);

    result.split('').forEach((char: string) => {
      expect(char).toMatch(/^[0-9a-f]$/);
    });
  });

  it('should support pulling the maximum possible length for a given base', () => {
    const base = 8;
    const result = generateSecret(base, base);

    expect(result).toHaveLength(base);

    const uniqueChars = new Set(result.split(''));
    expect(uniqueChars.size).toBe(base);
  });

  it('should throw an error if the requested length is greater than the base', () => {
    expect(() => {
      generateSecret(5, 4);
    }).toThrow(
      'Secret length cannot exceed the number of unique digits available in the base.',
    );
  });
});
