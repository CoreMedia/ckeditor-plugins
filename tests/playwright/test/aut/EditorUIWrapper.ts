import type { ClassicEditor } from "ckeditor5";
import type { Locator } from "playwright-core";
import { JSWrapper } from "./JSWrapper";
import type { ClassicEditorWrapper } from "./ClassicEditorWrapper";
// ClassicEditorUI: See ckeditor/ckeditor5#12027.
import { EditorUIViewWrapper } from "./EditorUIViewWrapper";
import type { Locatable } from "./Locatable";
import { visible } from "./Locatable";

/**
 * Wrapper for `EditorUI`.
 */
export class EditorUIWrapper extends JSWrapper<ClassicEditor["ui"]> implements Locatable {
  readonly #parent: ClassicEditorWrapper;

  constructor(parent: ClassicEditorWrapper) {
    super(parent.evaluateHandle((editor) => editor.ui));
    this.#parent = parent;
  }

  get locator(): Locator {
    // We need to find the next sibling of the parent node. As it seems, there
    // is no good way to express this with locators like simply chaining
    // `+ div.ck-editor` as the resulting querySelector chain is invalid then.
    // For now, we assume, that both share the same parent.
    return this.#parent.locator.locator("..").locator("div.ck-editor");
  }

  get visible(): Promise<boolean> {
    return visible(this);
  }

  get view(): EditorUIViewWrapper {
    return EditorUIViewWrapper.fromClassicEditorUI(this);
  }

  /**
   * Provides access to EditorUI via Editor.
   *
   * @param wrapper - editor wrapper
   */
  static fromClassicEditor(wrapper: ClassicEditorWrapper) {
    return new EditorUIWrapper(wrapper);
  }
}
