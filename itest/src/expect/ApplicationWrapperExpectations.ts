import { extendingWaitForExpect } from "./ExpectationsBase";
import { ApplicationWrapper } from "../aut/ApplicationWrapper";

/**
 * JEST Extension: Add matchers for `ApplicationConsole`.
 */
expect.extend({
  async waitForCKEditorToBeAvailable(a: ApplicationWrapper): Promise<jest.CustomMatcherResult> {
    return extendingWaitForExpect(
      "waitForCKEditorToBeAvailable",
      async () => expect(await a.editor.exists()).toBe(true),
      async () => expect(await a.editor.exists()).toBe(false),
      this,
    );
  },
});

/**
 * Extension to matchers for Application Console.
 */
export interface ApplicationWrapperMatchers<R = unknown, T = unknown> {
  waitForCKEditorToBeAvailable: T extends ApplicationWrapper
    ? () => R
    : "Type-level Error: Received value must be an ApplicationWrapper.";
}
