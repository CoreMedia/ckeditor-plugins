import Command from "@ckeditor/ckeditor5-core/src/command";
import Element from "@ckeditor/ckeditor5-engine/src/model/element";
import EmbeddedBlobCommandInput from "./EmbeddedBlobCommandInput";

export default class EmbeddedBlobWidgetCommand extends Command {
  execute({ contentUri, property }: EmbeddedBlobCommandInput): void {
    const editor = this.editor;
    const selection = editor.model.document.selection;

    editor.model.change((writer) => {
      const embeddedBlob = writer.createElement("embeddedBlob", {
        ...Object.fromEntries(selection.getAttributes()),
        contentUri: contentUri,
        property: property,
      });

      editor.model.insertContent(embeddedBlob);
      writer.setSelection(embeddedBlob, "on");
    });
  }

  refresh(): void {
    const model = this.editor.model;
    const selection = model.document.selection;
    if (!selection || !selection.focus) {
      return;
    }
    const parent = selection.focus.parent;
    if (!(parent instanceof Element)) {
      return;
    }
    this.isEnabled = model.schema.checkChild(parent, "embeddedBlob");
  }
}
