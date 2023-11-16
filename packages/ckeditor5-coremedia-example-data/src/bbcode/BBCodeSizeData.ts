import { ExampleData } from "../ExampleData";

enum FontSize {
  tiny = 70,
  small = 85,
  normal = 100,
  big = 140,
  huge = 180,
}

const A = "a".charCodeAt(0);
const Z = "z".charCodeAt(0);

const alphabetRange = [...Array(Z - A + 1).keys()].map((i) => String.fromCharCode(i + A));
const fontSizeStepSize = 7;
const increasingFontSizeExample = alphabetRange
  .map((alphabetChar, alphabetPos) => {
    const fontSize = alphabetPos * fontSizeStepSize;
    return `[size=${fontSize}]${alphabetChar}[/size]`;
  })
  .join("");

const text = `\
[h1]\\[size\\]: CKEditor 5 Font Sizes in BBCode[/h1]

The CKEditor 5 BBCode Plugin supports the \\[size\\] tag with sizes given
as integers. Due to the limitations of the
[url=https://ckeditor.com/docs/ckeditor5/latest/features/font.html]CKEditor 5 Font Size Feature[/url]
and for best compatibility with the CKEditor 4 BBCode Plugin, sizes are mapped
to an enumerated set of sizes:

[list=1]
[*] ${FontSize.tiny} denotes a tiny font-size
[*] ${FontSize.small} denotes a small font-size
[*] ${FontSize.big} denotes a big font-size
[*] ${FontSize.huge} denotes a huge font-size
[/list]

Font size ${FontSize.normal} is artificial and is interpreted as [i]normal[/i]
font-size.

[h2]Increasing Font-Sizes[/h2]

The following example also uses \\[size=${FontSize.normal}\\] which is
stripped in "toView" processing:

[code=bbcode]
\\[size=${FontSize.tiny}\\]in\\[/size\\]\\[size=${FontSize.small}\\]cr\\[/size\\]\\[size=${FontSize.normal}\\]ea\\[/size\\]\\[size=${FontSize.big}\\]si\\[/size\\]\\[size=${FontSize.huge}\\]ng\\[/size\\]
[/code]

Rendered as:

[size=${FontSize.tiny}]in[/size][size=${FontSize.small}]cr[/size][size=${FontSize.normal}]ea[/size][size=${FontSize.big}]si[/size][size=${FontSize.huge}]ng[/size]

[h2]Enumerated Font-Sizes[/h2]

Enumerated means, that there are only some selected numbers mapped to a
corresponding data view representation. All other numbers are mapped to a
suitable representative state.

This combines best the CKEditor 5 capabilities and the font-size percentage
mapping as it was used for CKEditor 4 BBCode Plugin. And on the other hand,
it prevents [i]unreadable[/i] text to make it into the editing view of the
editor (unreadable small or unreadable large).

Due to the enumerated character, the following incrementing font-sizes will
be increased in 5 steps:

${increasingFontSizeExample}
`;

export const sizeData: ExampleData = {
  Sizes: text,
};
