// noinspection HtmlUnknownAttribute

import { describe } from "node:test";
import { richtext } from "@coremedia-internal/ckeditor5-coremedia-example-data";
import * as aut from "../../src/rules/DefaultRules";
import { INLINE_IMG } from "../../src/rules/ImageElements";
import { RulesTester } from "./RulesTester";
import type { TestDirection } from "./TestDirection";
import { bijective, toView } from "./TestDirection";

/**
 * These tests are dedicated to the complete CoreMedia Rich Text 1.0 DTD.
 * Thus, it also applies tests for elements, that do not come with a custom
 * mapping.
 *
 * Find more detailed tests regarding the respective elements.
 */
void describe("DefaultRules", () => {
  const ruleConfigurations = aut.defaultRules;
  const text = "T";
  const url = "https://e.org/";
  const imgHref = "content/0#properties.data";

  const cases: { data: string; direction: TestDirection; view: string }[] = [
    { data: `<p>${text}</p>`, direction: bijective, view: `<p>${text}</p>` },
    { data: `<p class="CLASS">${text}</p>`, direction: bijective, view: `<p class="CLASS">${text}</p>` },
    { data: `<p dir="ltr">${text}</p>`, direction: bijective, view: `<p dir="ltr">${text}</p>` },
    { data: `<p xml:lang="en">${text}</p>`, direction: bijective, view: `<p lang="en">${text}</p>` },
    { data: `<p lang="en">${text}</p>`, direction: toView, view: `<p lang="en">${text}</p>` },
    { data: `<ul><li>${text}</li></ul>`, direction: bijective, view: `<ul><li>${text}</li></ul>` },
    {
      data: `<ul class="CLASS"><li>${text}</li></ul>`,
      direction: bijective,
      view: `<ul class="CLASS"><li>${text}</li></ul>`,
    },
    { data: `<ul dir="ltr"><li>${text}</li></ul>`, direction: bijective, view: `<ul dir="ltr"><li>${text}</li></ul>` },
    {
      data: `<ul xml:lang="en"><li>${text}</li></ul>`,
      direction: bijective,
      view: `<ul lang="en"><li>${text}</li></ul>`,
    },
    { data: `<ol><li>${text}</li></ol>`, direction: bijective, view: `<ol><li>${text}</li></ol>` },
    {
      data: `<ol class="CLASS"><li>${text}</li></ol>`,
      direction: bijective,
      view: `<ol class="CLASS"><li>${text}</li></ol>`,
    },
    { data: `<ol dir="ltr"><li>${text}</li></ol>`, direction: bijective, view: `<ol dir="ltr"><li>${text}</li></ol>` },
    {
      data: `<ol xml:lang="en"><li>${text}</li></ol>`,
      direction: bijective,
      view: `<ol lang="en"><li>${text}</li></ol>`,
    },
    {
      data: `<ul><li class="CLASS">${text}</li></ul>`,
      direction: bijective,
      view: `<ul><li class="CLASS">${text}</li></ul>`,
    },
    { data: `<ul><li dir="ltr">${text}</li></ul>`, direction: bijective, view: `<ul><li dir="ltr">${text}</li></ul>` },
    {
      data: `<ul><li xml:lang="en">${text}</li></ul>`,
      direction: bijective,
      view: `<ul><li lang="en">${text}</li></ul>`,
    },
    { data: `<pre>${text}</pre>`, direction: bijective, view: `<pre>${text}</pre>` },
    { data: `<pre class="CLASS">${text}</pre>`, direction: bijective, view: `<pre class="CLASS">${text}</pre>` },
    { data: `<pre dir="ltr">${text}</pre>`, direction: bijective, view: `<pre dir="ltr">${text}</pre>` },
    { data: `<pre xml:lang="en">${text}</pre>`, direction: bijective, view: `<pre lang="en">${text}</pre>` },
    {
      data: `<pre xml:space="preserve">${text}</pre>`,
      direction: bijective,
      view: `<pre xml:space="preserve">${text}</pre>`,
    },
    { data: `<blockquote>${text}</blockquote>`, direction: bijective, view: `<blockquote>${text}</blockquote>` },
    {
      data: `<blockquote class="CLASS">${text}</blockquote>`,
      direction: bijective,
      view: `<blockquote class="CLASS">${text}</blockquote>`,
    },
    {
      data: `<blockquote dir="ltr">${text}</blockquote>`,
      direction: bijective,
      view: `<blockquote dir="ltr">${text}</blockquote>`,
    },
    {
      data: `<blockquote xml:lang="en">${text}</blockquote>`,
      direction: bijective,
      view: `<blockquote lang="en">${text}</blockquote>`,
    },
    {
      data: `<blockquote cite="${url}">${text}</blockquote>`,
      direction: bijective,
      view: `<blockquote cite="${url}">${text}</blockquote>`,
    },
    {
      data: `<p><a xlink:href="${url}">${text}</a></p>`,
      direction: bijective,
      view: `<p><a href="${url}">${text}</a></p>`,
    },
    {
      data: `<p><a class="CLASS" xlink:href="${url}">${text}</a></p>`,
      direction: bijective,
      view: `<p><a class="CLASS" href="${url}">${text}</a></p>`,
    },
    {
      data: `<p><a dir="ltr" xlink:href="${url}">${text}</a></p>`,
      direction: bijective,
      view: `<p><a dir="ltr" href="${url}">${text}</a></p>`,
    },
    {
      data: `<p><a xlink:href="${url}" xml:lang="en">${text}</a></p>`,
      direction: bijective,
      view: `<p><a href="${url}" lang="en">${text}</a></p>`,
    },
    { data: `<p><span>${text}</span></p>`, direction: bijective, view: `<p><span>${text}</span></p>` },
    {
      data: `<p><span class="CLASS">${text}</span></p>`,
      direction: bijective,
      view: `<p><span class="CLASS">${text}</span></p>`,
    },
    {
      data: `<p><span dir="ltr">${text}</span></p>`,
      direction: bijective,
      view: `<p><span dir="ltr">${text}</span></p>`,
    },
    {
      data: `<p><span xml:lang="en">${text}</span></p>`,
      direction: bijective,
      view: `<p><span lang="en">${text}</span></p>`,
    },
    { data: `<p>${text}<br/>${text}</p>`, direction: bijective, view: `<p>${text}<br/>${text}</p>` },
    {
      data: `<p>${text}<br class="CLASS"/>${text}</p>`,
      direction: bijective,
      view: `<p>${text}<br class="CLASS"/>${text}</p>`,
    },
    { data: `<p><em>${text}</em></p>`, direction: bijective, view: `<p><i>${text}</i></p>` },
    {
      data: `<p><em class="CLASS">${text}</em></p>`,
      direction: bijective,
      view: `<p><i class="CLASS">${text}</i></p>`,
    },
    { data: `<p><em dir="ltr">${text}</em></p>`, direction: bijective, view: `<p><i dir="ltr">${text}</i></p>` },
    { data: `<p><em xml:lang="en">${text}</em></p>`, direction: bijective, view: `<p><i lang="en">${text}</i></p>` },
    { data: `<p><strong>${text}</strong></p>`, direction: bijective, view: `<p><strong>${text}</strong></p>` },
    {
      data: `<p><strong class="CLASS">${text}</strong></p>`,
      direction: bijective,
      view: `<p><strong class="CLASS">${text}</strong></p>`,
    },
    {
      data: `<p><strong dir="ltr">${text}</strong></p>`,
      direction: bijective,
      view: `<p><strong dir="ltr">${text}</strong></p>`,
    },
    {
      data: `<p><strong xml:lang="en">${text}</strong></p>`,
      direction: bijective,
      view: `<p><strong lang="en">${text}</strong></p>`,
    },
    { data: `<p><sub>${text}</sub></p>`, direction: bijective, view: `<p><sub>${text}</sub></p>` },
    {
      data: `<p><sub class="CLASS">${text}</sub></p>`,
      direction: bijective,
      view: `<p><sub class="CLASS">${text}</sub></p>`,
    },
    { data: `<p><sub dir="ltr">${text}</sub></p>`, direction: bijective, view: `<p><sub dir="ltr">${text}</sub></p>` },
    {
      data: `<p><sub xml:lang="en">${text}</sub></p>`,
      direction: bijective,
      view: `<p><sub lang="en">${text}</sub></p>`,
    },
    { data: `<p><sup>${text}</sup></p>`, direction: bijective, view: `<p><sup>${text}</sup></p>` },
    {
      data: `<p><sup class="CLASS">${text}</sup></p>`,
      direction: bijective,
      view: `<p><sup class="CLASS">${text}</sup></p>`,
    },
    { data: `<p><sup dir="ltr">${text}</sup></p>`, direction: bijective, view: `<p><sup dir="ltr">${text}</sup></p>` },
    {
      data: `<p><sup xml:lang="en">${text}</sup></p>`,
      direction: bijective,
      view: `<p><sup lang="en">${text}</sup></p>`,
    },
    {
      data: `<p><img alt="" xlink:href="${imgHref}"/></p>`,
      direction: bijective,
      view: `<p><img alt="" data-xlink-href="${imgHref}" src="${INLINE_IMG}"/></p>`,
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
      data: `<table><tbody><tr><td>${text}</td></tr></tbody></table>`,
      direction: bijective,
      view: `<table><tbody><tr><td>${text}</td></tr></tbody></table>`,
    },
    {
      data: `<table><tbody><tr><td class="td--header">${text}</td></tr></tbody></table>`,
      direction: bijective,
      view: `<table><tbody><tr><th>${text}</th></tr></tbody></table>`,
    },
    {
      data: `<table><tbody><tr class="tr--header"><td>${text}</td></tr></tbody></table>`,
      direction: bijective,
      view: `<table><thead><tr><td>${text}</td></tr></thead></table>`,
    },
    {
      data: `<table><tbody><tr class="tr--footer"><td>${text}</td></tr></tbody></table>`,
      direction: bijective,
      view: `<table><tfoot><tr><td>${text}</td></tr></tfoot></table>`,
    },
  ];

  for (const [index, { data, direction, view }] of cases.entries()) {
    void describe(`[${index}] Should provide mapping from data ${direction} view: ${data} ${direction} ${view}`, () => {
      const dataString = richtext(data);
      const htmlString = `<body>${view}</body>`;
      const tester = new RulesTester(ruleConfigurations, "*", "body > *");

      tester.executeTests({
        dataString,
        direction,
        htmlString,
      });
    });
  }
});
