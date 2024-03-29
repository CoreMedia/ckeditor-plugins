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
import { List } from "@ckeditor/ckeditor5-list";
import { Paragraph } from "@ckeditor/ckeditor5-paragraph";
import { PasteFromOffice } from "@ckeditor/ckeditor5-paste-from-office";
import { RemoveFormat } from "@ckeditor/ckeditor5-remove-format";
import { SourceEditing } from "@ckeditor/ckeditor5-source-editing";
import { Table, TableToolbar } from "@ckeditor/ckeditor5-table";
import { Highlight } from "@ckeditor/ckeditor5-highlight";

import { DialogVisibility } from "@coremedia/ckeditor5-dialog-visibility";
import { LinkTarget, ContentLinks } from "@coremedia/ckeditor5-coremedia-link";
import { ContentClipboard } from "@coremedia/ckeditor5-coremedia-content-clipboard";
import { ContentImagePlugin } from "@coremedia/ckeditor5-coremedia-images";
import { FontMapper as CoreMediaFontMapper } from "@coremedia/ckeditor5-font-mapper";
import MockStudioIntegration from "@coremedia/ckeditor5-coremedia-studio-integration-mock/src/MockStudioIntegration";

import {
  CoreMediaStudioEssentials,
  COREMEDIA_RICHTEXT_CONFIG_KEY,
  COREMEDIA_RICHTEXT_SUPPORT_CONFIG_KEY,
  Strictness,
} from "@coremedia/ckeditor5-coremedia-studio-essentials";
import { initInputExampleContent } from "../inputExampleContents";
import { COREMEDIA_MOCK_CONTENT_PLUGIN } from "@coremedia/ckeditor5-coremedia-studio-integration-mock/src/content/MockContentPlugin";

import { icons, PluginConstructor } from "@ckeditor/ckeditor5-core";
import MockInputExamplePlugin from "@coremedia/ckeditor5-coremedia-studio-integration-mock/src/content/MockInputExamplePlugin";
import PasteContentPlugin from "@coremedia/ckeditor5-coremedia-content-clipboard/src/paste/PasteContentPlugin";
import { RuleConfig } from "@coremedia/ckeditor5-dom-converter/src/Rule";
import { replaceElementByElementAndClass } from "@coremedia/ckeditor5-coremedia-richtext/src/rules/ReplaceElementByElementAndClass";
import { FilterRuleSetConfiguration } from "@coremedia/ckeditor5-dataprocessor-support/src/Rules";
import { replaceByElementAndClassBackAndForth } from "@coremedia/ckeditor5-coremedia-richtext/src/compatibility/v10/rules/ReplaceBy";
import { getHashParam } from "../HashParams";
import { COREMEDIA_LINK_CONFIG_KEY } from "@coremedia/ckeditor5-coremedia-link/src/contentlink/LinkBalloonConfig";
import { LinkAttributesConfig } from "@coremedia/ckeditor5-link-common/src/LinkAttributesConfig";
import { LinkAttributes } from "@coremedia/ckeditor5-link-common/src/LinkAttributes";
import { Differencing } from "@coremedia/ckeditor5-coremedia-differencing";
import type {
  LatestCoreMediaRichTextConfig,
  V10CoreMediaRichTextConfig,
} from "@coremedia/ckeditor5-coremedia-richtext";
import { CKEditorInstanceFactory } from "../CKEditorInstanceFactory";
import { ApplicationState } from "../ApplicationState";
import { Blocklist } from "@coremedia/ckeditor5-coremedia-blocklist";
import { DataFacade } from "@coremedia/ckeditor5-data-facade";
import { updatePreview } from "../preview";

const {
  objectInline: withinTextIcon,
  objectLeft: alignLeftIcon,
  objectRight: alignRightIcon,
  objectSizeFull: pageDefaultIcon,
} = icons;

const imagePlugins: PluginConstructor[] = [
  ContentImagePlugin,
  ImageInline,
  ImageBlockEditing,
  ImageStyle,
  ImageToolbar,
  ImageTextAlternative,
];

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

const getRichTextConfig = (
  richTextCompatibility: string | true,
): Partial<LatestCoreMediaRichTextConfig> | V10CoreMediaRichTextConfig => {
  //  Use v10 for first data-processor architecture, for example.
  if (richTextCompatibility === "v10") {
    return {
      // Defaults to: Loose
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

export const createRichTextEditor: CKEditorInstanceFactory = (
  sourceElement: HTMLElement,
  state: ApplicationState,
): Promise<ClassicEditor> => {
  const { uiLanguage } = state;
  return ClassicEditor.create(sourceElement, {
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
      defaultTargets: [
        {
          // May be used to experiment with default target selection.
          filter: (url) => url.endsWith("#newTab"),
          target: "_blank",
        },
      ],
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
      ui: uiLanguage,
      // Won't change the language of content.
      content: "en",
    },
    autosave: {
      waitingTime: 1000, // in ms
    },
    dataFacade: {
      save(dataApi): Promise<void> {
        console.log("Save triggered...");
        const start = performance.now();
        updatePreview(dataApi.getData(), "xml");
        console.log(`Saved data within ${performance.now() - start} ms.`);
        return Promise.resolve();
      },
    },
    [COREMEDIA_RICHTEXT_CONFIG_KEY]: getRichTextConfig(richTextCompatibility),
    [COREMEDIA_RICHTEXT_SUPPORT_CONFIG_KEY]: {
      aliases: [
        // As we represent `<mark>` as `<span class="mark">`, we must ensure,
        // that the same attributes are kept as is from CMS. For example, the
        // dir-attribute, which is valid for `<span>` must not be removed just
        // because CKEditor is not configured to handle it.
        { name: "mark", inherit: "span" },
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
      // Demonstrates, how you may add more contents on the fly.
      contents: [{ id: 2, name: "Some Example Document", type: "document" }],
    },
  }).then((newEditor: ClassicEditor) => {
    initInputExampleContent(newEditor);
    return newEditor;
  });
};
