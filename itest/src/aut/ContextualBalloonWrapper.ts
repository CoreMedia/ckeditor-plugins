import { Locator, Page } from "playwright";

/**
 * Provides access to the actually opened ontextualBalloon.
 */
export class ContextualBalloonWrapper {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Returns the nth item. Where n is index + 1.
   *
   * @param index - the index of the toolbar item. Starting with 0.
   * @returns Locator the locator
   */
  getNthItem(index: number): Locator {
    return this.#getToolbarItems().nth(index);
  }

  #getToolbarItems(): Locator {
    return this.#getBalloon().locator(".ck-toolbar button");
  }

  #getBalloon(): Locator {
    return this.page.locator(".ck-body-wrapper .ck-balloon-panel");
  }
}
