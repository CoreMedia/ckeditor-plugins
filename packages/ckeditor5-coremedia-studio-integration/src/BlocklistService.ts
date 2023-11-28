import { Observable } from "rxjs";

/**
 * Service, used to manage a list of blocked words within CKEditor.
 * Blocked words are words that should not appear in the editor content
 * and should be taken care of by an editor.
 * They are therefore highlighted within the text.
 *
 * This service interface allows to add or remove words and observe the whole list.
 * It is used in the `ckeditor5-blocklist` plugin.
 *
 * The service has to be registered globally on the `serviceAgent` and may then
 * be retrieved by its descriptor, for example:
 *
 * @example
 * ```typescript
 * serviceAgent
 *   .fetchService(createBlocklistServiceDescriptor())
 *     .then((service) => {});
 * ```
 */
interface BlocklistService {
  /**
   * Adds a given word to the blocklist.
   * When adding already existing words in the list, it is expected, that no
   * duplicate is added.
   *
   * @param wordToBlock - the word to be added to the blocklist
   */
  addToBlocklist(wordToBlock: string): void;

  /**
   * Removes a given word from the blocklist.
   *
   * @param wordToUnblock - the word to be removed from the blocklist
   */
  removeFromBlocklist(wordToUnblock: string): void;

  /**
   * Returns all entries of the blocklist.
   *
   * @returns The whole blocklist
   */
  getBlocklist(): Promise<string[]>;

  /**
   * Observes the blocklist and returns the whole list when words are added or removed.
   * If only changed values are relevant, a previous state of the list must be stored
   * so that changes can be restored by comparing with the current state of the list.
   *
   * @returns The whole blocklist
   */
  observe_blocklist(): Observable<string[]>;
}

export default BlocklistService;
