import type { Locator } from "playwright";
import type { Locatable } from "./Locatable";
import { visible } from "./Locatable";

export class ContentLinkViewWrapper implements Locatable {
  readonly #parent: Locatable;
  constructor(parent: Locatable) {
    this.#parent = parent;
  }

  get locator(): Locator {
    return this.#parent.locator.locator(".cm-ck-content-link-view");
  }

  remove(): Promise<void> {
    return this.locator.locator("button.cm-ck-cancel-button").click();
  }

  get visible(): Promise<boolean> {
    return visible(this);
  }

  static fromParent(parent: Locatable): ContentLinkViewWrapper {
    return new ContentLinkViewWrapper(parent);
  }
}
