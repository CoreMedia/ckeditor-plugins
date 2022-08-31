// For now, this is only a DOM related wrapper.
import { Locatable } from "./Locatable";
import { BodyCollectionWrapper } from "./BodyCollectionWrapper";
import { Locator } from "playwright";
import { LinkActionsViewWrapper } from "./LinkActionsViewWrapper";

export class BalloonPanelViewWrapper implements Locatable {
  readonly #parent: BodyCollectionWrapper;

  constructor(parent: BodyCollectionWrapper) {
    this.#parent = parent;
  }

  get locator(): Locator {
    return this.#parent.locator.locator(".ck-balloon-panel");
  }

  get linkActionsView(): LinkActionsViewWrapper {
    return LinkActionsViewWrapper.fromBalloonPanelViewWrapper(this);
  }

  static fromBodyCollection(wrapper: BodyCollectionWrapper) {
    return new BalloonPanelViewWrapper(wrapper);
  }
}
