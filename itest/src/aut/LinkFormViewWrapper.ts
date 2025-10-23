import type { Locator } from "playwright";
import type { Locatable } from "./Locatable";
import { visible } from "./Locatable";
import { ContentLinkViewWrapper } from "./ContentLinkViewWrapper";

export class LinkFormViewWrapper implements Locatable {
  readonly #parent: Locatable;

  constructor(parent: Locatable) {
    this.#parent = parent;
  }

  get locator(): Locator {
    return this.#parent.locator.locator(".ck-link-form");
  }

  get visible(): Promise<boolean> {
    return visible(this);
  }

  get urlInputField(): Locator {
    return this.locator.getByPlaceholder("Type to search content, enter");
  }

  get contentLinkView(): ContentLinkViewWrapper {
    return ContentLinkViewWrapper.fromParent(this);
  }

  get saveButtonLocator(): Locator {
    return this.locator.locator("button.ck-button-action");
  }

  save(): Promise<void> {
    return this.locator.locator("button.ck-button-action").click();
  }

  static fromParent(wrapper: Locatable): LinkFormViewWrapper {
    return new LinkFormViewWrapper(wrapper);
  }
}
