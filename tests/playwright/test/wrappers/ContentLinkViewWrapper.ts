import type { Locator } from "playwright-core";
import type { Locatable } from "../locators/Locatable.ts";
import { visible } from "../locators/Locatable.ts";

export class ContentLinkViewWrapper implements Locatable {
  readonly #parent: Locatable;

  constructor(parent: Locatable) {
    this.#parent = parent;
  }

  get locator(): Locator {
    return this.#parent.locator.locator(".cm-ck-content-link-view");
  }

  get visible(): Promise<boolean> {
    return visible(this);
  }

  remove(): Promise<void> {
    return this.locator.locator("button.cm-ck-cancel-button").click();
  }

  static fromParent(parent: Locatable): ContentLinkViewWrapper {
    return new ContentLinkViewWrapper(parent);
  }
}
