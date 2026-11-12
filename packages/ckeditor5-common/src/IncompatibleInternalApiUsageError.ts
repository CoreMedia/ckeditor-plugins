/**
 * An error to raise when required internal API cannot be accessed (anymore).
 *
 * Raising this exception will help to identify issues on CKEditor 5 upgrade,
 * where the internal API changed.
 *
 * Note that when raising this exception, thus, relying on internal API,
 * it is best guarded by a comment to a corresponding issue, so that we
 * get rid of internal API usages eventually.
 */
export class IncompatibleInternalApiUsageError extends Error {
  constructor(message?: string) {
    super(message);
    // https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-2.html
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
