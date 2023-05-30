import { Editor, Plugin } from "@ckeditor/ckeditor5-core";
import BlocklistCommand, { BLOCKLIST_COMMAND_NAME } from "./blocklistCommand";
import { FindAndReplaceUtils } from "@ckeditor/ckeditor5-find-and-replace";
import { Collection, uid } from "@ckeditor/ckeditor5-utils";
import { Range, Item, Marker, Model, Element } from "@ckeditor/ckeditor5-engine";

// TODO example data, replace with actual blocklist service
const BLOCKED_WORDS_LIST: string[] = ["example", "ample", "use", "instance", "showcase", "showca", "owcase"];

export default class BlocklistEditing extends Plugin {
  static readonly pluginName: string = "BlocklistEditing";

  init(): void {
    const editor = this.editor;
    editor.commands.add(BLOCKLIST_COMMAND_NAME, new BlocklistCommand(editor));

    // model to editing view downcast
    this.#defineConversion();

    editor.model.document.on("change:data", () => {
      BLOCKED_WORDS_LIST.forEach((wordToBlock) => {
        // we may not expect the plugin to be configured in the editor config, so just create an instance here
        const findAndReplaceUtils = new FindAndReplaceUtils(editor);
        const findCallback = findAndReplaceUtils.findByTextCallback(wordToBlock, {
          matchCase: false,
          wholeWords: false,
        });
        const { model } = editor;

        // Initial search is done on all nodes in all roots inside the content.
        model.document.getRootNames().reduce((currentResults: Collection<ResultType> | null, rootName) => {
          const root = model.document.getRoot(rootName);
          if (!root) {
            // eslint-disable-next-line no-null/no-null
            return null;
          }
          return this.#updateFindResultFromRange(
            wordToBlock,
            editor,
            model.createRangeIn(root),
            model,
            findCallback,
            currentResults
          );
          // eslint-disable-next-line no-null/no-null
        }, null);
      });
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
        const [, id, blockedWord] = markerName.split(":");

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

  #updateFindResultFromRange(
    blockedWord: string,
    editor: Editor,
    range: Range,
    model: Model,
    findCallback: ({ item, text }: { item: Item; text: string }) => ResultType[],
    startResults: Collection<ResultType> | null
  ): Collection<ResultType> {
    const results = startResults ?? new Collection();
    const findAndReplaceUtils = new FindAndReplaceUtils(editor);

    model.change((writer) => {
      [...range].forEach(({ type, item }) => {
        if (type === "elementStart") {
          if (model.schema.checkChild(item, "$text")) {
            const foundItems = findCallback({
              item,
              text: findAndReplaceUtils.rangeToText(model.createRangeIn(item as Element)),
            });

            if (!foundItems) {
              return;
            }

            foundItems.forEach((foundItem) => {
              const resultId = `blockedWord:${uid()}:${blockedWord}`;
              const marker = writer.addMarker(resultId, {
                usingOperation: false,
                affectsData: false,
                range: writer.createRange(
                  writer.createPositionAt(item, foundItem.start),
                  writer.createPositionAt(item, foundItem.end)
                ),
              });

              const index = this.#findInsertIndex(results, marker);

              results.add(
                {
                  id: resultId,
                  label: foundItem.label,
                  marker,
                },
                index
              );
            });
          }
        }
      });
    });

    return results;
  }

  // Finds the appropriate index in the resultsList Collection.
  #findInsertIndex(resultsList: Collection<ResultType>, markerToInsert: Marker) {
    const result = resultsList.find(({ marker }) => {
      if (marker === undefined) {
        return false;
      }
      return markerToInsert.getStart().isBefore(marker.getStart());
    });
    return result ? resultsList.getIndex(result) : resultsList.length;
  }
}

// copied from @ckeditor/ckeditor5-find-and-replace/src/findandreplace.d.ts since not exported in index.js
interface ResultType {
  id?: string;
  label?: string;
  start?: number;
  end?: number;
  marker?: Marker;
}
