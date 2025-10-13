import "global-jsdom/register";
import { describe } from "node:test";
import type { DataProcessingTestCase } from "../DataDrivenTests";
import { allDataProcessingTests, Direction } from "../DataDrivenTests";
import { flatten } from "../Utils";

// noinspection HttpUrlsUsage
const ns_richtext = "http://www.coremedia.com/2003/richtext-1.0";
const text = "TEXT";

const wrapContent = (content: string): string => `<div xmlns="${ns_richtext}">${content}</div>`;

void describe("CoreMediaRichTextConfig: Headings", () => {
  const headingFixtures: DataProcessingTestCase[] = flatten(
    [1, 2, 3, 4, 5, 6].map((level): DataProcessingTestCase[] => {
      const el = `h${level}`;
      const key = el.toUpperCase();
      const expectedClass = `p--heading-${level}`;

      return [
        {
          name: `${key}#1: Should transform to empty <p> if empty.`,
          data: wrapContent(`<p class="${expectedClass}"/>`),
          dataView: wrapContent(`<${el}/>`),
        },
        {
          name: `${key}#2: Should transform to <p> with class attribute.`,
          data: wrapContent(`<p class="${expectedClass}">${text}</p>`),
          dataView: wrapContent(`<${el}>${text}</${el}>`),
        },
        {
          name: `${key}#3: Should keep dir attribute.`,
          data: wrapContent(`<p dir="rtl" class="${expectedClass}"/>`),
          dataView: wrapContent(`<${el} dir="rtl"/>`),
        },
        {
          name: `${key}#4: Should transform xml:lang (data) to lang attribute (data view) back and forth.`,
          data: wrapContent(`<p class="${expectedClass}" xml:lang="en"/>`),
          dataView: wrapContent(`<${el} lang="en"/>`),
        },
        {
          name: `${key}#5: Should transform lang (data) to lang attribute (data view).`,
          direction: Direction.toDataView,
          comment:
            "CoreMedia RichText supports xml:lang as well as lang attribute. While preferring xml:lang for toData transformation, we have to respect lang attribute from data as well.",
          data: wrapContent(`<p class="${expectedClass}" lang="en"/>`),
          dataView: wrapContent(`<${el} lang="en"/>`),
        },
        {
          name: `${key}#6: Should prefer xml:lang over lang in data.`,
          direction: Direction.toDataView,
          comment: "As in HTML specification, xml:lang should take precedence, when both are given.",
          data: wrapContent(`<p class="${expectedClass}" lang="en" xml:lang="de"/>`),
          dataView: wrapContent(`<${el} lang="de"/>`),
        },
      ];
    }),
  );

  const invalidHeadingFixtures: DataProcessingTestCase[] = flatten(
    [0, 7, 10].map((level): DataProcessingTestCase[] => {
      const key = `INVALID_H${level}`;
      const invalidHeadingClass = `p--heading-${level}`;

      return [
        {
          name: `${key}#1: Should not handle invalid heading class.`,
          data: wrapContent(`<p class="${invalidHeadingClass}">${text}</p>`),
          dataView: wrapContent(`<p class="${invalidHeadingClass}">${text}</p>`),
        },
      ];
    }),
  );

  const data: DataProcessingTestCase[] = [
    {
      // See also #101 regarding ambiguous data states.
      name: "HEADING#1: Should prefer higher heading class (here: 1 and 2 → prefer 1).",
      direction: Direction.toDataView,
      data: wrapContent(`<p class="p--heading-1 p--heading-2">${text}</p>`),
      dataView: wrapContent(`<h1>${text}</h1>`),
    },
    {
      name: "HEADING#2: Should prefer higher heading class (here: 2 and 1 → prefer 1).",
      direction: Direction.toDataView,
      data: wrapContent(`<p class="p--heading-2 p--heading-1">${text}</p>`),
      dataView: wrapContent(`<h1>${text}</h1>`),
    },
    {
      name: "HEADING#3: Should prefer higher heading class and keep unrelated classes.",
      direction: Direction.toDataView,
      data: wrapContent(`<p class="some-class p--heading-2 p--heading-1">${text}</p>`),
      dataView: wrapContent(`<h1 class="some-class">${text}</h1>`),
    },
    ...headingFixtures,
    ...invalidHeadingFixtures,
  ];

  allDataProcessingTests(data);
});
