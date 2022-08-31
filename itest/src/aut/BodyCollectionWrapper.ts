import { JSWrapper } from "./JSWrapper";
import type { BodyCollection } from "@ckeditor/ckeditor5-ui";
import { EditorUIViewWrapper } from "./EditorUIViewWrapper";
import { Locatable } from "./Locatable";
import { Locator } from "playwright";
import { BalloonPanelViewWrapper } from "./BalloonPanelViewWrapper";

/**
 * This is a special ViewCollection dedicated to elements that are detached from
 * the DOM structure of the editor, like panels, icons, etc.
 */
export class BodyCollectionWrapper extends JSWrapper<BodyCollection> implements Locatable {
  readonly #parent: EditorUIViewWrapper;

  constructor(parent: EditorUIViewWrapper) {
    super(parent.evaluateHandle((parent) => parent.body as BodyCollection));
    this.#parent = parent;
  }

  get locator(): Locator {
    // Body Wrapper is at different location in DOM. No direct relation.
    return this.#parent.locator.page().locator(".ck-body-wrapper");
  }

  get balloonPanel(): BalloonPanelViewWrapper {
    return BalloonPanelViewWrapper.fromBodyCollection(this);
  }

  static fromClassicEditorUIView(wrapper: EditorUIViewWrapper) {
    return new BodyCollectionWrapper(wrapper);
  }
}
