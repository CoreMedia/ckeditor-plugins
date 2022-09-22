import { ClassicEditorWrapper } from "../../ClassicEditorWrapper";
import { JSWrapper } from "../../JSWrapper";
import type { ContextualBalloon } from "@ckeditor/ckeditor5-ui";
import ViewWrapper from "./../ViewWrapper";

//TODO: Currently there is no option to check which view is the visible one.
export default class ContextualBalloonWrapper extends JSWrapper<ContextualBalloon> {
  get view(): ViewWrapper {
    return ViewWrapper.fromContextualBalloon(this);
  }

  static fromEditor(editor: ClassicEditorWrapper): ContextualBalloonWrapper {
    const instance = editor.evaluateHandle((editor) => {
      return editor.plugins.get("ContextualBalloon") as ContextualBalloon;
    });
    return new ContextualBalloonWrapper(instance);
  }
}
