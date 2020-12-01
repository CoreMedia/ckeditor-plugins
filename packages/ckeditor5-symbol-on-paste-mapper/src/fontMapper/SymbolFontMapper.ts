import FontMapper from "./FontMapper"

export default class SymbolFontMapper implements FontMapper {
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

  toEscapedHtml(toMap:string): string {
    const chars: Array<any> = [...toMap];
    const replaced: Array<any> = chars.map((value) => {
      const textChar: number = SymbolFontMapper.unpack(value);
      if (SymbolFontMapper.map.has(textChar)) {
        let htmlReplacement: string | undefined = SymbolFontMapper.map.get(textChar);
        if (htmlReplacement) {
          return SymbolFontMapper.decodeHtmlEntities(htmlReplacement);
        }
      }
      return String.fromCharCode(textChar);
    });
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

  matches(fontFamilyStyle: string): boolean {
    return fontFamilyStyle.toLocaleLowerCase().indexOf("symbol") !== -1;
  }
}
