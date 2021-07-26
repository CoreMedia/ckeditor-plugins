import LabeledFieldView from "@ckeditor/ckeditor5-ui/src/labeledfield/labeledfieldview";
import Locale from "@ckeditor/ckeditor5-utils/src/locale";
import "../theme/contentlinkview.css";
import LinkUI from "@ckeditor/ckeditor5-link/src/linkui";
import ContentLinkView from "./ContentLinkView";

/**
 * Creates an ContentLinkView that renders content links in the link form-view.
 * It is initially hidden and must be revealed by removing its hidden class manually.
 *
 * The ContentLinkView is a LabeledFieldView which contains a ContentView.
 *
 * @param locale the editor's locale
 * @param linkUI the linkUI plugin
 */
const createContentLinkView = (locale: Locale, linkUI: LinkUI): LabeledFieldView<ContentLinkView> => {
  const contentLinkView: LabeledFieldView<ContentLinkView> = new LabeledFieldView(
    locale,
    (labeledFieldView, viewUid, statusUid) =>
      new ContentLinkView(locale, linkUI, {
        renderTypeIcon: true,
        renderStatusIcon: true,
        renderCancelButton: true,
      })
  );

  contentLinkView.set({
    label: "Url",
    isEmpty: false,
    class: "cm-ck-content-link-view-wrapper",
  });

  contentLinkView.fieldView.bind("uriPath").to(linkUI.formView, "contentUriPath");

  contentLinkView.fieldView.on("doubleClick", () => {
    console.log("open content");
  });

  contentLinkView.fieldView.on("cancelClick", () => {
    linkUI.formView.set({
      contentUriPath: undefined,
    });
    linkUI.actionsView.set({
      contentUriPath: undefined,
    });
  });

  return contentLinkView;
};

export default createContentLinkView;
