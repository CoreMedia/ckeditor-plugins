import { Autosave } from "@ckeditor/ckeditor5-autosave";
import { Bold, Italic, Underline } from "@ckeditor/ckeditor5-basic-styles";
import { ClassicEditor } from "@ckeditor/ckeditor5-editor-classic";
import { Essentials } from "@ckeditor/ckeditor5-essentials";
import { BBCode } from "@coremedia/ckeditor5-coremedia-bbcode";
import { Heading } from "@ckeditor/ckeditor5-heading";
import { Paragraph } from "@ckeditor/ckeditor5-paragraph";
import { SourceEditing } from "@ckeditor/ckeditor5-source-editing";

import { Link } from "@ckeditor/ckeditor5-link";
import { CKEditorInstanceFactory } from "../CKEditorInstanceFactory";
import { ApplicationState } from "../ApplicationState";

export const createBBCodeEditor: CKEditorInstanceFactory = (
  sourceElement: HTMLElement,
  state: ApplicationState
): Promise<ClassicEditor> => {
  const { uiLanguage } = state;
  return ClassicEditor.create(sourceElement, {
    placeholder: "Type your text here...",
    plugins: [Autosave, Bold, Essentials, Heading, Italic, Underline, Paragraph, SourceEditing, Link, BBCode],
    toolbar: ["undo", "redo", "|", "heading", "|", "bold", "italic", "underline", "|", "link", "|", "sourceEditing"],
    language: {
      // Language switch only applies to editor instance.
      ui: uiLanguage,
      // Won't change the language of content.
      content: "en",
    },
    autosave: {
      waitingTime: 1000, // in ms
      save() {
        console.log("BBCode Save triggered...");
        return Promise.resolve();
      },
    },
  });
};
