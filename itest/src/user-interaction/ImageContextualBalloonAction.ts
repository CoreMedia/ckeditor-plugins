import { ApplicationWrapper } from "../aut/ApplicationWrapper";
import { ContextualBalloonWrapper } from "../aut/ContextualBalloonWrapper";

/**
 * Actions to control the ImageStyle contextual balloon.
 */
export class ImageContextualBalloonAction {
  /**
   * Clicks the align left button in the active contextual balloon.
   * Assumes that the balloon has been opened before.
   *
   * @param application - the current application
   */
  static async clickAlignLeft(application: ApplicationWrapper): Promise<void> {
    const contextualBalloon = application.contextualBalloon;
    const alignLeftButton = ImageContextualBalloonAction.#getAlignLeftButton(contextualBalloon);
    await alignLeftButton.click();
  }

  /**
   * Clicks the align right button in the active contextual balloon.
   * Assumes that the balloon has been opened before.
   *
   * @param application - the current application
   */
  static async clickAlignRight(application: ApplicationWrapper): Promise<void> {
    const contextualBalloon = application.contextualBalloon;
    const alignRightButton = ImageContextualBalloonAction.#getAlignRightButton(contextualBalloon);
    await alignRightButton.click();
  }

  /**
   * Clicks the align within text button in the active contextual balloon.
   * Assumes that the balloon has been opened before.
   *
   * @param application - the current application
   */
  static async clickAlignWithinText(application: ApplicationWrapper): Promise<void> {
    const contextualBalloon = application.contextualBalloon;
    const alignWithinTextButton = ImageContextualBalloonAction.#getAlignWithinTextButton(contextualBalloon);
    await alignWithinTextButton.click();
  }

  /**
   * Clicks the align page default button in the active contextual balloon.
   * Assumes that the balloon has been opened before.
   *
   * @param application - the current application
   */
  static async clickAlignPageDefault(application: ApplicationWrapper): Promise<void> {
    const contextualBalloon = application.contextualBalloon;
    const alignPageDefaultButton = ImageContextualBalloonAction.#getAlignPageDefaultButton(contextualBalloon);
    await alignPageDefaultButton.click();
  }

  /**
   * Clicks the open in tab button in the active contextual balloon.
   * Assumes that the balloon has been opened before.
   *
   * @param application - the current application
   */
  static async clickOpenInTab(application: ApplicationWrapper): Promise<void> {
    const contextualBalloon = application.contextualBalloon;
    const openInTabButton = ImageContextualBalloonAction.#getOpenInTabButton(contextualBalloon);
    await openInTabButton.click();
  }

  /**
   * Returns the state of the open image in tab button.
   *
   * @param application - the application wrapper.
   */
  static async openInTabIsEnabled(application: ApplicationWrapper): Promise<boolean> {
    const contextualBalloon = application.contextualBalloon;
    const openInTabButton = ImageContextualBalloonAction.#getOpenInTabButton(contextualBalloon);
    return openInTabButton.isEnabled();
  }

  static #getAlignLeftButton(contextualBalloon: ContextualBalloonWrapper) {
    return contextualBalloon.getNthItem(0);
  }

  static #getAlignRightButton(contextualBalloon: ContextualBalloonWrapper) {
    return contextualBalloon.getNthItem(1);
  }

  static #getAlignWithinTextButton(contextualBalloon: ContextualBalloonWrapper) {
    return contextualBalloon.getNthItem(2);
  }

  static #getAlignPageDefaultButton(contextualBalloon: ContextualBalloonWrapper) {
    return contextualBalloon.getNthItem(3);
  }

  static #getOpenInTabButton(contextualBalloon: ContextualBalloonWrapper) {
    return contextualBalloon.getNthItem(5);
  }
}
