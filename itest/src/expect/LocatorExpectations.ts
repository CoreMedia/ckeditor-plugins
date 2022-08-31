import { extendingWaitForExpect } from "./ExpectationsBase";
import { Locator } from "playwright-core";

expect.extend({
  async waitToBeVisible(locator: Locator): Promise<jest.CustomMatcherResult> {
    const isVisible = locator.elementHandle().then((h) => h?.isVisible());
    return extendingWaitForExpect(
      "waitToBeVisible",
      async () => expect(await isVisible).toStrictEqual(true),
      async () => expect(await isVisible).toStrictEqual(false),
      this
    );
  },
});

/**
 * Extension to matchers for Application Console.
 */
export interface LocatorMatchers<R = unknown, T = unknown> {
  waitToBeVisible: T extends Locator ? () => R : "Type-level Error: Received value must be a Locator";
}
