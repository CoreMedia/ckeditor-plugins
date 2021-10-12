import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import EmbeddedBlobWidgetUI from "./EmbeddedBlobWidgetUI";
import EmbeddedBlobWidgetEditing from "./EmbeddedBlobWidgetEditing";
import Editor from "@ckeditor/ckeditor5-core/src/editor/editor";

export default class EmbeddedBlobWidget extends Plugin {
  static get requires(): Array<new (editor: Editor) => Plugin> {
    return [EmbeddedBlobWidgetEditing, EmbeddedBlobWidgetUI];
  }
}
