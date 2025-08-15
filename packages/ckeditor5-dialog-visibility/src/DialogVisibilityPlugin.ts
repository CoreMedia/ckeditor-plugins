import { Editor, Plugin, Dialog } from "ckeditor5";

export default class DialogVisibility extends Plugin {
  public static readonly pluginName = "DialogVisibility" as const;
  static readonly requires = [Dialog];
  intersectionObserver?: IntersectionObserver = undefined;
  isOpen = false;
  init(): void {
    const editorElement = this.editor.ui.element;
    if (editorElement) {
      this.observeEditorVisibility(editorElement);
    } else {
      this.waitForEditorReadyEvent();
    }
  }
  waitForEditorReadyEvent() {
    this.editor.on("ready", () => {
      const editorElement = this.editor.ui.element;
      if (editorElement) {
        this.observeEditorVisibility(editorElement);
      }
    });
  }
  observeEditorVisibility(editorElement: Element) {
    this.observeDialogState();
    this.intersectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const isVisible = entry.intersectionRatio > 0;
        if (!isVisible && this.isOpen) {
          this.closeDialog();
        }
      });
    }, {});
    this.intersectionObserver.observe(editorElement);
  }
  observeDialogState() {
    const editor: Editor = this.editor;
    const dialogPlugin: Dialog = editor.plugins.get("Dialog");
    if (dialogPlugin) {
      dialogPlugin.on("change:id", (eventInfo, name, value) => {
        // The Dialog plugin only changes the id when a dialog is shown or hidden.
        // On "show", the value is the id string (e.g. "findAndReplace"), on "hide" value is null.
        // Therefore, we know the dialog was closed when value is null.
        this.isOpen = !!value;
      });
    }
  }
  closeDialog() {
    const editor: Editor = this.editor;
    const dialogPlugin: Dialog = editor.plugins.get("Dialog");
    if (dialogPlugin) {
      dialogPlugin.hide();
    }
  }
  override destroy() {
    this.intersectionObserver?.disconnect();
    super.destroy();
  }
}
