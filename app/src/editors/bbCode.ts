import { Autosave } from "@ckeditor/ckeditor5-autosave";
import { Bold, Italic, Strikethrough, Underline } from "@ckeditor/ckeditor5-basic-styles";
import { ClassicEditor } from "@ckeditor/ckeditor5-editor-classic";
import { Essentials } from "@ckeditor/ckeditor5-essentials";
import { BBCode } from "@coremedia/ckeditor5-coremedia-bbcode";
import { Heading } from "@ckeditor/ckeditor5-heading";
import { Paragraph } from "@ckeditor/ckeditor5-paragraph";
import { SourceEditing } from "@ckeditor/ckeditor5-source-editing";

import { AutoLink, Link } from "@ckeditor/ckeditor5-link";
import { CKEditorInstanceFactory } from "../CKEditorInstanceFactory";
import { ApplicationState } from "../ApplicationState";
import { DataFacade } from "@coremedia/ckeditor5-data-facade";
import { updatePreview } from "../preview";
import { Autoformat } from "@ckeditor/ckeditor5-autoformat";
import { Blocklist } from "@coremedia/ckeditor5-coremedia-blocklist";
import { BlockQuote } from "@ckeditor/ckeditor5-block-quote";
import { CodeBlock } from "@ckeditor/ckeditor5-code-block";
import { DocumentList, DocumentListProperties } from "@ckeditor/ckeditor5-list";
import { PasteFromOffice } from "@ckeditor/ckeditor5-paste-from-office";
import { RemoveFormat } from "@ckeditor/ckeditor5-remove-format";
import { Table, TableToolbar } from "@ckeditor/ckeditor5-table";
import { Indent } from "@ckeditor/ckeditor5-indent";
import { MockBlocklistService } from "@coremedia/ckeditor5-coremedia-studio-integration-mock";

export const createBBCodeEditor: CKEditorInstanceFactory = (
  sourceElement: HTMLElement,
  state: ApplicationState,
): Promise<ClassicEditor> => {
  const { uiLanguage } = state;
  return ClassicEditor.create(sourceElement, {
    placeholder: "Type your text here...",
    plugins: [
      AutoLink,
      Autoformat,
      Autosave,
      BBCode,
      BlockQuote,
      Blocklist,
      Bold,
      CodeBlock,
      DataFacade,
      DocumentList,
      DocumentListProperties,
      Essentials,
      Heading,
      Indent,
      Italic,
      Link,
      MockBlocklistService,
      Paragraph,
      PasteFromOffice,
      RemoveFormat,
      SourceEditing,
      Strikethrough,
      Table,
      TableToolbar,
      Underline,
    ],
    toolbar: [
      "undo",
      "redo",
      "|",
      "heading",
      "|",
      "bold",
      "italic",
      "underline",
      "strikethrough",
      "removeFormat",
      "|",
      "link",
      "|",
      "blockQuote",
      "codeBlock",
      "|",
      "insertTable",
      "|",
      "numberedList",
      "bulletedList",
      "outdent",
      "indent",
      "|",
      "blocklist",
      "|",
      "sourceEditing",
    ],
    autosave: {
      waitingTime: 1000, // in ms
    },
    dataFacade: {
      save(dataApi): Promise<void> {
        console.log("Save triggered...");
        const start = performance.now();
        updatePreview(dataApi.getData(), "text");
        console.log(`Saved data within ${performance.now() - start} ms.`);
        return Promise.resolve();
      },
    },
    heading: {
      options: [
        { model: "paragraph", title: "Paragraph", class: "ck-heading_paragraph" },
        { model: "heading1", view: "h1", title: "Heading 1", class: "ck-heading_heading1" },
        { model: "heading2", view: "h2", title: "Heading 2", class: "ck-heading_heading2" },
        { model: "heading3", view: "h3", title: "Heading 3", class: "ck-heading_heading3" },
        { model: "heading4", view: "h4", title: "Heading 4", class: "ck-heading_heading4" },
        { model: "heading5", view: "h5", title: "Heading 5", class: "ck-heading_heading5" },
        { model: "heading6", view: "h6", title: "Heading 6", class: "ck-heading_heading6" },
      ],
    },
    language: {
      // Language switch only applies to editor instance.
      ui: uiLanguage,
      // Won't change the language of content.
      content: "en",
    },
    list: {
      properties: {
        startIndex: true,
        styles: false,
        reversed: false,
      },
    },
    link: {
      defaultProtocol: "https://",
    },
    table: {
      contentToolbar: ["tableColumn", "tableRow"],
    },
  });
};
