import { describe, it, expect } from 'vitest';
import {
  loginSchema,
  registerSchema,
  amountSchema,
  categoryNameSchema,
  limitSchema,
  columnMappingSchema,
} from '@/lib/validation/schemas';

// ── helpers ──────────────────────────────────────────────────────────────────

function firstMessage(result: { success: false; error: { issues: Array<{ message: string }> } }) {
  return result.error.issues[0]?.message ?? '';
}

function fieldMessages(result: ReturnType<typeof loginSchema.safeParse>) {
  if (result.success) return {};
  const map: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const key = issue.path.join('.') || '_root';
    map[key] = issue.message;
  }
  return map;
}

// ── loginSchema ───────────────────────────────────────────────────────────────

describe('loginSchema', () => {
  it('accepts valid credentials', () => {
    const result = loginSchema.safeParse({ email: 'a@b.com', password: 'password1' });
    expect(result.success).toBe(true);
  });

  it('rejects empty email', () => {
    const result = loginSchema.safeParse({ email: '', password: 'password1' });
    expect(result.success).toBe(false);
    if (!result.success) expect(fieldMessages(result).email).toContain('Invalid email');
  });

  it('rejects non-email string', () => {
    const result = loginSchema.safeParse({ email: 'notanemail', password: 'password1' });
    expect(result.success).toBe(false);
    if (!result.success) expect(fieldMessages(result).email).toContain('Invalid email');
  });

  it('rejects password shorter than 8 characters', () => {
    const result = loginSchema.safeParse({ email: 'a@b.com', password: 'short' });
    expect(result.success).toBe(false);
    if (!result.success)
      expect(fieldMessages(result).password).toContain('Password must be at least 8 characters');
  });
});

// ── registerSchema ────────────────────────────────────────────────────────────

describe('registerSchema', () => {
  it('accepts valid input when passwords match', () => {
    const result = registerSchema.safeParse({
      email: 'a@b.com',
      password: 'password1',
      confirmPassword: 'password1',
    });
    expect(result.success).toBe(true);
  });

  it('rejects when passwords do not match', () => {
    const result = registerSchema.safeParse({
      email: 'a@b.com',
      password: 'password1',
      confirmPassword: 'different',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(fieldMessages(result).confirmPassword).toContain('Passwords do not match');
    }
  });

  it('rejects invalid email (inherits loginSchema rules)', () => {
    const result = registerSchema.safeParse({
      email: 'bad',
      password: 'password1',
      confirmPassword: 'password1',
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(fieldMessages(result).email).toContain('Invalid email');
  });

  it('rejects short password (inherits loginSchema rules)', () => {
    const result = registerSchema.safeParse({
      email: 'a@b.com',
      password: 'short',
      confirmPassword: 'short',
    });
    expect(result.success).toBe(false);
    if (!result.success)
      expect(fieldMessages(result).password).toContain('Password must be at least 8 characters');
  });
});

// ── amountSchema ──────────────────────────────────────────────────────────────

describe('amountSchema', () => {
  it('accepts 0', () => expect(amountSchema.safeParse(0).success).toBe(true));
  it('accepts 9.99', () => expect(amountSchema.safeParse(9.99).success).toBe(true));
  it('accepts 100', () => expect(amountSchema.safeParse(100).success).toBe(true));

  it('rejects negative numbers', () => {
    expect(amountSchema.safeParse(-1).success).toBe(false);
  });

  it('rejects more than 2 decimal places', () => {
    expect(amountSchema.safeParse(1.999).success).toBe(false);
  });
});

// ── categoryNameSchema ────────────────────────────────────────────────────────

describe('categoryNameSchema', () => {
  it('accepts a normal name', () => {
    expect(categoryNameSchema.safeParse('Groceries').success).toBe(true);
  });

  it('rejects empty string', () => {
    const result = categoryNameSchema.safeParse('');
    expect(result.success).toBe(false);
    if (!result.success) expect(firstMessage(result)).toContain('Name is required');
  });

  it('rejects a string of 101 characters', () => {
    const result = categoryNameSchema.safeParse('a'.repeat(101));
    expect(result.success).toBe(false);
    if (!result.success)
      expect(firstMessage(result)).toContain('Name must be 100 characters or fewer');
  });

  it('accepts a string of exactly 100 characters', () => {
    expect(categoryNameSchema.safeParse('a'.repeat(100)).success).toBe(true);
  });
});

// ── limitSchema ───────────────────────────────────────────────────────────────

describe('limitSchema', () => {
  it('accepts valid amount + valid ISO date', () => {
    const result = limitSchema.safeParse({ amount: 50, effectiveFromDate: '2026-05-14' });
    expect(result.success).toBe(true);
  });

  it('rejects negative amount', () => {
    const result = limitSchema.safeParse({ amount: -10, effectiveFromDate: '2026-05-14' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid date string', () => {
    const result = limitSchema.safeParse({ amount: 50, effectiveFromDate: 'not-a-date' });
    expect(result.success).toBe(false);
    if (!result.success) expect(fieldMessages(result).effectiveFromDate).toContain('Invalid date');
  });

  it('rejects non-ISO date formats', () => {
    const result = limitSchema.safeParse({ amount: 50, effectiveFromDate: '14/05/2026' });
    expect(result.success).toBe(false);
  });
});

// ── columnMappingSchema ───────────────────────────────────────────────────────

describe('columnMappingSchema', () => {
  const valid = {
    dateColumnIndex: 0,
    categoryColumnIndexes: [1, 2],
    incomeColumnIndex: 3,
    scaleFactor: 1,
    invertSign: false,
  };

  it('accepts valid mapping', () => {
    expect(columnMappingSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects when a category column index equals the date column index', () => {
    const result = columnMappingSchema.safeParse({
      ...valid,
      categoryColumnIndexes: [0, 2], // 0 is the date column
    });
    expect(result.success).toBe(false);
    if (!result.success)
      expect(fieldMessages(result).categoryColumnIndexes).toContain(
        'Date column cannot also be a category column'
      );
  });

  it('rejects when the income column equals the date column', () => {
    const result = columnMappingSchema.safeParse({
      ...valid,
      incomeColumnIndex: 0, // same as dateColumnIndex
    });
    expect(result.success).toBe(false);
    if (!result.success)
      expect(fieldMessages(result).incomeColumnIndex).toContain(
        'Income column cannot be the same as the date column'
      );
  });

  it('rejects when the income column is also a category column', () => {
    const result = columnMappingSchema.safeParse({
      ...valid,
      categoryColumnIndexes: [1, 3], // 3 is the income column
    });
    expect(result.success).toBe(false);
    if (!result.success)
      expect(fieldMessages(result).incomeColumnIndex).toContain(
        'Income column cannot also be a category column'
      );
  });

  it('rejects non-positive scale factor', () => {
    const result = columnMappingSchema.safeParse({ ...valid, scaleFactor: 0 });
    expect(result.success).toBe(false);
    if (!result.success)
      expect(fieldMessages(result).scaleFactor).toContain(
        'Scale factor must be a positive number'
      );
  });

  it('rejects empty categoryColumnIndexes', () => {
    const result = columnMappingSchema.safeParse({ ...valid, categoryColumnIndexes: [] });
    expect(result.success).toBe(false);
    if (!result.success)
      expect(fieldMessages(result).categoryColumnIndexes).toContain(
        'Select at least one category column'
      );
  });
});
