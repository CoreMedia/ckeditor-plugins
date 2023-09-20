import { extendingWaitForExpect } from "../ExpectationsBase";
import { HasVisible } from "./HasVisible";

expect.extend({
  async waitToBeVisible(hasVisible: HasVisible): Promise<jest.CustomMatcherResult> {
    const { visible } = hasVisible;
    return extendingWaitForExpect(
      "waitToBeVisible",
      async () => expect(await visible).toStrictEqual(true),
      async () => expect(await visible).toStrictEqual(false),
      this,
    );
  },
});

/**
 * Extension to matchers for Application Console.
 */
export interface WaitToBeVisible<R = unknown, T = unknown> {
  waitToBeVisible: T extends HasVisible ? () => R : "Type-level Error: Received value must be HasVisible";
}
