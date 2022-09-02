import { Locatable, visible } from "./Locatable";
import { Locator } from "playwright";
import { ContentLinkViewWrapper } from "./ContentLinkViewWrapper";

export class LinkActionsViewWrapper implements Locatable {
  readonly #parent: Locatable;

  constructor(parent: Locatable) {
    this.#parent = parent;
  }

  get locator(): Locator {
    return this.#parent.locator.locator(".ck-link-actions");
  }

  get visible(): Promise<boolean> {
    return visible(this);
  }

  get contentLinkView(): ContentLinkViewWrapper {
    return ContentLinkViewWrapper.fromParent(this);
  }

  edit(): Promise<void> {
    // As it seems there is no better locator for this than 'next to preview'.
    const editButton = this.locator.locator("button.ck-link-actions__preview + button.ck-button");
    return editButton.click();
  }

  static fromParent(wrapper: Locatable): LinkActionsViewWrapper {
    return new LinkActionsViewWrapper(wrapper);
  }
}
