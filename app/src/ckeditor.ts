/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import Alignment from "@ckeditor/ckeditor5-alignment/src/alignment";
import Autosave from "@ckeditor/ckeditor5-autosave/src/autosave";
import BlockQuote from "@ckeditor/ckeditor5-block-quote/src/blockquote";
import Bold from "@ckeditor/ckeditor5-basic-styles/src/bold";
import ClassicEditor from "@ckeditor/ckeditor5-editor-classic/src/classiceditor";
import CodeBlock from "@ckeditor/ckeditor5-code-block/src/codeblock";
import Essentials from "@ckeditor/ckeditor5-essentials/src/essentials";
import Heading from "@ckeditor/ckeditor5-heading/src/heading";
import ImageInline from "@ckeditor/ckeditor5-image/src/imageinline";
import ImageStyle from "@ckeditor/ckeditor5-image/src/imagestyle";
import ImageToolbar from "@ckeditor/ckeditor5-image/src/imagetoolbar";
import Indent from "@ckeditor/ckeditor5-indent/src/indent";
import Italic from "@ckeditor/ckeditor5-basic-styles/src/italic";
import AutoLink from "@ckeditor/ckeditor5-link/src/autolink";
import Link from "@ckeditor/ckeditor5-link/src/link";
//@ts-expect-error not part of @types/ckeditor__ckeditor5-list@32.0.1, check for newer versions from time to time
import DocumentList from "@ckeditor/ckeditor5-list/src/documentlist";
import Paragraph from "@ckeditor/ckeditor5-paragraph/src/paragraph";
import PasteFromOffice from "@ckeditor/ckeditor5-paste-from-office/src/pastefromoffice";
import RemoveFormat from "@ckeditor/ckeditor5-remove-format/src/removeformat";
import Strikethrough from "@ckeditor/ckeditor5-basic-styles/src/strikethrough";
//@ts-expect-error typings not available from DefinitelyTyped
import Style from "@ckeditor/ckeditor5-style/src/style";
import SourceEditing from "@ckeditor/ckeditor5-source-editing/src/sourceediting";
import Subscript from "@ckeditor/ckeditor5-basic-styles/src/subscript";
import Superscript from "@ckeditor/ckeditor5-basic-styles/src/superscript";
import Table from "@ckeditor/ckeditor5-table/src/table";
import TableToolbar from "@ckeditor/ckeditor5-table/src/tabletoolbar";
import Underline from "@ckeditor/ckeditor5-basic-styles/src/underline";
import Highlight from "@ckeditor/ckeditor5-highlight/src/highlight";
import ImageBlockEditing from "@ckeditor/ckeditor5-image/src/image/imageblockediting";
import LinkImage from "@ckeditor/ckeditor5-link/src/linkimage";

import Differencing from "@coremedia/ckeditor5-coremedia-differencing/Differencing";
import LinkTarget from "@coremedia/ckeditor5-coremedia-link/linktarget/LinkTarget";
import ContentLinks from "@coremedia/ckeditor5-coremedia-link/contentlink/ContentLinks";
import ContentClipboard from "@coremedia/ckeditor5-coremedia-content-clipboard/ContentClipboard";
import ContentImagePlugin from "@coremedia/ckeditor5-coremedia-images/ContentImagePlugin";

import CoreMediaFontMapper from "@coremedia/ckeditor5-font-mapper/FontMapper";
import MockStudioIntegration from "@coremedia/ckeditor5-coremedia-studio-integration-mock/MockStudioIntegration";

import { setupPreview, updatePreview } from "./preview";
import { initReadOnlyMode } from "./readOnlySupport";
import { initExamples, setExampleData } from "./example-data";
import CoreMediaStudioEssentials, {
  COREMEDIA_RICHTEXT_CONFIG_KEY,
  COREMEDIA_RICHTEXT_SUPPORT_CONFIG_KEY,
  Strictness,
} from "@coremedia/ckeditor5-coremedia-studio-essentials/CoreMediaStudioEssentials";
import { initInputExampleContent } from "./inputExampleContents";
import { replaceByElementAndClassBackAndForth } from "@coremedia/ckeditor5-coremedia-richtext/rules/ReplaceBy";
import { COREMEDIA_MOCK_CONTENT_PLUGIN } from "@coremedia/ckeditor5-coremedia-studio-integration-mock/content/MockContentPlugin";

import { Command, icons } from "@ckeditor/ckeditor5-core";
import { TextPartLanguage } from "@ckeditor/ckeditor5-language";
import { saveData } from "./dataFacade";
import MockInputExamplePlugin from "@coremedia/ckeditor5-coremedia-studio-integration-mock/content/MockInputExamplePlugin";
import PasteContentPlugin from "@coremedia/ckeditor5-coremedia-content-clipboard/paste/PasteContentPlugin";

const {
  //@ts-expect-error We currently have no way to extend icon typing.
  objectInline: withinTextIcon,
  objectLeft: alignLeftIcon,
  objectRight: alignRightIcon,
  objectSizeFull: pageDefaultIcon,
} = icons;

const editorLanguage = document?.currentScript?.dataset.lang ?? "en";

// setup input example content IFrame
const showHideExampleContentButton = document.querySelector("#inputExampleContentButton");
const inputExampleContentFrame = document.querySelector("#inputExampleContentDiv") as HTMLDivElement;
if (showHideExampleContentButton && inputExampleContentFrame) {
  showHideExampleContentButton.addEventListener("click", () => {
    inputExampleContentFrame.hidden = !inputExampleContentFrame.hidden;
    showHideExampleContentButton.textContent = `${
      inputExampleContentFrame.hidden ? "Show" : "Hide"
    } input example contents`;
  });
}

setupPreview();

const imagePlugins = [ContentImagePlugin, ImageInline, ImageBlockEditing, ImageStyle, ImageToolbar];

const sourceElement = document.querySelector("#editor") as HTMLElement;
if (!sourceElement) {
  throw new Error("No element with class editor defined in html. Nothing to create the editor in.");
}
ClassicEditor.create(sourceElement, {
  licenseKey: "",
  placeholder: "Type your text here...",
  plugins: [
    ...imagePlugins,
    Alignment,
    Autosave,
    BlockQuote,
    Bold,
    CodeBlock,
    ContentLinks,
    Differencing,
    Essentials,
    Heading,
    Highlight,
    Indent,
    Italic,
    Link,
    LinkImage,
    LinkTarget,
    Paragraph,
    PasteContentPlugin,
    PasteFromOffice,
    RemoveFormat,
    Strikethrough,
    Style,
    Subscript,
    Superscript,
    Table,
    TableToolbar,
    Underline,
    CoreMediaFontMapper,
    MockInputExamplePlugin,
    MockStudioIntegration,
    TextPartLanguage,
  ],
  toolbar: {
    items: [
      "undo",
      "redo",
      "|",
      "heading",
      "style",
      "|",
      "pasteContent",
      "|",
      "bold",
      "italic",
      "underline",
      "strikethrough",
      "subscript",
      "superscript",
      "highlight",
      "removeFormat",
      "|",
      "link",
      "|",
      "bulletedList",
      "numberedList",
      "outdent",
      "indent",
      "|",
      "codeBlock",
      "blockQuote",
      "alignment",
      "|",
      "insertTable",
      "|",
      "textPartLanguage",
      "|",
      "sourceEditing",
    ],
  },

  alignment: {
    // The following alternative to signal alignment was used in CKEditor 4
    // of CoreMedia CMCC 10 and before.
    // Note, that in contrast to CKEditor 4 approach, these classes are now
    // applicable to any block element, while it supported only `<p>` in the
    // past.
    options: [
      {
        name: "left",
        className: "align--left",
      },
      {
        name: "right",
        className: "align--right",
      },
      {
        name: "center",
        className: "align--center",
      },
      {
        name: "justify",
        className: "align--justify",
      },
    ],
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

  link: {
    defaultProtocol: "https://",
    /*decorators: {
      hasTitle: {
        mode: "manual",
        label: "Title",
        attributes: {
          title:
            'Example how standard-decorators of the link-plugin works. To enable/disable, just rename decorators section to "disabled_decorators" and back again to "decorators" to activate it and see the results.',
        },
      },
    },*/
  },

  image: {
    styles: {
      // Defining custom styling options for the images.
      options: [
        {
          name: "float-left",
          icon: alignLeftIcon,
          title: "Left-aligned",
          className: "float--left",
          modelElements: ["imageInline"],
        },
        {
          name: "float-right",
          icon: alignRightIcon,
          title: "Right-aligned",
          className: "float--right",
          modelElements: ["imageInline"],
        },
        {
          name: "float-none",
          icon: withinTextIcon,
          title: "Within Text",
          className: "float--none",
          modelElements: ["imageInline"],
        },
        {
          name: "inline",
          title: "Page default",
          icon: pageDefaultIcon,
        },
      ],
    },
    toolbar: [
      "imageStyle:float-left",
      "imageStyle:float-right",
      "imageStyle:float-none",
      "|",
      "imageStyle:inline",
      "|",
      "linkImage",
      "contentImageOpenInTab",
    ],
  },

  //@ts-expect-error Typings unavailable.
  style: {
    definitions: [
      {
        name: "Font: Arial",
        element: "span",
        classes: ["font-name--arial"],
      },
      {
        name: "Font: Arial Black",
        element: "span",
        classes: ["font-name--arial-black"],
      },
      {
        name: "Font: Arial Narrow",
        element: "span",
        classes: ["font-name--arial-narrow"],
      },
      {
        name: "Font: Century",
        element: "span",
        classes: ["font-name--century"],
      },
      {
        name: "Font: Courier",
        element: "span",
        classes: ["font-name--courier"],
      },
      {
        name: "Font: Lucida Console",
        element: "span",
        classes: ["font-name--lucida-console"],
      },
      {
        name: "Font: Lucida Sans Unicode",
        element: "span",
        classes: ["font-name--lucida-sans-unicode"],
      },
      {
        name: "Font: Times New Roman",
        element: "span",
        classes: ["font-name--times-new-roman"],
      },
      {
        name: "Font: Verdana",
        element: "span",
        classes: ["font-name--verdana"],
      },
      {
        name: "Size: 08 Pt",
        element: "span",
        classes: ["font-size--8"],
      },
      {
        name: "Size: 09 Pt",
        element: "span",
        classes: ["font-size--9"],
      },
      {
        name: "Size: 10 Pt",
        element: "span",
        classes: ["font-size--10"],
      },
      {
        name: "Size: 11 Pt",
        element: "span",
        classes: ["font-size--11"],
      },
      {
        name: "Size: 12 Pt",
        element: "span",
        classes: ["font-size--12"],
      },
      {
        name: "Size: 14 Pt",
        element: "span",
        classes: ["font-size--14"],
      },
      {
        name: "Size: 16 Pt",
        element: "span",
        classes: ["font-size--16"],
      },
      {
        name: "Size: 18 Pt",
        element: "span",
        classes: ["font-size--18"],
      },
      {
        name: "Size: 20 Pt",
        element: "span",
        classes: ["font-size--20"],
      },
      {
        name: "Size: 24 Pt",
        element: "span",
        classes: ["font-size--24"],
      },
      {
        name: "Size: 26 Pt",
        element: "span",
        classes: ["font-size--26"],
      },
      {
        name: "Size: 28 Pt",
        element: "span",
        classes: ["font-size--28"],
      },
      {
        name: "Size: 36 Pt",
        element: "span",
        classes: ["font-size--36"],
      },
      {
        name: "Size: 48 Pt",
        element: "span",
        classes: ["font-size--48"],
      },
      {
        name: "Size: 72 Pt",
        element: "span",
        classes: ["font-size--72"],
      },
    ],
  },

  table: {
    contentToolbar: ["tableColumn", "tableRow", "mergeTableCells"],
  },

  language: {
    // Language switch only applies to editor instance.
    ui: editorLanguage,
    // Won't change language of content.
    content: "en",
    textPartLanguage: [
      { title: "Arabic", languageCode: "ar", textDirection: "rtl" },
      { title: "English (GB)", languageCode: "en-GB" },
      { title: "English (US)", languageCode: "en-US" },
      { title: "English", languageCode: "en" },
      { title: "French", languageCode: "fr" },
      { title: "German", languageCode: "de" },
      { title: "Japanese", languageCode: "ja" },
      { title: "Spanish", languageCode: "es" },
      { title: "Ukrainian", languageCode: "uk" },
    ],
  },

  autosave: {
    waitingTime: 1000, // in ms
    save(currentEditor) {
      console.log("Save triggered...");
      const start = performance.now();
      return saveData(currentEditor as ClassicEditor, "autosave").then(() => {
        console.log(`Saved data within ${performance.now() - start} ms.`);
      });
    },
  },
  [COREMEDIA_RICHTEXT_CONFIG_KEY]: {
    strictness: Strictness.STRICT,
    rules: {
      elements: {
        // Highlight Plugin Support
        mark: replaceByElementAndClassBackAndForth("mark", "span", "mark"),
      },
    },
  },
  [COREMEDIA_RICHTEXT_SUPPORT_CONFIG_KEY]: {
    aliases: [
      // As we represent `<mark>` as `<span class="mark">`, we must ensure,
      // that the same attributes are kept as is from CMS. For example, the
      // dir-attribute, which is valid for `<span>` must not be removed just
      // because CKEditor is not configured to handle it.
      { name: "mark", inherit: "span" },
    ],
  },
  [COREMEDIA_MOCK_CONTENT_PLUGIN]: {
    // Demonstrates, how you may add more contents on the fly.
    contents: [{ id: 2, name: "Some Example Document", type: "document" }],
  },
})
  .then((newEditor) => {
    // @ts-expect-error imported in html
    // eslint-disable-next-line
    CKEditorInspector.attach(
      {
        "main-editor": newEditor,
      },
      {
        isCollapsed: true,
      }
    );

    (newEditor.plugins.get("Differencing") as Differencing)?.activateDifferencing();

    initReadOnlyMode(newEditor);
    initExamples(newEditor);
    initInputExampleContent(newEditor);

    const undoCommand: Command | undefined = newEditor.commands.get("undo");

    if (undoCommand) {
      //@ts-expect-error Editor extension, no typing available.
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-return
      newEditor.resetUndo = () => undoCommand.clearStack();
      console.log("Registered `editor.resetUndo()` to clear undo history.");
    }

    // Do it late, so that we also have a clear signal (e.g., to integration
    // tests), that the editor is ready.
    //@ts-expect-error Unknown, but we set it.
    window.editor = newEditor;
    console.log("Exposed editor instance as `editor`.");

    setExampleData(newEditor, "Welcome");
    // Initialize Preview
    updatePreview(newEditor.getData());
  })
  .catch((error) => {
    console.error(error);
  });
