/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import Alignment from "@ckeditor/ckeditor5-alignment/src/alignment";
import AutoLink from "@ckeditor/ckeditor5-link/src/autolink";
import Autoformat from "@ckeditor/ckeditor5-autoformat/src/autoformat";
import Autosave from "@ckeditor/ckeditor5-autosave/src/autosave";
import BlockQuote from "@ckeditor/ckeditor5-block-quote/src/blockquote";
import Bold from "@ckeditor/ckeditor5-basic-styles/src/bold";
import ClassicEditor from "@ckeditor/ckeditor5-editor-classic/src/classiceditor";
import Code from "@ckeditor/ckeditor5-basic-styles/src/code";
import CodeBlock from "@ckeditor/ckeditor5-code-block/src/codeblock";
import Essentials from "@ckeditor/ckeditor5-essentials/src/essentials";
import FindAndReplace from "@ckeditor/ckeditor5-find-and-replace/src/findandreplace";
import Heading from "@ckeditor/ckeditor5-heading/src/heading";
import ImageInline from "@ckeditor/ckeditor5-image/src/imageinline";
import ImageStyle from "@ckeditor/ckeditor5-image/src/imagestyle";
import ImageTextAlternative from "@ckeditor/ckeditor5-image/src/imagetextalternative";
import ImageToolbar from "@ckeditor/ckeditor5-image/src/imagetoolbar";
import Indent from "@ckeditor/ckeditor5-indent/src/indent";
import Italic from "@ckeditor/ckeditor5-basic-styles/src/italic";
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
import { COREMEDIA_MOCK_CONTENT_PLUGIN } from "@coremedia/ckeditor5-coremedia-studio-integration-mock/content/MockContentPlugin";

import { Command, icons } from "@ckeditor/ckeditor5-core";
import { saveData } from "./dataFacade";
import MockInputExamplePlugin from "@coremedia/ckeditor5-coremedia-studio-integration-mock/content/MockInputExamplePlugin";
import PasteContentPlugin from "@coremedia/ckeditor5-coremedia-content-clipboard/paste/PasteContentPlugin";
import { RuleConfig } from "@coremedia/ckeditor5-dom-converter/Rule";
import { replaceElementByElementAndClass } from "@coremedia/ckeditor5-coremedia-richtext/rules/ReplaceElementByElementAndClass";
import { FilterRuleSetConfiguration } from "@coremedia/ckeditor5-dataprocessor-support/src/Rules";
import { replaceByElementAndClassBackAndForth } from "@coremedia/ckeditor5-coremedia-richtext/compatibility/v10/rules/ReplaceBy";
import { getHashParam } from "./HashParams";
import { COREMEDIA_LINK_CONFIG_KEY } from "@coremedia/ckeditor5-coremedia-link/contentlink/LinkBalloonConfig";

const {
  //@ts-expect-error We have no way to extend icon typing, yet.
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

const imagePlugins = [
  ContentImagePlugin,
  ImageInline,
  ImageBlockEditing,
  ImageStyle,
  ImageToolbar,
  ImageTextAlternative,
];

const sourceElement = document.querySelector("#editor") as HTMLElement;
if (!sourceElement) {
  throw new Error("No element with class editor defined in html. Nothing to create the editor in.");
}

/**
 * You may switch the compatibility, for example, by providing
 * `compatibility=v10`.
 */
const richTextCompatibility = getHashParam("compatibility") || "latest";

/**
 * Apply custom mapping rules.
 */
const richTextRuleConfigurations: RuleConfig[] = [
  // Highlight plugin support.
  replaceElementByElementAndClass({
    viewLocalName: "mark",
    dataLocalName: "span",
    // "mark" is the default here, derived from `viewLocalName`. Thus,
    // we may skip it here.
    dataReservedClass: "mark",
  }),
];

/**
 * v10 compatible configuration.
 */
const v10RichTextRuleConfigurations: FilterRuleSetConfiguration = {
  elements: {
    // Highlight Plugin Support
    mark: replaceByElementAndClassBackAndForth("mark", "span", "mark"),
  },
};

ClassicEditor.create(sourceElement, {
  licenseKey: "",
  placeholder: "Type your text here...",
  plugins: [
    ...imagePlugins,
    Alignment,
    Autoformat,
    Autosave,
    BlockQuote,
    Bold,
    Code,
    CodeBlock,
    ContentLinks,
    ContentClipboard,
    Differencing,
    Essentials,
    FindAndReplace,
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
    TableToolbar,
    Underline,
    CoreMediaFontMapper,
    MockInputExamplePlugin,
    MockStudioIntegration,
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
    //@ts-expect-error - incorrect types, types expect an array of strings here
    {
      label: "More formatting",
      icon: "threeVerticalDots",
      items: ["strikethrough", "subscript", "superscript", "code"],
    },
    "highlight",
    "removeFormat",
    "|",
    "link",
    "|",
    "alignment",
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
    "pasteContent",
    "findAndReplace",
    "|",
    "sourceEditing",
  ],
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
      "imageTextAlternative",
      "contentImageOpenInTab",
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
    textPartLanguage: [],
  },
  autosave: {
    waitingTime: 1000, // in ms
    save(currentEditor: ClassicEditor) {
      console.log("Save triggered...");
      const start = performance.now();
      return saveData(currentEditor, "autosave").then(() => {
        console.log(`Saved data within ${performance.now() - start} ms.`);
      });
    },
  },
  ["coremedia:contextualize"]: {
    contextAwareSave(currentEditor: ClassicEditor) {
      console.log("Save triggered...");
      const start = performance.now();
      return saveData(currentEditor, "autosave").then(() => {
        console.log(`Saved data within ${performance.now() - start} ms.`);
      });
    },
  },
  [COREMEDIA_RICHTEXT_CONFIG_KEY]: {
    // Defaults to: Loose
    strictness: Strictness.STRICT,
    // Latest is the default. Use v10 for first data-processor architecture,
    // for example.
    compatibility: richTextCompatibility,
    rules: richTextCompatibility === "v10" ? v10RichTextRuleConfigurations : richTextRuleConfigurations,
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
  [COREMEDIA_LINK_CONFIG_KEY]: {
    linkBalloon: {
      keepOpen: {
        ids: ["example-to-keep-the-link-balloon-open-on-click", "inputExampleContentButton"],
        classes: ["example-class-to-keep-the-link-balloon-open-on-click"],
      },
    },
  },
  [COREMEDIA_MOCK_CONTENT_PLUGIN]: {
    // Demonstrates, how you may add more contents on the fly.
    contents: [{ id: 2, name: "Some Example Document", type: "document" }],
  },
})
  .then((newEditor: ClassicEditor) => {
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
