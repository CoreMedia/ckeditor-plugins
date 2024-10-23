import { Observable, Subject } from "rxjs";
import { BlocklistService, createBlocklistServiceDescriptor } from "@coremedia/ckeditor5-coremedia-studio-integration";
import { Editor, Plugin } from "ckeditor5";
import MockServiceAgentPlugin from "./content/MockServiceAgentPlugin";
import { reportInitEnd, reportInitStart } from "@coremedia/ckeditor5-core-common";
import { serviceAgent } from "@coremedia/service-agent";

/**
 * Mock BlocklistService for use in example app.
 *
 * The service provides an empty list and adds the
 * words, that are present in the default example app
 * editor after a short period of time.
 */
export class MockBlocklistService extends Plugin implements BlocklistService {
  static readonly pluginName = "MockBlocklistService" as const;
  static readonly requires = [MockServiceAgentPlugin];
  #blocklist: string[];
  readonly #blocklistSubject: Subject<string[]>;

  /**
   * Constructor with some configuration options for the mock service.
   */
  constructor(editor: Editor) {
    super(editor);
    this.#blocklist = ["studio", "provided"];
    this.#blocklistSubject = new Subject<string[]>();
    this.#addExamples();
  }

  init(): void {
    const initInformation = reportInitStart(this);
    serviceAgent.registerService(this, createBlocklistServiceDescriptor());
    reportInitEnd(initInformation);
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
          void this.addToBlocklist(word);
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
  // eslint-disable-next-line @typescript-eslint/require-await
  async addToBlocklist(wordToBlock: string): Promise<void> {
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
  // eslint-disable-next-line @typescript-eslint/require-await
  async removeFromBlocklist(wordToUnblock: string): Promise<void> {
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
  getBlocklist(): Promise<string[]> {
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
