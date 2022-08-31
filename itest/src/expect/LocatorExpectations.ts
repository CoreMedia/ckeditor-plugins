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

/**
 * Tell TypeScript to know of new matchers.
 */
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface Expect extends LocatorMatchers {}

    // eslint-disable-next-line @typescript-eslint/no-empty-interface,@typescript-eslint/ban-types
    interface Matchers<R = unknown, T = {}> extends LocatorMatchers<R, T> {}

    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface InverseAsymmetricMatchers extends LocatorMatchers {}
  }
}
