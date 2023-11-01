import { Locatable, visible } from "./Locatable";
import { Locator } from "playwright";

export class BlocklistActionsViewWrapper implements Locatable {
  readonly #parent: Locatable;

  constructor(parent: Locatable) {
    this.#parent = parent;
  }

  get locator(): Locator {
    return this.#parent.locator.locator(".cm-ck-blocklist-form");
  }

  get visible(): Promise<boolean> {
    return visible(this);
  }

  get blockedWordLabel(): Locatable {
    const locator = this.locator.locator(".cm-ck-blocklist-entry .ck-form__header__label");
    return {
      locator,
      visible: Promise.resolve(locator.isVisible()),
    };
  }

  get allBlockedWords(): Promise<string[]> {
    return this.locator.locator(".cm-ck-blocklist-entry .ck-form__header__label").allTextContents();
  }

  get removeButton(): Locatable {
    const locator = this.locator.locator(".ck-button-cancel");
    return {
      locator,
      visible: Promise.resolve(locator.isVisible()),
    };
  }

  get input(): Locatable {
    const locator = this.locator.locator(".ck-input");
    return {
      locator,
      visible: Promise.resolve(locator.isVisible()),
    };
  }

  get submitButton(): Locatable {
    const locator = this.locator.locator(".ck-button-save");
    return {
      locator,
      visible: Promise.resolve(locator.isVisible()),
    };
  }

  static fromParent(wrapper: Locatable): BlocklistActionsViewWrapper {
    return new BlocklistActionsViewWrapper(wrapper);
  }
}
