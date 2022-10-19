import { ApplicationConsole } from "../aut/ApplicationConsole";
import { ConsoleMessage } from "playwright-core";

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
 * JEST Extension: Add matchers for `ApplicationConsole`.
 */
expect.extend({
  toHaveNoErrorsOrWarnings: (c: ApplicationConsole): jest.CustomMatcherResult => ({
    message: () =>
      `expected that no errors or warnings got logged but got ${c.errorsAndWarnings.length}:\n${messagesToString(
        c.errorsAndWarnings
      )}`,
    pass: c.errorsAndWarnings.length === 0,
  }),
});

/**
 * Extension to matchers for Application Console.
 */
export interface ApplicationConsoleMatchers<R = unknown, T = unknown> {
  toHaveNoErrorsOrWarnings: T extends ApplicationConsole
    ? () => R
    : "Type-level Error: Received value must be an ApplicationConsole.";
}
