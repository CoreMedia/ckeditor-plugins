import { extendingWaitForExpect } from "../ExpectationsBase";
import type { HasEnabled } from "./HasEnabled";

expect.extend({
  async waitToBeEnabled(hasEnabled: HasEnabled): Promise<jest.CustomMatcherResult> {
    const { enabled } = hasEnabled;
    return extendingWaitForExpect(
      "waitToBeEnabled",
      async () => expect(await enabled).toStrictEqual(true),
      async () => expect(await enabled).toStrictEqual(false),
      this,
    );
  },
});

/**
 * Extension to matchers for Application Console.
 */
export interface WaitToBeEnabled<R = unknown, T = unknown> {
  waitToBeEnabled: T extends HasEnabled ? () => R : "Type-level Error: Received value must be HasEnabled";
}
