import { Locatable } from "./Locatable";
import { BalloonPanelViewWrapper } from "./BalloonPanelViewWrapper";
import { Locator } from "playwright";

export class LinkActionsViewWrapper implements Locatable {
  readonly #parent: BalloonPanelViewWrapper;

  constructor(parent: BalloonPanelViewWrapper) {
    this.#parent = parent;
  }

  get locator(): Locator {
    return this.#parent.locator.locator(".ck-link-actions");
  }

  static fromBalloonPanelViewWrapper(wrapper: BalloonPanelViewWrapper): LinkActionsViewWrapper {
    return new LinkActionsViewWrapper(wrapper);
  }
}
