import { Locatable, visible } from "./Locatable";
import { Locator } from "playwright";
import { ContentLinkViewWrapper } from "./ContentLinkViewWrapper";

export class LinkToolbarViewWrapper implements Locatable {
  readonly #parent: Locatable;

  constructor(parent: Locatable) {
    this.#parent = parent;
  }

  get locator(): Locator {
    return this.#parent.locator.locator(".cm-ck-link-actions-view");
  }

  get visible(): Promise<boolean> {
    return visible(this);
  }

  get contentLinkView(): ContentLinkViewWrapper {
    return ContentLinkViewWrapper.fromParent(this);
  }

  edit(): Promise<void> {
    // As it seems there is no better locator for this than 'next to preview'.
    const editButton = this.locator.locator(".ck-button[data-cke-tooltip-text='Edit link']");
    return editButton.click();
  }

  static fromParent(wrapper: Locatable): LinkToolbarViewWrapper {
    return new LinkToolbarViewWrapper(wrapper);
  }
}
