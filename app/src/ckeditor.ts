/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Alignment } from "@ckeditor/ckeditor5-alignment";
import { AutoLink, Link, LinkImage } from "@ckeditor/ckeditor5-link";
import { Autoformat } from "@ckeditor/ckeditor5-autoformat";
import { Autosave } from "@ckeditor/ckeditor5-autosave";
import { BlockQuote } from "@ckeditor/ckeditor5-block-quote";
import { Bold, Code, Italic, Strikethrough, Subscript, Superscript, Underline } from "@ckeditor/ckeditor5-basic-styles";
import { ClassicEditor } from "@ckeditor/ckeditor5-editor-classic";
import { CodeBlock } from "@ckeditor/ckeditor5-code-block";
import { Essentials } from "@ckeditor/ckeditor5-essentials";
import { FindAndReplace } from "@ckeditor/ckeditor5-find-and-replace";
import { Heading } from "@ckeditor/ckeditor5-heading";
// ImageInline: See ckeditor/ckeditor5#12027.
import ImageInline from "@ckeditor/ckeditor5-image/src/imageinline";
// ImageBlockEditing: See ckeditor/ckeditor5#12027.
import ImageBlockEditing from "@ckeditor/ckeditor5-image/src/image/imageblockediting";
import { ImageStyle, ImageTextAlternative, ImageToolbar } from "@ckeditor/ckeditor5-image";
import { Indent } from "@ckeditor/ckeditor5-indent";
import { DocumentList } from "@ckeditor/ckeditor5-list";
import { Paragraph } from "@ckeditor/ckeditor5-paragraph";
import { PasteFromOffice } from "@ckeditor/ckeditor5-paste-from-office";
import { RemoveFormat } from "@ckeditor/ckeditor5-remove-format";
import { SourceEditing } from "@ckeditor/ckeditor5-source-editing";
import { Table, TableToolbar } from "@ckeditor/ckeditor5-table";
import { Highlight } from "@ckeditor/ckeditor5-highlight";

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

import { Command, Editor, icons, PluginConstructor } from "@ckeditor/ckeditor5-core";
import { saveData } from "./dataFacade";
import MockInputExamplePlugin from "@coremedia/ckeditor5-coremedia-studio-integration-mock/content/MockInputExamplePlugin";
import PasteContentPlugin from "@coremedia/ckeditor5-coremedia-content-clipboard/paste/PasteContentPlugin";
import { RuleConfig } from "@coremedia/ckeditor5-dom-converter/Rule";
import { replaceElementByElementAndClass } from "@coremedia/ckeditor5-coremedia-richtext/rules/ReplaceElementByElementAndClass";
import { FilterRuleSetConfiguration } from "@coremedia/ckeditor5-dataprocessor-support/src/Rules";
import { replaceByElementAndClassBackAndForth } from "@coremedia/ckeditor5-coremedia-richtext/compatibility/v10/rules/ReplaceBy";
import { getHashParam } from "./HashParams";
import { COREMEDIA_LINK_CONFIG_KEY } from "@coremedia/ckeditor5-coremedia-link/contentlink/LinkBalloonConfig";
import { LinkAttributesConfig } from "@coremedia/ckeditor5-link-common/LinkAttributesConfig";
import { LinkAttributes } from "@coremedia/ckeditor5-link-common/LinkAttributes";

/**
 * Typings for CKEditorInspector, as it does not ship with typings yet.
 */
// See https://github.com/ckeditor/ckeditor5-inspector/issues/173
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
declare class CKEditorInspector {
  static attach(editorOrConfig: Editor | Record<string, Editor>, options?: { isCollapsed?: boolean }): string[];
}

const {
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

const imagePlugins: PluginConstructor[] = [
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

/**
 * Configuration that holds all link-related attributes, that are not
 * covered yet by any plugin.
 *
 * Similar to GHS/GRS, they are just registered as being _valid_ **and**
 * (this is important) register them to belong to a link element, which again
 * ensures that they are removed on remove-link, that cursor positioning
 * handles them correctly, etc.
 *
 * For demonstration purpose, the link attributes configuration can be disabled
 * via hash parameter `skipLinkAttributes`.
 */
const linkAttributesConfig: LinkAttributesConfig = getHashParam("skipLinkAttributes")
  ? { attributes: [] }
  : {
      attributes: [
        { view: "title", model: "linkTitle" },
        { view: "data-xlink-actuate", model: "linkActuate" },
      ],
    };

ClassicEditor.create(sourceElement, {
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
    LinkAttributes,
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
    // Note that in contrast to CKEditor 4 approach, these classes are now
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
    ...linkAttributesConfig,
    /*decorators: {
      hasTitle: {
        mode: "manual",
        label: "Title",
        attributes: {
          title:
            'Example how standard-decorators of the link-plugin works. To enable/disable, just rename the decorators section to "disabled_decorators" and back again to "decorators" to activate it and see the results.',
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
          modelElements: ["imageInline"],
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
    // Won't change the language of content.
    content: "en",
  },
  autosave: {
    waitingTime: 1000, // in ms
    save(currentEditor: Editor) {
      console.log("Save triggered...");
      const start = performance.now();
      return saveData(currentEditor, "autosave").then(() => {
        console.log(`Saved data within ${performance.now() - start} ms.`);
      });
    },
  },
  // @ts-expect-error - TODO[cke] Fix Typings
  [COREMEDIA_RICHTEXT_CONFIG_KEY]: {
    // Defaults to: Loose
    strictness: Strictness.STRICT,
    // The Latest is the default. Use v10 for first data-processor architecture,
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
    CKEditorInspector.attach(
      {
        "main-editor": newEditor,
      },
      {
        // With hash parameter #expandInspector you may expand the
        // inspector by default.
        isCollapsed: !getHashParam("expandInspector"),
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
