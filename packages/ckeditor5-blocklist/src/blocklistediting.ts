import { Plugin } from "@ckeditor/ckeditor5-core";
import BlocklistCommand, { BLOCKLIST_COMMAND_NAME } from "./blocklistCommand";
import { Collection } from "@ckeditor/ckeditor5-utils";
import { createSearchCallback, onDocumentChange, ResultType, updateFindResultFromRange } from "./blocklistChangesUtils";

export default class BlocklistEditing extends Plugin {
  static readonly pluginName: string = "BlocklistEditing";

  blockedWordMarkers: Collection<ResultType> = new Collection<ResultType>();

  init(): void {
    const editor = this.editor;
    editor.commands.add(BLOCKLIST_COMMAND_NAME, new BlocklistCommand(editor));

    // model to editing view downcast
    this.#defineConversion();

    // whenever the data in the editor changes, we need to check new nodes
    // for blocklisted words, or remove markers if nodes have been removed
    editor.model.document.on("change:data", () => {
      onDocumentChange(this.blockedWordMarkers, editor);
    });
  }

  /**
   * Removes all markers for a given blocklisted word.
   * This means:
   * * The local collection of markers will be cleared of
   * all markers for the given word.
   * * The model is adjusted accordingly.
   *
   * @param wordToUnblock - the word, defining the markers that will be removed
   */
  removeMarkersForWord(wordToUnblock: string): void {
    const model = this.editor.model;
    const markers = this.blockedWordMarkers;
    const markersToRemove: string[] = [];
    model.change((writer) => {
      markers.map((resultType) => {
        const markerName = resultType.marker?.name;
        if (markerName === undefined || resultType.id === undefined) {
          return;
        }
        const { blockedWord } = this.#splitMarkerName(markerName);
        if (wordToUnblock === blockedWord) {
          writer.removeMarker(markerName);
          markersToRemove.push(resultType.id);
        }
      });
    });
    markersToRemove.forEach((markerId) => {
      markers.remove(markerId);
    });
  }

  /**
   * Adds markers for a given blocklisted word.
   * This means:
   * * New markers for the given word will be pushed to the
   * local collection of markers.
   * * The model is adjusted accordingly.
   *
   * Important: This function does not know whether the blocklisted word is already
   * marked in the gui. Calling it twice, will result in a dirty ui with multiple
   * nested marker spans.
   *
   * @param wordToBlock - the word, defining the markers that will be added
   */
  addMarkersForWord(wordToBlock: string): void {
    const model = this.editor.model;

    // Initial search for word is done on all nodes in all roots inside the content.
    model.document.getRootNames().reduce((currentResults: Collection<ResultType> | undefined, rootName) => {
      const rootElement = model.document.getRoot(rootName);
      if (!rootElement) {
        return undefined;
      }
      return updateFindResultFromRange(
        wordToBlock,
        this.editor,
        model.createRangeIn(rootElement),
        model,
        createSearchCallback(wordToBlock),
        this.blockedWordMarkers
      );
    }, undefined);
  }

  /**
   * Sets up the marker downcast converters for blocked words highlighting.
   * A "blockedWord" Marker in the editor document model, will be downcast to
   * a span element in the editing view.
   *
   * The corresponding word in the blocklist will be saved as
   * a data attribute on the span. This is necessary, because such
   * spans can also be split up, e.g. if 2 spans are overlapping.
   */
  #defineConversion(): void {
    const { editor } = this;

    // Set up the marker highlighting conversion.
    editor.conversion.for("editingDowncast").markerToHighlight({
      model: "blockedWord",
      view: ({ markerName }) => {
        const { id, blockedWord } = this.#splitMarkerName(markerName);

        // Marker removal from the view has a bug: https://github.com/ckeditor/ckeditor5/issues/7499
        // A minimal option is to return a new object for each converted marker...
        return {
          name: "span",
          classes: ["cm-ck-blocklisted"],
          attributes: {
            // ...however, adding a unique attribute should be future-proof..
            "data-blocklist-word": id,
            "data-blocklist-blocked-word": blockedWord,
          },
        };
      },
    });
  }

  /**
   * Splits a marker name into id and blocklisted word
   *
   * @param markerName - the marker name
   * @private
   */
  #splitMarkerName(markerName: string): { id: string; blockedWord: string } {
    const [, id, blockedWord] = markerName.split(":");
    return {
      id,
      blockedWord,
    };
  }
}
