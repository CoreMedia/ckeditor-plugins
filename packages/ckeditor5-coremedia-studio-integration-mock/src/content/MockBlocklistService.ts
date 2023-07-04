import { Observable, Subject } from "rxjs";
import BlocklistService from "@coremedia/ckeditor5-coremedia-studio-integration/src/content/BlocklistService";
import { createBlocklistServiceDescriptor } from "@coremedia/ckeditor5-coremedia-studio-integration/src/content/BlocklistServiceDescriptor";

/**
 * Mock Display Service for use in example app.
 *
 * By default, the service provides just some static content with some
 * predefined settings given a content-ID or the content's URI path.
 *
 * For custom contents, like for example to simulate actively modified
 * contents, simulate slow loading contents, you may register such contents
 * with a given ID at `MockContentPlugin`.
 */
class MockBlocklistService implements BlocklistService {
  #blocklist: string[];
  #blocklistSubject: Subject<string[]>;

  /**
   * Constructor with some configuration options for the mock service.
   */
  constructor() {
    this.#blocklist = ["studio", "provided"];
    this.#blocklistSubject = new Subject<string[]>();
    this.#addExamples();
  }

  /**
   * Adds an example word every 5 seconds
   * @private
   */
  #addExamples(): void {
    const wordsToAdd = ["others", "function"];
    // eslint-disable-next-line no-restricted-globals
    setInterval(() => {
      if (wordsToAdd.length > 0) {
        const word = wordsToAdd.pop();
        if (word) {
          this.addToBlocklist(word);
        }
      }
    }, 2000);
  }

  /**
   * The name of the service.
   */
  getName(): string {
    return createBlocklistServiceDescriptor().name;
  }

  /**
   * Adds a given word to the blocklist.
   * Words are saved lowercase without duplicates.
   *
   * @param wordToBlock - the word to be added to the blocklist
   */
  addToBlocklist(wordToBlock: string): void {
    const lowerCaseWord = wordToBlock.toLowerCase();
    if (!this.#blocklist.includes(lowerCaseWord)) {
      this.#blocklist.push(lowerCaseWord);
      this.#blocklistSubject.next(this.#blocklist);
    }
  }

  /**
   * Removes a given word from the blocklist.
   *
   * @param wordToUnblock - the word to be removed from the blocklist
   */
  removeFromBlocklist(wordToUnblock: string): void {
    const lowerCaseWord = wordToUnblock.toLowerCase();
    if (this.#blocklist.includes(lowerCaseWord)) {
      this.#blocklist = this.#blocklist.filter((word) => word !== lowerCaseWord);
      this.#blocklistSubject.next(this.#blocklist);
    }
  }

  /**
   * Returns all entries of the blocklist.
   *
   * @returns The whole blocklist
   */
  getList(): Promise<string[]> {
    return Promise.resolve(this.#blocklist);
  }

  /**
   * Observes the blocklist and returns the whole list when words are added or removed.
   *
   * @returns The whole blocklist
   */
  observe_blocklist(): Observable<string[]> {
    return this.#blocklistSubject;
  }
}

export default MockBlocklistService;
