import LabeledFieldView from "@ckeditor/ckeditor5-ui/src/labeledfield/labeledfieldview";
import "../../../theme/contentlinkview.css";
import LinkUI from "@ckeditor/ckeditor5-link/src/linkui";
import ContentLinkView from "./ContentLinkView";
import Editor from "@ckeditor/ckeditor5-core/src/editor/editor";
import LoggerProvider from "@coremedia/ckeditor5-logging/logging/LoggerProvider";
import { executeOpenContentInTabCommand } from "../OpenContentInTabCommand";

/**
 * Creates an ContentLinkView that renders content links in the link form-view.
 * It is initially hidden and must be revealed by removing its hidden class manually.
 *
 * The ContentLinkView is a LabeledFieldView, which contains a ContentView.
 *
 * @param linkUI - the linkUI plugin
 * @param editor - the editor
 */
const createContentLinkView = (linkUI: LinkUI, editor: Editor): LabeledFieldView => {
  const logger = LoggerProvider.getLogger("ContentLinkView");

  const { t } = editor.locale;
  const { formView } = linkUI;
  const contentLinkView: LabeledFieldView = new LabeledFieldView(
    editor.locale,
    () =>
      new ContentLinkView(editor, {
        renderTypeIcon: true,
        renderCancelButton: true,
      })
  );

  contentLinkView.set({
    label: t("Link"),
    isEmpty: false,
    class: "cm-ck-content-link-view-wrapper",
  });

  const { fieldView } = contentLinkView;

  // Propagate URI-Path from formView (see FormViewExtension) to ContentLinkView
  // @ts-expect-error TODO Fix According to Typings
  fieldView.bind("uriPath").to(formView, "contentUriPath");
  // Propagate Content Name from ContentLinkView to FormView, as we require
  // knowing the name in some link insertion scenarios.
  formView.bind("contentName").to(contentLinkView.fieldView);
  fieldView.on("contentClick", () => {
    // @ts-expect-error - Fix typings.
    const { uriPath } = fieldView;
    if (typeof uriPath === "string") {
      logger.debug(`Executing OpenContentInTabCommand for: ${uriPath}.`);
      executeOpenContentInTabCommand(editor, [uriPath]);
    }
  });

  fieldView.on("executeCancel", () => {
    formView.set({
      contentUriPath: undefined,
    });
    linkUI.actionsView.set({
      contentUriPath: undefined,
    });
    formView.urlInputView.focus();
  });

  return contentLinkView;
};

export default createContentLinkView;
