

import "global-jsdom/register";
import { describe } from "node:test";
import { allDataProcessingTests, DataProcessingTestCase, Direction } from "../DataDrivenTests";
import { flatten } from "../Utils";

// noinspection HttpUrlsUsage
const ns_richtext = "http://www.coremedia.com/2003/richtext-1.0";
const ns_xhtml = "http://www.w3.org/1999/xhtml";

// noinspection XmlUnusedNamespaceDeclaration
const wrapContent = (content: string): string => `<div xmlns="${ns_richtext}">${content}</div>`;

/**
 * CoreMedia RichText 1.0 Element Definition Reference for Tested Elements:
 *
 * ```
 * <!ELEMENT blockquote (p|ul|ol|pre|blockquote|table)* >
 * <!ATTLIST blockquote
 *   xml:lang NMTOKEN   #IMPLIED
 *   cite     CDATA     #IMPLIED
 *   dir      (ltr|rtl) #IMPLIED
 *   lang     NMTOKEN   #IMPLIED
 *   class    CDATA     #IMPLIED >
 *
 * <!ELEMENT p (#PCDATA|a|br|span|img|em|strong|sub|sup)* >
 * <!ATTLIST p
 *   xml:lang NMTOKEN   #IMPLIED
 *   dir      (ltr|rtl) #IMPLIED
 *   lang     NMTOKEN   #IMPLIED
 *   class    CDATA     #IMPLIED >
 *
 * <!ELEMENT pre (#PCDATA|a|br|span|em|strong|sub|sup)* >
 * <!ATTLIST pre
 *   xml:lang  NMTOKEN    #IMPLIED
 *   xml:space (preserve) #FIXED 'preserve'
 *   dir       (ltr|rtl)  #IMPLIED
 *   lang      NMTOKEN    #IMPLIED
 *   class     CDATA      #IMPLIED >
 * ```
 */
void describe("CoreMediaRichTextConfig: Miscellaneous Block Tags", () => {
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
        {
          name: `${key}#3: Should keep dir attribute.`,
          data: wrapContent(`<${el} dir="rtl"/>`),
          dataView: wrapContent(`<${el} dir="rtl"/>`),
        },
        {
          name: `${key}#4: Should transform xml:lang (data) to lang attribute (data view) back and forth.`,
          data: wrapContent(`<${el} xml:lang="en"/>`),
          dataView: wrapContent(`<${el} lang="en"/>`),
        },
        {
          name: `${key}#5: Should transform lang (data) to lang attribute (data view).`,
          direction: Direction.toDataView,
          comment:
            "CoreMedia RichText supports xml:lang as well as lang attribute. While preferring xml:lang for toData transformation, we have to respect lang attribute from data as well.",
          data: wrapContent(`<${el} lang="en"/>`),
          dataView: wrapContent(`<${el} lang="en"/>`),
        },
        {
          name: `${key}#6: Should prefer xml:lang over lang in data.`,
          direction: Direction.toDataView,
          comment: "As in HTML specification, xml:lang should take precedence, when both are given.",
          data: wrapContent(`<${el} lang="en" xml:lang="de"/>`),
          dataView: wrapContent(`<${el} lang="de"/>`),
        },
      ];
    }),
  );

  const data: DataProcessingTestCase[] = [
    ...defaultBlockFixtures,
    {
      name: `PRE#7: Should preserve xml:space attribute in data view. No transformation required, as HTML supports xml:space.`,
      data: wrapContent(`<pre xml:space="preserve"/>`),
      dataView: wrapContent(`<pre xml:space="preserve"/>`),
    },
    {
      name: `BLOCKQUOTE#7: Should preserve cite attribute in data view.`,
      data: wrapContent(`<blockquote cite="https://example.org/"/>`),
      dataView: wrapContent(`<blockquote cite="https://example.org/"/>`),
    },
  ];

  allDataProcessingTests(data);
});
