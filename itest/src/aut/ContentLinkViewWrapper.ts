import { Locatable, visible } from "./Locatable";
import { Locator } from "playwright";

export class ContentLinkViewWrapper implements Locatable {
  #parent: Locatable;
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
