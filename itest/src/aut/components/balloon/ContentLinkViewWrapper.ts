import LinkActionsViewWrapper from "./LinkActionsViewWrapper";
import { HasContentName } from "../../../expect/contentName/HasContentName";
import { JSWrapper } from "../../JSWrapper";

export default class ContentLinkViewWrapper extends JSWrapper<Element> implements HasContentName {
  get contentName(): Promise<string> {
    return this.evaluate((htmlElement) => {
      const ariaLabel = htmlElement.getAttribute("aria-label");
      if (ariaLabel) {
        return ariaLabel;
      }
      //By using the aria-labelledby we can get a reference to the span where the content name is stored.
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
      // As we are patching the LinkActionsView we have trouble here to find the child with its correct type.
      // Easiest way is to assume that it is the second item in the list.
      // Unfortunately we can't get a ckeditor view but only the HTMLElement
      const children = linkActionsView.element?.children;
      const item = children?.item(1); //currently the first item is the ContentLinkView
      if (!item) {
        throw new Error();
      }
      return item;
    });
    return new ContentLinkViewWrapper(instance);
  }
}
