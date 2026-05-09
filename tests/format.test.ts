import { describe, expect, it } from 'vitest';
import { slugify, truncate, formatNumber } from '@shared/lib/format';

describe('format helpers', () => {
  it('slugifie correctement avec accents', () => {
    expect(slugify('Sciences & Tech')).toBe('sciences-tech');
    expect(slugify('Astronomie é à ï')).toBe('astronomie-e-a-i');
  });

  it('tronque proprement', () => {
    expect(truncate('abcdef', 4)).toBe('abc…');
    expect(truncate('abc', 5)).toBe('abc');
    expect(truncate(undefined)).toBe('—');
  });

  it('formatte les nombres', () => {
    expect(formatNumber(undefined)).toBe('—');
    expect(formatNumber(1234)).toMatch(/1.{0,2}234/);
  });
});
