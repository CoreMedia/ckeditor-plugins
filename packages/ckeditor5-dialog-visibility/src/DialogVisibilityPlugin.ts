import { Editor, Plugin } from "@ckeditor/ckeditor5-core";
import { Dialog } from "@ckeditor/ckeditor5-ui";

export default class DialogVisibility extends Plugin {
  public static readonly pluginName = "DialogVisibility" as const;
  static readonly requires = [Dialog];

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
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const isVisible = entry.intersectionRatio > 0;
        if (!isVisible) {
          this.closeDialog();
        }
      });
    }, {});

    observer.observe(editorElement);
  }

  closeDialog() {
    const editor: Editor = this.editor;
    const dialogPlugin: Dialog = editor.plugins.get("Dialog");
    if (dialogPlugin) {
      dialogPlugin.hide();
    }
  }
}
