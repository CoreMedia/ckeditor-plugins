import { JSWrapper } from "./JSWrapper";
import Document from "@ckeditor/ckeditor5-engine/src/view/document";
import { ViewWrapper } from "./ViewWrapper";

export class ViewDocumentWrapper extends JSWrapper<Document> {
  static fromView(wrapper: ViewWrapper): ViewDocumentWrapper {
    return new ViewDocumentWrapper(wrapper.evaluateHandle((view) => view.document));
  }
}
