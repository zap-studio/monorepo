export const requireEnv = (name: string): string => {
  const value = process.env[name];
  if (!value || value.trim() === "") {
    throw new Error(`Environment variable ${name} is required but not set.`);
  }
  return value;
};

export const warnOptionalEnv = (name: string): string | undefined => {
  const value = process.env[name];
  if (!value || value.trim() === "") {
    console.warn(`Optional environment variable ${name} is not set.`);
  }
  return value;
};
