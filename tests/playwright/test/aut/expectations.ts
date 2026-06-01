import { expect } from "@playwright/test";
import type { ConsoleMessage } from "playwright-core";
import type { ApplicationConsole } from "./ApplicationConsole";

/**
 * Maps messages to some representation for output. Ignores arguments, as they
 * require asynchronous access and evaluating `jsonValue` may fail for cyclic
 * references.
 *
 * @param messages - messages to transform to a string (separated by newlines)
 */
const messagesToString = (messages: ConsoleMessage[]): string =>
  messages.map((m) => `${m.type()}: ${m.text()} (${JSON.stringify(m.location())})`).join("\n");

/**
 * Replacement for the former Jest matcher `toHaveNoErrorsOrWarnings`.
 *
 * Asserts that no errors or warnings have been logged to the application
 * console.
 *
 * @param applicationConsole - console to inspect
 */
export const expectNoErrorsOrWarnings = (applicationConsole: ApplicationConsole): void => {
  const { errorsAndWarnings } = applicationConsole;
  expect(
    errorsAndWarnings,
    `expected that no errors or warnings got logged but got ${errorsAndWarnings.length}:\n${messagesToString(
      errorsAndWarnings,
    )}`,
  ).toHaveLength(0);
};
