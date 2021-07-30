import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import Editor from "@ckeditor/ckeditor5-core/src/editor/editor";
import { DataTransfer } from "@ckeditor/ckeditor5-clipboard/src/clipboardobserver";
import {
  extractContentUriFromDragEventJsonData,
  requireContentCkeModelUri,
} from "@coremedia/coremedia-studio-integration/content/DragAndDropUtils";
import UpcastWriter from "@ckeditor/ckeditor5-engine/src/view/upcastwriter";

export default class ContentLinkClipboard extends Plugin {
  static get pluginName(): string {
    return "ContentLinkClipboard";
  }

  static get requires(): Array<new (editor: Editor) => Plugin> {
    return [];
  }

  init(): Promise<void> | null {
    this.#defineClipboardInputOutput();
    return null;
  }

  #defineClipboardInputOutput(): void {
    const view = this.editor.editing.view;
    const viewDocument = view.document;

    // Processing pasted or dropped content.
    this.listenTo(viewDocument, "clipboardInput", (evt, data) => {
      // The clipboard content was already processed by the listener on the higher priority
      // (for example while pasting into the code block).
      if (data.content) {
        return;
      }

      const dataTransfer: DataTransfer = data.dataTransfer;
      const cmUriList: string = dataTransfer.getData("cm/uri-list");

      const uriPath = extractContentUriFromDragEventJsonData(cmUriList);
      //TODO: also handle text/uri-list for normal links.
      if (!uriPath) {
        return;
      }

      const ckeModelContentUri = requireContentCkeModelUri(uriPath);
      // Translate the h-card data to a view fragment.
      const writer = new UpcastWriter(viewDocument);
      const fragment = writer.createDocumentFragment();

      writer.appendChild(
        writer.createElement("a", { href: `${ckeModelContentUri}` }, `${ckeModelContentUri}`),
        fragment
      );

      // Provide the content to the clipboard pipeline for further processing.
      data.content = fragment;
    });
  }
}
