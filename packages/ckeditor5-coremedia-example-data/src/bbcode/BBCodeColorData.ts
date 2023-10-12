import { bbCode } from "./BBCode";
import { ExampleData } from "../ExampleData";

const rainbow = ["red", "orange", "yellow", "green", "blue", "indigo", "violet"];
const bbCodeRainbow = Array.from("rainbow")
  .map((c, idx) => `[color=${rainbow[idx]}]${c}[/color]`)
  .join("");

const text = `${bbCode.h1(`\\[color\\]: CKEditor 5 Font Colors in BBCode`)}\
${bbCode.p(`\
The CKEditor 5 BBCode Plugin supports the \\[color\\] tag with colors either \
given in hex or as color names.`)}\
${bbCode.h2("The Colors of the Rainbow")}
${bbCode.p(`A ${bbCodeRainbow} has very nice colors.`)}
`;

export const colorData: ExampleData = {
  Colors: text,
};
