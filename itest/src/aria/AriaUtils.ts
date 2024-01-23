import waitForExpect from "wait-for-expect";
import { Locator } from "playwright";

export const expectFocusedElementHasAriaText = async (ariaLabelContent: string): Promise<void> => {
  await waitForExpect(async () => {
    const focusedElement: Locator = await page.locator("*:focus");
    await expect(new LocatorWithAriaLabel(focusedElement)).waitToHaveAriaLabel(ariaLabelContent);
  });
};

export const tabToAriaLabel = async (ariaLabelContent: string): Promise<void> => {
  const firstItem = await page.locator("*:focus");
  if (await hasAriaLabel(firstItem, ariaLabelContent)) {
    return;
  }
  const firstItemAriaLabelContent = await getAriaLabel(new LocatorWithAriaLabel(firstItem));
  if (!firstItemAriaLabelContent) {
    throw new Error("Failed identifying first aria labeled content.");
  }

  await page.keyboard.press("Tab");

  while (!(await focusedElementHasAriaText(firstItemAriaLabelContent))) {
    if (await focusedElementHasAriaText(ariaLabelContent)) {
      break;
    }
    await page.keyboard.press("Tab");
  }
};

const focusedElementHasAriaText = async (ariaText: string): Promise<boolean> => {
  const focusedElement = await page.locator("*:focus");
  return hasAriaLabel(focusedElement, ariaText);
};

const hasAriaLabel = async (element: Locator, ariaLabel: string): Promise<boolean> => {
  const ariaLabelContent = await getAriaLabel(new LocatorWithAriaLabel(element));
  return ariaLabelContent === ariaLabel;
};

export const getAriaLabel = async (element: HasAriaLabel): Promise<string | null> => {
  const ariaLabelSetDirectly = await element.getAriaLabel();
  if (ariaLabelSetDirectly && ariaLabelSetDirectly !== "") {
    return ariaLabelSetDirectly;
  }

  const ariaLabelId = await element.getAriaLabelledBy();
  if (!ariaLabelId) {
    return Promise.reject("No aria label found for");
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
