import BlocklistCommand, { BLOCKLIST_COMMAND_NAME } from "./blocklistCommand";
import { Collection, Plugin } from "ckeditor5";
import { createSearchCallback, onDocumentChange, ResultType, updateFindResultFromRange } from "./blocklistChangesUtils";
import { serviceAgent } from "@coremedia/service-agent";
import { Subscription } from "rxjs";
import { BlocklistService, createBlocklistServiceDescriptor } from "@coremedia/ckeditor5-coremedia-studio-integration";
import { Logger, LoggerProvider } from "@coremedia/ckeditor5-logging";
import { getMarkerDetails, removeMarkerDetails } from "./blocklistMarkerUtils";

export default class BlocklistEditing extends Plugin {
  static readonly pluginName: string = "BlocklistEditing";
  static readonly #logger: Logger = LoggerProvider.getLogger("BlocklistEditing");

  /**
   * A list of markers, used to highlight blocked words in the editor.
   */
  blockedWordMarkers: Collection<ResultType> = new Collection<ResultType>();

  /**
   * A "copy" of the list, retrieved from an external service.
   * This list will be overridden whenever new data from the service is observed,
   * but can be more up-to-date if the service does not provide real-time data.
   *
   * Example: In case a word is added or removed via the editor UI, the internal list
   * will update immediately. The service will also be notified and should eventually
   * return the updated list, but we cannot assume that this happens in an instant.
   *
   * Therefore, immediate UI changes and user feedback should rely on this internal list.
   */
  internalBlocklist: string[] = [];

  /**
   * Subscription on the serviceAgent until the blocklist service is available.
   * @private
   */
  #blocklistServiceSubscription: Pick<Subscription, "unsubscribe"> | undefined = undefined;

  init(): void {
    const editor = this.editor;
    editor.commands.add(BLOCKLIST_COMMAND_NAME, new BlocklistCommand(editor));

    // model to editing view downcast
    this.#defineConversion();

    // whenever the data in the editor changes, we need to check new nodes
    // for blocked words, or remove markers if nodes have been removed
    editor.model.document.on("change:data", () => {
      onDocumentChange(this.blockedWordMarkers, editor, this.internalBlocklist);
    });

    // Connect to the BlockList Service to retrieve the list of words to highlight
    this.#subscribeToBlocklistService();
  }

  #subscribeToBlocklistService(): void {
    const onServiceRegisteredFunction = (services: BlocklistService[]): void => {
      // No BlocklistService registered yet, no need to compute further
      if (services.length === 0) {
        return;
      }

      // BlocklistService found, we may unsubscribe now
      if (this.#blocklistServiceSubscription) {
        this.#blocklistServiceSubscription.unsubscribe();
      }

      // BlocklistService is now available, use it
      serviceAgent
        .fetchService(createBlocklistServiceDescriptor())
        .then(this.#listenForBlocklistChanges.bind(this))
        .catch((reason): void => {
          BlocklistEditing.#logger.warn("BlocklistService not available.", reason);
        });
    };

    // Wait for the service to be available
    this.#blocklistServiceSubscription = serviceAgent
      .observeServices<BlocklistService>(createBlocklistServiceDescriptor())
      .subscribe(onServiceRegisteredFunction);
  }

  override destroy() {
    if (this.#blocklistServiceSubscription) {
      this.#blocklistServiceSubscription.unsubscribe();
    }
    super.destroy();
  }

  /**
   * Updates the internal list of blocked words and all affected markers whenever
   * the blocklist from the serviceAgent blocklistService changes.
   * @param blocklistService - the blocklist service
   * @private
   */
  async #listenForBlocklistChanges(blocklistService: BlocklistService): Promise<void> {
    blocklistService.observe_blocklist().subscribe({
      next: (blockedWords: string[]) => {
        // Get all words that differ from blockedWords and internalBlocklist
        const { addedWords, removedWords } = this.#getAddedAndRemovedWords(blockedWords, this.internalBlocklist);
        addedWords.forEach((word) => {
          this.#addMarkersForWord(word);
        });
        removedWords.forEach((word) => {
          this.#removeMarkersForWord(word);
        });

        // Set new value in internal list
        if (addedWords.length > 0 || removedWords.length > 0) {
          this.internalBlocklist = [...blockedWords];
        }
      },
    });
    const initialWords = await blocklistService.getBlocklist();
    initialWords.forEach((word) => {
      this.#addMarkersForWord(word);
    });
    this.internalBlocklist = [...initialWords];
  }

  /**
   * Compares two string lists and returns the differences between the lists.
   * All words, that exist in the newList, but not in the oldList, are handled as "added".
   * All words in the oldList, that do not exist in the newList, are handled as "removed".
   *
   * When used to differentiate between the internally stored list and the list, provided
   * by an external service, the oldList represents the internal list and the data from the
   * service is used as the newList.
   *
   * @param newList - the more recent list
   * @param oldList - the older list
   * @returns an object, holding information about changes between the lists
   * @private
   */
  #getAddedAndRemovedWords(
    newList: string[],
    oldList: string[],
  ): {
    addedWords: string[];
    removedWords: string[];
  } {
    const addedWords = newList.filter((word) => !oldList.includes(word));
    const removedWords = oldList.filter((word) => !newList.includes(word));
    return {
      addedWords,
      removedWords,
    };
  }

  /**
   * Adds a word to the blocklist.
   * Use this method for changes, triggered by the UI, not by the service.
   *
   * This method updates the internal list, changes the markers accordingly
   * and triggers the blocklistService.
   *
   * @param wordToBlock - the word to add to the list
   */
  addBlocklistWord(wordToBlock: string): void {
    // Update internal list and markers
    // This is a bet. We hope that the serviceAgent call to update the list returns successfully.
    // Otherwise, these changes will have to be reverted later on.
    const wasAdded = this.#addToInternalBlocklist(wordToBlock);
    if (wasAdded) {
      this.#addMarkersForWord(wordToBlock);
    }

    // Update value in service
    serviceAgent
      .fetchService(createBlocklistServiceDescriptor())
      .then((blocklistService: BlocklistService) => blocklistService.addToBlocklist(wordToBlock))
      .catch((reason) => {
        // The call was unsuccessful, therefore revert the previous changes:
        if (wasAdded) {
          this.#removeFromInternalBlocklist(wordToBlock);
          this.#removeMarkersForWord(wordToBlock);
        }
        BlocklistEditing.#logger.warn("Error while adding word to blocklist", reason);
      });
  }

  /**
   * Removes a word from the blocklist.
   * Use this method for changes, triggered by the UI, not by the service.
   *
   * This method updates the internal list, changes the markers accordingly
   * and triggers the blocklistService.
   *
   * @param wordToUnblock - the word to remove from the list
   */
  removeBlocklistWord(wordToUnblock: string): void {
    // Update internal list and update markers
    const wasRemoved = this.#removeFromInternalBlocklist(wordToUnblock);
    if (wasRemoved) {
      this.#removeMarkersForWord(wordToUnblock);
    }

    // Update value in service
    serviceAgent
      .fetchService(createBlocklistServiceDescriptor())
      .then((blocklistService: BlocklistService) => blocklistService.removeFromBlocklist(wordToUnblock))
      .catch((reason) => {
        if (wasRemoved) {
          this.#addToInternalBlocklist(wordToUnblock);
          this.#addMarkersForWord(wordToUnblock);
        }
        BlocklistEditing.#logger.warn("Error while removing word from blocklist", reason);
      });
  }

  /**
   * Adds a word to the internal blocklist.
   * Words will be transformed to lowercase before added.
   *
   * @param wordToBlock - the word to add
   * @returns whether the word was added
   * @private
   */
  #addToInternalBlocklist(wordToBlock: string): boolean {
    const lowerCaseWord = wordToBlock.toLowerCase();
    if (!this.internalBlocklist.includes(lowerCaseWord)) {
      this.internalBlocklist.push(lowerCaseWord);
      return true;
    }
    return false;
  }

  /**
   * Removes a word from the internal blocklist.
   *
   * @param wordToUnblock - the word to remove
   * @returns whether the word was removed
   * @private
   */
  #removeFromInternalBlocklist(wordToUnblock: string): boolean {
    const lowerCaseWord = wordToUnblock.toLowerCase();
    if (this.internalBlocklist.includes(lowerCaseWord)) {
      this.internalBlocklist = this.internalBlocklist.filter((word) => word !== lowerCaseWord);
      return true;
    }
    return false;
  }

  /**
   * Removes all markers for a given blocked word.
   * This means:
   * * The local collection of markers will be cleared of
   * all markers for the given word.
   * * The model is adjusted accordingly.
   *
   * @param wordToUnblock - the word, defining the markers that will be removed
   */
  #removeMarkersForWord(wordToUnblock: string): void {
    const model = this.editor.model;
    const markers = this.blockedWordMarkers;
    const markersToRemove: string[] = [];
    model.change((writer) => {
      markers.map((resultType) => {
        const markerName = resultType.marker?.name;
        if (markerName === undefined || resultType.id === undefined) {
          return;
        }
        const { blockedWord } = getMarkerDetails(markerName);
        if (wordToUnblock === blockedWord) {
          removeMarkerDetails(markerName);
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
   * Adds markers for a given blocked word.
   * This means:
   * * New markers for the given word will be pushed to the
   * local collection of markers.
   * * The model is adjusted accordingly.
   *
   * Important: This function does not know whether the blocked word is already
   * marked in the gui. Calling it twice, will result in a dirty ui with multiple
   * nested marker spans.
   *
   * @param wordToBlock - the word, defining the markers that will be added
   */
  #addMarkersForWord(wordToBlock: string): void {
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
        this.blockedWordMarkers,
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
   * spans can also be split up, e.g. if two spans are overlapping.
   */
  #defineConversion(): void {
    const { editor } = this;

    // Set up the marker highlighting conversion.
    editor.conversion.for("editingDowncast").markerToHighlight({
      model: "blockedWord",
      view: ({ markerName }) => {
        const markerDetails = getMarkerDetails(markerName);

        // Marker removal from the view has a bug: https://github.com/ckeditor/ckeditor5/issues/7499
        // A minimal option is to return a new object for each converted marker...
        return {
          name: "span",
          classes: ["cm-ck-blocked-word"],
          attributes: {
            // ...however, adding a unique attribute should be future-proof..
            "data-blocklist-word": markerDetails.id,
            "data-blocklist-blocked-word": markerDetails.blockedWord ? markerDetails.blockedWord : "",
          },
        };
      },
    });
  }
}
