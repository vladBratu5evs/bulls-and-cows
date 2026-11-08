import { describe, it, expect } from 'vitest';
import { countPossibleSecrets } from './countPossibleSecrets.js';

describe('countPossibleSecrets', () => {
  it('should return a number', () => {
    const numberOfSecrets: number = countPossibleSecrets(2, 2);
    expect(typeof numberOfSecrets).toBe('number');
  });

  it('should calculate correct secrets for base 2 and lengths 2 to 6', () => {
    expect(countPossibleSecrets(2, 2)).toBe(2);
  });

  it('should calculate correct secrets for base 8 and lengths 2 to 6', () => {
    expect(countPossibleSecrets(2, 8)).toBe(56);
    expect(countPossibleSecrets(3, 8)).toBe(336);
    expect(countPossibleSecrets(4, 8)).toBe(1680);
    expect(countPossibleSecrets(5, 8)).toBe(6720);
    expect(countPossibleSecrets(6, 8)).toBe(20160);
  });

  it('should calculate correct secrets for base 10 and lengths 2 to 6', () => {
    expect(countPossibleSecrets(2, 10)).toBe(90);
    expect(countPossibleSecrets(3, 10)).toBe(720);
    expect(countPossibleSecrets(4, 10)).toBe(5040);
    expect(countPossibleSecrets(5, 10)).toBe(30240);
    expect(countPossibleSecrets(6, 10)).toBe(151200);
  });

  it('should calculate correct secrets for base 16 and lengths 2 to 6', () => {
    expect(countPossibleSecrets(2, 16)).toBe(240);
    expect(countPossibleSecrets(3, 16)).toBe(3360);
    expect(countPossibleSecrets(4, 16)).toBe(43680);
    expect(countPossibleSecrets(5, 16)).toBe(524160);
    expect(countPossibleSecrets(6, 16)).toBe(5765760);
  });
});
