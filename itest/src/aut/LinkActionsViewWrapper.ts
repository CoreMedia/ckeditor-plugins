import { Locatable, visible } from "./Locatable";
import { BalloonPanelViewWrapper } from "./BalloonPanelViewWrapper";
import { Locator } from "playwright";
import { ContentLinkViewWrapper } from "./ContentLinkViewWrapper";

export class LinkActionsViewWrapper implements Locatable {
  readonly #parent: BalloonPanelViewWrapper;

  constructor(parent: BalloonPanelViewWrapper) {
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

  static fromBalloonPanelViewWrapper(wrapper: BalloonPanelViewWrapper): LinkActionsViewWrapper {
    return new LinkActionsViewWrapper(wrapper);
  }
}
