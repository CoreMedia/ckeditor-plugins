import LabeledFieldView from "@ckeditor/ckeditor5-ui/src/labeledfield/labeledfieldview";
import Locale from "@ckeditor/ckeditor5-utils/src/locale";
import ContentView from "./ContentView";
import LinkFormView from "@ckeditor/ckeditor5-link/src/ui/linkformview";
import { updateVisibility } from "../utils";
import "../theme/internallinkview.css";

/**
 * Creates an InternalLinkView that renders internal links in the link form-view.
 * It is initially hidden and must be revealed by removing its hidden class manually.
 *
 * The InternalLinkView is a LabeledFieldView which contains a ContentView.
 *
 * @param locale the editor's locale
 * @param linkFormView the containing linkFormView
 */
const createInternalLinkView = (locale: Locale, linkFormView: LinkFormView): LabeledFieldView<ContentView> => {
  const internalLinkView: LabeledFieldView<ContentView> = new LabeledFieldView(
    locale,
    (labeledFieldView, viewUid, statusUid) => new ContentView(locale)
  );

  internalLinkView.set({
    label: "Url",
    isEmpty: false,
    class: ["cm-ck-internal-link-field-view ck-cm-hidden"],
  });

  internalLinkView.fieldView._buttonView.on("execute", () => {
    updateVisibility(internalLinkView, false);
    updateVisibility(linkFormView.urlInputView, true);
  });

  return internalLinkView;
};

export default createInternalLinkView;
