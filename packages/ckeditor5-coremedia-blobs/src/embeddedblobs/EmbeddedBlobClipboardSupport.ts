import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import Editor from "@ckeditor/ckeditor5-core/src/editor/editor";
import Clipboard from "@ckeditor/ckeditor5-clipboard/src/clipboard";
import Logger from "@coremedia/ckeditor5-logging/logging/Logger";
import LoggerProvider from "@coremedia/ckeditor5-logging/logging/LoggerProvider";
import EventInfo from "@ckeditor/ckeditor5-utils/src/eventinfo";
import ClipboardEventData from "@ckeditor/ckeditor5-clipboard/src/clipboardobserver";
import CoreMediaClipboardUtils from "@coremedia/ckeditor5-coremedia-dragdrop-utils/CoreMediaClipboardUtils";

export default class EmbeddedBlobClipboardSupport extends Plugin {
  static #embeddedBlobClipboardSupport = "EmbeddedBlobClipboardSupport";
  static #LOGGER: Logger = LoggerProvider.getLogger(EmbeddedBlobClipboardSupport.#embeddedBlobClipboardSupport);

  static get pluginName(): string {
    return EmbeddedBlobClipboardSupport.#embeddedBlobClipboardSupport;
  }

  static get requires(): Array<new (editor: Editor) => Plugin> {
    return [Clipboard];
  }

  init(): Promise<void> | null {
    this.#initEventListeners();
    return null;
  }

  #initEventListeners(): void {
    const editor = this.editor;
    const view = editor.editing.view;
    const viewDocument = view.document;

    // Processing pasted or dropped content.
    this.listenTo(viewDocument, "clipboardInput", this.#clipboardInputHandler);
    this.listenTo(viewDocument, "dragover", EmbeddedBlobClipboardSupport.#dragOverHandler);
  }

  readonly #clipboardInputHandler = (evt: EventInfo, data: ClipboardEventData): void => {
    const extractContentUris = CoreMediaClipboardUtils.extractContentUris(data);
    EmbeddedBlobClipboardSupport.#LOGGER.debug("on debug");
  };

  static readonly #dragOverHandler = (evt: EventInfo, data: ClipboardEventData): void => {
    EmbeddedBlobClipboardSupport.#LOGGER.debug("on debug");
  };

  destroy(): null {
    const editor = this.editor;
    const view = editor.editing.view;
    const viewDocument = view.document;

    this.stopListening(viewDocument, "clipboardInput", this.#clipboardInputHandler);
    this.stopListening(viewDocument, "dragover", EmbeddedBlobClipboardSupport.#dragOverHandler);
    return null;
  }
}
