import { allDataProcessingTests, DataProcessingTestCase, Direction } from "../DataDrivenTests";
import { flatten } from "../Utils";

// noinspection HttpUrlsUsage
const ns_richtext = "http://www.coremedia.com/2003/richtext-1.0";
const whitespace = " \t\n";
const text = "TEXT";
const emptyRichText = `<div xmlns="${ns_richtext}"/>`;

// noinspection XmlUnusedNamespaceDeclaration
const wrapContent = (content: string): string => `<div xmlns="${ns_richtext}">${content}</div>`;

describe("CoreMediaRichTextConfig: Lists", () => {
  const data: DataProcessingTestCase[] = flatten(
    ["ul", "ol"].map((el): DataProcessingTestCase[] => {
      const key = el.toUpperCase();
      return [
        {
          name: `${key}#1: Should remove if empty, as empty <${el}> not allowed by DTD.`,
          direction: Direction.toData,
          data: emptyRichText,
          dataView: wrapContent(`<${el}>${whitespace}</${el}>`),
        },
        {
          name: `${key}#2: Should keep if valid.`,
          dataView: wrapContent(`<${el}><li>${text}</li></${el}>`),
          data: wrapContent(`<${el}><li>${text}</li></${el}>`),
        },
        {
          name: `${key}#3: Should keep class attribute.`,
          dataView: wrapContent(`<${el} class="CLASS"><li>${text}</li></${el}>`),
          data: wrapContent(`<${el} class="CLASS"><li>${text}</li></${el}>`),
        },
      ];
    })
  );

  allDataProcessingTests(data);
});
