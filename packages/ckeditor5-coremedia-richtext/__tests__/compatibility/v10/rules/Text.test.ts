/* eslint @typescript-eslint/naming-convention: off */
/* eslint-disable @typescript-eslint/no-floating-promises */

import "global-jsdom/register";
import { describe } from "node:test";
import { allDataProcessingTests, DataProcessingTestCase, Direction } from "../DataDrivenTests";
import { decodeEntity, encodeString, flatten } from "../Utils";

// noinspection HttpUrlsUsage
const ns_richtext = "http://www.coremedia.com/2003/richtext-1.0";
const ns_xlink = "http://www.w3.org/1999/xlink";
const whitespace = " \t\n";
const text = `Lorem${whitespace}Ipsum`;
const attr_link_external = "https://example.org/";
// noinspection XmlUnusedNamespaceDeclaration
const emptyRichText = `<div xmlns="${ns_richtext}" xmlns:xlink="${ns_xlink}"/>`;
// noinspection XmlUnusedNamespaceDeclaration
const wrapContent = (content: string): string =>
  `<div xmlns="${ns_richtext}" xmlns:xlink="${ns_xlink}">${content}</div>`;

describe("CoreMediaRichTextConfig: Text Fixtures", () => {
  const textEntityFixtures: DataProcessingTestCase[] = flatten(
    [
      "&nbsp;",
      "&quot;",
      "&cent;",
      "&plusmn;",
      "&Alpha;",
      "&piv;",
      "&bull;",
      "&hellip;",
      "&trade;",
      "&harr;",
      "&sum;",
      "&loz;",
    ].map((entity, index): DataProcessingTestCase[] => {
      const dataView = wrapContent(`<p>${text}${encodeString(entity)}${text}</p>`);
      const dataFromDataView = wrapContent(`<p>${text}${decodeEntity(entity)}${text}</p>`);
      // Don't transform already decoded entities again.
      const dataViewFromData = dataFromDataView;
      const name = `TEXT/ENTITY#${index + 1}: Entity should be resolved to plain character: ${entity}`;
      return [
        {
          name,
          direction: Direction.toData,
          data: dataFromDataView,
          dataView,
        },
        {
          name,
          direction: Direction.toDataView,
          comment:
            "toView: We don't want to introduce entities again - just because we cannot distinguish the source. General contract should be: Always use UTF-8 characters.",
          data: dataFromDataView,
          dataView: dataViewFromData,
        },
      ];
    }),
  );

  const textCoreEntityFixtures: DataProcessingTestCase[] = ["&gt;", "&lt;", "&amp;"].map((entity, index) => ({
    name: `TEXT/CORE_ENTITY#${index + 1}: Core Entity should be kept as is: ${entity}`,
    direction: Direction.toData,
    comment: "toView: In contrast to other entities, we must keep core entities, as otherwise XML may break.",
    data: wrapContent(`<p>${text}${entity}${text}</p>`),
    dataView: wrapContent(`<p>${text}${entity}${text}</p>`),
  }));

  // noinspection HtmlUnknownAttribute,XmlUnusedNamespaceDeclaration
  const data: DataProcessingTestCase[] = [
    {
      name: "TEXT#1: Should remove text at root DIV.",
      direction: Direction.toData,
      data: emptyRichText,
      dataView: wrapContent(`${text}`),
    },
    {
      name: "TEXT#2: Should keep text at P.",
      direction: Direction.toData,
      data: wrapContent(`<p>${text}</p>`),
      dataView: wrapContent(`<p>${text}</p>`),
    },
    {
      name: "TEXT#3: Should remove text at UL (and remove empty UL).",
      direction: Direction.toData,
      data: emptyRichText,
      dataView: wrapContent(`<ul>${text}</ul>`),
    },
    {
      name: "TEXT#4: Should remove text at OL (and remove empty OL).",
      direction: Direction.toData,
      data: emptyRichText,
      dataView: wrapContent(`<ol>${text}</ol>`),
    },
    {
      name: "TEXT#5: Should keep text at LI.",
      data: wrapContent(`<ol><li>${text}</li></ol>`),
      dataView: wrapContent(`<ol><li>${text}</li></ol>`),
    },
    {
      name: "TEXT#6: Should keep text at PRE.",
      data: wrapContent(`<pre>${text}</pre>`),
      dataView: wrapContent(`<pre>${text}</pre>`),
    },
    {
      name: "TEXT#7: Should remove text at BLOCKQUOTE.",
      direction: Direction.toData,
      comment: `CoreMedia RichText DTD requires blockquotes to contain for example <p> as nested element. As CKEditor by default adds a paragraph to blockquotes, we don't need any 'fix' such as surrounding the text by a paragraph.`,
      data: wrapContent(`<blockquote/>`),
      dataView: wrapContent(`<blockquote>${text}</blockquote>`),
    },
    {
      name: "TEXT#8: Should keep text at A.",
      data: wrapContent(`<p><a xlink:href="${attr_link_external}">${text}</a></p>`),
      dataView: wrapContent(`<p><a href="${attr_link_external}">${text}</a></p>`),
    },
    {
      name: "TEXT#9: Should keep text at SPAN.",
      data: wrapContent(`<p><span class="CLASS">${text}</span></p>`),
      dataView: wrapContent(`<p><span class="CLASS">${text}</span></p>`),
    },
    {
      name: "TEXT#10: Should remove text at BR.",
      direction: Direction.toData,
      data: wrapContent(`<p>${text}<br/>${text}</p>`),
      dataView: wrapContent(`<p>${text}<br>${text}</br>${text}</p>`),
    },
    {
      name: "TEXT#11: Should keep text at EM.",
      data: wrapContent(`<p><em>${text}</em></p>`),
      dataView: wrapContent(`<p><i>${text}</i></p>`),
    },
    {
      name: "TEXT#12: Should keep text at STRONG.",
      data: wrapContent(`<p><strong>${text}</strong></p>`),
      dataView: wrapContent(`<p><strong>${text}</strong></p>`),
    },
    {
      name: "TEXT#13: Should keep text at SUB.",
      data: wrapContent(`<p><sub>${text}</sub></p>`),
      dataView: wrapContent(`<p><sub>${text}</sub></p>`),
    },
    {
      name: "TEXT#14: Should keep text at SUP.",
      data: wrapContent(`<p><sup>${text}</sup></p>`),
      dataView: wrapContent(`<p><sup>${text}</sup></p>`),
    },
    {
      name: "TEXT#15: Should remove text at IMG.",
      direction: Direction.toData,
      data: wrapContent(`<p><img alt="" xlink:href="${attr_link_external}"/></p>`),
      dataView: wrapContent(`<p><img alt="" src="SRC" data-xlink-href="${attr_link_external}">${text}</img></p>`),
    },
    {
      name: "TEXT#16: Should remove text at TABLE.",
      // TODO[cke] Fix Bug.
      skip: "For some unknown reason, the tbody element is removed in this case. Needs to be investigated.",
      direction: Direction.toData,
      data: wrapContent(`<table><tbody class="CLASS"><tr><td class="td--header">${text}</td></tr></tbody></table>`),
      dataView: wrapContent(`<table>${text}<tbody class="CLASS"><tr><th>${text}</th></tr></tbody>${text}</table>`),
    },
    {
      name: "TEXT#17: Should remove text at TBODY.",
      direction: Direction.toData,
      data: wrapContent(`<table><tbody><tr><td>${text}</td></tr></tbody></table>`),
      dataView: wrapContent(`<table><tbody>${text}<tr><td>${text}</td></tr>${text}</tbody></table>`),
    },
    {
      name: "TEXT#18: Should remove text at TR.",
      direction: Direction.toData,
      data: wrapContent(`<table><tbody><tr><td>${text}</td></tr></tbody></table>`),
      dataView: wrapContent(`<table><tr>${text}<td>${text}</td>${text}</tr></table>`),
    },
    {
      name: "TEXT#19: Should keep text at TD.",
      data: wrapContent(`<table><tbody><tr><td>${text}</td></tr></tbody></table>`),
      dataView: wrapContent(`<table><tbody><tr><td>${text}</td></tr></tbody></table>`),
    },
    ...textEntityFixtures,
    ...textCoreEntityFixtures,
  ];

  allDataProcessingTests(data);
});
