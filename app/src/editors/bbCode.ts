import { Autosave } from "@ckeditor/ckeditor5-autosave";
import { Bold, Italic } from "@ckeditor/ckeditor5-basic-styles";
import { ClassicEditor } from "@ckeditor/ckeditor5-editor-classic";
import { Essentials } from "@ckeditor/ckeditor5-essentials";
import { BBCode } from "@coremedia/ckeditor5-coremedia-bbcode";
import { Heading } from "@ckeditor/ckeditor5-heading";
import { Paragraph } from "@ckeditor/ckeditor5-paragraph";
import { SourceEditing } from "@ckeditor/ckeditor5-source-editing";

import { Editor } from "@ckeditor/ckeditor5-core";
import { getHashParam } from "../HashParams";

/**
 * Typings for CKEditorInspector, as it does not ship with typings yet.
 */
// See https://github.com/ckeditor/ckeditor5-inspector/issues/173
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
declare class CKEditorInspector {
  static attach(editorOrConfig: Editor | Record<string, Editor>, options?: { isCollapsed?: boolean }): string[];
}

const editorElementSelector = "#bbcodeEditor";

export const createBBCodeEditor = (language = "en") => {
  const sourceElement = document.querySelector(editorElementSelector) as HTMLElement;
  if (!sourceElement) {
    throw new Error(`No element with id ${editorElementSelector} defined in html. Nothing to create the editor in.`);
  }

  ClassicEditor.create(document.querySelector(editorElementSelector) as HTMLElement, {
    placeholder: "Type your text here...",
    plugins: [Autosave, Bold, Essentials, Heading, Italic, Paragraph, SourceEditing, BBCode],
    toolbar: ["undo", "redo", "|", "heading", "|", "bold", "italic", "sourceEditing"],
    language: {
      // Language switch only applies to editor instance.
      ui: language,
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
  })
    .then((newEditor: ClassicEditor) => {
      CKEditorInspector.attach(
        {
          "bbcode-editor": newEditor,
        },
        {
          // With hash parameter #expandInspector you may expand the
          // inspector by default.
          isCollapsed: !getHashParam("expandInspector"),
        }
      );
    })
    .catch((error) => {
      console.error(error);
    });
};
