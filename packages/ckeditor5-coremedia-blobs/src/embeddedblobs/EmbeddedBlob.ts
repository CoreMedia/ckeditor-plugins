import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import EmbeddedBlobEditing from "./EmbeddedBlobEditing";
import Editor from "@ckeditor/ckeditor5-core/src/editor/editor";
import Image from "@ckeditor/ckeditor5-image/src/image";
import ContentPlaceholder from "../content/ContentPlaceholder";

export default class EmbeddedBlob extends Plugin {
  static get requires(): Array<new (editor: Editor) => Plugin> {
    return [EmbeddedBlobEditing, ContentPlaceholder, Image];
  }
}
