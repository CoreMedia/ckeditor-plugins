import { extendingWaitForExpect } from "../ExpectationsBase";
import type { HasContentName } from "./HasContentName";

expect.extend({
  async waitToHaveContentName(hasContentName: HasContentName, expectedName: string): Promise<jest.CustomMatcherResult> {
    const { contentName } = hasContentName;
    return extendingWaitForExpect(
      "waitToHaveContentName",
      async () => expect(await contentName).toStrictEqual(expectedName),
      async () => expect(await contentName).toStrictEqual(expectedName),
      this,
    );
  },
});

/**
 * Extension to matchers for Application Console.
 */
export interface WaitToHaveContentName<R = unknown, T = unknown> {
  waitToHaveContentName: T extends HasContentName
    ? (expectedValue: string) => R
    : "Type-level Error: Received value must be HasContetName";
}
