import Command from "@ckeditor/ckeditor5-core/src/command";
import Element from "@ckeditor/ckeditor5-engine/src/model/element";

export default class PictureWidgetCommand extends Command {
  execute({ contentId, property }: any) {
    const editor = this.editor;
    const selection = editor.model.document.selection;
    //http://localhost:12345/studio/rest/api/content/23618/properties/data;blob=44f2e8b5e29f66a529afd0a2fbabff2d/rm/fit;maxw=240
    editor.model.change((writer) => {
      // Create a <placeholder> elment with the "name" attribute (and all the selection attributes)...
      const placeholder = writer.createElement("placeholder", {
        ...Object.fromEntries(selection.getAttributes()),
        contentId: contentId,
        property: property,
      });

      // ... and insert it into the document.
      editor.model.insertContent(placeholder);

      // Put the selection on the inserted element.
      writer.setSelection(placeholder, "on");
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
    this.isEnabled = model.schema.checkChild(parent, "placeholder");
  }
}
