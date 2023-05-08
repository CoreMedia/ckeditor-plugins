import ViewWrapper from "../ViewWrapper";
import { JSWrapper } from "../../JSWrapper";
// LinkActionsView: See ckeditor/ckeditor5#12027.
import type LinkActionsView from "@ckeditor/ckeditor5-link/src/ui/linkactionsview";
import ContentLinkViewWrapper from "./ContentLinkViewWrapper";

export default class LinkActionsViewWrapper extends JSWrapper<LinkActionsView> {
  getContentLinkView(): ContentLinkViewWrapper {
    return ContentLinkViewWrapper.fromLinkActionsView(this);
  }

  static fromView(view: ViewWrapper): LinkActionsViewWrapper {
    const instance = view.evaluateHandle((view) => view as LinkActionsView);
    return new LinkActionsViewWrapper(instance);
  }
}
