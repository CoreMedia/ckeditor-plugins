// For now, this is only a DOM related wrapper.
import type { Locator } from "playwright";
import type { Locatable } from "./Locatable";
import { visible } from "./Locatable";
import { LinkToolbarViewWrapper } from "./LinkToolbarViewWrapper";
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

  get linkToolbarView(): LinkToolbarViewWrapper {
    return LinkToolbarViewWrapper.fromParent(this);
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
