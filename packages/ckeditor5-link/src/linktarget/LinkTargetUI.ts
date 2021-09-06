import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import Editor from "@ckeditor/ckeditor5-core/src/editor/editor";
import Logger from "@coremedia/coremedia-utils/logging/Logger";
import LoggerProvider from "@coremedia/coremedia-utils/logging/LoggerProvider";
import LinkUI from "@ckeditor/ckeditor5-link/src/linkui";
import LinkEditing from "@ckeditor/ckeditor5-link/src/linkediting";
import LinkFormView from "@ckeditor/ckeditor5-link/src/ui/linkformview";
import ButtonView from "@ckeditor/ckeditor5-ui/src/button/buttonview";
import { addClassToTemplate, removeClassFromTemplate } from "../utils";

import "./theme/linkform.css";
import "./theme/footerbutton.css";
import LinkActionsView from "@ckeditor/ckeditor5-link/src/ui/linkactionsview";

/**
 * Adds an attribute `linkTarget` to the model, which will be represented
 * as `target` attribute in view.
 *
 * @see <a href="https://stackoverflow.com/questions/51303892/how-to-add-target-attribute-to-a-tag-in-ckeditor5">How to add "target" attribute to `a` tag in ckeditor5? - Stack Overflow</a>
 */
export default class LinkTargetUI extends Plugin {
  static readonly pluginName: string = "LinkTargetUI";
  static readonly #logger: Logger = LoggerProvider.getLogger(LinkTargetUI.pluginName);

  static get requires(): Array<new (editor: Editor) => Plugin> {
    return [LinkUI, LinkEditing];
  }

  init(): Promise<void> | null {
    const logger = LinkTargetUI.#logger;
    const startTimestamp = performance.now();

    logger.debug(`Initializing ${LinkTargetUI.pluginName}...`);

    const editor = this.editor;
    const linkUI: LinkUI = <LinkUI>editor.plugins.get(LinkUI);

    this.#extendFormView(linkUI);

    logger.debug(`Initialized ${LinkTargetUI.pluginName} within ${performance.now() - startTimestamp} ms.`);
    return null;
  }

  /*
   * Design notes:
   *
   * * Just as linkUi we need to listen to formView.submit to read the input
   *   fields. We may need to ensure a higher priority.
   * * We may need to move the addition of linkTarget attribute to a command
   *   which is then executed.
   */
  #extendFormView(linkUI: LinkUI) {
    const formView = linkUI.formView;
    LinkTargetUI.#customizeUrlInputView(formView);
    LinkTargetUI.#customizeActionsView(linkUI.actionsView);

    LinkTargetUI._customizeFormView(formView);
    LinkTargetUI.#customizeToolbarButtons(formView);
  }

  static #customizeUrlInputView(linkFormView: LinkFormView): void {
    linkFormView.urlInputView.set({
      label: "Link",
      class: ["cm-ck-external-link-field"],
    });
    linkFormView.urlInputView.fieldView.set({
      placeholder: "URL angeben oder Inhalt hierher ziehen",
    });
  }

  static #customizeActionsView(actionsView: LinkActionsView): void {
    const CM_FORM_VIEW_CLS = "cm-ck-link-actions-view";
    const CM_PREVIEW_BUTTON_VIEW_CLS = "cm-ck-link-actions-preview";
    addClassToTemplate(actionsView, [CM_FORM_VIEW_CLS]);
    addClassToTemplate(actionsView.previewButtonView, [CM_PREVIEW_BUTTON_VIEW_CLS]);
  }

  static #customizeToolbarButtons(formView: LinkFormView): void {
    LinkTargetUI.#customizeButton(formView.cancelButtonView);
    LinkTargetUI.#customizeButton(formView.saveButtonView);
  }

  private static _customizeFormView(formView: LinkFormView): void {
    const CM_LINK_FORM_CLS = "cm-ck-link-form";
    const CM_FORM_VIEW_CLS = "cm-ck-link-form-view";
    const CM_PRIMARY_BUTTON_CLS = "cm-ck-footer-button-primary";
    const CM_FOOTER_BUTTON_CLS = "cm-ck-footer-button";

    // ck editor default classes, that need to be removed
    // these classes will only appear if manual decorators are enabled
    const CK_LINK_FORM_LAYOUT_VERTICAL_CLS = "ck-link-form_layout-vertical";
    const CK_VERTICAL_FORM_CLS = "ck-vertical-form";

    // always add vertical css classes to the formView
    addClassToTemplate(formView, [CM_LINK_FORM_CLS, CM_FORM_VIEW_CLS]);
    removeClassFromTemplate(formView, [CK_LINK_FORM_LAYOUT_VERTICAL_CLS, CK_VERTICAL_FORM_CLS]);

    // change the order of the buttons
    formView.children.remove(formView.saveButtonView);
    formView.children.remove(formView.cancelButtonView);

    addClassToTemplate(formView.saveButtonView, [CM_FOOTER_BUTTON_CLS, CM_PRIMARY_BUTTON_CLS]);
    addClassToTemplate(formView.cancelButtonView, CM_FOOTER_BUTTON_CLS);
    formView.children.add(formView.cancelButtonView);
    formView.children.add(formView.saveButtonView);
  }

  static #customizeButton(button: ButtonView): void {
    // The icon view is the first child of the viewCollection:
    const iconView = button.children.first;
    button.children.remove(iconView);
    button.withText = true;
  }
}
