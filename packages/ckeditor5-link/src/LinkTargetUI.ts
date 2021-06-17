import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import Editor from "@ckeditor/ckeditor5-core/src/editor/editor";
import { Logger, LoggerProvider } from "@coremedia/coremedia-utils/index";
import LinkUI from "@ckeditor/ckeditor5-link/src/linkui";
import LinkFormViewExtension from "./ui/LinkFormViewExtension";
import LinkEditing from "@ckeditor/ckeditor5-link/src/linkediting";
import LinkFormView from "@ckeditor/ckeditor5-link/src/ui/linkformview";
import ButtonView from "@ckeditor/ckeditor5-ui/src/button/buttonview";
import View from "@ckeditor/ckeditor5-ui/src/view";
import { LINK_BEHAVIOR, linkTargetToUiValues, uiValuesToLinkTarget } from "./utils";

import "./theme/linkform.css";
import "./theme/footerbutton.css";

/**
 * Adds an attribute `linkTarget` to the model, which will be represented
 * as `target` attribute in view.
 *
 * @see <a href="https://stackoverflow.com/questions/51303892/how-to-add-target-attribute-to-a-tag-in-ckeditor5">How to add "target" attribute to `a` tag in ckeditor5? - Stack Overflow</a>
 */
export default class LinkTargetUI extends Plugin {
  static readonly pluginName: string = "LinkTargetUI";
  private readonly logger: Logger = LoggerProvider.getLogger(LinkTargetUI.pluginName);

  static get requires(): Array<new (editor: Editor) => Plugin> {
    return [LinkUI, LinkEditing];
  }

  private formExtension?: LinkFormViewExtension;

  init(): Promise<void> | null {
    const startTimestamp = performance.now();

    this.logger.debug(`Initializing ${LinkTargetUI.pluginName}...`);

    const editor = this.editor;
    const linkUI: LinkUI = <LinkUI>editor.plugins.get(LinkUI);

    this.formExtension = this._extendFormView(linkUI);

    this.logger.debug(`Initialized ${LinkTargetUI.pluginName} within ${performance.now() - startTimestamp} ms.`);
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
  private _extendFormView(linkUI: LinkUI): LinkFormViewExtension {
    const editor = this.editor;
    const linkCommand = editor.commands.get("link");
    const linkTargetCommand = editor.commands.get("linkTarget");
    const formView = linkUI.formView;
    const extension = new LinkFormViewExtension(formView);
    extension.targetInputView
      .bind("hiddenTarget")
      .to(linkTargetCommand, "value", (value: string) => linkTargetToUiValues(value).target);

    /*
     * Also listen to the url input field to be able to differentiate between new links (with default link behavior)
     * and already existing links with no linkBehavior set
     */
    extension.linkBehaviorView
      .bind("linkBehavior")
      .to(linkTargetCommand, "value", formView.urlInputView.fieldView, "value", (value: string, url: string) =>
        url ? linkTargetToUiValues(value).linkBehavior : LINK_BEHAVIOR.OPEN_IN_CURRENT_TAB
      );

    // TODO[cke] We need to fix the typing of bind regarding the bind parameters.
    // @ts-ignore
    extension.targetInputView.bind("isReadOnly").to(linkCommand, "isEnabled", (value) => !value);
    this._customizeFormView(formView);
    LinkTargetUI._customizeToolbarButtons(formView);

    this.listenTo(
      formView,
      "submit",
      () => {
        const { value: target } = <HTMLInputElement>extension.targetInputView.fieldView.element;
        const { value: href } = <HTMLInputElement>formView.urlInputView.fieldView.element;
        // @ts-ignore
        const linkBehavior: string = extension.linkBehaviorView.linkBehavior;
        const linkTarget = uiValuesToLinkTarget(linkBehavior, target);
        editor.execute("linkTarget", linkTarget, href);
      },
      /*
       * We need a higher listener priority here than for `LinkCommand`.
       * This is because we want to listen to any changes to the model
       * triggered by LinkCommand.
       *
       * This is actually a workaround regarding a corresponding extension
       * point to the link command.
       */
      {
        priority: "high",
      }
    );

    /*
     * Workaround to reset the values of linkBehavior and target fields if modal
     * is canceled and reopened after changes have been made. See related issues:
     * ckeditor/ckeditor5-link#78 (now: ckeditor/ckeditor5#4765) and
     * ckeditor/ckeditor5-link#123 (now: ckeditor/ckeditor5#4793)
     */
    //@ts-ignore
    linkUI.decorate("_addFormView");
    this.listenTo(linkUI, "_addFormView", () => {
      if (linkTargetCommand === undefined) {
        return;
      }
      const { linkBehavior, target } = linkTargetToUiValues(<string>linkTargetCommand.value);
      //@ts-ignore
      extension.linkBehaviorView.linkBehavior = linkBehavior || "";
      extension.targetInputView.fieldView.element.value = target || "";
      //@ts-ignore
      extension.targetInputView.hiddenTarget = target || "";
    });

    return extension;
  }

  private static _customizeToolbarButtons(formView: LinkFormView): void {
    LinkTargetUI._customizeButton(formView.cancelButtonView);
    LinkTargetUI._customizeButton(formView.saveButtonView);
  }

  private _customizeFormView(formView: LinkFormView): void {
    const CM_LINK_FORM_CLS = "cm-ck-link-form";
    const CM_FORM_VIEW_CLS = "cm-ck-link-form-view";
    const CM_PRIMARY_BUTTON_CLS = "cm-ck-footer-button-primary";
    const CM_FOOTER_BUTTON_CLS = "cm-ck-footer-button";

    // always add vertical css classes to the formView
    this._addClassToTemplate(formView, [CM_LINK_FORM_CLS, CM_FORM_VIEW_CLS]);

    // change the order of the buttons
    formView.children.remove(formView.saveButtonView);
    formView.children.remove(formView.cancelButtonView);

    this._addClassToTemplate(formView.saveButtonView, [CM_FOOTER_BUTTON_CLS, CM_PRIMARY_BUTTON_CLS]);
    this._addClassToTemplate(formView.cancelButtonView, CM_FOOTER_BUTTON_CLS);
    formView.children.add(formView.cancelButtonView);
    formView.children.add(formView.saveButtonView);
  }

  private static _customizeButton(button: ButtonView): void {
    // The icon view is the first child of the viewCollection:
    const iconView = button.children.first;
    button.children.remove(iconView);
    button.withText = true;
  }

  private _addClassToTemplate(view: View, classNames: string[] | string): void {
    // @ts-ignore
    const classes: string[] = view.template.attributes.class;

    if (!Array.isArray(classNames)) {
      classNames = [classNames];
    }
    classNames.forEach((className) => {
      if (!classes.includes(className)) {
        classes.push(className);
      }
    });
  }

  destroy(): Promise<never> | null {
    this.formExtension?.destroy();
    return null;
  }
}
