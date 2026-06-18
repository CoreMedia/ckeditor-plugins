import { DialogVisibility } from "@coremedia/ckeditor5-dialog-visibility";
import {
  ContentLinks,
  COREMEDIA_CONTEXT_KEY,
  COREMEDIA_LINK_CONFIG_KEY,
  LinkTarget,
} from "@coremedia/ckeditor5-coremedia-link";
import { ContentClipboard, PasteContentPlugin } from "@coremedia/ckeditor5-coremedia-content-clipboard";
import { ContentImagePlugin } from "@coremedia/ckeditor5-coremedia-images";
import { FontMapper as CoreMediaFontMapper } from "@coremedia/ckeditor5-font-mapper";
import {
  COREMEDIA_MOCK_CONTENT_PLUGIN,
  MockInputExamplePlugin,
  MockStudioIntegration,
} from "@coremedia-internal/ckeditor5-coremedia-studio-integration-mock";
import {
  COREMEDIA_RICHTEXT_CONFIG_KEY,
  COREMEDIA_RICHTEXT_SUPPORT_CONFIG_KEY,
  CoreMediaStudioEssentials,
  Strictness,
} from "@coremedia/ckeditor5-coremedia-studio-essentials";
import type { PluginConstructor } from "ckeditor5";
import {
  Alignment,
  Autoformat,
  AutoLink,
  Autosave,
  BlockQuote,
  Bold,
  ClassicEditor,
  Code,
  CodeBlock,
  Essentials,
  FindAndReplace,
  Heading,
  Highlight,
  IconObjectInline,
  IconObjectLeft,
  IconObjectRight,
  IconObjectSizeFull,
  ImageBlockEditing,
  ImageInline,
  ImageStyle,
  ImageTextAlternative,
  ImageToolbar,
  Indent,
  Italic,
  Link,
  LinkImage,
  List,
  Paragraph,
  PasteFromOffice,
  RemoveFormat,
  SourceEditing,
  Strikethrough,
  Subscript,
  Superscript,
  Table,
  TableToolbar,
  Underline,
} from "ckeditor5";
import type { RuleConfig } from "@coremedia/ckeditor5-dom-converter";
import type {
  LatestCoreMediaRichTextConfig,
  V10CoreMediaRichTextConfig,
} from "@coremedia/ckeditor5-coremedia-richtext";
import {
  replaceByElementAndClassBackAndForth,
  replaceElementByElementAndClass,
  stripFixedAttributes,
} from "@coremedia/ckeditor5-coremedia-richtext";
import "ckeditor5/ckeditor5.css";
import type { FilterRuleSetConfiguration } from "@coremedia/ckeditor5-dataprocessor-support";
import type { LinkAttributesConfig } from "@coremedia/ckeditor5-link-common";
import { LinkAttributes } from "@coremedia/ckeditor5-link-common";
import { Differencing } from "@coremedia/ckeditor5-coremedia-differencing";
import { Blocklist } from "@coremedia/ckeditor5-coremedia-blocklist";
import { DataFacade } from "@coremedia/ckeditor5-data-facade";
import type { ScenarioArgs } from "../runtime/scenario";
import { licenseKey, licenseKeyErrorMessage } from "./license";

const withinTextIcon = IconObjectInline;
const alignLeftIcon = IconObjectLeft;
const alignRightIcon = IconObjectRight;
const pageDefaultIcon = IconObjectSizeFull;

const imagePlugins: PluginConstructor[] = [
  ContentImagePlugin,
  ImageInline,
  ImageBlockEditing,
  ImageStyle,
  ImageToolbar,
  ImageTextAlternative,
];

/**
 * Apply custom mapping rules.
 */
const richTextRuleConfigurations: RuleConfig[] = [
  // Highlight plugin support.
  replaceElementByElementAndClass({
    viewLocalName: "mark",
    dataLocalName: "span",
    dataReservedClass: "mark",
  }),
  stripFixedAttributes(),
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

const linkAttributesConfig: LinkAttributesConfig = {
  attributes: [
    {
      view: "title",
      model: "linkTitle",
    },
    {
      view: "data-xlink-actuate",
      model: "linkActuate",
    },
  ],
};

const getRichTextConfig = (
  richTextCompatibility: string | true,
): Partial<LatestCoreMediaRichTextConfig> | V10CoreMediaRichTextConfig => {
  //  Use v10 for first data-processor architecture, for example.
  if (richTextCompatibility === "v10") {
    return {
      strictness: Strictness.STRICT,
      compatibility: "v10",
      rules: v10RichTextRuleConfigurations,
    };
  }
  return {
    strictness: Strictness.STRICT,
    compatibility: "latest",
    rules: richTextRuleConfigurations,
  };
};

/**
 * Creates the CoreMedia RichText editor used by the migrated Playwright
 * scenarios. Ported from `app/src/editors/richtext.ts`, with the application's
 * preview/inspector/hash-parameter wiring removed; scenario configuration is
 * provided through {@link ScenarioArgs} instead.
 *
 * @param sourceElement - host element the editor is mounted into
 * @param args - resolved scenario args
 */
export const createRichTextEditor = async (sourceElement: HTMLElement, args: ScenarioArgs): Promise<ClassicEditor> => {
  const { uiLanguage } = args;
  const contextUriPath = `content/123`;

  try {
    const editor = await ClassicEditor.create(sourceElement, {
      licenseKey,
      placeholder: "Type your text here...",
      plugins: [
        ...imagePlugins,
        Alignment,
        Autoformat,
        Autosave,
        Blocklist,
        BlockQuote,
        DialogVisibility,
        Bold,
        Code,
        CodeBlock,
        ContentLinks,
        ContentClipboard,
        DataFacade,
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
        List,
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
        "blocklist",
        "|",
        "sourceEditing",
      ],
      alignment: {
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
          {
            model: "paragraph",
            title: "Paragraph",
            class: "ck-heading_paragraph",
          },
          {
            model: "heading1",
            view: "h1",
            title: "Heading 1",
            class: "ck-heading_heading1",
          },
          {
            model: "heading2",
            view: "h2",
            title: "Heading 2",
            class: "ck-heading_heading2",
          },
          {
            model: "heading3",
            view: "h3",
            title: "Heading 3",
            class: "ck-heading_heading3",
          },
          {
            model: "heading4",
            view: "h4",
            title: "Heading 4",
            class: "ck-heading_heading4",
          },
          {
            model: "heading5",
            view: "h5",
            title: "Heading 5",
            class: "ck-heading_heading5",
          },
          {
            model: "heading6",
            view: "h6",
            title: "Heading 6",
            class: "ck-heading_heading6",
          },
        ],
      },
      link: {
        toolbar: ["linkPreview", "editLink", "|", "_self", "_blank", "_embed", "_other", "|", "unlink"],
        defaultProtocol: "https://",
        defaultTargets: [
          {
            filter: (url: string) => url.endsWith("#newTab"),
            target: "_blank",
          },
        ],
        ...linkAttributesConfig,
      },
      image: {
        styles: {
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
        ui: uiLanguage,
        content: "en",
      },
      autosave: {
        waitingTime: 1000,
      },
      dataFacade: {
        save(): Promise<void> {
          return Promise.resolve();
        },
      },
      [COREMEDIA_CONTEXT_KEY]: { uriPath: contextUriPath },
      [COREMEDIA_RICHTEXT_CONFIG_KEY]: getRichTextConfig("latest"),
      [COREMEDIA_RICHTEXT_SUPPORT_CONFIG_KEY]: {
        aliases: [
          {
            name: "mark",
            inherit: "span",
          },
        ],
      },
      // @ts-expect-error - TODO: Typing issues as it seems.
      [COREMEDIA_LINK_CONFIG_KEY]: {
        linkBalloon: {
          keepOpen: {
            ids: ["example-to-keep-the-link-balloon-open-on-click", "inputExampleContentButton"],
            classes: ["example-class-to-keep-the-link-balloon-open-on-click"],
          },
        },
      },
      [COREMEDIA_MOCK_CONTENT_PLUGIN]: {
        contents: [
          {
            id: 2,
            name: "Some Example Document",
            type: "document",
          },
        ],
      },
    });

    // Different to in-production use, where differencing is only active in
    // read-only view, the test scenarios use differencing in R/W view (as the
    // former example application did). Activate it so augmented server-side
    // diff data passes to the editing view.
    if (editor.plugins.has(Differencing)) {
      editor.plugins.get(Differencing).activateDifferencing();
    }

    return editor;
  } catch (e) {
    console.error("Caught error when creating Editor.", e);
    throw Error(licenseKeyErrorMessage);
  }
};
