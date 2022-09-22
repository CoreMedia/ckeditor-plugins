import { JSWrapper } from "../../JSWrapper";
import type { ButtonView } from "@ckeditor/ckeditor5-ui";
import { HasVisible } from "../../../expect/IsVisible/HasVisible";
import { HasToggleable } from "../../../expect/isToggleable/HasToggleable";
import { HasEnabled } from "../../../expect/isEnabled/HasEnabled";

export default class ButtonViewWrapper extends JSWrapper<ButtonView> implements HasVisible, HasToggleable, HasEnabled {
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
    return this.evaluate((buttonView) => {
      return buttonView.isVisible;
    });
  }

  get toggleable(): Promise<boolean> {
    return this.evaluate((buttonView) => {
      return buttonView.isToggleable;
    });
  }

  get on(): Promise<boolean> {
    return this.evaluate((buttonView) => {
      return buttonView.isOn;
    });
  }

  get enabled(): Promise<boolean> {
    return this.evaluate((buttonView) => {
      return buttonView.isEnabled;
    });
  }

  async #getAriaLabeledBy(): Promise<string | null | undefined> {
    return this.evaluate((buttonView) => {
      return buttonView.element?.getAttribute("aria-labelledby");
    });
  }
}
