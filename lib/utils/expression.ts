const SAFE_EXPR = /^[0-9][0-9.+\-*/]*$/;

// Evaluates a simple arithmetic expression containing only digits, decimal points,
// and the four basic operators. Returns null for empty, invalid, or non-finite results.
export function evaluateExpression(input: string): number | null {
  const cleaned = input.trim();
  if (!cleaned) return null;
  if (!SAFE_EXPR.test(cleaned)) return null;
  try {
    // Safe: regex guarantees only digits, decimal points, and the four arithmetic operators
    const result = Function('"use strict"; return (' + cleaned + ')')();
    return typeof result === 'number' && isFinite(result) ? result : null;
  } catch {
    return null;
  }
}
