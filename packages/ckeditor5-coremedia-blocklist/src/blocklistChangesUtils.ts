import { Collection, uid } from "@ckeditor/ckeditor5-utils";
import { Editor } from "@ckeditor/ckeditor5-core";
import { DiffItem, DiffItemAttribute, Element, Item, Marker, Model, Node, Range } from "@ckeditor/ckeditor5-engine";
import { FindAndReplaceUtils } from "@ckeditor/ckeditor5-find-and-replace";

// copied from @ckeditor/ckeditor5-find-and-replace/src/findandreplace.d.ts since not exported in index.js
export interface ResultType {
  id?: string;
  label?: string;
  start?: number;
  end?: number;
  marker?: Marker;
}

/**
 * Reacts to document changes in order to update search list.
 */
export const onDocumentChange = (results: Collection<ResultType>, editor: Editor, blockedWordsList: string[]) => {
  const changedNodes = new Set<Node>();
  const removedMarkers = new Set<string>();
  const model = editor.model;

  const changes = model.document.differ.getChanges() as Exclude<DiffItem, DiffItemAttribute>[];

  // Get nodes in which changes happened to re-run a search callback on them.
  changes.forEach((change) => {
    if (!change.position) {
      // If a link is created on a selection, the changes is missing a position.
      // It's okay to skip this change because no change in the editor text appeared.
      return;
    }
    if (change.name === "$text" || (change.position.nodeAfter && model.schema.isInline(change.position.nodeAfter))) {
      changedNodes.add(change.position.parent as Element);

      [...model.markers.getMarkersAtPosition(change.position)].forEach((markerAtChange) => {
        removedMarkers.add(markerAtChange.name);
      });
    } else if (change.type === "insert") {
      if (change.position.nodeAfter) {
        changedNodes.add(change.position.nodeAfter);
      }
    }
  });

  // Get markers from removed nodes also.
  model.document.differ.getChangedMarkers().forEach(({ name, data: { newRange } }) => {
    if (newRange && newRange.start.root.rootName === "$graveyard") {
      removedMarkers.add(name);
    }
  });

  // Get markers from the updated nodes and remove all (search will be re-run on these nodes).
  changedNodes.forEach((node) => {
    const markersInNode = [...model.markers.getMarkersIntersectingRange(model.createRangeIn(node as Element))];

    markersInNode.forEach((marker) => removedMarkers.add(marker.name));
  });

  // Remove results & markers from the changed part of content.
  model.change((writer) => {
    removedMarkers.forEach((markerName) => {
      // Remove the result first - in order to prevent rendering a removed marker.
      if (results.has(markerName)) {
        results.remove(markerName);
      }

      writer.removeMarker(markerName);
    });
  });

  // Run search callback again on updated nodes.
  changedNodes.forEach((nodeToCheck) => {
    blockedWordsList.forEach((wordToBlock: string) => {
      updateFindResultFromRange(
        wordToBlock,
        editor,
        model.createRangeOn(nodeToCheck),
        model,
        createSearchCallback(wordToBlock),
        results,
      );
    });
  });
};

export const createSearchCallback = (word: string) => {
  const regexpMatchToFindResult = (matchResult: RegExpMatchArray): ResultType => {
    const lastGroupIndex = matchResult.length - 1;
    let startOffset = matchResult.index ?? 0;

    // Searches with match all flag have an extra matching group with empty string or white space matched before the word.
    // If the search term starts with the space already, there is no extra group even with match all flag on.
    if (matchResult.length === 3) {
      startOffset += matchResult[1].length;
    }

    return {
      label: matchResult[lastGroupIndex],
      start: startOffset,
      end: startOffset + matchResult[lastGroupIndex].length,
    };
  };

  const regExp = new RegExp(`(${word})`, "gui");
  const searchCallback = ({ text }: { text: string }) => {
    const matches = [...text.matchAll(regExp)];
    return matches.map(regexpMatchToFindResult);
  };
  return searchCallback;
};

export const updateFindResultFromRange = (
  blockedWord: string,
  editor: Editor,
  range: Range,
  model: Model,
  findCallback: ({ item, text }: { item: Item; text: string }) => ResultType[],
  startResults: Collection<ResultType> | null,
): Collection<ResultType> => {
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
                writer.createPositionAt(item, foundItem.end),
              ),
            });

            const index = findInsertIndex(results, marker);

            results.add(
              {
                id: resultId,
                label: foundItem.label,
                marker,
              },
              index,
            );
          });
        }
      }
    });
  });

  return results;
};

// Finds the appropriate index in the resultsList Collection.
const findInsertIndex = (resultsList: Collection<ResultType>, markerToInsert: Marker) => {
  const result = resultsList.find(({ marker }) => {
    if (marker === undefined) {
      return false;
    }
    return markerToInsert.getStart().isBefore(marker.getStart());
  });
  return result ? resultsList.getIndex(result) : resultsList.length;
};
