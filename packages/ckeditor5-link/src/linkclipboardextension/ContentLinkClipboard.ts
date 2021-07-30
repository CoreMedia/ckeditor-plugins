import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import Editor from "@ckeditor/ckeditor5-core/src/editor/editor";
import { DataTransfer } from "@ckeditor/ckeditor5-clipboard/src/clipboardobserver";
import {
  extractContentUriFromDragEventJsonData,
  requireContentCkeModelUri,
} from "@coremedia/coremedia-studio-integration/content/DragAndDropUtils";
import { serviceAgent } from "@coremedia/studio-apps-service-agent";
import ContentDisplayService from "@coremedia/coremedia-studio-integration/content/ContentDisplayService";
import ContentDisplayServiceDescriptor from "@coremedia/coremedia-studio-integration/content/ContentDisplayServiceDescriptor";
import { Subscription } from "rxjs";

export default class ContentLinkClipboard extends Plugin {
  private _contentSubscription: Subscription | undefined = undefined;

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

    const editor = this.editor;
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

      //If it is a content link we have to handle the event asynchronously to fetch data like the content name from a remote service.
      //Therefore we have to stop the event, otherwise we would have to treat the event synchronously.
      evt.stop();

      serviceAgent
        .fetchService<ContentDisplayService>(new ContentDisplayServiceDescriptor())
        .then((contentDisplayService: ContentDisplayService): void => {
          contentDisplayService.name(uriPath).then((contentName) => {
            ContentLinkClipboard.#handleContentNameResponse(editor, data, uriPath, contentName);
          });
        });
    });
  }

  static #handleContentNameResponse(editor: Editor, data: any, uriPath: string, contentName: string): void {
    editor.model.change((writer) => {
      if (data.targetRanges) {
        writer.setSelection(data.targetRanges.map((viewRange: Range) => editor.editing.mapper.toModelRange(viewRange)));
      }

      editor.model.enqueueChange("default", () => {
        const ckeModelContentUri = requireContentCkeModelUri(uriPath);
        const link = writer.createText(`${contentName}`, {
          linkHref: `${ckeModelContentUri}`,
        });

        editor.model.insertContent(link, editor.model.document.selection);
      });
    });
  }

  destroy(): Promise<never> | null {
    if (this._contentSubscription) {
      this._contentSubscription.unsubscribe();
    }
    return null;
  }
}
