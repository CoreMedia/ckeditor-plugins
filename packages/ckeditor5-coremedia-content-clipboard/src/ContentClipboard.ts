/* eslint no-null/no-null: off */

import { Plugin, Editor } from "@ckeditor/ckeditor5-core";
import Logger from "@coremedia/ckeditor5-logging/src/logging/Logger";
import LoggerProvider from "@coremedia/ckeditor5-logging/src/logging/LoggerProvider";
import {
  Clipboard,
  ClipboardContentInsertionEvent,
  ClipboardInputTransformationData,
  ClipboardInputTransformationEvent,
  ClipboardPipeline,
  ViewDocumentClipboardInputEvent,
} from "@ckeditor/ckeditor5-clipboard";
import {
  Range as ModelRange,
  ViewRange,
  DocumentFragment as ModelDocumentFragment,
  ViewDocumentFragment,
  ViewDocument,
  StylesProcessor,
  DomEventData,
} from "@ckeditor/ckeditor5-engine";
import { EventInfo } from "@ckeditor/ckeditor5-utils";
import {
  ClipboardEventData,
  ClipboardInputEventData,
  ViewDocumentDragOverEvent,
} from "@ckeditor/ckeditor5-clipboard/src/clipboardobserver";
import ContentClipboardEditing from "./ContentClipboardEditing";
import { InitInformation, reportInitEnd, reportInitStart } from "@coremedia/ckeditor5-core-common/src/Plugins";
import { disableUndo, UndoSupport } from "./integrations/Undo";
import { isRaw } from "@coremedia/ckeditor5-common/src/AdvancedTypes";
import { insertContentMarkers } from "./ContentMarkers";
import {
  getEvaluationResult,
  isDroppable,
  IsDroppableEvaluationResult,
} from "@coremedia/ckeditor5-coremedia-studio-integration/src/content/IsDroppableInRichtext";
import { receiveDraggedItemsFromDataTransfer } from "@coremedia/ckeditor5-coremedia-studio-integration/src/content/studioservices/DragDropServiceWrapper";

const PLUGIN_NAME = "ContentClipboardPlugin";

/**
 * Artificial interface of `ClipboardEventData`, which holds a content.
 */
export interface ContentEventData<T> extends ClipboardEventData {
  content: T;
}

/**
 * Type-Guard for ContentEventData.
 *
 * @param value - value to validate
 */
const isContentEventData = <T extends ClipboardEventData>(value: T): value is T & ContentEventData<unknown> =>
  isRaw<ContentEventData<unknown>>(value, "content");

/**
 * This plugin takes care of linkable Studio contents, which are dropped
 * directly into the editor or pasted from the clipboard.
 */
export default class ContentClipboard extends Plugin {
  static readonly pluginName = PLUGIN_NAME;
  static readonly #logger: Logger = LoggerProvider.getLogger(PLUGIN_NAME);

  static readonly requires = [Clipboard, ClipboardPipeline, ContentClipboardEditing, UndoSupport];

  init(): void {
    const initInformation: InitInformation = reportInitStart(this);
    this.#initEventListeners();
    reportInitEnd(initInformation);
  }

  /**
   * Adds a listener to `dragover` and `clipboardInput` to process possibly
   * dragged contents.
   */
  #initEventListeners(): void {
    const editor = this.editor;
    const view = editor.editing.view;
    const viewDocument = view.document;

    // Processing pasted or dropped content.
    this.listenTo<ViewDocumentClipboardInputEvent>(viewDocument, "clipboardInput", this.#clipboardInputHandler);
    // Priority `low` required, so that we can control the `dropEffect`.
    this.listenTo<ViewDocumentDragOverEvent>(viewDocument, "dragover", ContentClipboard.#dragOverHandler, {
      priority: "low",
    });

    if (editor.plugins.has(ClipboardPipeline)) {
      const clipboardPipelinePlugin = editor.plugins.get(ClipboardPipeline);
      this.listenTo<ClipboardInputTransformationEvent>(
        clipboardPipelinePlugin,
        "inputTransformation",
        this.#inputTransformation,
      );
    }
  }

  override destroy(): void {
    const editor = this.editor;
    const view = editor.editing.view;
    const viewDocument = view.document;

    this.stopListening(viewDocument, "clipboardInput", this.#clipboardInputHandler);
    this.stopListening(viewDocument, "dragover", ContentClipboard.#dragOverHandler);
    if (editor.plugins.has(ClipboardPipeline)) {
      this.stopListening(editor.plugins.get(ClipboardPipeline), "inputTransformation", this.#inputTransformation);
    }
  }

  // noinspection JSUnusedLocalSymbols
  /**
   * Drag-over handler to control drop-effect icons, which is, to forbid for
   * any content-sets containing types, which are not allowed to be linked.
   *
   * @param evt - event information
   * @param data - clipboard data
   */
  static #dragOverHandler(evt: EventInfo<"dragover">, data: DomEventData<DragEvent> & ClipboardEventData): void {
    // The listener already processed the clipboard content on the
    // higher priority (for example, while pasting into the code block).
    if (isContentEventData(data) && !!data.content) {
      return;
    }
    const isDroppableEvaluationResult = isDroppable();
    if (!isDroppableEvaluationResult) {
      return;
    }

    data.preventDefault();

    if (isDroppableEvaluationResult === "PENDING") {
      ContentClipboard.#logger.debug("Drag over evaluation is currently pending", data);
      data.dataTransfer.dropEffect = "none";
      return;
    }

    if (isDroppableEvaluationResult.isDroppable) {
      data.dataTransfer.dropEffect = "link";
    } else {
      data.dataTransfer.dropEffect = "none";
    }
  }

  // noinspection JSUnusedLocalSymbols
  /**
   * Handler for the clipboardInput event. This function gets called when
   * an item is dropped or pasted into the editor.
   *
   * See: https://github.com/ckeditor/ckeditor5/blob/6eab4831ef4432152069c457c8921395315c1b33/packages/ckeditor5-clipboard/src/clipboardpipeline.js#L59-L121
   * The goal here is to hook into the clipboardPipeline and use our
   * inputTransform method if the clipboard data is a CoreMedia content.
   *
   * @param evt - event information
   * @param data - clipboard data
   */
  #clipboardInputHandler = (
    evt: EventInfo<"clipboardInput">,
    data: DomEventData<ClipboardEvent | DragEvent> & ClipboardInputEventData,
  ): void => {
    const dataTransfer: DataTransfer = data.dataTransfer as unknown as DataTransfer;
    if (!dataTransfer) {
      return;
    }

    const uris: string[] | undefined = receiveDraggedItemsFromDataTransfer(dataTransfer);
    if (!uris) {
      return;
    }

    const isDroppableResult: IsDroppableEvaluationResult | undefined = getEvaluationResult(uris);
    // Return if this is no CoreMedia content drop.
    if (!isDroppableResult) {
      return;
    }

    // This is kinda hacky, we need to set content to skip the default
    // clipboardInputHandler by setting content, we mark this event as
    // "already resolved".
    data.content = new ViewDocumentFragment(new ViewDocument(new StylesProcessor()));
  };

  /**
   * Event listener callback that gets hooked into CKEditor's clipboardPipeline.
   * If the retrieved data is a CoreMedia content, the event will be stopped.
   * This also stops the default clipboardPipeline.
   *
   * After adding all needed markers (and UIElements), we trigger the last step
   * of the pipeline manually by firing an event with an empty document
   * fragment.
   *
   * **Important:** This function also disabled the undo command. Be sure to
   * enable it again after the content has been written to the model.
   *
   * @param evt - event information
   * @param data - clipboard data
   */
  #inputTransformation = (evt: EventInfo<"inputTransformation">, data: ClipboardInputTransformationData): void => {
    const dataTransfer: DataTransfer = data.dataTransfer as unknown as DataTransfer;
    if (!dataTransfer) {
      return;
    }

    const uris: string[] | undefined = receiveDraggedItemsFromDataTransfer(dataTransfer);
    if (!uris) {
      return;
    }

    const isDroppableResult: IsDroppableEvaluationResult | undefined = getEvaluationResult(uris);
    if (!isDroppableResult || isDroppableResult === "PENDING") {
      return;
    }

    // Return if this is no CoreMedia content drop.
    if (!isDroppableResult.uris || isDroppableResult.uris.length === 0) {
      return;
    }

    const droppableUris = isDroppableResult.uris;

    const { editor } = this;

    // Return if no range has been set (usually indicated by a blue cursor
    // during the drag)
    const targetRange = ContentClipboard.#evaluateTargetRange(editor, data);
    if (!targetRange) {
      return;
    }

    // Do not trigger the default inputTransformation event listener to avoid
    // rendering the text of the input data.
    evt.stop();

    // We might run into trouble during complex input scenarios:
    //
    // A drop with multiple items will result in different requests that might
    // differ in response time, for example.
    //
    // Triggering undo/redo, while only a part of the input has already been
    // resolved, will cause an inconsistent state between content and
    // placeholder elements.
    //
    // The best solution for this seems to disable the undo command before the
    // input and enable it again afterward.
    disableUndo(editor.plugins.get(UndoSupport));

    const { model } = editor;

    insertContentMarkers(editor, targetRange, droppableUris);
    // Fire content insertion event in a single change block to allow other
    // handlers to run in the same block without post-fixers called in between
    // (i.e., the selection post-fixer).
    model.change(() => {
      this.fire<ClipboardContentInsertionEvent>("contentInsertion", {
        content: new ModelDocumentFragment(),
        method: data.method,
        dataTransfer: data.dataTransfer,
        targetRanges: data.targetRanges,
      });
    });
  };

  /**
   * Evaluate target range. `null` if no range could be determined.
   *
   * @param editor - current editor instance
   * @param data - event data
   */
  static #evaluateTargetRange(editor: Editor, data: ClipboardInputTransformationData): ModelRange | null {
    if (!data.targetRanges) {
      return editor.model.document.selection.getFirstRange();
    }
    const targetRanges: ModelRange[] = data.targetRanges.map(
      (viewRange: ViewRange): ModelRange => editor.editing.mapper.toModelRange(viewRange),
    );
    if (targetRanges.length > 0) {
      return targetRanges[0];
    }
    return null;
  }
}
