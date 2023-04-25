import { LabeledFieldView } from "@ckeditor/ckeditor5-ui";
import "../../../theme/contentlinkview.css";
import ContentLinkView from "./ContentLinkView";
import { Editor } from "@ckeditor/ckeditor5-core";
import { LazyLinkUIPropertiesNotInitializedYetError } from "../LazyLinkUIPropertiesNotInitializedYetError";
import { AugmentedLinkUI } from "./AugmentedLinkUI";

/**
 * Creates an ContentLinkView that renders content links in the link form-view.
 * It is initially hidden and must be revealed by removing its hidden class manually.
 *
 * The ContentLinkView is a LabeledFieldView, which contains a ContentView.
 *
 * @param linkUI - the linkUI plugin
 * @param editor - the editor
 */
const createContentLinkView = (linkUI: AugmentedLinkUI, editor: Editor): LabeledFieldView => {
  const { t } = editor.locale;
  const { formView } = linkUI;
  const { actionsView } = linkUI;
  if (!formView || !actionsView) {
    throw new LazyLinkUIPropertiesNotInitializedYetError();
  }

  const contentLinkView = new LabeledFieldView(
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

  // Propagate URI-Path from formView (see FormViewExtension) to ContentLinkView

  const { fieldView } = contentLinkView;

  fieldView.bind("uriPath").to(formView, "contentUriPath");
  // Propagate Content Name from ContentLinkView to FormView, as we require to
  // know the name in some link insertion scenarios.

  formView.bind("contentName").to(contentLinkView.fieldView);
  fieldView.on("contentClick", () => {
    linkUI.editor.commands.get("openLinkInTab")?.execute();
  });

  fieldView.on("executeCancel", () => {
    formView.set({
      contentUriPath: undefined,
    });
    actionsView.set({
      contentUriPath: undefined,
    });
    formView.urlInputView.focus();
  });

  return contentLinkView;
};

export default createContentLinkView;
