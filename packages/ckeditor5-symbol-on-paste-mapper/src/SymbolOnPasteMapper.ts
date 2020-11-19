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

export default class SymbolOnPasteMapper extends Plugin {
  static readonly pluginName: string =  "SymbolOnPasteMapper";
  // TODO[cke] Copied from PasteFromOffice... should be some set of constants
  //   which tell, if there is any font to consider for replacement.
  static readonly msWordMatch: RegExp = /<meta\s*name="?generator"?\s*content="?microsoft\s*word\s*\d+"?\/?>/i;
  // TODO[cke] Would be great adding context information (editor/sourceElement-id or similar)
  //    to get the actual editor we write log entries for.
  private readonly logger:Logger = LoggerProvider.getLogger(SymbolOnPasteMapper.pluginName);
  /**
   * Helper element for decoding HTML entities like &amp;quot; which are contained in the MS Word clipboard
   * content. For processing in here we require the real characters instead of their HTML entities.
   * @type {Element}
   */
  private static DECODE_ELEMENT_HELP = document.createElement("div");

  private static map: Map<number, string> = new Map<number, string>([
      [34, "&forall;"],
      [36, "&exist;"],
    [38, '&amp;'],
  [39, '&#x22d;'],
  [45, '&minus;'],
  [60, '&lt;'],
  [62, '&g;'],
  [64, '&ong;'],

  // Alphabetic (Uppercase)
  [65, '&Alpha;'],
  [66, '&Beta;'],
  [67, '&Chi;'],
  [68, '&Delta;'],
  [69, '&Epsilon;'],
  [70, '&Phi;'],
  [71, '&Gamma;'],
  [72, '&Eta;'],
  [73, '&Iota;'],
  [74, '&thetasym;'],
  [75, '&Kappa;'],
  [76, '&Lambda;'],
  [77, '&Mu;'],
  [78, '&Nu;'],
  [79, '&Omicron;'],
  [80, '&Pi;'],
  [81, '&Theta;'],
  [82, '&Rho;'],
  [83, '&Sigma;'],
  [84, '&Tau;'],
  [85, '&Upsilon;'],
  [86, '&sigmaf;'],
  [87, '&Omega;'],
  [88, '&Xi;'],
  [89, '&Psi;'],
  [90, '&Zeta;'],

  // Extended punctuation
  [92, '&there4;'],
  [94, '&perp;'],
  [96, '&#xF8E5;'],
    [97, '&alpha;'],
    [98, '&beta;'],
    [99, '&chi;'],
    [100, '&delta;'],
    [101, '&epsilon;'],
    [102, '&phi;'],
    [103, '&gamma;'],
    [104, '&eta;'],
    [105, '&iota;'],
    [106, '&#x3d5;'],
    [107, '&kappa;'],
    [108, '&lambda;'],
    [109, '&mu;'],
    [110, '&nu;'],
    [111, '&omicron;'],
    [112, '&pi;'],
    [113, '&theta;'],
    [114, '&rho;'],
    [115, '&sigma;'],
    [116, '&tau;'],
    [117, '&upsilon;'],
    [118, '&piv;'],
    [119, '&omega;'],
    [120, '&xi;'],
    [121, '&psi;'],
    [122, '&zeta;'],
    // Extended punctuation
    [160, '&euro;'],
    // International
    [161, '&upsih;'],
    // Extended punctuation
    [162, '&prime;'],
    [163, '&le;'],
    [164, '&frasl;'],
    [165, '&infin;'],
    // International
    [166, '&fnof;'],
      // Extended punctuation
      [167, '&clubs;'],
    [168, '&diams;'],
    [169, '&hearts;'],
    [170, '&spades;'],
    [171, '&harr;'],
    [172, '&larr;'],
    [173, '&uarr;'],
    [174, '&rarr;'],
    [175, '&darr;'],
    [178, '&Prime;'],
    [179, '&ge;'],
    [180, '&times;'],
    [181, '&prop;'],
    [182, '&part;'],
    [183, '&bull;'],
    [184, '&divide;'],
    [185, '&ne;'],
    [186, '&equiv;'],
    [187, '&asymp;'],
    [188, '&hellip;'],
    [189, '&#x23d0;'],
    [190, '&#x23af;'],
    [191, '&#x21b2;'],
    // International
    [192, '&alefsym;'],
    [193, '&image;'],
    [194, '&real;'],
    [195, '&weierp;'],
    // Extended punctuation
    [196, '&otimes;'],
    [197, '&oplus;'],
    [198, '&empty;'],
    [199, '&cap;'],
    [200, '&cup;'],
    [201, '&sup;'],
    [202, '&supe;'],
    [203, '&nsub;'],
    [204, '&sub;'],
    [205, '&sube;'],
    [206, '&isin;'],
    [207, '&notin;'],
    [208, '&ang;'],
    [209, '&nabla;'],
    [210, '&reg;'],
    [211, '&copy;'], // Ó = ©, see also 227 (duplicate by intention)
    [212, '&trade;'], // Ô = ™, see also 228 (duplicate by intention)

    [213, '&prod;'], // Õ = ∏
    [214, '&radic;'], // Ö = √
    [215, '&sdot;'], // × = ⋅
    [216, '&not;'], // Ø = ¬
    [217, '&and;'], // Ù = ∧
    [218, '&or;'], // Ú = ∨
    [219, '&hArr;'], // Û = ⇔
    [220, '&lArr;'], // Ü = ⇐
    [221, '&uArr;'], // Ý = ⇑
    [222, '&rArr;'], // Þ = ⇒
    [223, '&dArr;'], // ß = ⇓
    [224, '&loz;'], // à = ◊
    [225, '&#x3008;'], // á = 〈
    [226, '&reg;'], // Ò = ®, see also 210 (duplicate by intention)
    [227, '&copy;'], // Ó = ©, see also 211 (duplicate by intention)
    [228, '&trade;'], // Ô = ™, see also 212 (duplicate by intention)
    [229, '&sum;'], // å = ∑
    [230, '&#x239b;'], // æ = ⎛
    [231, '&#x239c;'], // ç = ⎜
    [232, '&#x239d;'], // è = ⎝
    [233, '&#x23a1;'], // é = ⎡
    [234, '&#x23a2;'], // ê = ⎢
    [235, '&#x23a3;'], // ë = ⎣
    [236, '&#x23a7;'], // ì = ⎧
    [237, '&#x23a8;'], // í = ⎨
    [238, '&#x23a9;'], // î = ⎩
    [239, '&#x23aa;'], // ï = ⎪
    [241, '&#x3009;'], // ñ = 〉
    [242, '&int;'], // ò = ∫
    [243, '&#x2320;'], // ó = ⌠
    [244, '&#x23ae;'], // ô = ⎮
    [245, '&#x2321;'], // õ = ⌡
    [246, '&#x239e;'], // ö = ⎞
    [247, '&#x239f;'], // ÷ = ⎟
    [248, '&#x23a0;'], // ø = ⎠
    [249, '&#x23a4;'], // ù = ⎤
    [250, '&#x23a5;'], // ú = ⎥
    [251, '&#x23a6;'], // û = ⎦
    [252, '&#x23ab;'], // ü = ⎫
    [253, '&#x23ac;'], // ý = ⎬
    [254, '&#x23ad;'] // þ = ⎭

    ]);

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
        if (this.hasFontFamilySymbol(child)) {
          let element: Element = upcastWriter.clone(child, true);
          let childIndex: number = content.getChildIndex(child);
          element._removeStyle("font-family");
          this.replaceText(element);
          content._removeChildren(childIndex, 1);
          content._insertChild(childIndex, element);
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

      if (this.hasFontFamilySymbol(child)) {
        let childIndex = element.getChildIndex(child);
        let clone: Element = upcastWriter.clone(child, true);
        clone._removeStyle("font-family");
        this.replaceText(clone);
        element._removeChildren(childIndex, 1);
        element._insertChild(childIndex, clone);
      } else {
        this.treatElementChildren(upcastWriter, child);
      }
    }
  }

  private static replaceText(element: Element): void {
    let textElement: Text | null = this.findTextElement(element);
    if (!textElement) {
      return;
    }
    let oldTextData: string = textElement._textData;
    textElement._textData = this.replaceCharacters(oldTextData);
  }

  private static replaceCharacters(oldData: string): string {
    const chars: Array<any> = [...oldData];
    const replaced: Array<any> = chars.map((value) => {
      const textChar: number = this.unpack(value);
      if (this.map.has(textChar)) {
        let htmlReplacement: string | undefined = this.map.get(textChar);
        if (htmlReplacement) {
          return this.decodeHtmlEntities(htmlReplacement);
        }
      }
      return value;
    });
    console.info(replaced.join());
    return replaced.join();
  }

  private static decodeHtmlEntities (str: string): string | null {
    this.DECODE_ELEMENT_HELP.innerHTML = str;
    return this.DECODE_ELEMENT_HELP.textContent;
  }

  private static unpack(data: string): number {
    if (data.length > 1 || data.length < 1) {
      return -1;
    }

    let utf8charCode = data.charCodeAt(0);
    return utf8charCode & 0xFF;
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

  private static hasFontFamilySymbol(element: Element): boolean {
    let hasStyleFontFamily: boolean = element.hasStyle("font-family");
    if (!hasStyleFontFamily) {
      return false;
    }

    let style:string = element.getStyle("font-family");

    return style.toLocaleLowerCase().indexOf("symbol") !== -1;
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
