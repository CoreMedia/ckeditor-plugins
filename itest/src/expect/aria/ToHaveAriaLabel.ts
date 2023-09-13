import { extendingWaitForExpect } from "../ExpectationsBase";
import { getAriaLabel, HasAriaLabel } from "../../aria/AriaUtils";

expect.extend({
  async waitToHaveAriaLabel(hasAriaLabel: HasAriaLabel, expectedAriaLabel: string): Promise<jest.CustomMatcherResult> {
    return extendingWaitForExpect(
      "waitToHaveAriaLabel",
      async () => {
        const ariaLabel = await getAriaLabel(hasAriaLabel);
        expect(ariaLabel).toBeDefined();
        expect(await ariaLabel).toStrictEqual(expectedAriaLabel);
      },
      async () => {
        const ariaLabel = await getAriaLabel(hasAriaLabel);
        expect(ariaLabel).toBeDefined();
        expect(await ariaLabel).not.toStrictEqual(expectedAriaLabel);
      },
      this,
    );
  },
});

/**
 * Extension to matchers for Application Console.
 */
export interface WaitToHaveAriaLabel<R = unknown, T = unknown> {
  waitToHaveAriaLabel: T extends HasAriaLabel
    ? (expectedValue: string) => R
    : "Type-level Error: Received value must be HasContetName";
}
