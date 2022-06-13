import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import Editor from "@ckeditor/ckeditor5-core/src/editor/editor";
import ClipboardPipeline from "@ckeditor/ckeditor5-clipboard/src/clipboardpipeline";
import Logger from "@coremedia/ckeditor5-logging/logging/Logger";
import LoggerProvider from "@coremedia/ckeditor5-logging/logging/LoggerProvider";
import DocumentFragment from "@ckeditor/ckeditor5-engine/src/view/documentfragment";
import Node from "@ckeditor/ckeditor5-engine/src/view/node";
import Element from "@ckeditor/ckeditor5-engine/src/view/element";
import Text from "@ckeditor/ckeditor5-engine/src/view/text";
import UpcastWriter from "@ckeditor/ckeditor5-engine/src/view/upcastwriter";
import FontMapping, { UnpackFunction } from "./fontMapping/FontMapping";
import ClipboardEventData from "@ckeditor/ckeditor5-clipboard/src/clipboardobserver";
import EventInfo from "@ckeditor/ckeditor5-utils/src/eventinfo";
import { ifPlugin } from "@coremedia/ckeditor5-common/Plugins";
import FontMappingRegistry from "./fontMapping/FontMappingRegistry";

export const CONFIG_KEY = "coremedia:fontMapper";
export type FontMapperConfigEntry = {
  font: string;
  mode?: "append" | "replace";
  map: { [key: number]: string };
  unpack?: UnpackFunction;
};

type FontMapperConfig = Array<FontMapperConfigEntry>;

/**
 *
 * This plugin maps characters of a given font-family to their alternative representation. For example
 * for the Symbol font characters might be replaced by their Unicode equivalents.
 *
 * When detecting a given font in the font-family style attribute the replacement for all characters inside
 * the element will be performed recursively &mdash; until a nested element is found which overrides the
 * font-family.
 *
 * Upon processing font-family style settings will be removed from the element, if it matches the given
 * font-family.
 *
 * *Configuration:*
 *
 * The font-name will be a full match (i. e. not partial), ignoring the case. It is also located within a
 * set of alternative font-families &mdash; and again, on match, the complete font-family setting will
 * be removed.
 *
 * The replacement map has keys denoting the character code and contains the corresponding HTML replacement
 * to use instead. Mind that the HTML replacement (typically entities) must be already encoded. The replacement
 * will be taken as is.
 *
 * In addition to this the custom replacement map might denote how to combine with the default setting by
 * specifying an attribute `mode` which defaults to add/override but might be set to
 * `"replace"` in order to specify a completely different mapping.
 *
 * Special care has been taken for the characters ampersand (&amp;), less-than (&lt;) and greater-than (&gt;):
 * Unless you explicitly override the replacement it is ensured that they are also encoded after the mapping
 * has been applied.
 */
export default class FontMapper extends Plugin {
  static readonly pluginName: string = "FontMapper";
  static readonly #logger: Logger = LoggerProvider.getLogger(FontMapper.pluginName);

  private static readonly styleNameFontFamily = "font-family";
  private static readonly supportedDataFormat: string = "text/html";
  private static readonly clipboardEventName: string = "inputTransformation";

  static get requires(): Array<new (editor: Editor) => Plugin> {
    return [ClipboardPipeline];
  }

  async init(): Promise<void> {
    const logger = FontMapper.#logger;
    const pluginName = FontMapper.pluginName;
    const startTimestamp = performance.now();

    logger.debug(`Initializing ${pluginName}...`);

    const editor = this.editor;
    const customFontMapperConfig: FontMapperConfig | undefined = editor.config.get(CONFIG_KEY) as FontMapperConfig;
    FontMapper.#applyPluginConfig(customFontMapperConfig);

    // We need to handle the input event AFTER it has been processed by the pasteFromOffice plugin (uses "high" priority), if enabled.
    // We also need to use a priority higher then "low" in order to process the input in time.
    await ifPlugin(editor, ClipboardPipeline).then((p: Plugin) =>
      this.listenTo(p, FontMapper.clipboardEventName, FontMapper.#handleClipboardInputTransformationEvent, {
        priority: "normal",
      })
    );

    logger.debug(`Initialized ${pluginName} within ${performance.now() - startTimestamp} ms.`);
  }

  /**
   * Registers all FontMappings from this plugin's configuration in the {@link FontMappingRegistry}.
   *
   * @param config - the configuration for this plugin
   */
  static #applyPluginConfig(config: FontMapperConfig | undefined): void {
    const logger = FontMapper.#logger;

    if (!config) {
      logger.debug("Configuration: No additional configuration found");
      return;
    }

    config.forEach((configEntry: FontMapperConfigEntry) => {
      logger.debug(`Configuration: Register Mapping for ${configEntry.font}`);
      FontMappingRegistry.registerFontMapping(configEntry);
    });
  }

  // noinspection JSUnusedLocalSymbols
  static #handleClipboardInputTransformationEvent(eventInfo: EventInfo, data: ClipboardEventData): void {
    const pastedContent: string = data.dataTransfer.getData(FontMapper.supportedDataFormat);
    const eventContent: DocumentFragment = data.content;
    if (!pastedContent) {
      return;
    }

    data.content = FontMapper.#replaceFontFamilies(eventContent);
  }

  static #replaceFontFamilies(htmlElement: DocumentFragment | Element): DocumentFragment {
    const childrenElements: Array<Element> = Array.from<Node>(htmlElement.getChildren())
      .filter((value) => value instanceof Element)
      .map((value) => value as Element);

    for (const child of childrenElements) {
      const replacementElement: Element | null = this.#evaluateReplacement(child);
      if (replacementElement) {
        const childIndex: number = htmlElement.getChildIndex(child);
        htmlElement._removeChildren(childIndex, 1);
        htmlElement._insertChild(childIndex, replacementElement);
      } else {
        this.#replaceFontFamilies(child);
      }
    }
    return htmlElement;
  }

  static #evaluateReplacement(element: Element): Element | null {
    if (!element.hasStyle(FontMapper.styleNameFontFamily)) {
      return null;
    }

    const fontFamily: string | undefined = element.getStyle(FontMapper.styleNameFontFamily);
    if (!fontFamily) {
      return null;
    }

    const fontMapper = FontMappingRegistry.getFontMapping(fontFamily);
    if (!fontMapper) {
      return null;
    }

    return this.#createElementCloneWithReplacedText(fontMapper, element);
  }

  static #createElementCloneWithReplacedText(fontMapper: FontMapping, element: Element) {
    const clone: Element = new UpcastWriter(element.document).clone(element, true);
    clone._removeStyle(FontMapper.styleNameFontFamily);
    this.#replaceText(fontMapper, clone);
    return clone;
  }

  static #replaceText(fontMapper: FontMapping, element: Element): void {
    const textElement: Text | null = this.#findTextElement(element);
    if (!textElement) {
      return;
    }
    const oldTextData: string = textElement._textData;
    textElement._textData = fontMapper.toEscapedHtml(oldTextData);
  }

  static #findTextElement(element: Element): Text | null {
    const children: Iterable<Node> = element.getChildren();
    const childrenArray: Array<Node> = Array.from(children);
    for (const child of childrenArray) {
      if (child instanceof Text) {
        return child;
      }
      if (child instanceof Element) {
        return this.#findTextElement(child);
      }
    }
    return null;
  }
}
