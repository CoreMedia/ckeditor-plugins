import { ExampleData } from "../ExampleData";
import { bbCode } from "./BBCode";

const paragraphs = (...texts: string[]): string => texts.join(`\n\n`);

export const inlineFormatData: ExampleData = {
  Bold: paragraphs(`${bbCode.h1("Bold Text")}`, `Lorem ${bbCode.bold("ipsum")} dolor`),
  Italic: paragraphs(`${bbCode.h1("Italic Text")}`, `Lorem ${bbCode.italic("ipsum")} dolor`),
  Underline: paragraphs(`${bbCode.h1("Underline Text")}`, `Lorem ${bbCode.underline("ipsum")} dolor`),
  Strikethrough: paragraphs(`${bbCode.h1("Strikethrough Text")}`, `Lorem ${bbCode.strikethrough("ipsum")} dolor`),
  Styles: paragraphs(
    `${bbCode.h1("Text Using Styles")}`,
    `Lorem ${bbCode.style("ipsum", { size: "1.5em" })} dolor`,
    `Lorem ${bbCode.style("ipsum", { color: "fuchsia" })} dolor`,
    `Lorem ${bbCode.style("ipsum", { color: "#ff0000" })} dolor`,
    `Lorem ${bbCode.style("ipsum", {
      size: "1.5em",
      color: "fuchsia",
    })} dolor`,
  ),
};
