import { JSWrapper } from "./JSWrapper";
import { ViewDocument } from "@ckeditor/ckeditor5-engine";
import { ViewWrapper } from "./ViewWrapper";

export class ViewDocumentWrapper extends JSWrapper<ViewDocument> {
  static fromView(wrapper: ViewWrapper): ViewDocumentWrapper {
    return new ViewDocumentWrapper(wrapper.evaluateHandle((view) => view.document));
  }
}
