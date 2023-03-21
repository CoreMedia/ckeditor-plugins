import LabeledFieldView from "@ckeditor/ckeditor5-ui/src/labeledfield/labeledfieldview";
import "../../../theme/contentlinkview.css";
import LinkUI from "@ckeditor/ckeditor5-link/src/linkui";
import ContentLinkView from "./ContentLinkView";
import Editor from "@ckeditor/ckeditor5-core/src/editor/editor";
import { LazyLinkUIPropertiesNotInitializedYetError } from "../LazyLinkUIPropertiesNotInitializedYetError";

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
  const { t } = editor.locale;
  const { formView } = linkUI;
  const { actionsView } = linkUI;
  if (!formView || !actionsView) {
    throw new LazyLinkUIPropertiesNotInitializedYetError();
  }
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

  // Propagate URI-Path from formView (see FormViewExtension) to ContentLinkView

  // @ts-expect-errors since 37.0.0, how to extend the view with another property?
  contentLinkView.fieldView.bind("uriPath").to(formView, "contentUriPath");
  // Propagate Content Name from ContentLinkView to FormView, as we require to
  // know the name in some link insertion scenarios.

  // @ts-expect-errors since 37.0.0, how to extend the view with another property?
  formView.bind("contentName").to(contentLinkView.fieldView);
  contentLinkView.fieldView.on("contentClick", () => {
    linkUI.editor.commands.get("openLinkInTab")?.execute();
  });

  contentLinkView.fieldView.on("executeCancel", () => {
    formView.set({
      // @ts-expect-errors since 37.0.0, how to extend the view with another property?
      contentUriPath: undefined,
    });
    actionsView.set({
      // @ts-expect-errors since 37.0.0, how to extend the view with another property?
      contentUriPath: undefined,
    });
    formView.urlInputView.focus();
  });

  return contentLinkView;
};

export default createContentLinkView;
