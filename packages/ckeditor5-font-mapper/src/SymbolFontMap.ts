/**
 * Maps characters to their corresponding entity. Missing characters will be
 * kept as is. Also includes HTML_ENCODING_MAP automatically.
 *
 * @see {@link http://www.alanwood.net/demos/symbol.html| Unicode alternatives for Greek and special characters in HTML}
 * @see {@link https://en.wikipedia.org/wiki/Symbol_(typeface)| Symbol (typeface) - Wikipedia}
 * @see {@link http://www.fileformat.info/info/unicode/char/search.htm| Unicode Character Search}
 */
export const symbolFontMap = new Map<number, string>([
  [34, "&forall;"], // " = ∀
  [36, "&exist;"], // $ = ∃
  [38, "&amp;"], // & = &
  [39, "&#x220d;"], // ' = ∍
  [45, "&minus;"], // - = −
  [60, "&lt;"], // < = <
  [62, "&gt;"], // > = >
  [64, "&cong;"], // @ = ≅

  // Alphabetic (Uppercase)
  [65, "&Alpha;"], // A = Α
  [66, "&Beta;"], // B = Β
  [67, "&Chi;"], // C = Χ
  [68, "&Delta;"], // D = Δ
  [69, "&Epsilon;"], // E = Ε
  [70, "&Phi;"], // F = Φ
  [71, "&Gamma;"], // G = Γ
  [72, "&Eta;"], // H = Η
  [73, "&Iota;"], // I = Ι
  [74, "&thetasym;"], // J = ϑ
  [75, "&Kappa;"], // K = Κ
  [76, "&Lambda;"], // L = Λ
  [77, "&Mu;"], // M = Μ
  [78, "&Nu;"], // N = Ν
  [79, "&Omicron;"], // O = Ο
  [80, "&Pi;"], // P = Π
  [81, "&Theta;"], // Q = Θ
  [82, "&Rho;"], // R = Ρ
  [83, "&Sigma;"], // S = Σ
  [84, "&Tau;"], // T = Τ
  [85, "&Upsilon;"], // U = Υ
  [86, "&sigmaf;"], // V = ς
  [87, "&Omega;"], // W = Ω
  [88, "&Xi;"], // X = Ξ
  [89, "&Psi;"], // Y = Ψ
  [90, "&Zeta;"], // Z = Ζ

  // Extended punctuation
  [92, "&there4;"], // \ = ∴
  [94, "&perp;"], // ^ = ⊥
  [96, "&#xF8E5;"], // ` = ... see explanation at Wikipedia, special use character

  // Alphabetic (Lowercase)
  [97, "&alpha;"], // a = α
  [98, "&beta;"], // b = β
  [99, "&chi;"], // c = χ
  [100, "&delta;"], // d = δ
  [101, "&epsilon;"], // e = ε
  [102, "&phi;"], // f = φ
  [103, "&gamma;"], // g = γ
  [104, "&eta;"], // h = η
  [105, "&iota;"], // i = ι
  [106, "&#x3d5;"], // j = ϕ
  [107, "&kappa;"], // k = κ
  [108, "&lambda;"], // l = λ
  [109, "&mu;"], // m = μ
  [110, "&nu;"], // n = ν
  [111, "&omicron;"], // o = ο
  [112, "&pi;"], // p = π
  [113, "&theta;"], // q = θ
  [114, "&rho;"], // r = ρ
  [115, "&sigma;"], // s = σ
  [116, "&tau;"], // t = τ
  [117, "&upsilon;"], // u = υ
  [118, "&piv;"], // v = ϖ
  [119, "&omega;"], // w = ω
  [120, "&xi;"], // x = ξ
  [121, "&psi;"], // y = ψ
  [122, "&zeta;"], // z = ζ

  // Extended punctuation
  [160, "&euro;"], // = €

  // International
  [161, "&upsih;"], // ¡ = ϒ

  // Extended punctuation
  [162, "&prime;"], // ¢ = ʹ
  [163, "&le;"], // £ = ≤
  [164, "&frasl;"], // ¤ = ⁄
  [165, "&infin;"], // ¥ = ∞

  // International
  [166, "&fnof;"], // ¦ = ƒ

  // Extended punctuation
  [167, "&clubs;"], // § = ♣
  [168, "&diams;"], // ¨ = ♦
  [169, "&hearts;"], // © = ♥
  [170, "&spades;"], // ª = ♠
  [171, "&harr;"], // « = ↔
  [172, "&larr;"], // ¬ = ←
  [173, "&uarr;"], // ­ = ↑
  [174, "&rarr;"], // ® = →
  [175, "&darr;"], // ¯ = ↓
  [178, "&Prime;"], // ² = ʺ
  [179, "&ge;"], // ³ = ≥
  [180, "&times;"], // ´ = ≥
  [181, "&prop;"], // µ = ∝
  [182, "&part;"], // ¶ = ∂
  [183, "&bull;"], // · = •
  [184, "&divide;"], // ¸ = ÷
  [185, "&ne;"], // ¹ = ≠
  [186, "&equiv;"], // º = ≠
  [187, "&asymp;"], // » = ≈
  [188, "&hellip;"], // ¼ = …
  [189, "&#x23d0;"], // ½ = ⏐
  [190, "&#x23af;"], // ¾ = ⎯
  [191, "&#x21b2;"], // ¿ = ↵

  // International
  [192, "&alefsym;"], // À = ℵ
  [193, "&image;"], // Á = ℑ
  [194, "&real;"], // Â = ℜ
  [195, "&weierp;"], // Ã = ℘

  // Extended punctuation
  [196, "&otimes;"], // Ä = ⊗
  [197, "&oplus;"], // Å = ⊕
  [198, "&empty;"], // Æ = ∅
  [199, "&cap;"], // Ç = ∩
  [200, "&cup;"], // È = ∪
  [201, "&sup;"], // ╔ = ⊃
  [202, "&supe;"], // ╩ = ⊇
  [203, "&nsub;"], // Ë = ⊄
  [204, "&sub;"], // Ì = ⊂
  [205, "&sube;"], // Í = ⊆
  [206, "&isin;"], // Î = ∈
  [207, "&notin;"], // Ï = ∉
  [208, "&ang;"], // Ð = ∠
  [209, "&nabla;"], // Ñ = ∇
  [210, "&reg;"], // Ò = ®, see also 226 (duplicate by intention)
  [211, "&copy;"], // Ó = ©, see also 227 (duplicate by intention)
  [212, "&trade;"], // Ô = ™, see also 228 (duplicate by intention)

  [213, "&prod;"], // Õ = ∏
  [214, "&radic;"], // Ö = √
  [215, "&sdot;"], // × = ⋅
  [216, "&not;"], // Ø = ¬
  [217, "&and;"], // Ù = ∧
  [218, "&or;"], // Ú = ∨
  [219, "&hArr;"], // Û = ⇔
  [220, "&lArr;"], // Ü = ⇐
  [221, "&uArr;"], // Ý = ⇑
  [222, "&rArr;"], // Þ = ⇒
  [223, "&dArr;"], // ß = ⇓
  [224, "&loz;"], // à = ◊
  [225, "&#x3008;"], // á = 〈
  [226, "&reg;"], // Ò = ®, see also 210 (duplicate by intention)
  [227, "&copy;"], // Ó = ©, see also 211 (duplicate by intention)
  [228, "&trade;"], // Ô = ™, see also 212 (duplicate by intention)
  [229, "&sum;"], // å = ∑
  [230, "&#x239b;"], // æ = ⎛
  [231, "&#x239c;"], // ç = ⎜
  [232, "&#x239d;"], // è = ⎝
  [233, "&#x23a1;"], // é = ⎡
  [234, "&#x23a2;"], // ê = ⎢
  [235, "&#x23a3;"], // ë = ⎣
  [236, "&#x23a7;"], // ì = ⎧
  [237, "&#x23a8;"], // í = ⎨
  [238, "&#x23a9;"], // î = ⎩
  [239, "&#x23aa;"], // ï = ⎪
  [241, "&#x3009;"], // ñ = 〉
  [242, "&int;"], // ò = ∫
  [243, "&#x2320;"], // ó = ⌠
  [244, "&#x23ae;"], // ô = ⎮
  [245, "&#x2321;"], // õ = ⌡
  [246, "&#x239e;"], // ö = ⎞
  [247, "&#x239f;"], // ÷ = ⎟
  [248, "&#x23a0;"], // ø = ⎠
  [249, "&#x23a4;"], // ù = ⎤
  [250, "&#x23a5;"], // ú = ⎥
  [251, "&#x23a6;"], // û = ⎦
  [252, "&#x23ab;"], // ü = ⎫
  [253, "&#x23ac;"], // ý = ⎬
  [254, "&#x23ad;"], // þ = ⎭
]);
