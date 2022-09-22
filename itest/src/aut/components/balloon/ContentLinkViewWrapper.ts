import LinkActionsViewWrapper from "./LinkActionsViewWrapper";
import { HasContentName } from "../../../expect/contentName/HasContentName";
import { JSWrapper } from "../../JSWrapper";

export default class ContentLinkViewWrapper extends JSWrapper<Element> implements HasContentName {
  get contentName(): Promise<string> {
    return this.evaluate((htmlElement) => {
      const spanId = htmlElement.getAttribute("aria-labelledby");
      let spanElement: Element | undefined;
      for (const child of htmlElement.children) {
        if (child.id === spanId) {
          spanElement = child;
        }
      }
      const textContent = spanElement?.textContent;
      if (!textContent) {
        throw Error("Couldn't find text");
      }
      return textContent;
    });
  }

  static fromLinkActionsView(linkActionsWrapper: LinkActionsViewWrapper): ContentLinkViewWrapper {
    const instance = linkActionsWrapper.evaluateHandle((linkActionsView) => {
      const nextSibling = linkActionsView.element?.children;
      const item = nextSibling?.item(1);
      if (!item) {
        throw new Error();
      }
      return item;
    });
    return new ContentLinkViewWrapper(instance);
  }
}
