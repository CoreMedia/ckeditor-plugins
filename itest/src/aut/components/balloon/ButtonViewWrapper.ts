import type { ButtonView } from "ckeditor5";
import { JSWrapper } from "../../JSWrapper";
import type { HasVisible } from "../../../expect/IsVisible/HasVisible";
import type { HasToggleable } from "../../../expect/isToggleable/HasToggleable";
import type { HasEnabled } from "../../../expect/isEnabled/HasEnabled";
import type { HasAriaLabel } from "../../../aria/AriaUtils";

export default class ButtonViewWrapper
  extends JSWrapper<ButtonView>
  // Seems, we cannot make prettier happy here for some reason regarding
  // whitespace before curly brace.
  // eslint-disable-next-line prettier/prettier
  implements HasVisible, HasToggleable, HasEnabled, HasAriaLabel {
  click(): Promise<void> {
    return this.evaluate((buttonView) => {
      const element = buttonView.element;
      if (element) {
        element.click();
      } else {
        throw Error("Can't click element which does not exist");
      }
    });
  }

  get visible(): Promise<boolean> {
    return this.evaluate((buttonView) => buttonView.isVisible);
  }

  get toggleable(): Promise<boolean> {
    return this.evaluate((buttonView) => buttonView.isToggleable);
  }

  get on(): Promise<boolean> {
    return this.evaluate((buttonView) => buttonView.isOn);
  }

  get enabled(): Promise<boolean> {
    return this.evaluate((buttonView) => buttonView.isEnabled);
  }

  getAriaLabel(): Promise<string | undefined> {
    return this.evaluate((buttonView) => {
      const element = buttonView.element;
      if (!element) {
        return Promise.reject(new Error("ButtonView has no element"));
      }
      const attribute = element.getAttribute("aria-label");
      if (!attribute) {
        return Promise.resolve(undefined);
      }
      return Promise.resolve(attribute);
    });
  }

  getAriaLabelledBy(): Promise<string | undefined> {
    return this.evaluate((buttonView) => {
      const element = buttonView.element;
      if (!element) {
        return Promise.reject(new Error("ButtonView has no element"));
      }
      const attribute = element.getAttribute("aria-labelledby");
      if (!attribute) {
        return Promise.resolve(undefined);
      }
      return Promise.resolve(attribute);
    });
  }
}
