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
import SymbFontMapper from './fontMapper/SymbFontMapper';
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
      clipboard.on(
        'inputTransformation',
        (eventInfo: any, data: any) => {
          let pastedContent: string = data.dataTransfer.getData("text/html");
          let content: DocumentFragment = data.content;
          if (!pastedContent) {
            return;
          }

          data.content = SymbolOnPasteMapper.processInputTransformationEvent(content);
        },
        {
          // Must be less than priority in PasteFromOffice.
          priority: 'normal'
        }
      )
    } else {
      this.logger.error("Unexpected Clipboard plugin.");
    }
    return null;
  }

  private static processInputTransformationEvent(content: DocumentFragment): DocumentFragment {
    let upcastWriter: UpcastWriter = new UpcastWriter(content.document);

    let children:Iterable<Node> = content.getChildren();
    for (const child of children) {
      if (child instanceof Element) {
        if (child.hasStyle("font-family")) {
          let fontMapper: FontMapper | null = FontMapperProvider.getFontMapper(child.getStyle("font-family"));
          if (fontMapper) {
            let element: Element = upcastWriter.clone(child, true);
            let childIndex: number = content.getChildIndex(child);
            element._removeStyle("font-family");
            this.replaceText(fontMapper, element);
            content._removeChildren(childIndex, 1);
            content._insertChild(childIndex, element);
          }
        } else {
          this.treatElementChildren(upcastWriter, child as Element);
        }
      }
    }
    return content;
  }

  private static treatElementChildren(upcastWriter: UpcastWriter, element: Element): void {
    let children: Iterable<Node> = element.getChildren();
    for (const child of children) {
      if (!(child instanceof Element)) {
        continue;
      }

      if (child.hasStyle("font-family")) {
        let fontMapper: FontMapper | null = FontMapperProvider.getFontMapper(child.getStyle("font-family"));
        if (fontMapper) {
          let childIndex = element.getChildIndex(child);
          let clone: Element = upcastWriter.clone(child, true);
          clone._removeStyle("font-family");
          this.replaceText(fontMapper, clone);
          element._removeChildren(childIndex, 1);
          element._insertChild(childIndex, clone);
        }
      } else {
        this.treatElementChildren(upcastWriter, child);
      }
    }
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

  private static hasFontFamily(element: Element): boolean {
    let hasStyleFontFamily: boolean = element.hasStyle("font-family");
    return hasStyleFontFamily;

  }

// ainit() {
  //   const editor = this.editor;
  //   const viewDocument = editor.editing.view.document;
  //   const normalizers = [];
  //
  //   normalizers.push( new MSWordNormalizer( viewDocument ) );
  //   normalizers.push( new GoogleDocsNormalizer( viewDocument ) );
  //
  //   editor.plugins.get( 'Clipboard' ).on(
  //     'inputTransformation',
  //     ( evt, data ) => {
  //       if ( data.isTransformedWithPasteFromOffice ) {
  //         return;
  //       }
  //
  //       const htmlString = data.dataTransfer.getData( 'text/html' );
  //       const activeNormalizer = normalizers.find( normalizer => normalizer.isActive( htmlString ) );
  //
  //       if ( activeNormalizer ) {
  //         activeNormalizer.execute( data );
  //
  //         data.isTransformedWithPasteFromOffice = true;
  //       }
  //     },
  //     { priority: 'high' }
  //   );
  // }
}
