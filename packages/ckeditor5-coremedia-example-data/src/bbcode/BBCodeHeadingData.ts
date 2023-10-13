import { bbCode } from "./BBCode";
import { ExampleData } from "../ExampleData";

const rainbow = ["red", "orange", "yellow", "green", "blue", "indigo", "violet"];
const bbCodeRainbow = rainbow
  // We only have six heading levels :-(
  .filter((c, idx) => idx < 6)
  .map((c, idx) => {
    const level = idx + 1;
    const startTag = `[h${level}]`;
    const endTag = `[/h${level}]`;
    const headingText = `[color=${c}]Heading ${level}[/color]`;
    const heading = `${startTag}${headingText}${endTag}\n\n`;
    const text = `We love the [color=${c}]${c}[/color] color.`;
    return `${heading}${text}`;
  })
  .join("\n\n");

const text = `${bbCode.h1(`\\[h1\\] to \\[h6\\]: CKEditor 5 Headings in BBCode`)}\
${bbCode.p(`\
The CKEditor 5 BBCode Plugin supports the \\[h1\\] to \\[h6\\] tags to denote \
different heading levels.`)}

${bbCodeRainbow}`;

export const headingData: ExampleData = {
  Headings: text,
};
