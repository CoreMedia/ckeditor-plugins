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
import { saveData } from "./dataFacade";
import MockInputExamplePlugin from "@coremedia/ckeditor5-coremedia-studio-integration-mock/content/MockInputExamplePlugin";
import PasteContentPlugin from "@coremedia/ckeditor5-coremedia-content-clipboard/paste/PasteContentPlugin";
//@ts-expect-error Typings unavailable.
import Style from "@ckeditor/ckeditor5-style/src/style";
import { FontBackgroundColor, FontColor, FontFamily, FontSize } from "@ckeditor/ckeditor5-font";
import { TextPartLanguage } from "@ckeditor/ckeditor5-language";
import { TableCellProperties, TableProperties } from "@ckeditor/ckeditor5-table";
import { FontSizeOption } from "@ckeditor/ckeditor5-font/src/fontsize";
import { FontFamilyOption } from "@ckeditor/ckeditor5-font/src/fontfamily";

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

const customColors = [
  {
    color: "aqua",
    label: "Aqua",
  },
  {
    color: "black",
    label: "Black",
  },
  {
    color: "blue",
    label: "Blue",
  },
  {
    color: "fuchsia",
    label: "Fuchsia",
  },
  {
    color: "gray",
    label: "Gray",
  },
  {
    color: "green",
    label: "Green",
  },
  {
    color: "lime",
    label: "Lime",
  },
  {
    color: "maroon",
    label: "Maroon",
  },
  {
    color: "navy",
    label: "Navy",
  },
  {
    color: "olive",
    label: "Olive",
  },
  {
    color: "purple",
    label: "Purple",
  },
  {
    color: "red",
    label: "Red",
  },
  {
    color: "silver",
    label: "Silver",
  },
  {
    color: "teal",
    label: "Teal",
  },
  {
    color: "white",
    label: "White",
  },
  {
    color: "yellow",
    label: "Yellow",
  },
];

const fontSizeOption = (config: Pick<FontSizeOption, "title" | "model"> & { class: string }): FontSizeOption => ({
  ...config,
  // @ts-expect-error - https://github.com/DefinitelyTyped/DefinitelyTyped/issues/63059
  upcastAlso: undefined,
  view: {
    name: "span",
    classes: config.class,
    // See https://github.com/ckeditor/ckeditor5/issues/2295
    // Required for styling the menu. Removed for data-processing, thus, only
    // used in editing view (duplicate information) and in menu.
    styles: {
      "font-size": config.model,
    },
  },
});

const fontSizeOptions = (config: (number | "default")[]): (FontSizeOption | "default")[] =>
  config.map((value) => {
    if (value === "default") {
      return "default";
    }
    return fontSizeOption({
      title: `${value} Pt.`,
      // model value to be re-used for menu styling.
      model: `${value}pt`,
      class: `font-size--${value}`,
    });
  });

const fontFamilyOption = (config: Pick<FontFamilyOption, "title" | "model"> & { class: string }): FontFamilyOption => ({
  ...config,
  // @ts-expect-error - Similar to https://github.com/DefinitelyTyped/DefinitelyTyped/issues/63059
  upcastAlso: undefined,
  view: {
    name: "span",
    classes: config.class,
    // See https://github.com/ckeditor/ckeditor5/issues/2295
    // Required for styling the menu. Removed for data-processing, thus, only
    // used in editing view (duplicate information) and in menu.
    styles: {
      "font-family": config.model,
    },
  },
});

const NonAlphaNumericOrUnderscore = /[\W_]+/g;

const fontNameToCssClass = (name: string): string => {
  const lcName = name.toLowerCase();
  const fontNamePostfix = lcName.replaceAll(NonAlphaNumericOrUnderscore, "-");
  return `font-name--${fontNamePostfix}`;
};

const fontFamilyOptions = (config: (string | "default")[]): (FontFamilyOption | "default")[] =>
  config.map((value) => {
    if (value === "default") {
      return "default";
    }
    return fontFamilyOption({
      title: value,
      // model value to be re-used for menu styling.
      model: value,
      class: fontNameToCssClass(value),
    });
  });

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
    ContentClipboard,
    Differencing,
    Essentials,
    FontBackgroundColor,
    FontColor,
    FontFamily,
    FontSize,
    Heading,
    Highlight,
    Indent,
    Italic,
    AutoLink,
    Link,
    LinkImage,
    LinkTarget,
    CoreMediaStudioEssentials,
    DocumentList,
    Paragraph,
    PasteContentPlugin,
    PasteFromOffice,
    RemoveFormat,
    Strikethrough,
    SourceEditing,
    Subscript,
    Superscript,
    Table,
    TableCellProperties,
    TableProperties,
    TableToolbar,
    TextPartLanguage,
    Underline,
    CoreMediaFontMapper,
    MockInputExamplePlugin,
    MockStudioIntegration,
    Style,
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
      "fontFamily",
      "fontColor",
      "fontBackgroundColor",
      "fontSize",
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

  fontFamily: {
    options: [
      "Consolas",
      ...fontFamilyOptions([
        "default",
        "Arial",
        "Arial Black",
        "Arial Narrow",
        "Century",
        "Courier",
        "Lucida Console",
        "Lucida Sans Unicode",
        "Times New Roman",
        "Verdana",
      ]),
    ],
  },

  fontSize: {
    options: fontSizeOptions(["default", 8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 26, 28, 36, 48, 72]),
  },

  fontColor: {
    colors: customColors,
  },

  fontBackgroundColor: {
    colors: customColors,
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
      {
        model: "paragraph-lime",
        view: {
          name: "p",
          classes: "background-color--lime",
        },
        title: "Paragraph (Lime)",
        class: "ck-heading_paragraph background-color--lime",
      },
      { model: "heading1", view: "h1", title: "Heading 1", class: "ck-heading_heading1" },
      { model: "heading2", view: "h2", title: "Heading 2", class: "ck-heading_heading2" },
      {
        model: "heading2-maroon",
        view: {
          name: "h2",
          classes: "background-color--maroon",
        },
        title: "Heading 2 (Maroon)",
        class: "ck-heading_heading2 background-color--maroon",
      },
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
        name: `<td> Purple`,
        element: "td",
        classes: ["background-color--purple"],
      },
      {
        name: `<td> Teal`,
        element: "td",
        classes: ["background-color--teal"],
      },
      {
        name: `<td> Yellow`,
        element: "td",
        classes: ["background-color--yellow"],
      },
      {
        name: `<th> Purple`,
        element: "th",
        classes: ["background-color--purple"],
      },
      {
        name: `<th> Teal`,
        element: "th",
        classes: ["background-color--teal"],
      },
      {
        name: `<th> Yellow`,
        element: "th",
        classes: ["background-color--yellow"],
      },
      {
        name: `<table> Purple`,
        element: "table",
        classes: ["background-color--purple"],
      },
      {
        name: `<table> Teal`,
        element: "table",
        classes: ["background-color--teal"],
      },
      {
        name: `<table> Yellow`,
        element: "table",
        classes: ["background-color--yellow"],
      },
      {
        name: `<ol> Arial Black`,
        element: "ol",
        classes: ["font-name--arial-black"],
      },
      {
        name: `<ol> Lucida Console`,
        element: "ol",
        classes: ["font-name--lucida-console"],
      },
      {
        name: `<ul> Arial Black`,
        element: "ul",
        classes: ["font-name--arial-black"],
      },
      {
        name: `<ul> Lucida Console`,
        element: "ul",
        classes: ["font-name--lucida-console"],
      },
      {
        name: `<li> Arial Black`,
        element: "li",
        classes: ["font-name--arial-black"],
      },
      {
        name: `<li> Lucida Console`,
        element: "li",
        classes: ["font-name--lucida-console"],
      },
      {
        name: `<p> Arial Black`,
        element: "p",
        classes: ["font-name--arial-black"],
      },
      {
        name: `<p> Lucida Console`,
        element: "p",
        classes: ["font-name--lucida-console"],
      },
      {
        name: `Heading 2 (Maroon)`,
        element: "h2",
        classes: ["background-color--maroon"],
      },
      {
        name: `Fuchsia <blockquote>`,
        element: "blockquote",
        classes: ["background-color--fuchsia"],
      },
      {
        name: "Aqua Bg.",
        element: "span",
        classes: ["background-color--aqua"],
      },
      {
        name: "Black Bg.",
        element: "span",
        classes: ["background-color--black"],
      },
      {
        name: "Blue Bg.",
        element: "span",
        classes: ["background-color--blue"],
      },
      {
        name: "Fuchsia Bg.",
        element: "span",
        classes: ["background-color--fuchsia"],
      },
      {
        name: "Gray Bg.",
        element: "span",
        classes: ["background-color--gray"],
      },
      {
        name: "Green Bg.",
        element: "span",
        classes: ["background-color--green"],
      },
      {
        name: "Lime Bg.",
        element: "span",
        classes: ["background-color--lime"],
      },
      {
        name: "Maroon Bg.",
        element: "span",
        classes: ["background-color--maroon"],
      },
      {
        name: "Navy Bg.",
        element: "span",
        classes: ["background-color--navy"],
      },
      {
        name: "Olive Bg.",
        element: "span",
        classes: ["background-color--olive"],
      },
      {
        name: "Purple Bg.",
        element: "span",
        classes: ["background-color--purple"],
      },
      {
        name: "Red Bg.",
        element: "span",
        classes: ["background-color--red"],
      },
      {
        name: "Silver Bg.",
        element: "span",
        classes: ["background-color--silver"],
      },
      {
        name: "Teal Bg.",
        element: "span",
        classes: ["background-color--teal"],
      },
      {
        name: "White Bg.",
        element: "span",
        classes: ["background-color--white"],
      },
      {
        name: "Yellow Bg.",
        element: "span",
        classes: ["background-color--yellow"],
      },
      {
        name: "Aqua Fg.",
        element: "span",
        classes: ["color--aqua"],
      },
      {
        name: "Black Fg.",
        element: "span",
        classes: ["color--black"],
      },
      {
        name: "Blue Fg.",
        element: "span",
        classes: ["color--blue"],
      },
      {
        name: "Fuchsia Fg.",
        element: "span",
        classes: ["color--fuchsia"],
      },
      {
        name: "Gray Fg.",
        element: "span",
        classes: ["color--gray"],
      },
      {
        name: "Green Fg.",
        element: "span",
        classes: ["color--green"],
      },
      {
        name: "Lime Fg.",
        element: "span",
        classes: ["color--lime"],
      },
      {
        name: "Maroon Fg.",
        element: "span",
        classes: ["color--maroon"],
      },
      {
        name: "Navy Fg.",
        element: "span",
        classes: ["color--navy"],
      },
      {
        name: "Olive Fg.",
        element: "span",
        classes: ["color--olive"],
      },
      {
        name: "Purple Fg.",
        element: "span",
        classes: ["color--purple"],
      },
      {
        name: "Red Fg.",
        element: "span",
        classes: ["color--red"],
      },
      {
        name: "Silver Fg.",
        element: "span",
        classes: ["color--silver"],
      },
      {
        name: "Teal Fg.",
        element: "span",
        classes: ["color--teal"],
      },
      {
        name: "White Fg.",
        element: "span",
        classes: ["color--white"],
      },
      {
        name: "Yellow Fg.",
        element: "span",
        classes: ["color--yellow"],
      },

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
    contentToolbar: [
      "tableColumn",
      "tableRow",
      "mergeTableCells",
      "|",
      "tableProperties",
      "tableCellProperties",
      "|",
      "style",
      "link",
    ],
    tableProperties: {
      borderColors: customColors,
      backgroundColors: customColors,
    },
    tableCellProperties: {
      borderColors: customColors,
      backgroundColors: customColors,
    },
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
