import waitForExpect from "wait-for-expect";
import type { Locator } from "playwright";

export const expectFocusedElementHasAriaText = async (ariaLabelContent: string) =>
  waitForExpect(async () => {
    const focusedElement: Locator = page.locator("*:focus");
    await focusedElement.waitFor();
    expect(await getAriaLabel(new LocatorWithAriaLabel(focusedElement))).toEqual(ariaLabelContent);
  });

export const getAriaLabel = async (element: HasAriaLabel): Promise<string | null | undefined> => {
  const ariaLabelSetDirectly = await element.getAriaLabel();
  if (ariaLabelSetDirectly && ariaLabelSetDirectly !== "") {
    return ariaLabelSetDirectly;
  }

  const ariaLabelId = await element.getAriaLabelledBy();
  if (!ariaLabelId) {
    return undefined;
  }
  const ariaLabelSpan = page.locator(`span#${ariaLabelId}`);
  return ariaLabelSpan.textContent();
};

export interface HasAriaLabel {
  getAriaLabel(): Promise<string | undefined>;

  getAriaLabelledBy(): Promise<string | undefined>;
}

export class LocatorWithAriaLabel implements HasAriaLabel {
  readonly #locator: Locator;

  constructor(locator: Locator) {
    this.#locator = locator;
  }

  async getAriaLabel(): Promise<string | undefined> {
    const ariaLabelSetDirectly = await this.#locator.getAttribute("aria-label");
    if (ariaLabelSetDirectly) {
      return Promise.resolve(ariaLabelSetDirectly);
    }
    return Promise.resolve(undefined);
  }

  async getAriaLabelledBy(): Promise<string | undefined> {
    const ariaLabelId = await this.#locator.getAttribute("aria-labelledby");
    if (!ariaLabelId) {
      return Promise.resolve(undefined);
    }
    return Promise.resolve(ariaLabelId);
  }
}
