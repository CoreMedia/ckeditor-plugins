import LabeledFieldView from "@ckeditor/ckeditor5-ui/src/labeledfield/labeledfieldview";
import Locale from "@ckeditor/ckeditor5-utils/src/locale";
import ContentView from "./ContentView";
import LinkFormView from "@ckeditor/ckeditor5-link/src/ui/linkformview";
import "../../theme/internallinkview.css";
import Command from "@ckeditor/ckeditor5-core/src/command";
import EventInfo from "@ckeditor/ckeditor5-utils/src/eventinfo";
import { CONTENT_CKE_MODEL_URI_REGEXP } from "@coremedia/coremedia-studio-integration/content/UriPath";
import {showInternalLinkField} from "../ContentLinkViewUtils";

/**
 * Creates an InternalLinkView that renders internal links in the link form-view.
 * It is initially hidden and must be revealed by removing its hidden class manually.
 *
 * The InternalLinkView is a LabeledFieldView which contains a ContentView.
 *
 * @param locale the editor's locale
 * @param linkFormView the containing linkFormView
 */
const createInternalLinkView = (
  locale: Locale,
  linkFormView: LinkFormView,
  linkCommand: Command | undefined
): LabeledFieldView<ContentView> => {
  const internalLinkView: LabeledFieldView<ContentView> = new LabeledFieldView(
    locale,
    (labeledFieldView, viewUid, statusUid) => new ContentView(locale)
  );

  internalLinkView.set({
    label: "Url",
    isEmpty: false,
    class: "ck-cm-internal-link-field",
  });

  internalLinkView.fieldView._buttonView.on("execute", () => {
    internalLinkView.fieldView.set({
      value: undefined,
    });
  });

  /*
   * Listen to changes of linkCommand (just like the url input field does)
   * If the value represents a content, we'll set the content link field value
   */
  internalLinkView.fieldView.bind("value").to(linkCommand, "value", (value: string) => {
    return CONTENT_CKE_MODEL_URI_REGEXP.test(value) ? value : undefined;
  });

  /*
   * We need to update the visibility of the inputs when the value of the content link changes
   * If the value was removed: show external link field, otherwise show the internal link field
   */
  internalLinkView.fieldView.on("change:value", (evt: EventInfo) => {
    const value = evt.source.value;
    // content link value has changed. set urlInputView accordingly
    // value is null if it was set by cancelling and reopening the dialog, resetting the dialog should not
    // re-trigger a set of utlInputView here
    if (value !== null) {
      linkFormView.urlInputView.fieldView.set({
        value: value || "",
      });
    }

    // set visibility of url and content field
    showInternalLinkField(linkFormView, value);
  });

  return internalLinkView;
};

export default createInternalLinkView;
