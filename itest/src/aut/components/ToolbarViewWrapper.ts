import type { ToolbarView } from "ckeditor5";
import { JSWrapper } from "../JSWrapper";
import type ViewWrapper from "./ViewWrapper";

export default class ToolbarViewWrapper extends JSWrapper<ToolbarView> {
  static fromView(viewWrapper: ViewWrapper): ToolbarViewWrapper {
    const instance = viewWrapper.evaluateHandle((view) => view as ToolbarView);
    return new ToolbarViewWrapper(instance);
  }
}
