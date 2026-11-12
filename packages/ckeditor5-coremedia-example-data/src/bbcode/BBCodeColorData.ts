import type { ExampleData } from "../ExampleData";

const rainbow = ["red", "orange", "yellow", "green", "blue", "indigo", "violet"];
const bbCodeRainbow = Array.from("rainbow")
  .map((c, idx) => `[color=${rainbow[idx]}]${c}[/color]`)
  .join("");

const text = `\
[h1]\\[color\\]: CKEditor 5 Font Colors in BBCode[/h1]

The CKEditor 5 BBCode Plugin supports the \\[color\\] tag with colors either
given in hex or as color names.

[h2]The Colors of the Rainbow[/h2]

A ${bbCodeRainbow} has very nice colors:

[list]
${rainbow.map((color) => `[*] [color=${color}]${color}[/color]`).join("\n")}
[/list]
`;

export const colorData: ExampleData = {
  Colors: text,
};
