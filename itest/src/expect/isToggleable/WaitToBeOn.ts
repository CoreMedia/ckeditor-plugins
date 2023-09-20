import { extendingWaitForExpect } from "../ExpectationsBase";
import { HasToggleable } from "./HasToggleable";

expect.extend({
  async waitToBeOn(hasToggleable: HasToggleable): Promise<jest.CustomMatcherResult> {
    const { on } = hasToggleable;
    return extendingWaitForExpect(
      "waitToBeOn",
      async () => expect(await on).toStrictEqual(true),
      async () => expect(await on).toStrictEqual(false),
      this,
    );
  },
});

/**
 * Extension to matchers for Application Console.
 */
export interface WaitToBeOn<R = unknown, T = unknown> {
  waitToBeOn: T extends HasToggleable ? () => R : "Type-level Error: Received value must be HasToggleable";
}
