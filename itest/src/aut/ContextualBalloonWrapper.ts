import { Locator, Page } from "playwright";

/**
 * Provides access to the currently opened contextual balloon.
 * Please note that the contextual balloon is actually a singleton and
 * reuse for different balloon features.
 * See: {@link https://ckeditor.com/docs/ckeditor5/latest/api/module_ui_panel_balloon_contextualballoon-ContextualBalloon.html}
 */
export class ContextualBalloonWrapper {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Returns the nth item.
   * It's zero based, nth(0) selects the first element
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
