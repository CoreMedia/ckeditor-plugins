import { allDataProcessingTests, DataProcessingTestCase, Direction } from "../DataDrivenTests";

// noinspection HttpUrlsUsage
const ns_richtext = "http://www.coremedia.com/2003/richtext-1.0";
const text = "TEXT";

const wrapHeading = (content: string): string => `<div xmlns="${ns_richtext}">${content}</div>`;

describe("CoreMediaRichTextConfig: Headings", () => {
  const data: DataProcessingTestCase[] = [
    {
      name: "HEADING#1: Should prefer higher heading class (here: 1 and 2 → prefer 1).",
      direction: Direction.toDataView,
      data: wrapHeading(`<p class="p--heading-1 p--heading-2">${text}</p>`),
      dataView: wrapHeading(`<h1>${text}</h1>`),
    },
    {
      name: "HEADING#2: Should prefer higher heading class (here: 2 and 1 → prefer 1).",
      direction: Direction.toDataView,
      data: wrapHeading(`<p class="p--heading-2 p--heading-1">${text}</p>`),
      dataView: wrapHeading(`<h1>${text}</h1>`),
    },
    {
      name: "HEADING#3: Should prefer higher heading class and keep unrelated classes.",
      direction: Direction.toDataView,
      data: wrapHeading(`<p class="some-class p--heading-2 p--heading-1">${text}</p>`),
      dataView: wrapHeading(`<h1 class="some-class">${text}</h1>`),
    },
  ];

  allDataProcessingTests(data);
});
