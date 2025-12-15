/**
 * Represents an error that occurs during policy evaluation or enforcement.
 * Use this error to indicate issues related to policy logic, configuration, or execution.
 */
export class PolicyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PolicyError";
  }
}
