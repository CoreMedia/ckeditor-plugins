import { JSWrapper } from "../JSWrapper";
import ContextualBalloonWrapper from "./balloon/ContextualBalloonWrapper";
import type { View } from "@ckeditor/ckeditor5-ui";
import ToolbarViewWrapper from "./ToolbarViewWrapper";

/**
 * Wraps the CKEditor 5 view.
 */
export default class ViewWrapper extends JSWrapper<View> {
  asToolbarViewWrapper() {
    return ToolbarViewWrapper.fromView(this);
  }

  static fromContextualBalloon(contextualBalloonWrapper: ContextualBalloonWrapper) {
    const instance = contextualBalloonWrapper.evaluateHandle((contextualBalloon) => {
      const visibleView = contextualBalloon.visibleView;
      if (!visibleView) {
        throw new Error();
      }
      return visibleView;
    });
    return new ViewWrapper(instance);
  }
}
