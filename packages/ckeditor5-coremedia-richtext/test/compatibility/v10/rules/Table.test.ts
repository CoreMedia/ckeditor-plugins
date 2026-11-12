import "global-jsdom/register";
import { describe } from "node:test";
import type { DataProcessingTestCase } from "../DataDrivenTests";
import { allDataProcessingTests, Direction } from "../DataDrivenTests";
// noinspection HttpUrlsUsage
const ns_richtext = "http://www.coremedia.com/2003/richtext-1.0";
const text = "TEXT";
const emptyRichText = `<div xmlns="${ns_richtext}"/>`;

// noinspection XmlUnusedNamespaceDeclaration
const wrapContent = (content: string): string => `<div xmlns="${ns_richtext}">${content}</div>`;

/**
 * CoreMedia RichText 1.0 Element Definition Reference for Tested Elements:
 *
 * ```
 * <!ELEMENT table (tbody|tr+) >
 * <!ATTLIST table
 *   xml:lang NMTOKEN #IMPLIED
 *   dir      (ltr|rtl) #IMPLIED
 *   lang     NMTOKEN   #IMPLIED
 *   class    CDATA     #IMPLIED
 *   summary  CDATA     #IMPLIED >
 *
 * <!ELEMENT tbody (tr)+ >
 * <!ATTLIST tbody
 *   xml:lang NMTOKEN #IMPLIED
 *   dir      (ltr|rtl)                    #IMPLIED
 *   align    (left|center|right)          #IMPLIED
 *   valign   (top|middle|bottom|baseline) #IMPLIED
 *   lang     NMTOKEN                      #IMPLIED
 *   class    CDATA                        #IMPLIED >
 *
 * <!ELEMENT td (#PCDATA|p|ul|ol|pre|blockquote|table|a|br|span|img|em|strong|sub|sup)* >
 * <!ATTLIST td
 *   abbr     CDATA                        #IMPLIED
 *   xml:lang NMTOKEN                      #IMPLIED
 *   colspan  CDATA                        '1'
 *   dir      (ltr|rtl)                    #IMPLIED
 *   align    (left|center|right)          #IMPLIED
 *   rowspan  CDATA                        '1'
 *   valign   (top|middle|bottom|baseline) #IMPLIED
 *   lang     NMTOKEN                      #IMPLIED
 *   class    CDATA                        #IMPLIED >
 *
 * <!ELEMENT tr (td)+ >
 * <!ATTLIST tr
 *   xml:lang NMTOKEN                      #IMPLIED
 *   dir      (ltr|rtl)                    #IMPLIED
 *   align    (left|center|right)          #IMPLIED
 *   valign   (top|middle|bottom|baseline) #IMPLIED
 *   lang     NMTOKEN                      #IMPLIED
 *   class    CDATA                        #IMPLIED >
 * ```
 */
void describe("CoreMediaRichTextConfig: Table", () => {
  const elementMapping = [
    {
      name: "TABLE#01: Empty table should be removed, as it is invalid.",
      direction: Direction.toData,
      data: emptyRichText,
      dataView: wrapContent(`<table/>`),
    },
    {
      name: "TABLE#02: tbody should be added if missing.",
      direction: Direction.toData,
      comment:
        "This is a design decision which eases data-processing implementation. If this is unexpected, it may be changed.",
      data: wrapContent(`<table><tbody><tr><td>${text}</td></tr></tbody></table>`),
      dataView: wrapContent(`<table><tr><td>${text}</td></tr></table>`),
    },
    {
      name: "TABLE#03: thead should be transformed as being part of tbody.",
      comment:
        "ckeditor/ckeditor5#9360: We must try at best effort to keep information about rows which are meant to be part of thead.",
      data: wrapContent(
        `<table><tbody><tr class="tr--header"><td class="td--header">${text}</td></tr></tbody></table>`,
      ),
      dataView: wrapContent(`<table><thead><tr><th>${text}</th></tr></thead></table>`),
    },
    {
      name: "TABLE#04: tbody should be kept as is.",
      data: wrapContent(`<table><tbody><tr><td>${text}</td></tr></tbody></table>`),
      dataView: wrapContent(`<table><tbody><tr><td>${text}</td></tr></tbody></table>`),
    },
    {
      name: "TABLE#05: thead should merge into tbody",
      comment:
        "One contract is, that thead merges into existing tbody, so that e.g. class attributes at tbody are kept.",
      data: wrapContent(
        `<table><tbody class="CLASS"><tr class="tr--header"><td>Head</td></tr><tr><td>Body</td></tr></tbody></table>`,
      ),
      dataView: wrapContent(
        `<table><thead><tr><td>Head</td></tr></thead><tbody class="CLASS"><tr><td>Body</td></tr></tbody></table>`,
      ),
    },
    {
      name: "TABLE#06: th should be transformed to td with class.",
      data: wrapContent(`<table><tbody><tr><td class="td--header">Head</td></tr></tbody></table>`),
      dataView: wrapContent(`<table><tbody><tr><th>Head</th></tr></tbody></table>`),
    },
    {
      name: "TABLE#07: Should remove figure around table. By default CKEditor 5 adds a figure around table.",
      direction: Direction.toData,
      data: wrapContent(`<table><tbody><tr><td>Body</td></tr></tbody></table>`),
      dataView: wrapContent(`<figure><table><tbody><tr><td>Body</td></tr></tbody></table></figure>`),
    },
    {
      name: "TABLE#08: Should remove empty tbody, and thus empty table.",
      direction: Direction.toData,
      data: emptyRichText,
      dataView: wrapContent(`<table><tbody/></table>`),
    },
    {
      name: "TABLE#09: Should remove empty tr, and thus empty tbody, and thus empty table.",
      direction: Direction.toData,
      data: emptyRichText,
      dataView: wrapContent(`<table><tbody><tr/></tbody></table>`),
    },
    {
      name: "TABLE#10: Should keep empty td.",
      data: wrapContent(`<table><tbody><tr><td/></tr></tbody></table>`),
      dataView: wrapContent(`<table><tbody><tr><td/></tr></tbody></table>`),
    },
    {
      name: "TABLE#11: Should keep td with several children.",
      data: wrapContent(`<table><tbody><tr><td><p>${text}</p><p>${text}</p></td></tr></tbody></table>`),
      dataView: wrapContent(`<table><tbody><tr><td><p>${text}</p><p>${text}</p></td></tr></tbody></table>`),
    },
    {
      name: "TABLE#12: Should remove singleton br in td.",
      direction: Direction.toData,
      comment: "This is the behavior of CoreMedia RichText with CKEditor 4.",
      data: wrapContent(`<table><tbody><tr><td/></tr></tbody></table>`),
      dataView: wrapContent(`<table><tbody><tr><td><br/></td></tr></tbody></table>`),
    },
    {
      name: "TABLE#13: Should remove singleton p in td.",
      direction: Direction.toData,
      comment: "This is the behavior of CoreMedia RichText with CKEditor 4.",
      data: wrapContent(`<table><tbody><tr><td/></tr></tbody></table>`),
      dataView: wrapContent(`<table><tbody><tr><td><p/></td></tr></tbody></table>`),
    },
    {
      name: "TABLE#14: Should remove singleton p in td if it only contains br.",
      direction: Direction.toData,
      comment: "This is the behavior of CoreMedia RichText with CKEditor 4.",
      data: wrapContent(`<table><tbody><tr><td/></tr></tbody></table>`),
      dataView: wrapContent(`<table><tbody><tr><td><p><br/></p></td></tr></tbody></table>`),
    },
    {
      name: "TABLE#15: Should not remove singleton p in td if it contains text.",
      data: wrapContent(`<table><tbody><tr><td><p>${text}</p></td></tr></tbody></table>`),
      dataView: wrapContent(`<table><tbody><tr><td><p>${text}</p></td></tr></tbody></table>`),
    },
    {
      name: "TABLE#16: th should be transformed to td with class and continue with normal tds.",
      data: wrapContent(
        `<table><tbody><tr><td class="td--header">Head</td></tr><tr><td>Data</td></tr></tbody></table>`,
      ),
      dataView: wrapContent(`<table><tbody><tr><th>Head</th></tr><tr><td>Data</td></tr></tbody></table>`),
    },
    {
      name: "TABLE#17: tfoot should be transformed and merged to tbody.",
      comment: "tfoot in CKEditor 5 24.x is not supported in view and will be merged to tbody.",
      data: wrapContent(`<table><tbody><tr class="tr--footer"><td class="td--header">Foot</td></tr></tbody></table>`),
      dataView: wrapContent(`<table><tfoot><tr><th>Foot</th></tr></tfoot></table>`),
    },
    {
      name: "TABLE#18: Multiple tbodies should be merged into first.",
      direction: Direction.toData,
      comment:
        "HTML may provide multiple tbodies, CoreMedia RichText may only have one. Design decision: Only keep attributes of first tbody.",
      data: wrapContent(`<table><tbody class="body1"><tr><td>Body 1</td></tr><tr><td>Body 2</td></tr></tbody></table>`),
      dataView: wrapContent(
        `<table><tbody class="body1"><tr><td>Body 1</td></tr></tbody><tbody class="body2"><tr><td>Body 2</td></tr></tbody></table>`,
      ),
    },
  ];

  const tableAttributes: DataProcessingTestCase[] = [
    {
      name: `TABLE/ATTRIBUTES#1: Should keep class attribute.`,
      data: wrapContent(`<table class="CLASS"><tbody><tr><td>${text}</td></tr></tbody></table>`),
      dataView: wrapContent(`<table class="CLASS"><tbody><tr><td>${text}</td></tr></tbody></table>`),
    },
    {
      name: `TABLE/ATTRIBUTES#2: Should keep dir attribute.`,
      data: wrapContent(`<table dir="rtl"><tbody><tr><td>${text}</td></tr></tbody></table>`),
      dataView: wrapContent(`<table dir="rtl"><tbody><tr><td>${text}</td></tr></tbody></table>`),
    },
    {
      name: `TABLE/ATTRIBUTES#3: Should transform xml:lang (data) to lang attribute (data view) back and forth.`,
      data: wrapContent(`<table xml:lang="en"><tbody><tr><td>${text}</td></tr></tbody></table>`),
      dataView: wrapContent(`<table lang="en"><tbody><tr><td>${text}</td></tr></tbody></table>`),
    },
    {
      name: `TABLE/ATTRIBUTES#4: Should transform lang (data) to lang attribute (data view).`,
      direction: Direction.toDataView,
      comment:
        "CoreMedia RichText supports xml:lang as well as lang attribute. While preferring xml:lang for toData transformation, we have to respect lang attribute from data as well.",
      data: wrapContent(`<table lang="en"><tbody><tr><td>${text}</td></tr></tbody></table>`),
      dataView: wrapContent(`<table lang="en"><tbody><tr><td>${text}</td></tr></tbody></table>`),
    },
    {
      name: `TABLE/ATTRIBUTES#5: Should prefer xml:lang over lang in data.`,
      direction: Direction.toDataView,
      comment: "As in HTML specification, xml:lang should take precedence, when both are given.",
      data: wrapContent(`<table lang="en" xml:lang="de"><tbody><tr><td>${text}</td></tr></tbody></table>`),
      dataView: wrapContent(`<table lang="de"><tbody><tr><td>${text}</td></tr></tbody></table>`),
    },
    {
      name: `TABLE/ATTRIBUTES#6: Should keep summary attribute.`,
      comment:
        "`summary` is deprecated in HTML and `<caption>` should be used instead. Introducing a corresponding mapping in data-processing has not been introduced yet. Thus, this test is subject to change.",
      data: wrapContent(`<table summary="SUMMARY"><tbody><tr><td>${text}</td></tr></tbody></table>`),
      dataView: wrapContent(`<table summary="SUMMARY"><tbody><tr><td>${text}</td></tr></tbody></table>`),
    },
  ];

  const tbodyAttributes: DataProcessingTestCase[] = [
    {
      name: `TBODY/ATTRIBUTES#1: Should keep class attribute.`,
      data: wrapContent(`<table><tbody class="CLASS"><tr><td>${text}</td></tr></tbody></table>`),
      dataView: wrapContent(`<table><tbody class="CLASS"><tr><td>${text}</td></tr></tbody></table>`),
    },
    {
      name: `TBODY/ATTRIBUTES#2: Should keep dir attribute.`,
      data: wrapContent(`<table><tbody dir="rtl"><tr><td>${text}</td></tr></tbody></table>`),
      dataView: wrapContent(`<table><tbody dir="rtl"><tr><td>${text}</td></tr></tbody></table>`),
    },
    {
      name: `TBODY/ATTRIBUTES#3: Should transform xml:lang (data) to lang attribute (data view) back and forth.`,
      data: wrapContent(`<table><tbody xml:lang="en"><tr><td>${text}</td></tr></tbody></table>`),
      dataView: wrapContent(`<table><tbody lang="en"><tr><td>${text}</td></tr></tbody></table>`),
    },
    {
      name: `TBODY/ATTRIBUTES#4: Should transform lang (data) to lang attribute (data view).`,
      direction: Direction.toDataView,
      comment:
        "CoreMedia RichText supports xml:lang as well as lang attribute. While preferring xml:lang for toData transformation, we have to respect lang attribute from data as well.",
      data: wrapContent(`<table><tbody lang="en"><tr><td>${text}</td></tr></tbody></table>`),
      dataView: wrapContent(`<table><tbody lang="en"><tr><td>${text}</td></tr></tbody></table>`),
    },
    {
      name: `TBODY/ATTRIBUTES#5: Should prefer xml:lang over lang in data.`,
      direction: Direction.toDataView,
      comment: "As in HTML specification, xml:lang should take precedence, when both are given.",
      data: wrapContent(`<table><tbody lang="en" xml:lang="de"><tr><td>${text}</td></tr></tbody></table>`),
      dataView: wrapContent(`<table><tbody lang="de"><tr><td>${text}</td></tr></tbody></table>`),
    },
    {
      name: `TBODY/ATTRIBUTES#6: Should keep align attribute.`,
      comment:
        "As `align` is deprecated, we may instead think about mapping from/to corresponding text-align style attribute.",
      data: wrapContent(`<table><tbody align="center"><tr><td>${text}</td></tr></tbody></table>`),
      dataView: wrapContent(`<table><tbody align="center"><tr><td>${text}</td></tr></tbody></table>`),
    },
    {
      name: `TBODY/ATTRIBUTES#6: Should keep valign attribute.`,
      comment:
        "As `valign` is deprecated, we may instead think about mapping from/to corresponding vertical-align style attribute.",
      data: wrapContent(`<table><tbody valign="bottom"><tr><td>${text}</td></tr></tbody></table>`),
      dataView: wrapContent(`<table><tbody valign="bottom"><tr><td>${text}</td></tr></tbody></table>`),
    },
  ];

  const tableRowAttributes: DataProcessingTestCase[] = [
    {
      name: `TR/ATTRIBUTES#1: Should keep class attribute.`,
      data: wrapContent(`<table><tbody><tr class="CLASS"><td>${text}</td></tr></tbody></table>`),
      dataView: wrapContent(`<table><tbody><tr class="CLASS"><td>${text}</td></tr></tbody></table>`),
    },
    {
      name: `TR/ATTRIBUTES#2: Should keep dir attribute.`,
      data: wrapContent(`<table><tbody><tr dir="rtl"><td>${text}</td></tr></tbody></table>`),
      dataView: wrapContent(`<table><tbody><tr dir="rtl"><td>${text}</td></tr></tbody></table>`),
    },
    {
      name: `TR/ATTRIBUTES#3: Should transform xml:lang (data) to lang attribute (data view) back and forth.`,
      data: wrapContent(`<table><tbody><tr xml:lang="en"><td>${text}</td></tr></tbody></table>`),
      dataView: wrapContent(`<table><tbody><tr lang="en"><td>${text}</td></tr></tbody></table>`),
    },
    {
      name: `TR/ATTRIBUTES#4: Should transform lang (data) to lang attribute (data view).`,
      direction: Direction.toDataView,
      comment:
        "CoreMedia RichText supports xml:lang as well as lang attribute. While preferring xml:lang for toData transformation, we have to respect lang attribute from data as well.",
      data: wrapContent(`<table><tbody><tr lang="en"><td>${text}</td></tr></tbody></table>`),
      dataView: wrapContent(`<table><tbody><tr lang="en"><td>${text}</td></tr></tbody></table>`),
    },
    {
      name: `TR/ATTRIBUTES#5: Should prefer xml:lang over lang in data.`,
      direction: Direction.toDataView,
      comment: "As in HTML specification, xml:lang should take precedence, when both are given.",
      data: wrapContent(`<table><tbody><tr lang="en" xml:lang="de"><td>${text}</td></tr></tbody></table>`),
      dataView: wrapContent(`<table><tbody><tr lang="de"><td>${text}</td></tr></tbody></table>`),
    },
    {
      name: `TR/ATTRIBUTES#6: Should keep align attribute.`,
      comment:
        "As `align` is deprecated, we may instead think about mapping from/to corresponding text-align style attribute.",
      data: wrapContent(`<table><tbody><tr align="center"><td>${text}</td></tr></tbody></table>`),
      dataView: wrapContent(`<table><tbody><tr align="center"><td>${text}</td></tr></tbody></table>`),
    },
    {
      name: `TR/ATTRIBUTES#7: Should keep valign attribute.`,
      comment:
        "As `valign` is deprecated, we may instead think about mapping from/to corresponding vertical-align style attribute.",
      data: wrapContent(`<table><tbody><tr valign="bottom"><td>${text}</td></tr></tbody></table>`),
      dataView: wrapContent(`<table><tbody><tr valign="bottom"><td>${text}</td></tr></tbody></table>`),
    },
  ];

  const tableDataAttributes: DataProcessingTestCase[] = [
    {
      name: `TD/ATTRIBUTES#1: Should keep class attribute.`,
      data: wrapContent(`<table><tbody><tr><td class="CLASS">${text}</td></tr></tbody></table>`),
      dataView: wrapContent(`<table><tbody><tr><td class="CLASS">${text}</td></tr></tbody></table>`),
    },
    {
      name: `TD/ATTRIBUTES#2: Should keep dir attribute.`,
      data: wrapContent(`<table><tbody><tr><td dir="rtl">${text}</td></tr></tbody></table>`),
      dataView: wrapContent(`<table><tbody><tr><td dir="rtl">${text}</td></tr></tbody></table>`),
    },
    {
      name: `TD/ATTRIBUTES#3: Should transform xml:lang (data) to lang attribute (data view) back and forth.`,
      data: wrapContent(`<table><tbody><tr><td xml:lang="en">${text}</td></tr></tbody></table>`),
      dataView: wrapContent(`<table><tbody><tr><td lang="en">${text}</td></tr></tbody></table>`),
    },
    {
      name: `TD/ATTRIBUTES#4: Should transform lang (data) to lang attribute (data view).`,
      direction: Direction.toDataView,
      comment:
        "CoreMedia RichText supports xml:lang as well as lang attribute. While preferring xml:lang for toData transformation, we have to respect lang attribute from data as well.",
      data: wrapContent(`<table><tbody><tr><td lang="en">${text}</td></tr></tbody></table>`),
      dataView: wrapContent(`<table><tbody><tr><td lang="en">${text}</td></tr></tbody></table>`),
    },
    {
      name: `TD/ATTRIBUTES#5: Should prefer xml:lang over lang in data.`,
      direction: Direction.toDataView,
      comment: "As in HTML specification, xml:lang should take precedence, when both are given.",
      data: wrapContent(`<table><tbody><tr><td lang="en" xml:lang="de">${text}</td></tr></tbody></table>`),
      dataView: wrapContent(`<table><tbody><tr><td lang="de">${text}</td></tr></tbody></table>`),
    },
    {
      name: `TD/ATTRIBUTES#6: Should keep align attribute.`,
      comment:
        "As `align` is deprecated, we may instead think about mapping from/to corresponding text-align style attribute.",
      data: wrapContent(`<table><tbody><tr><td align="center">${text}</td></tr></tbody></table>`),
      dataView: wrapContent(`<table><tbody><tr><td align="center">${text}</td></tr></tbody></table>`),
    },
    {
      name: `TD/ATTRIBUTES#7: Should keep valign attribute.`,
      comment:
        "As `valign` is deprecated, we may instead think about mapping from/to corresponding vertical-align style attribute.",
      data: wrapContent(`<table><tbody><tr><td valign="bottom">${text}</td></tr></tbody></table>`),
      dataView: wrapContent(`<table><tbody><tr><td valign="bottom">${text}</td></tr></tbody></table>`),
    },
    {
      name: `TD/ATTRIBUTES#8: Should keep colspan attribute.`,
      data: wrapContent(`<table><tbody><tr><td colspan="2">${text}</td></tr></tbody></table>`),
      dataView: wrapContent(`<table><tbody><tr><td colspan="2">${text}</td></tr></tbody></table>`),
    },
    {
      name: `TD/ATTRIBUTES#9: Should keep rowspan attribute.`,
      data: wrapContent(`<table><tbody><tr><td rowspan="2">${text}</td></tr></tbody></table>`),
      dataView: wrapContent(`<table><tbody><tr><td rowspan="2">${text}</td></tr></tbody></table>`),
    },
    {
      name: `TD/ATTRIBUTES#9: Should keep abbr attribute.`,
      comment:
        "abbr is deprecated. An alternative mapping in data-processing does not exist yet. If, it should be aligned with corresponding editing actions in CKEditor.",
      data: wrapContent(`<table><tbody><tr><td abbr="ABBR">${text}</td></tr></tbody></table>`),
      dataView: wrapContent(`<table><tbody><tr><td abbr="ABBR">${text}</td></tr></tbody></table>`),
    },
  ];

  const data: DataProcessingTestCase[] = [
    ...elementMapping,
    ...tableAttributes,
    ...tbodyAttributes,
    ...tableRowAttributes,
    ...tableDataAttributes,
  ];

  allDataProcessingTests(data);
});
