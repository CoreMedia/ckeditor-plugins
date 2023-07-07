// For now, this is only a DOM related wrapper.
import { Locatable, visible } from "./Locatable";
import { Locator } from "playwright";
import { LinkActionsViewWrapper } from "./LinkActionsViewWrapper";
import { LinkFormViewWrapper } from "./LinkFormViewWrapper";
import { BlocklistActionsViewWrapper } from "./BlocklistActionsViewWrapper";

export class BalloonPanelViewWrapper implements Locatable {
  readonly #parent: Locatable;

  constructor(parent: Locatable) {
    this.#parent = parent;
  }

  get locator(): Locator {
    return this.#parent.locator.locator(".ck-balloon-panel");
  }

  get visible(): Promise<boolean> {
    return visible(this);
  }

  get linkActionsView(): LinkActionsViewWrapper {
    return LinkActionsViewWrapper.fromParent(this);
  }

  get linkFormView(): LinkFormViewWrapper {
    return LinkFormViewWrapper.fromParent(this);
  }

  get blocklistActionsView(): BlocklistActionsViewWrapper {
    return BlocklistActionsViewWrapper.fromParent(this);
  }

  static fromParent(wrapper: Locatable) {
    return new BalloonPanelViewWrapper(wrapper);
  }
}
