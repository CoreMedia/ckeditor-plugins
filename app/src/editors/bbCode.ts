import { Autosave } from "@ckeditor/ckeditor5-autosave";
import { Bold, Italic, Strikethrough, Underline } from "@ckeditor/ckeditor5-basic-styles";
import { ClassicEditor } from "@ckeditor/ckeditor5-editor-classic";
import { Essentials } from "@ckeditor/ckeditor5-essentials";
import { BBCode } from "@coremedia/ckeditor5-bbcode";
import { Heading } from "@ckeditor/ckeditor5-heading";
import { Paragraph } from "@ckeditor/ckeditor5-paragraph";
import { SourceEditing } from "@ckeditor/ckeditor5-source-editing";

import { AutoLink, Link, LinkImage } from "@ckeditor/ckeditor5-link";
import { CKEditorInstanceFactory } from "../CKEditorInstanceFactory";
import { ApplicationState } from "../ApplicationState";
import { DataFacade } from "@coremedia/ckeditor5-data-facade";
import { updatePreview } from "../preview";
import { Autoformat } from "@ckeditor/ckeditor5-autoformat";
import { Blocklist } from "@coremedia/ckeditor5-coremedia-blocklist";
import { BlockQuote } from "@ckeditor/ckeditor5-block-quote";
import { CodeBlock } from "@ckeditor/ckeditor5-code-block";
import { List, ListProperties } from "@ckeditor/ckeditor5-list";
import { PasteFromOffice } from "@ckeditor/ckeditor5-paste-from-office";
import { RemoveFormat } from "@ckeditor/ckeditor5-remove-format";
import { Indent } from "@ckeditor/ckeditor5-indent";
import { MockBlocklistService } from "@coremedia/ckeditor5-coremedia-studio-integration-mock";
import { FontColor, FontSize } from "@ckeditor/ckeditor5-font";
import { AutoImage, ImageInline, ImageInsert, ImageInsertViaUrl, ImageToolbar } from "@ckeditor/ckeditor5-image";
import { Base64UploadAdapter } from "@ckeditor/ckeditor5-upload";
import ImageBlockEditing from "@ckeditor/ckeditor5-image/src/image/imageblockediting";

export const createBBCodeEditor: CKEditorInstanceFactory = (
  sourceElement: HTMLElement,
  state: ApplicationState,
): Promise<ClassicEditor> => {
  const { uiLanguage } = state;
  return ClassicEditor.create(sourceElement, {
    placeholder: "Type your text here...",
    plugins: [
      AutoImage,
      AutoLink,
      Autoformat,
      Autosave,
      // Base64: Not recommended in production use.
      Base64UploadAdapter,
      BBCode,
      BlockQuote,
      Blocklist,
      Bold,
      CodeBlock,
      DataFacade,
      List,
      ListProperties,
      Essentials,
      FontColor,
      FontSize,
      Heading,
      // ImageBlockEditing: Required by LinkImage; but images in BBCode are always inline.
      ImageBlockEditing,
      ImageInline,
      ImageInsert,
      ImageInsertViaUrl,
      ImageToolbar,
      Indent,
      Italic,
      Link,
      LinkImage,
      MockBlocklistService,
      Paragraph,
      PasteFromOffice,
      RemoveFormat,
      SourceEditing,
      Strikethrough,
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
      "fontSize",
      "fontColor",
      "removeFormat",
      "|",
      "link",
      "imageInsert",
      "|",
      "blockQuote",
      "codeBlock",
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
    codeBlock: {
      // Mostly defaults, despite new one: BBCode.
      languages: [
        { language: "plaintext", label: "Plain text" }, // The default language.
        { language: "bbcode", label: "BBCode" },
        { language: "c", label: "C" },
        { language: "cs", label: "C#" },
        { language: "cpp", label: "C++" },
        { language: "css", label: "CSS" },
        { language: "diff", label: "Diff" },
        { language: "html", label: "HTML" },
        { language: "java", label: "Java" },
        { language: "javascript", label: "JavaScript" },
        { language: "php", label: "PHP" },
        { language: "python", label: "Python" },
        { language: "ruby", label: "Ruby" },
        { language: "typescript", label: "TypeScript" },
        { language: "xml", label: "XML" },
      ],
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
    fontColor: {
      colors: [
        {
          color: "hsl(0,0%,0%)",
          label: "Black",
        },
        {
          color: "#ff0000",
          label: "Red",
        },
        {
          color: "rgb(255,255,0)",
          label: "Yellow",
        },
        {
          color: "#00ff00",
          label: "Green",
        },
        {
          color: "#00ffff",
          label: "Cyan",
        },
        {
          color: "#0000ff",
          label: "Blue",
        },
        {
          color: "fuchsia",
          label: "Fuchsia",
        },
        {
          color: "#ffffff",
          label: "White",
          hasBorder: true,
        },
        {
          color: "rgba(0,0,0,0.63)",
          label: "Darken",
        },
      ],
      colorPicker: {
        format: "hex",
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
    image: {
      toolbar: ["imageTextAlternative"],
      upload: {
        types: ["jpeg", "png", "gif", "bmp", "webp", "tiff", "avif", "svg"],
      },
    },
    language: {
      // Language switch only applies to editor instance.
      ui: uiLanguage,
      // Won't change the language of content.
      content: "en",
    },
    list: {
      properties: {
        startIndex: false,
        styles: {
          useAttribute: true,
        },
        reversed: false,
      },
    },
    link: {
      defaultProtocol: "https://",
    },
  });
};
