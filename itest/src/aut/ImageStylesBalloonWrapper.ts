import { Locator, Page } from "playwright";

/**
 * Provides access to the editor within the example application. It requires
 * the editor to be exposed as global variable in window context.
 */
export class ImageStylesBalloonWrapper {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  getBalloon(): Locator {
    return this.page.locator(".ck-body-wrapper .ck-balloon-panel");
  }

  getToolbarItems(): Locator {
    return this.getBalloon().locator(".ck-toolbar button");
  }

  getAlignLeftButton(): Locator {
    return this.getToolbarItems().first();
  }

  getAlignRightButton(): Locator {
    return this.getToolbarItems().nth(1);
  }

  getWithinTextButton(): Locator {
    return this.getToolbarItems().nth(2);
  }

  getPageDefaultButton(): Locator {
    return this.getToolbarItems().nth(3);
  }
}
