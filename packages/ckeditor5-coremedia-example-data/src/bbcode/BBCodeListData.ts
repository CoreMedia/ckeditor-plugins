import type { ExampleData } from "../ExampleData";

const introduction = `\
[h1]\\[list\\]: CKEditor 5 Document Lists in BBCode[/h1]

The CKEditor 5 BBCode Plugin supports the \\[list\\] tag and integrates
with the
[url=https://ckeditor.com/docs/ckeditor5/latest/features/lists/document-lists.html]Document list feature[/url]
available for CKEditor 5.
`;

const rainbowColors = ["red", "orange", "yellow", "green", "blue", "indigo", "violet"] as const;
type RainbowColor = (typeof rainbowColors)[number];

class Rainbow {
  #currentIdx = 0;

  next(): RainbowColor {
    const current = rainbowColors[this.#currentIdx];
    this.#currentIdx++;
    if (this.#currentIdx === rainbowColors.length) {
      this.#currentIdx = 0;
    }
    return current;
  }
}

const rainbow = new Rainbow();

const orderedListTypes: Record<string, string> = {
  1: "numeric",
  i: "lower-roman",
  I: "upper-roman",
  a: "lower-latin",
  A: "upper-latin",
};

const loremIpsum = ["lorem", "ipsum", "dolor"];

const ulItemsForOrderedListTypes = Object.entries(orderedListTypes)
  .map(([typeId, typeName]) => {
    const ulItemPrefix = `[*] Ordered List of type ${typeName}:`;
    const startTag = `[list=${typeId}]`;
    const olItems = loremIpsum.map((s) => `[*] [color=${rainbow.next()}]${s}[/color]`).join("\n");
    const endTag = `[/list]`;
    return `${ulItemPrefix}\n${startTag}\n${olItems}\n${endTag}`;
  })
  .join("\n");

const nestedAndTypeListIntroduction = `\
[h2]Nested and Typed Ordered List Demo[/h2]

[quote]
[b]Limitation Lower/Upper[/b]

Although the "type" attribute for <ol> elements supports distinguishing upper
and lower characters, browsers may not support case-sensitive CSS rules.
Thus, in this demo, you may experience to see upper and lower types displayed
in the same way.
[/quote]

[h3]The Demo[/h3]
`;

const nestedAndTypeListDemo = `\
${introduction}

${nestedAndTypeListIntroduction}

[list]\n${ulItemsForOrderedListTypes}\n[/list]
`;

const nestedAndParagraphsDemo = `\
${introduction}

[h2]Nested and Paragraphs Demo[/h2]

With the document list feature, list items may also contain paragraphs.

[list]
[*] A first paragraph.

This is a second paragraph within a list item.
[*] Mixed paragraphs and nested lists.

Second paragraph.

[list=1]
[*] One
[*] Two
[/list]

Final paragraph.
[/list]
`;

export const listData: ExampleData = {
  "Lists: Nested and Typed": nestedAndTypeListDemo,
  "Lists: Nested and Paragraphs": nestedAndParagraphsDemo,
};
