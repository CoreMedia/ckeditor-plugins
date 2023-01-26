import { Locatable, visible } from "./Locatable";
import { Locator } from "playwright";
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
    return this.locator.locator(".ck-input");
  }

  get contentLinkView(): ContentLinkViewWrapper {
    return ContentLinkViewWrapper.fromParent(this);
  }

  save(): Promise<void> {
    return this.locator.locator("button.ck-button-save").click();
  }

  static fromParent(wrapper: Locatable): LinkFormViewWrapper {
    return new LinkFormViewWrapper(wrapper);
  }
}
