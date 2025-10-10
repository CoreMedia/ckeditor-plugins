import type { ContextualBalloon } from "ckeditor5";
import { ClassicEditorWrapper } from "../../ClassicEditorWrapper";
import { JSWrapper } from "../../JSWrapper";
import ViewWrapper from "./../ViewWrapper";

export default class ContextualBalloonWrapper extends JSWrapper<ContextualBalloon> {
  get view(): ViewWrapper {
    return ViewWrapper.fromContextualBalloon(this);
  }
  static fromEditor(editor: ClassicEditorWrapper): ContextualBalloonWrapper {
    const instance = editor.evaluateHandle((editor) => editor.plugins.get("ContextualBalloon"));
    return new ContextualBalloonWrapper(instance);
  }
}
