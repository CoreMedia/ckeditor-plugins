import { allDataProcessingTests, DataProcessingTestCase, Direction } from "../DataDrivenTests";
import { flatten } from "../Utils";

// noinspection HttpUrlsUsage
const ns_richtext = "http://www.coremedia.com/2003/richtext-1.0";
const ns_xhtml = "http://www.w3.org/1999/xhtml";

// noinspection XmlUnusedNamespaceDeclaration
const wrapContent = (content: string): string => `<div xmlns="${ns_richtext}">${content}</div>`;

describe("CoreMediaRichTextConfig: Miscellaneous Block Tags", () => {
  const defaultBlockFixtures: DataProcessingTestCase[] = flatten(
    ["p", "pre", "blockquote"].map((el): DataProcessingTestCase[] => {
      const key = el.toUpperCase();
      return [
        {
          name: `${key}#1: Should keep if empty.`,
          data: wrapContent(`<${el}/>`),
          dataView: wrapContent(`<${el}/>`),
        },
        {
          name: `${key}#2: Should adapt namespace if required.`,
          direction: Direction.toData,
          data: wrapContent(`<${el}/>`),
          dataView: wrapContent(`<${el} xmlns="${ns_xhtml}"/>`),
        },
        {
          name: `${key}#3: Should keep class attribute.`,
          data: wrapContent(`<${el} class="CLASS"/>`),
          dataView: wrapContent(`<${el} class="CLASS"/>`),
        },
      ];
    })
  );

  const data: DataProcessingTestCase[] = [...defaultBlockFixtures];

  allDataProcessingTests(data);
});
