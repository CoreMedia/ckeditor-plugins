// For now, this is only a DOM related wrapper.
import type { Locator } from "playwright-core";
import type { Locatable } from "../locators/Locatable.ts";
import { visible } from "../locators/Locatable.ts";
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

  // Note: `linkToolbarView` / `linkFormView` accessors will be added when the
  // link-related suites are migrated.

  get blocklistActionsView(): BlocklistActionsViewWrapper {
    return BlocklistActionsViewWrapper.fromParent(this);
  }

  static fromParent(wrapper: Locatable) {
    return new BalloonPanelViewWrapper(wrapper);
  }
}
