function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Required environment variable "${name}" is not set`);
  return value;
}

export const env = {
  INTERNAL_API_URL: requireEnv('INTERNAL_API_URL'),
};
