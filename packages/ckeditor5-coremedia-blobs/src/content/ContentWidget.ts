import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import Editor from "@ckeditor/ckeditor5-core/src/editor/editor";
import ContentWidgetEditing from "./ContentWidgetEditing";

export default class ContentWidget extends Plugin {
  static get requires(): Array<new (editor: Editor) => Plugin> {
    return [ContentWidgetEditing];
  }
}
