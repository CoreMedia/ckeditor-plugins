import { Plugin } from "@ckeditor/ckeditor5-core";
import BlocklistCommand, { BLOCKLIST_COMMAND_NAME } from "./blocklistCommand";
import { Collection } from "@ckeditor/ckeditor5-utils";
import { onDocumentChange, ResultType } from "./blocklistChangesUtils";

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

  #splitMarkerName(markerName: string): { id: string; blockedWord: string } {
    const [, id, blockedWord] = markerName.split(":");
    return {
      id,
      blockedWord,
    };
  }
}
