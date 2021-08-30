import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import Editor from "@ckeditor/ckeditor5-core/src/editor/editor";
import Clipboard from "@ckeditor/ckeditor5-clipboard/src/clipboard";
import Logger from "@coremedia/coremedia-utils/logging/Logger";
import LoggerProvider from "@coremedia/coremedia-utils/logging/LoggerProvider";
import DocumentFragment from "@ckeditor/ckeditor5-engine/src/view/documentfragment";
import Node from "@ckeditor/ckeditor5-engine/src/view/node";
import Element from "@ckeditor/ckeditor5-engine/src/view/element";
import Text from "@ckeditor/ckeditor5-engine/src/view/text";
import UpcastWriter from "@ckeditor/ckeditor5-engine/src/view/upcastwriter";
import FontMapperProvider from "./fontMapper/FontMapperProvider";
import FontMapper from "./fontMapper/FontMapper";
import ClipboardEventData from "@ckeditor/ckeditor5-clipboard/src/clipboardobserver";
import FontMapperPluginConfig from "./FontMapperPluginConfig";
import EventInfo from "@ckeditor/ckeditor5-utils/src/eventinfo";

export default class SymbolOnPasteMapper extends Plugin {
  static readonly pluginName: string = "SymbolOnPasteMapper";
  static readonly #logger: Logger = LoggerProvider.getLogger(SymbolOnPasteMapper.pluginName);

  private static readonly styleNameFontFamily = "font-family";
  private static readonly supportedDataFormat: string = "text/html";
  private static readonly clipboardEventName: string = "inputTransformation";
  private static readonly pluginNameClipboard: string = "Clipboard";

  constructor(ed: Editor) {
    super(ed);
  }

  static get requires(): Array<new (editor: Editor) => Plugin> {
    return [Clipboard];
  }

  init(): Promise<void> | null {
    const logger = SymbolOnPasteMapper.#logger;

    logger.info("Initializing FontMapper Plugin");
    const editor = this.editor;
    const fontMapperPluginConfig: FontMapperPluginConfig = editor.config.get(
      "fontMapperPlugin"
    ) as FontMapperPluginConfig;
    SymbolOnPasteMapper.#applyPluginConfig(fontMapperPluginConfig);

    const clipboard: Plugin | undefined = editor.plugins.get(SymbolOnPasteMapper.pluginNameClipboard);
    if (clipboard instanceof Clipboard) {
      clipboard.on(SymbolOnPasteMapper.clipboardEventName, SymbolOnPasteMapper.handleClipboardInputTransformationEvent);
    } else {
      logger.error("Unexpected Clipboard plugin.");
    }
    return null;
  }

  static #applyPluginConfig(config: FontMapperPluginConfig): void {
    const logger = SymbolOnPasteMapper.#logger;

    if (!config) {
      logger.debug("Configuration: No additional configuration found");
      return;
    }
    logger.debug("Configuration: Additional configuration will be applied");
    const fontMapper: Array<FontMapper> = config.fontMapper;
    if (fontMapper) {
      logger.debug("Configuration: New FontMapper are configured, will replace the default ones");
      FontMapperProvider.replaceFontMapper(fontMapper);
    }
  }

  // noinspection JSUnusedLocalSymbols
  private static handleClipboardInputTransformationEvent(eventInfo: EventInfo, data: ClipboardEventData): void {
    const pastedContent: string = data.dataTransfer.getData(SymbolOnPasteMapper.supportedDataFormat);
    const eventContent: DocumentFragment = data.content;
    if (!pastedContent) {
      return;
    }

    data.content = SymbolOnPasteMapper.replaceFontFamilies(eventContent);
  }

  private static replaceFontFamilies(htmlElement: DocumentFragment | Element): DocumentFragment {
    const childrenElements: Array<Element> = Array.from<Node>(htmlElement.getChildren())
      .filter((value) => value instanceof Element)
      .map((value) => value as Element);

    for (const child of childrenElements) {
      const replacementElement: Element | null = this.evaluateReplacement(child);
      if (replacementElement) {
        const childIndex: number = htmlElement.getChildIndex(child);
        htmlElement._removeChildren(childIndex, 1);
        htmlElement._insertChild(childIndex, replacementElement);
      } else {
        this.replaceFontFamilies(child);
      }
    }
    return htmlElement;
  }

  private static evaluateReplacement(element: Element): Element | null {
    if (!element.hasStyle(SymbolOnPasteMapper.styleNameFontFamily)) {
      return null;
    }

    const fontFamilyStyle: string | undefined = element.getStyle(SymbolOnPasteMapper.styleNameFontFamily);
    const fontMapper: FontMapper | null = FontMapperProvider.getFontMapper(fontFamilyStyle);
    if (!fontMapper) {
      return null;
    }

    return this.createElementCloneWithReplacedText(fontMapper, element);
  }

  private static createElementCloneWithReplacedText(fontMapper: FontMapper, element: Element) {
    const clone: Element = new UpcastWriter(element.document).clone(element, true);
    clone._removeStyle(SymbolOnPasteMapper.styleNameFontFamily);
    this.replaceText(fontMapper, clone);
    return clone;
  }

  private static replaceText(fontMapper: FontMapper, element: Element): void {
    const textElement: Text | null = this.findTextElement(element);
    if (!textElement) {
      return;
    }
    const oldTextData: string = textElement._textData;
    textElement._textData = fontMapper.toEscapedHtml(oldTextData);
  }

  private static findTextElement(element: Element): Text | null {
    const children: Iterable<Node> = element.getChildren();
    for (const child of children) {
      if (child instanceof Text) {
        return child;
      }
      if (child instanceof Element) {
        return this.findTextElement(child);
      }
    }
    return null;
  }
}
