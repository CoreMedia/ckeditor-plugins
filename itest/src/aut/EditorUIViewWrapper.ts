import type { ClassicEditor } from "ckeditor5";
import type { Locator } from "playwright";
import { JSWrapper } from "./JSWrapper";
import type { EditorUIWrapper } from "./EditorUIWrapper";
// ClassicEditorUIView: See ckeditor/ckeditor5#12027.
import { BodyCollectionWrapper } from "./BodyCollectionWrapper";
import type { Locatable } from "./Locatable";
import { visible } from "./Locatable";

export class EditorUIViewWrapper extends JSWrapper<ClassicEditor["ui"]["view"]> implements Locatable {
  readonly #parent: EditorUIWrapper;

  constructor(parent: EditorUIWrapper) {
    super(parent.evaluateHandle((editorUI) => editorUI.view));
    this.#parent = parent;
  }

  get locator(): Locator {
    // As it seems, they share the same element reference.
    return this.#parent.locator.locator(".ck-content");
  }

  get visible(): Promise<boolean> {
    return visible(this);
  }

  get body(): BodyCollectionWrapper {
    return BodyCollectionWrapper.fromClassicEditorUIView(this);
  }

  static fromClassicEditorUI(wrapper: EditorUIWrapper) {
    return new EditorUIViewWrapper(wrapper);
  }
}
