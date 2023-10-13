import { bbCode } from "./BBCode";
import { ExampleData } from "../ExampleData";

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

const ulItems = Object.entries(orderedListTypes)
  .map(([typeId, typeName]) => {
    const ulItemPrefix = `[*] Ordered List of type ${typeName}:`;
    const startTag = `[list=${typeId}]`;
    const olItems = loremIpsum.map((s) => `[*] [color=${rainbow.next()}]${s}[/color]`).join("\n");
    const endTag = `[/list]`;
    return `${ulItemPrefix}\n${startTag}\n${olItems}\n${endTag}`;
  })
  .join("\n");

const listDemo = `[list]\n${ulItems}\n[/list]`;

const text = `${bbCode.h1(`\\[list\\]: CKEditor 5 Document Lists in BBCode`)}\
${bbCode.p(`\
The CKEditor 5 BBCode Plugin supports the \\[list\\] tag that aligns with the \
CKEditor 5 DocumentList Feature. Ordered lists are supported by type attribute \
such as the default \\[list=1\\] or alternatives like \\[list=a\\] for \
lower-alpha characters.`)}\
${bbCode.h2("Limitation Lower/Upper")}
${bbCode.p(`\
Although the "type" attribute for <ol> elements supports distinguishing upper \
and lower characters, browsers may not support case-sensitive CSS rules. \
Thus, in this demo you may experience to see upper and lower types displayed \
in the same way.`)}\
${bbCode.h2("The Lists")}
${listDemo}
`;

export const listData: ExampleData = {
  Lists: text,
};
