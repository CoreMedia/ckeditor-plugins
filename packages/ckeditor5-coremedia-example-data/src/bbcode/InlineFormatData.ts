import { ExampleData } from "../ExampleData";

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

const text = ({ tag, name, title }: (typeof inlineExamples)[number]): string => `\
[h1]\\[${tag}\\] CKEditor 5 ${title} Style[/h1]

Text can be represented in [${tag}]${name}[/${tag}] style.
`;

const inlineFormatDataEntries = inlineExamples.map((example) => [example.title, text(example)]);

export const inlineFormatData = Object.fromEntries(inlineFormatDataEntries) as ExampleData;
