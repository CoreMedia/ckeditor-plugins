import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import Editor from "@ckeditor/ckeditor5-core/src/editor/editor";
import Clipboard from "@ckeditor/ckeditor5-clipboard/src/clipboard";
import LoggerProvider from "@coremedia/coremedia-utils/dist/logging/LoggerProvider";
import Logger from "@coremedia/coremedia-utils/dist/logging/Logger";
import DocumentFragment from "@ckeditor/ckeditor5-engine/src/view/documentfragment"
import Node from "@ckeditor/ckeditor5-engine/src/view/node"
import Element from "@ckeditor/ckeditor5-engine/src/view/element"
import Text from "@ckeditor/ckeditor5-engine/src/view/text"
import UpcastWriter from "@ckeditor/ckeditor5-engine/src/view/upcastwriter";
import FontMapperProvider from "./fontMapper/FontMapperProvider";
import FontMapper from "./fontMapper/FontMapper";

export default class SymbolOnPasteMapper extends Plugin {
  static readonly pluginName: string =  "SymbolOnPasteMapper";
  // TODO[cke] Copied from PasteFromOffice... should be some set of constants
  //   which tell, if there is any font to consider for replacement.
  static readonly msWordMatch: RegExp = /<meta\s*name="?generator"?\s*content="?microsoft\s*word\s*\d+"?\/?>/i;
  // TODO[cke] Would be great adding context information (editor/sourceElement-id or similar)
  //    to get the actual editor we write log entries for.
  private readonly logger:Logger = LoggerProvider.getLogger(SymbolOnPasteMapper.pluginName);

  private readonly CLIPBOARD_EVENT_NAME: string = "inputTransformation";

  constructor(ed: Editor) {
    super(ed);
  }

  static get requires() {
    return [
      Clipboard
    ];
  }

  init(): Promise<void> | null {
    const editor = this.editor;
    this.logger.info("SymbolOnPastePlugin initialized");
    let clipboard = editor.plugins.get('Clipboard');
    if (clipboard instanceof Clipboard) {
      clipboard.on(this.CLIPBOARD_EVENT_NAME, SymbolOnPasteMapper.handleClipboardInputTransformationEvent);
    } else {
      this.logger.error("Unexpected Clipboard plugin.");
    }
    return null;
  }

  private static handleClipboardInputTransformationEvent(eventInfo: any, data: any): void {
    let pastedContent: string = data.dataTransfer.getData("text/html");
    let eventContent: DocumentFragment = data.content;
    if (!pastedContent) {
      return;
    }

    data.content = SymbolOnPasteMapper.replaceFontFamilies(eventContent);
  }

  private static replaceFontFamilies(htmlElement: DocumentFragment | Element): DocumentFragment {
    let childrenElements: Array<Element> = Array.from<Node>(htmlElement.getChildren())
      .filter(value => value instanceof Element)
      .map(value => value as Element);

    for (const child of childrenElements) {
      let replacementElement: Element | null = this.evaluateReplacement(child);
      if (replacementElement) {
        let childIndex: number = htmlElement.getChildIndex(child);
        htmlElement._removeChildren(childIndex, 1);
        htmlElement._insertChild(childIndex, replacementElement);
      } else {
        this.replaceFontFamilies(child);
      }
    }
    return htmlElement;
  }

  private static evaluateReplacement(element: Element): Element | null {
    if (!element.hasStyle("font-family")) {
      return null;
    }

    let fontFamilyStyle: string = element.getStyle("font-family");
    let fontMapper: FontMapper | null = FontMapperProvider.getFontMapper(fontFamilyStyle);
    if (!fontMapper) {
      return null;
    }

    return this.createElementCloneWithReplacedText(fontMapper, element);
  }

  private static createElementCloneWithReplacedText(fontMapper: FontMapper, element: Element) {
    let clone: Element = new UpcastWriter(element.document).clone(element, true);
    clone._removeStyle("font-family");
    this.replaceText(fontMapper, clone);
    return clone;
  }

  private static replaceText(fontMapper: FontMapper, element: Element): void {
    let textElement: Text | null = this.findTextElement(element);
    if (!textElement) {
      return;
    }
    let oldTextData: string = textElement._textData;
    textElement._textData = fontMapper.toEscapedHtml(oldTextData);
  }

  private static findTextElement(element: Element): Text |  null {
    let children: Iterable<Node> = element.getChildren();
    for (const child of children) {
      if (child instanceof Text) {
        return child as Text;
      }
      if (child instanceof Element) {
        return this.findTextElement(child);
      }
    }
    return null;
  }

}
