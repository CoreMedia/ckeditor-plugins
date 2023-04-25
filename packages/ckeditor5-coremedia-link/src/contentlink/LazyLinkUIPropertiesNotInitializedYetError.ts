// TODO[cke] Find better way and better details for this error (e.g., should denote, which property is missing)
export class LazyLinkUIPropertiesNotInitializedYetError extends Error {
  constructor() {
    super("Lazy LinkUI properties (LinkUI.formView and LinkUI.actionsView) are not initialized yet.");
    // https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-2.html
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
