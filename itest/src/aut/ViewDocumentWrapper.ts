import type { ViewDocument } from "ckeditor5";
import { JSWrapper } from "./JSWrapper";
import type { ViewWrapper } from "./ViewWrapper";

export class ViewDocumentWrapper extends JSWrapper<ViewDocument> {
  static fromView(wrapper: ViewWrapper): ViewDocumentWrapper {
    return new ViewDocumentWrapper(wrapper.evaluateHandle((view) => view.document));
  }
}
