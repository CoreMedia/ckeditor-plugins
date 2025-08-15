import { ViewDocument } from "ckeditor5";
import { JSWrapper } from "./JSWrapper";
import { ViewWrapper } from "./ViewWrapper";

export class ViewDocumentWrapper extends JSWrapper<ViewDocument> {
  static fromView(wrapper: ViewWrapper): ViewDocumentWrapper {
    return new ViewDocumentWrapper(wrapper.evaluateHandle((view) => view.document));
  }
}
