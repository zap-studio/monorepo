export function handleCompromisedPasswordError(error: unknown): void {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "PASSWORD_COMPROMISED"
  ) {
    throw new Error(
      "This password has been exposed in a data breach. Please choose a stronger, unique password.",
    );
  }
  throw new Error("An error occurred during authentication. Please try again.");
}
