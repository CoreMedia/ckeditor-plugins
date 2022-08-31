import { ConsoleMessage } from "playwright-core";
import { Page } from "playwright";

type ConsoleMessageType =
  | "log"
  | "debug"
  | "info"
  | "error"
  | "warning"
  | "dir"
  | "dirxml"
  | "table"
  | "trace"
  | "clear"
  | "startGroup"
  | "startGroupCollapsed"
  | "endGroup"
  | "assert"
  | "profile"
  | "profileEnd"
  | "count"
  | "timeEnd";

type ConsoleMessageHandler = (consoleMessage: ConsoleMessage) => void;

/**
 * Provides access to the application console.
 */
export class ApplicationConsole {
  readonly #messages: ConsoleMessage[] = [];
  readonly #page: Page;
  #handler?: ConsoleMessageHandler;

  /**
   * Just instantiates the console with no listener attached yet.
   * @param page - page to listen to
   */
  constructor(page: Page) {
    this.#page = page;
  }

  /**
   * Opens console and starts tracking messages.
   */
  open() {
    this.#handler = (msg) => {
      this.#messages.push(msg);
    };
    this.#page.on("console", this.#handler);
  }

  /**
   * Closes console, stops tracking messages and clears tracked messages.
   */
  close() {
    this.#handler && this.#page.off("console", this.#handler);
    this.#handler = undefined;
    this.clear();
  }

  /**
   * Provides messages of the given types.
   *
   * @param messageTypes - types to return messages for
   */
  #getMessagesOfType(...messageTypes: ConsoleMessageType[]): ConsoleMessage[] {
    return this.messages.filter((msg) => messageTypes.some((t) => t === msg.type()));
  }

  /**
   * Get all recorded messages.
   */
  get messages(): ConsoleMessage[] {
    return this.#messages;
  }

  /**
   * Provides all retrieved errors and warnings.
   */
  get errorsAndWarnings(): ConsoleMessage[] {
    return this.#getMessagesOfType("warning", "error");
  }

  /**
   * Clears the recorded messages.
   */
  clear(): void {
    this.#messages.length = 0;
  }
}
