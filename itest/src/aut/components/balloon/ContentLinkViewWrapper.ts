import { HasContentName } from "../../../expect/contentName/HasContentName";
import { JSWrapper } from "../../JSWrapper";
import LinkActionsViewWrapper from "./LinkActionsViewWrapper";

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
      // As the order of buttons in the toolbar is part of the editor's configuration, we can't be sure which element is the contentLinkView.
      // Therefore, just look for the class in all descendants.
      // Unfortunately we can't get a ckeditor view but only the HTMLElement
      const item = linkActionsView.element?.querySelectorAll(".cm-ck-content-link-view")[0];
      if (!item) {
        throw new Error();
      }
      return item;
    });
    return new ContentLinkViewWrapper(instance);
  }
}
