import { JSWrapper } from "./JSWrapper";
import { EditorUIWrapper } from "./EditorUIWrapper";
// ClassicEditorUIView: See ckeditor/ckeditor5#12027.
import { ClassicEditor } from "ckeditor5";
import { BodyCollectionWrapper } from "./BodyCollectionWrapper";
import { Locator } from "playwright";
import { Locatable, visible } from "./Locatable";

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
