import { JSWrapper } from "../JSWrapper";
import type { ToolbarView } from "@ckeditor/ckeditor5-ui";
import ViewWrapper from "./ViewWrapper";

export default class ToolbarViewWrapper extends JSWrapper<ToolbarView> {
  static fromView(viewWrapper: ViewWrapper): ToolbarViewWrapper {
    const instance = viewWrapper.evaluateHandle((view) => {
      return view as ToolbarView;
    });
    return new ToolbarViewWrapper(instance);
  }
}
