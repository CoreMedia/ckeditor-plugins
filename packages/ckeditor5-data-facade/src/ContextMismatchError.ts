/**
 * An error raised, when the context when getting the data does not match
 * the current context anymore.
 */
export class ContextMismatchError extends Error {
  constructor(message?: string) {
    super(message);
    // https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-2.html
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
