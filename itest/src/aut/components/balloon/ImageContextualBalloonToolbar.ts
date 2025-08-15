import { ButtonView, ToolbarView } from "ckeditor5";
import ToolbarViewWrapper from "../ToolbarViewWrapper";
import ButtonViewWrapper from "./ButtonViewWrapper";

export default class ImageContextualBalloonToolbar {
  readonly #toolbarViewWrapper: ToolbarViewWrapper;
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
    return this.#getButtonViewWrapper(8);
  }
  #getButtonViewWrapper(buttonIndex: number): ButtonViewWrapper {
    const buttonInstance = this.#toolbarViewWrapper.evaluateHandle((toolbarView, buttonIndex: number) => {
      const itemsView: unknown = toolbarView.children.get(0) as unknown as ToolbarView;
      if (!itemsView) {
        throw new Error("ToolbarView has no items view");
      }
      const buttonView = (itemsView as ToolbarView).children.get(buttonIndex) as unknown as ButtonView;
      if (!buttonView) {
        throw new Error(`No button found for button index ${buttonIndex}.`);
      }
      return buttonView;
    }, buttonIndex);
    return new ButtonViewWrapper(buttonInstance);
  }
}
