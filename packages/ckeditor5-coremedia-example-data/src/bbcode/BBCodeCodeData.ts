import { bbCode } from "./BBCode";
import { ExampleData } from "../ExampleData";

const text = `${bbCode.h1(`\\[code\\]: CKEditor 5 Code Blocks in BBCode`)}\
${bbCode.p(`\
The CKEditor 5 BBCode Plugin supports the \\[code\\] tag along with its \
optional language identifier.`)}\
${bbCode.h2("No Language Identifier")}
${bbCode.p(`If no language identifier is given, it is assumed, that the code \
block defaults to ${bbCode.italic("plain text")}.`)}
${bbCode.code(`No Language`)}
${bbCode.h2("With Language Identifier")}
${bbCode.code(
  `\
\\[b\\]bold\\[/b\\]
`,
  "bbcode",
)}
`;

export const codeBlockData: ExampleData = {
  "Code Blocks": text,
};
