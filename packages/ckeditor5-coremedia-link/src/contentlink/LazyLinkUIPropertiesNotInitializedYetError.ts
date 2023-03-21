export class LazyLinkUIPropertiesNotInitializedYetError extends Error {
  constructor() {
    super("Lazy LinkUI properties (LinkUI.formView and LinkUI.actionsView) are not initialized yet.");
  }
}
