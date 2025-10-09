// noinspection HtmlUnknownAttribute,HtmlRequiredAltAttribute

import "global-jsdom/register";
import test, { describe } from "node:test";
import * as aut from "../../src/rules/ImageElements";
import { richtext } from "@coremedia-internal/ckeditor5-coremedia-example-data";
import { bijective, TestDirection, toData } from "./TestDirection";
import { INLINE_IMG } from "../../src/rules/ImageElements";
import { RulesTester } from "./RulesTester";

void describe("ImageElements", () => {
  const ruleConfigurations = [aut.imageElements];
  const imgHref = "content/0#properties.data";
  const someImageUrl = "https://e.org/external.webp";

  const testCases: { data: string; direction: TestDirection; view: string }[] = [
    {
      data: `<p><img alt="" xlink:href="${imgHref}"/></p>`,
      direction: bijective,
      view: `<p><img alt="" data-xlink-href="${imgHref}" src="${INLINE_IMG}"/></p>`,
    },
    {
      data: `<p><img alt="ALT" xlink:href="${imgHref}"/></p>`,
      direction: bijective,
      view: `<p><img alt="ALT" data-xlink-href="${imgHref}" src="${INLINE_IMG}"/></p>`,
    },
    {
      data: `<p><img xlink:href="${imgHref}" alt=""/></p>`,
      direction: toData,
      view: `<p><img data-xlink-href="${imgHref}" src="${INLINE_IMG}"/></p>`,
    },
    {
      data: `<p><img alt="" height="42" xlink:href="${imgHref}"/></p>`,
      direction: bijective,
      view: `<p><img alt="" height="42" data-xlink-href="${imgHref}" src="${INLINE_IMG}"/></p>`,
    },
    {
      data: `<p><img alt="" width="42" xlink:href="${imgHref}"/></p>`,
      direction: bijective,
      view: `<p><img alt="" width="42" data-xlink-href="${imgHref}" src="${INLINE_IMG}"/></p>`,
    },
    {
      data: `<p></p>`,
      direction: toData,
      view: `<p><img alt="Missing required data-xlink-href" src="${someImageUrl}"/></p>`,
    },
    {
      data: `<p><img alt="" xlink:type="simple" xlink:href="${imgHref}"/></p>`,
      direction: bijective,
      view: `<p><img alt="" data-xlink-type="simple" data-xlink-href="${imgHref}" src="${INLINE_IMG}"/></p>`,
    },
    {
      data: `<p><img alt="" xlink:href="${imgHref}" xlink:role="ROLE" /></p>`,
      direction: bijective,
      view: `<p><img alt="" data-xlink-href="${imgHref}" data-xlink-role="ROLE" src="${INLINE_IMG}"/></p>`,
    },
    {
      data: `<p><img alt="" xlink:href="${imgHref}" xlink:title="TITLE"/></p>`,
      direction: bijective,
      view: `<p><img alt="" data-xlink-href="${imgHref}" data-xlink-title="TITLE" src="${INLINE_IMG}"/></p>`,
    },
    {
      data: `<p><img alt="" xlink:href="${imgHref}" xlink:show="embed"/></p>`,
      direction: bijective,
      view: `<p><img alt="" data-xlink-href="${imgHref}" data-xlink-show="embed" src="${INLINE_IMG}"/></p>`,
    },
    {
      data: `<p><img alt="" xlink:href="${imgHref}" xlink:actuate="onLoad" /></p>`,
      direction: bijective,
      view: `<p><img alt="" data-xlink-href="${imgHref}" data-xlink-actuate="onLoad" src="${INLINE_IMG}"/></p>`,
    },
  ];

  for (const [index, { data, direction, view }] of testCases.entries()) {
    void test(`[${index}] Should provide mapping from data ${direction} view: ${data} ${direction} ${view}`, () => {
      const dataString = richtext(data);
      const htmlString = `<body>${view}</body>`;
      const tester = new RulesTester(ruleConfigurations, "p", "p");

      tester.executeTests({
        dataString,
        direction,
        htmlString,
      });
    });
  }
});
