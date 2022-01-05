import { allDataProcessingTests, DataProcessingTestCase, Direction } from "../DataDrivenTests";
import { flatten } from "../Utils";

// noinspection HttpUrlsUsage
const ns_richtext = "http://www.coremedia.com/2003/richtext-1.0";
const text = "TEXT";

// noinspection XmlUnusedNamespaceDeclaration
const wrapContent = (content: string): string => `<div xmlns="${ns_richtext}">${content}</div>`;

describe("CoreMediaRichTextConfig: Miscellaneous Inline Tags", () => {
  const replaceInlineSimpleFixtures: DataProcessingTestCase[] = flatten(
    [
      {
        view: "b",
        data: "strong",
        bijective: false,
      },
      {
        view: "i",
        data: "em",
        bijective: true,
      },
    ].map(({ view, data, bijective }): DataProcessingTestCase[] => {
      const key = view.toUpperCase();
      return [
        {
          name: `${key}#1: View: <${view}> ${bijective ? "<" : ""}-> Data: <${data}>.`,
          direction: bijective ? Direction.both : Direction.toData,
          data: wrapContent(`<p><${data}>${text}</${data}></p>`),
          dataView: wrapContent(`<p><${view}>${text}</${view}></p>`),
        },
        {
          name: `${key}#2: Should keep <${data}> when transformed.`,
          direction: Direction.toData,
          data: wrapContent(`<p><${data}>${text}</${data}></p>`),
          dataView: wrapContent(`<p><${data}>${text}</${data}></p>`),
        },
      ];
    })
  );

  const replaceInlineBySpanFixtures: DataProcessingTestCase[] = flatten(
    [
      {
        view: "u",
        dataClass: "underline",
        bijective: true,
      },
      {
        view: "strike",
        dataClass: "strike",
        bijective: false,
      },
      {
        view: "s",
        dataClass: "strike",
        bijective: true,
      },
      {
        view: "del",
        dataClass: "strike",
        bijective: false,
      },
    ].map(({ view, dataClass, bijective }): DataProcessingTestCase[] => {
      // bijective: Typically false for "alias" mappings.
      // The mapping, which corresponds to the default representation in
      // CKEditor should be bijective (i.e. = true).
      const key = view.toUpperCase();
      return [
        {
          name: `${key}#1: View: <${view}> ${bijective ? "<" : ""}-> Data: by <span class="${dataClass}">.`,
          direction: bijective ? Direction.both : Direction.toData,
          data: wrapContent(`<p><span class="${dataClass}">${text}</span></p>`),
          dataView: wrapContent(`<p><${view}>${text}</${view}></p>`),
        },
        {
          name: `${key}#2: Should keep <span class="${dataClass}"> when transformed.`,
          direction: Direction.toData,
          data: wrapContent(`<p><span class="${dataClass}">${text}</span></p>`),
          dataView: wrapContent(`<p><span class="${dataClass}">${text}</span></p>`),
        },
      ];
    })
  );

  const data: DataProcessingTestCase[] = [...replaceInlineSimpleFixtures, ...replaceInlineBySpanFixtures];

  allDataProcessingTests(data);
});
