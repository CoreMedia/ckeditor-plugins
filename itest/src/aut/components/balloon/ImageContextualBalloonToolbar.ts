import ToolbarViewWrapper from "../ToolbarViewWrapper";
import ButtonViewWrapper from "./ButtonViewWrapper";
import type { ButtonView } from "@ckeditor/ckeditor5-ui";
import type { ItemsView } from "@ckeditor/ckeditor5-ui/src/toolbar/toolbarview";

export default class ImageContextualBalloonToolbar {
  #toolbarViewWrapper: ToolbarViewWrapper;

  constructor(toolbarViewWrapper: ToolbarViewWrapper) {
    this.#toolbarViewWrapper = toolbarViewWrapper;
  }

  getAlignLeftButton(): ButtonViewWrapper {
    return this.#getButtonViewWrapper(0);
  }

  getAlignRightButton(): ButtonViewWrapper {
    return this.#getButtonViewWrapper(1);
  }

  getAlignWithinTextButton(): ButtonViewWrapper {
    return this.#getButtonViewWrapper(2);
  }

  getAlignPageDefaultButton(): ButtonViewWrapper {
    return this.#getButtonViewWrapper(4);
  }

  getLinkButton(): ButtonViewWrapper {
    return this.#getButtonViewWrapper(6);
  }

  getOpenInTabButton(): ButtonViewWrapper {
    return this.#getButtonViewWrapper(7);
  }

  #getButtonViewWrapper(buttonIndex: number): ButtonViewWrapper {
    const buttonInstance = this.#toolbarViewWrapper.evaluateHandle((toolbarView, buttonIndex: number) => {
      const itemsView: unknown = toolbarView.children.get(0) as unknown as ItemsView;
      if (!itemsView) {
        throw new Error("Toolbarview has no items view");
      }

      const buttonView = (itemsView as ItemsView).children.get(buttonIndex) as unknown as ButtonView;
      if (!buttonView) {
        throw new Error(`No button found for button index ${buttonIndex}.`);
      }
      return buttonView;
    }, buttonIndex);
    return new ButtonViewWrapper(buttonInstance);
  }
}
