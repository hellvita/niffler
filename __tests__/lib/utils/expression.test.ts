import { describe, it, expect } from 'vitest';
import { evaluateExpression } from '@/lib/utils/expression';

describe('evaluateExpression', () => {
  it('returns the number for a plain integer', () => {
    expect(evaluateExpression('28')).toBe(28);
  });

  it('returns the number for a plain decimal', () => {
    expect(evaluateExpression('9.99')).toBe(9.99);
  });

  it('handles a trailing decimal point', () => {
    expect(evaluateExpression('28.')).toBe(28);
  });

  it('evaluates addition', () => {
    expect(evaluateExpression('17+20')).toBe(37);
  });

  it('evaluates subtraction', () => {
    expect(evaluateExpression('30-8')).toBe(22);
  });

  it('evaluates multiplication', () => {
    expect(evaluateExpression('6*7')).toBe(42);
  });

  it('evaluates division', () => {
    expect(evaluateExpression('10/4')).toBe(2.5);
  });

  it('evaluates chained operations respecting operator precedence', () => {
    expect(evaluateExpression('5+3*2')).toBe(11);
  });

  it('returns null for an empty string', () => {
    expect(evaluateExpression('')).toBeNull();
  });

  it('returns null for a whitespace-only string', () => {
    expect(evaluateExpression('   ')).toBeNull();
  });

  it('returns null when expression starts with an operator', () => {
    expect(evaluateExpression('+5')).toBeNull();
    expect(evaluateExpression('-5')).toBeNull();
  });

  it('returns null for a trailing operator (incomplete expression)', () => {
    expect(evaluateExpression('17+')).toBeNull();
    expect(evaluateExpression('10*')).toBeNull();
  });

  it('returns null for division by zero', () => {
    expect(evaluateExpression('5/0')).toBeNull();
  });

  it('returns null when the expression contains letters', () => {
    expect(evaluateExpression('5abc')).toBeNull();
  });

  it('returns null when the expression contains unsupported characters', () => {
    expect(evaluateExpression('5%2')).toBeNull();
    expect(evaluateExpression('5^2')).toBeNull();
  });
});
