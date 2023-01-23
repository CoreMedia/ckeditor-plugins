import { extendingWaitForExpect } from "../ExpectationsBase";
import { Locator } from "playwright";

expect.extend({
  async waitToHaveAriaLabel(locator: Locator, expectedAriaLabel: string): Promise<jest.CustomMatcherResult> {
    return extendingWaitForExpect(
      "waitToHaveAriaLabel",
      async () => {
        const ariaLabelId = await locator.getAttribute("aria-labelledby");
        const ariaLabelSpan = locator.locator(`span#${ariaLabelId}`);
        const ariaLabelContent = ariaLabelSpan.textContent();
        expect(await ariaLabelContent).toStrictEqual(expectedAriaLabel);
      },
      async () => {
        const ariaLabelId = await locator.getAttribute("aria-labelledby");
        const ariaLabelSpan = locator.locator(`span#${ariaLabelId}`);
        const ariaLabelContent = ariaLabelSpan.textContent();
        expect(await ariaLabelContent).not.toStrictEqual(expectedAriaLabel);
      },
      this
    );
  },
});

/**
 * Extension to matchers for Application Console.
 */
export interface WaitToHaveAriaLabel<R = unknown, T = unknown> {
  waitToHaveAriaLabel: T extends Locator
    ? (expectedValue: string) => R
    : "Type-level Error: Received value must be HasContetName";
}
