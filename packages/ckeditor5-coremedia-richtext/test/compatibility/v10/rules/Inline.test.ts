

import "global-jsdom/register";
import test, { describe } from "node:test";
import expect from "expect";
import { allDataProcessingTests, applyFilter, DataProcessingTestCase, Direction, getFilter } from "../DataDrivenTests";
import { flatten } from "../Utils";

// noinspection HttpUrlsUsage
const ns_richtext = "http://www.coremedia.com/2003/richtext-1.0";
const text = "TEXT";

// noinspection XmlUnusedNamespaceDeclaration
const wrapContent = (content: string): string => `<div xmlns="${ns_richtext}">${content}</div>`;

/**
 * CoreMedia RichText 1.0 Element Definition Reference for Tested Elements:
 *
 * ```
 * <!ELEMENT strong (#PCDATA|a|br|span|img|em|strong|sub|sup)* >
 * <!ATTLIST strong
 *   xml:lang NMTOKEN   #IMPLIED
 *   dir      (ltr|rtl) #IMPLIED
 *   lang     NMTOKEN   #IMPLIED
 *   class    CDATA     #IMPLIED >
 *
 * <!ELEMENT em (#PCDATA|a|br|span|img|em|strong|sub|sup)* >
 * <!ATTLIST em
 *   xml:lang NMTOKEN   #IMPLIED
 *   dir      (ltr|rtl) #IMPLIED
 *   lang     NMTOKEN   #IMPLIED
 *   class    CDATA     #IMPLIED >
 *
 * <!ELEMENT span (#PCDATA|a|br|span|img|em|strong|sub|sup)* >
 * <!ATTLIST span
 *   xml:lang NMTOKEN   #IMPLIED
 *   dir      (ltr|rtl) #IMPLIED
 *   lang     NMTOKEN   #IMPLIED
 *   class    CDATA     #IMPLIED >
 *
 * <!ATTLIST sub
 *   xml:lang NMTOKEN   #IMPLIED
 *   dir      (ltr|rtl) #IMPLIED
 *   lang     NMTOKEN   #IMPLIED
 *   class    CDATA     #IMPLIED >
 *
 * <!ELEMENT sup (#PCDATA|a|br|span|img|em|strong|sub|sup)* >
 * <!ATTLIST sup
 *   xml:lang NMTOKEN   #IMPLIED
 *   dir      (ltr|rtl) #IMPLIED
 *   lang     NMTOKEN   #IMPLIED
 *   class    CDATA     #IMPLIED >
 * ```
 */
void describe("CoreMediaRichTextConfig: Miscellaneous Inline Tags", () => {
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
      // noinspection HtmlUnknownAttribute
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
        {
          name: `${key}#3: Keep class attribute — View: <${view}> ${bijective ? "<" : ""}-> Data: <${data}>.`,
          direction: bijective ? Direction.both : Direction.toData,
          data: wrapContent(`<p><${data} class="CLASS">${text}</${data}></p>`),
          dataView: wrapContent(`<p><${view} class="CLASS">${text}</${view}></p>`),
        },
        {
          name: `${key}#4: Should keep <${data}> when transformed along with class attribute.`,
          direction: Direction.toData,
          data: wrapContent(`<p><${data} class="CLASS">${text}</${data}></p>`),
          dataView: wrapContent(`<p><${data} class="CLASS">${text}</${data}></p>`),
        },
        {
          name: `${key}#5: Keep dir attribute — View: <${view}> ${bijective ? "<" : ""}-> Data: <${data}>.`,
          direction: bijective ? Direction.both : Direction.toData,
          data: wrapContent(`<p><${data} dir="rtl">${text}</${data}></p>`),
          dataView: wrapContent(`<p><${view} dir="rtl">${text}</${view}></p>`),
        },
        {
          name: `${key}#6: Should keep <${data}> when transformed along with dir attribute.`,
          direction: Direction.toData,
          data: wrapContent(`<p><${data} dir="rtl">${text}</${data}></p>`),
          dataView: wrapContent(`<p><${data} dir="rtl">${text}</${data}></p>`),
        },
        {
          name: `${key}#5: Keep lang/xml:lang attribute — View: <${view}> ${bijective ? "<" : ""}-> Data: <${data}>.`,
          direction: bijective ? Direction.both : Direction.toData,
          data: wrapContent(`<p><${data} xml:lang="en">${text}</${data}></p>`),
          dataView: wrapContent(`<p><${view} lang="en">${text}</${view}></p>`),
        },
        {
          name: `${key}#6: Should keep <${data}> when transformed along with lang/xml:lang attribute.`,
          direction: Direction.toData,
          data: wrapContent(`<p><${data} xml:lang="en">${text}</${data}></p>`),
          dataView: wrapContent(`<p><${data} lang="en">${text}</${data}></p>`),
        },
      ];
    }),
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
      // noinspection HtmlUnknownAttribute
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
        {
          name: `${key}#3: Keep class attribute — View: <${view}> ${
            bijective ? "<" : ""
          }-> Data: by <span class="${dataClass}">.`,
          direction: bijective ? Direction.both : Direction.toData,
          data: wrapContent(`<p><span class="CLASS ${dataClass}">${text}</span></p>`),
          dataView: wrapContent(`<p><${view} class="CLASS">${text}</${view}></p>`),
        },
        {
          name: `${key}#4: Keep dir attribute — View: <${view}> ${
            bijective ? "<" : ""
          }-> Data: by <span class="${dataClass}">.`,
          direction: bijective ? Direction.both : Direction.toData,
          data: wrapContent(`<p><span dir="rtl" class="${dataClass}">${text}</span></p>`),
          dataView: wrapContent(`<p><${view} dir="rtl">${text}</${view}></p>`),
        },
        {
          name: `${key}#4: Keep lang/xml:lang attribute — View: <${view}> ${
            bijective ? "<" : ""
          }-> Data: by <span class="${dataClass}">.`,
          direction: bijective ? Direction.both : Direction.toData,
          data: wrapContent(`<p><span class="${dataClass}" xml:lang="en">${text}</span></p>`),
          dataView: wrapContent(`<p><${view} lang="en">${text}</${view}></p>`),
        },
      ];
    }),
  );

  const asIsFixtures: DataProcessingTestCase[] = flatten(
    ["span", "sub", "sup"].map((el): DataProcessingTestCase[] => {
      const key = el.toUpperCase();
      // noinspection HtmlUnknownAttribute
      return [
        {
          name: `${key}#1: Should Map Element Identically.`,
          data: wrapContent(`<p><${el}>${text}</${el}></p>`),
          dataView: wrapContent(`<p><${el}>${text}</${el}></p>`),
        },
        {
          name: `${key}#2: Keep class attribute.`,
          data: wrapContent(`<p><${el} class="CLASS">${text}</${el}></p>`),
          dataView: wrapContent(`<p><${el} class="CLASS">${text}</${el}></p>`),
        },
        {
          name: `${key}#3: Keep dir attribute.`,
          data: wrapContent(`<p><${el} dir="rtl">${text}</${el}></p>`),
          dataView: wrapContent(`<p><${el} dir="rtl">${text}</${el}></p>`),
        },
        {
          name: `${key}#4: Keep lang/xml:lang attribute.`,
          data: wrapContent(`<p><${el} xml:lang="en">${text}</${el}></p>`),
          dataView: wrapContent(`<p><${el} lang="en">${text}</${el}></p>`),
        },
        {
          name: `${key}#5: Should transform lang (data) to lang attribute (data view).`,
          direction: Direction.toDataView,
          data: wrapContent(`<p><${el} lang="en">${text}</${el}></p>`),
          dataView: wrapContent(`<p><${el} lang="en">${text}</${el}></p>`),
        },
        {
          name: `${key}#6: Should prefer xml:lang over lang in data.`,
          silent: true,
          direction: Direction.toDataView,
          data: wrapContent(`<p><${el} lang="en" xml:lang="de">${text}</${el}></p>`),
          dataView: wrapContent(`<p><${el} lang="de">${text}</${el}></p>`),
        },
      ];
    }),
  );

  const data: DataProcessingTestCase[] = [
    ...replaceInlineSimpleFixtures,
    ...replaceInlineBySpanFixtures,
    ...asIsFixtures,
  ];

  allDataProcessingTests(data);

  void describe("Ambiguous States", () => {
    const cases = [
      { classes: "strike underline", remainingClasses: [] },
      { classes: "underline strike", remainingClasses: [] },
      { classes: "underline strike custom", remainingClasses: ["custom"] },
      { classes: "underline custom strike", remainingClasses: ["custom"] },
      { classes: "custom underline strike", remainingClasses: ["custom"] },
      { classes: "c1 underline c2 strike c3", remainingClasses: ["c1", "c2", "c3"] },
    ];

    for (const [index, { classes, remainingClasses }] of cases.entries()) {
      void test(`[${index}] Should map ambiguous <span class="${classes}"> to either <u> or <s> keeping possibly remaining classes.`, () => {
        const filter = getFilter(Direction.toDataView);
        const input = wrapContent(`<p><span class="${classes}">${text}</span></p>`);
        // silent: We expect a warning here. Don't show it in tests.
        const actual = applyFilter(filter, input, true);
        if (remainingClasses.length > 0) {
          expect(actual).toMatch(/<([us]) class=[^>]+>[^<]*<\/\1>/);
          for (const remainingClass of remainingClasses) {
            expect(actual).toContain(remainingClass);
          }
        } else {
          // Either <u> or <s>
          expect(actual).toMatch(/<([us])>[^<]*<\/\1>/);
        }
      });
    }
  });
});
