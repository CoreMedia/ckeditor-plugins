import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import Editor from "@ckeditor/ckeditor5-core/src/editor/editor";
import ContentPlaceholderEditing from "./ContentPlaceholderEditing";

export default class ContentPlaceholder extends Plugin {
  static get requires(): Array<new (editor: Editor) => Plugin> {
    return [ContentPlaceholderEditing];
  }
}
