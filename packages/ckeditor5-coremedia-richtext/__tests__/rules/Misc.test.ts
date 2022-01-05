import { allDataProcessingTests, DataProcessingTestCase, Direction } from "../DataDrivenTests";

// noinspection HttpUrlsUsage
const ns_richtext = "http://www.coremedia.com/2003/richtext-1.0";
const text = "TEXT";

// noinspection XmlUnusedNamespaceDeclaration
const wrapContent = (content: string): string => `<div xmlns="${ns_richtext}">${content}</div>`;

describe("CoreMediaRichTextConfig: Miscellaneous", () => {
  const data: DataProcessingTestCase[] = [
    {
      name: "EMPTY#1: Should not modify empty RichText.",
      data: `<div xmlns="${ns_richtext}"/>`,
      dataView: `<div xmlns="${ns_richtext}"/>`,
    },
    {
      name: "DIV#1: Should replace nested DIVs by P.",
      direction: Direction.toData,
      comment:
        "In CKEditor 4 we observed, that it may be required replacing DIVs, which are only allowed at root for CoreMedia RichText, by Ps instead.",
      data: wrapContent(`<p>${text}</p>`),
      dataView: wrapContent(`<div>${text}</div>`),
    },
    {
      name: "BR#1: Should keep BR as is.",
      data: `<div xmlns="${ns_richtext}"><p>${text}<br/>${text}</p></div>`,
      dataView: `<div xmlns="${ns_richtext}"><p>${text}<br/>${text}</p></div>`,
    },
    {
      name: "BR#2: Should keep BR class as is.",
      data: `<div xmlns="${ns_richtext}"><p>${text}<br class="CLASS"/>${text}</p></div>`,
      dataView: `<div xmlns="${ns_richtext}"><p>${text}<br class="CLASS"/>${text}</p></div>`,
    },
    {
      name: "SPAN#1: Should keep empty span.",
      comment:
        "While the element is irrelevant, this refers to an issue with CKEditor 4, where such empty spans got expanded instead, so that <span/>t became <span>t</span>",
      data: `<div xmlns="${ns_richtext}"><p>${text}<span/>${text}</p></div>`,
      dataView: `<div xmlns="${ns_richtext}"><p>${text}<span/>${text}</p></div>`,
    },
    {
      name: "SPAN#2: Should keep empty span and its attributes.",
      comment:
        "While the element is irrelevant, this refers to an issue with CKEditor 4, where such empty spans got expanded instead, so that <span/>t became <span>t</span>",
      data: `<div xmlns="${ns_richtext}"><p>${text}<span dir="rtl" class="CLASS"/>${text}</p></div>`,
      dataView: `<div xmlns="${ns_richtext}"><p>${text}<span dir="rtl" class="CLASS"/>${text}</p></div>`,
    },
  ];

  allDataProcessingTests(data);
});
