import { expect, test } from "@playwright/test";
import type { ConsoleMessage, Page } from "playwright-core";

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
class ApplicationConsole {
  readonly #messages: ConsoleMessage[] = [];
  readonly #page: Page;
  #handler?: ConsoleMessageHandler;

  /**
   * Just instantiates the console with no listener attached yet.
   *
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
    // Dump may contain valuable information for debugging (e.g., log outputs from tests).
    let debugDump = `ApplicationConsole dump (${this.messages.length}):`;
    this.messages.forEach((message) => {
      const { url, lineNumber, columnNumber } = message.location();
      return (debugDump = `${debugDump}\n  [${message.type()}] ${message.text()} (${url}#${lineNumber}:${columnNumber})`);
    });
    console.debug(debugDump);
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
const messagesToString = (messages: ConsoleMessage[]): string =>
  messages.map((m) => `${m.type()}: ${m.text()} (${JSON.stringify(m.location())})`).join("\n");

export const expectNoErrorsOrWarnings = (applicationConsole: ApplicationConsole): void => {
  const { errorsAndWarnings } = applicationConsole;
  expect(
    errorsAndWarnings,
    `expected that no errors or warnings got logged but got ${errorsAndWarnings.length}:\n${messagesToString(
      errorsAndWarnings,
    )}`,
  ).toHaveLength(0);
};

const consoles: Map<Page, ApplicationConsole> = new Map();

test.beforeEach(async ({ page }) => {
  const console = new ApplicationConsole(page);
  console.open();
  consoles.set(page, console);
});

test.afterEach(async ({ page }) => {
  const console = consoles.get(page);
  if (console) {
    console.close();
    expectNoErrorsOrWarnings(console);
    consoles.delete(page);
  }
});

export { expect, test };
