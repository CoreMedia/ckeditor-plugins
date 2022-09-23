import { JSWrapper } from "../JSWrapper";
import ContextualBalloonWrapper from "./balloon/ContextualBalloonWrapper";
import type { View } from "@ckeditor/ckeditor5-ui";

/**
 * Wraps the CKEditor 5 view.
 */
export default class ViewWrapper extends JSWrapper<View> {
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
