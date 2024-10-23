import ViewWrapper from "../ViewWrapper";
import { JSWrapper } from "../../JSWrapper";

import ContentLinkViewWrapper from "./ContentLinkViewWrapper";
import { LinkActionsView } from "@coremedia/ckeditor5-coremedia-link";

export default class LinkActionsViewWrapper extends JSWrapper<LinkActionsView> {
  getContentLinkView(): ContentLinkViewWrapper {
    return ContentLinkViewWrapper.fromLinkActionsView(this);
  }

  static fromView(view: ViewWrapper): LinkActionsViewWrapper {
    const instance = view.evaluateHandle((view) => view as LinkActionsView);
    return new LinkActionsViewWrapper(instance);
  }
}
