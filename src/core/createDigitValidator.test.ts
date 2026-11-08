import { describe, it, expect } from 'vitest';
import { createDigitValidator } from './createDigitValidator.js';

describe('createDigitValidator', () => {
  it('should return a function', () => {
    const validate = createDigitValidator(10);
    expect(typeof validate).toBe('function');
  });

  it('decimal (base 10), should validate digits 0-9', () => {
    const isDecimal = createDigitValidator(10);
    expect(isDecimal('0')).toBe(true);
    expect(isDecimal('9')).toBe(true);
    expect(isDecimal('a')).toBe(false);
    expect(isDecimal('10')).toBe(false);
  });

  it('binary (base 2), should validate digits 0-1', () => {
    const isBinary = createDigitValidator(2);
    expect(isBinary('0')).toBe(true);
    expect(isBinary('1')).toBe(true);
    expect(isBinary('2')).toBe(false);
  });

  it('octal (base 8), should validate digits 0-7', () => {
    const isOctal = createDigitValidator(8);
    expect(isOctal('0')).toBe(true);
    expect(isOctal('7')).toBe(true);
    expect(isOctal('8')).toBe(false);
  });

  it('hexadecimal (base 16), should validate digits 0-9 and letters a-f', () => {
    const isHexadecimal = createDigitValidator(16);
    expect(isHexadecimal('0')).toBe(true);
    expect(isHexadecimal('9')).toBe(true);
    expect(isHexadecimal('10')).toBe(false);
    expect(isHexadecimal('a')).toBe(true);
    expect(isHexadecimal('f')).toBe(true);
    expect(isHexadecimal('F')).toBe(true);
    expect(isHexadecimal('g')).toBe(false);
  });
});
