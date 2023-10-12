import { ExampleData } from "../ExampleData";
import { bbCode } from "./BBCode";

const paragraphs = (...texts: string[]): string => texts.join(`\n\n`);

const inlineExamples = [
  {
    tag: "b",
    name: "bold",
    title: "Bold",
  },
  {
    tag: "i",
    name: "italic",
    title: "Italic",
  },
  {
    tag: "s",
    name: "strikethrough",
    title: "Strikethrough",
  },
  {
    tag: "u",
    name: "underline",
    title: "Underline",
  },
];

const inlineFormatDataEntries = inlineExamples.map(({ tag, name, title }) => [
  title,
  paragraphs(
    `${bbCode.h1(`\\[${tag}\\] CKEditor 5 ${title} Style`)}`,
    `Text can be represented in [${tag}]${name}[/${tag}] style.`,
  ),
]);

export const inlineFormatData = Object.fromEntries(inlineFormatDataEntries) as ExampleData;
