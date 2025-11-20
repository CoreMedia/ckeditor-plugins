// ImageInline: See ckeditor/ckeditor5#12027.

// ImageBlockEditing: See ckeditor/ckeditor5#12027.

import { Blocklist } from "@coremedia/ckeditor5-coremedia-blocklist";
import { ContentClipboard, PasteContentPlugin } from "@coremedia/ckeditor5-coremedia-content-clipboard";
import { Differencing } from "@coremedia/ckeditor5-coremedia-differencing";
import { ContentImagePlugin } from "@coremedia/ckeditor5-coremedia-images";
import {
  ContentLinks,
  COREMEDIA_CONTEXT_KEY,
  COREMEDIA_LINK_CONFIG_KEY,
  LinkTarget,
} from "@coremedia/ckeditor5-coremedia-link";
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
import {
  COREMEDIA_RICHTEXT_CONFIG_KEY,
  COREMEDIA_RICHTEXT_SUPPORT_CONFIG_KEY,
  CoreMediaStudioEssentials,
  Strictness,
} from "@coremedia/ckeditor5-coremedia-studio-essentials";
import {
  COREMEDIA_MOCK_CONTENT_PLUGIN,
  MockInputExamplePlugin,
  MockStudioIntegration,
} from "@coremedia/ckeditor5-coremedia-studio-integration-mock";
import { DataFacade } from "@coremedia/ckeditor5-data-facade";
import type { FilterRuleSetConfiguration } from "@coremedia/ckeditor5-dataprocessor-support";
import { DialogVisibility } from "@coremedia/ckeditor5-dialog-visibility";
import type { RuleConfig } from "@coremedia/ckeditor5-dom-converter";
import { FontMapper as CoreMediaFontMapper } from "@coremedia/ckeditor5-font-mapper";
import type { LinkAttributesConfig } from "@coremedia/ckeditor5-link-common";
import { LinkAttributes } from "@coremedia/ckeditor5-link-common";
import type { PluginConstructor, TextPartLanguageOption } from "ckeditor5";
import {
  TextPartLanguage,
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
import { TextDirection } from "@coremedia/ckeditor5-text-direction";
import type { ApplicationState } from "../ApplicationState";
import type { CKEditorInstanceFactory } from "../CKEditorInstanceFactory";
import { getHashParam } from "../HashParams";
import { initInputExampleContent } from "../inputExampleContents";
import { updatePreview } from "../preview";

export const licenseKeyErrorMessage =
  "Please provide a valid license key for your CKEditor5 instance. Please create a .env file in the workspace root and make your license as CKEDITOR_LICENSE_KEY variable. Please use 'GPL' if you want to use the GNU General Public License.";

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
  ? {
      attributes: [],
    }
  : {
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
      // Defaults to: Loose
      strictness: Strictness.STRICT,
      compatibility: "v10",
      rules: v10RichTextRuleConfigurations,
    };
  }
  return {
    strictness: Strictness.STRICT,
    compatibility: "latest",
    rules: [...richTextRuleConfigurations],
  };
};
const textPartLanguage: TextPartLanguageOption[] = [
  { title: "Arabic", languageCode: "ar" },
  { title: "English", languageCode: "en" },
  { title: "Español", languageCode: "es" },
  { title: "Français", languageCode: "fr" },
];
export const createRichTextEditor: CKEditorInstanceFactory = async (
  sourceElement: HTMLElement,
  state: ApplicationState,
): Promise<ClassicEditor> => {
  const { uiLanguage } = state;
  const contextUriPath = `content/123`;
  // @ts-expect-error - CKEDITOR_LICENSE_KEY is replaced during build.
  const licenseKey = CKEDITOR_LICENSE_KEY as string | undefined;

  try {
    return ClassicEditor.create(sourceElement, {
      licenseKey,
      placeholder: "Type your text here...",
      language: {
        // Language switch only applies to editor instance.
        ui: uiLanguage,
        // Won't change the language of content.
        content: "en",
        textPartLanguage,
      },
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
        TextDirection,
        TextPartLanguage,
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
        "textPartLanguage",
        "textDirection",
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
            // May be used to experiment with default target selection.
            filter: (url: string) => url.endsWith("#newTab"),
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
      [COREMEDIA_CONTEXT_KEY]: { uriPath: contextUriPath },
      [COREMEDIA_RICHTEXT_CONFIG_KEY]: getRichTextConfig(richTextCompatibility),
      [COREMEDIA_RICHTEXT_SUPPORT_CONFIG_KEY]: {
        aliases: [
          // As we represent `<mark>` as `<span class="mark">`, we must ensure,
          // that the same attributes are kept as is from CMS. For example, the
          // dir-attribute, which is valid for `<span>` must not be removed just
          // because CKEditor is not configured to handle it.
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
        // Demonstrates, how you may add more contents on the fly.
        contents: [
          {
            id: 2,
            name: "Some Example Document",
            type: "document",
          },
        ],
      },
    }).then((newEditor: ClassicEditor) => {
      initInputExampleContent(newEditor);
      return newEditor;
    });
  } catch (e) {
    console.error("Catched error when creating Editor.", e);
    throw Error(licenseKeyErrorMessage);
  }
};
