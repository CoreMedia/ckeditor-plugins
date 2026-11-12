/**
 * An error raised, when the context when getting the data does not match
 * the current context anymore.
 */
export class ContextMismatchError extends Error {
  /**
   * The actual context as of previously set data.
   */
  readonly actual?: string;
  /**
   * The expected context data got requested for.
   */
  readonly expected?: string;

  constructor(
    message?: string,
    contextInformation?: {
      actual?: string;
      expected?: string;
    },
  ) {
    super(message);

    this.actual = contextInformation?.actual;
    this.expected = contextInformation?.expected;
  }

  override toString(): string {
    return `ContextMismatchError: ${this.message} {actual=${this.actual}, expected=${this.expected}}`;
  }
}

/**
 * Typeguard to check if an error is a `ContextMismatchError`.
 *
 * @param error - the error to check
 */
export const isContextMismatchError = (error: unknown): error is ContextMismatchError =>
  error instanceof ContextMismatchError;
