import LabeledFieldView from "@ckeditor/ckeditor5-ui/src/labeledfield/labeledfieldview";
import Locale from "@ckeditor/ckeditor5-utils/src/locale";
import ContentView from "./ContentView";
import "../theme/contentlinkview.css";
import LinkUI from "@ckeditor/ckeditor5-link/src/linkui";

/**
 * Creates an ContentLinkView that renders content links in the link form-view.
 * It is initially hidden and must be revealed by removing its hidden class manually.
 *
 * The ContentLinkView is a LabeledFieldView which contains a ContentView.
 *
 * @param locale the editor's locale
 * @param linkUI the linkUI plugin
 */
const createContentLinkView = (locale: Locale, linkUI: LinkUI): LabeledFieldView<ContentView> => {
  const contentLinkView: LabeledFieldView<ContentView> = new LabeledFieldView(
    locale,
    (labeledFieldView, viewUid, statusUid) => new ContentView(locale, linkUI)
  );

  contentLinkView.set({
    label: "Url",
    isEmpty: false,
    class: "ck-cm-content-link-field",
  });

  contentLinkView.fieldView._buttonView.on("execute", () => {
    linkUI.set({
      contentUriPath: undefined,
    });
  });

  return contentLinkView;
};

export default createContentLinkView;
