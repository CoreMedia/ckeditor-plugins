

import "global-jsdom/register";
import { describe } from "node:test";
import { allDataProcessingTests, DataProcessingTestCase, Direction } from "../DataDrivenTests";

// noinspection HttpUrlsUsage
const ns_richtext = "http://www.coremedia.com/2003/richtext-1.0";
const text = "TEXT";

// noinspection XmlUnusedNamespaceDeclaration
const wrapContent = (content: string): string => `<div xmlns="${ns_richtext}">${content}</div>`;

/**
 * CoreMedia RichText 1.0 Element Definition Reference for Tested Elements:
 *
 * ```
 * <!ELEMENT div (p|ul|ol|pre|blockquote|table)* >
 * <!ATTLIST div
 *   xmlns       CDATA #FIXED 'http://www.coremedia.com/2003/richtext-1.0'
 *   xmlns:xlink CDATA #FIXED 'http://www.w3.org/1999/xlink' >
 *
 * <!ELEMENT br EMPTY >
 * <!ATTLIST br
 *   class CDATA #IMPLIED >
 * ```
 */
void describe("CoreMediaRichTextConfig: Miscellaneous", () => {
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
  ];

  allDataProcessingTests(data);
});
