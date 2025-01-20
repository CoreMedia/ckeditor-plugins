import { Editor, LabeledFieldView, View } from "ckeditor5";
import ContentLinkView from "../ContentLinkView";

export default class SuggestionView extends View<HTMLDivElement> {}

export const createContentLinkSuggestion = (editor: Editor): ContentLinkView => {
  //const { t } = editor.locale;

  const clv = new ContentLinkView(editor, {
    renderTypeIcon: true,
    renderCancelButton: false,
  });

  const contentLinkView = new LabeledFieldView(editor.locale, () => clv);
  //   contentLinkView.set({
  //     label: t("Link"),
  //     isEmpty: false,
  //     class: "cm-test",
  //   });

  const { fieldView } = contentLinkView;
  fieldView.set("uriPath", "content:12345");

  fieldView.on("contentClick", () => {
    console.log("content clicked");
  });
  return clv;
};
