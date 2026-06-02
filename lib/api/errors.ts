export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly data?: unknown
  ) {
    super(`API error ${status}`);
  }
}
