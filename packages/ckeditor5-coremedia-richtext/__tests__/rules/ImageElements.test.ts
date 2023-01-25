// noinspection HtmlUnknownAttribute,HtmlRequiredAltAttribute

import * as aut from "../../src/rules/ImageElements";
import { richtext } from "@coremedia-internal/ckeditor5-coremedia-example-data/RichTextBase";
import { bijective, TestDirection, toData } from "./TestDirection";
import { INLINE_IMG } from "../../src/rules/ImageElements";
import { RulesTester } from "./RulesTester";

describe("ImageElements", () => {
  const ruleConfigurations = [aut.imageElements];
  const imgHref = "content/0#properties.data";
  const someImageUrl = "https://e.org/external.webp";

  describe.each`
    data                                                                      | direction    | view
    ${`<p><img alt="" xlink:href="${imgHref}"/></p>`}                         | ${bijective} | ${`<p><img alt="" data-xlink-href="${imgHref}" src="${INLINE_IMG}"/></p>`}
    ${`<p><img alt="ALT" xlink:href="${imgHref}"/></p>`}                      | ${bijective} | ${`<p><img alt="ALT" data-xlink-href="${imgHref}" src="${INLINE_IMG}"/></p>`}
    ${`<p><img xlink:href="${imgHref}" alt=""/></p>`}                         | ${toData}    | ${`<p><img data-xlink-href="${imgHref}" src="${INLINE_IMG}"/></p>`}
    ${`<p><img alt="" height="42" xlink:href="${imgHref}"/></p>`}             | ${bijective} | ${`<p><img alt="" height="42" data-xlink-href="${imgHref}" src="${INLINE_IMG}"/></p>`}
    ${`<p><img alt="" width="42" xlink:href="${imgHref}"/></p>`}              | ${bijective} | ${`<p><img alt="" width="42" data-xlink-href="${imgHref}" src="${INLINE_IMG}"/></p>`}
    ${`<p></p>`}                                                              | ${toData}    | ${`<p><img alt="Missing required data-xlink-href" src="${someImageUrl}"/></p>`}
    ${`<p><img alt="" xlink:type="simple" xlink:href="${imgHref}"/></p>`}     | ${bijective} | ${`<p><img alt="" data-xlink-type="simple" data-xlink-href="${imgHref}" src="${INLINE_IMG}"/></p>`}
    ${`<p><img alt="" xlink:href="${imgHref}" xlink:role="ROLE" /></p>`}      | ${bijective} | ${`<p><img alt="" data-xlink-href="${imgHref}" data-xlink-role="ROLE" src="${INLINE_IMG}"/></p>`}
    ${`<p><img alt="" xlink:href="${imgHref}" xlink:title="TITLE"/></p>`}     | ${bijective} | ${`<p><img alt="" data-xlink-href="${imgHref}" data-xlink-title="TITLE" src="${INLINE_IMG}"/></p>`}
    ${`<p><img alt="" xlink:href="${imgHref}" xlink:show="embed"/></p>`}      | ${bijective} | ${`<p><img alt="" data-xlink-href="${imgHref}" data-xlink-show="embed" src="${INLINE_IMG}"/></p>`}
    ${`<p><img alt="" xlink:href="${imgHref}" xlink:actuate="onLoad" /></p>`} | ${bijective} | ${`<p><img alt="" data-xlink-href="${imgHref}" data-xlink-actuate="onLoad" src="${INLINE_IMG}"/></p>`}
  `(
    "[$#] Should provide mapping from data $direction view: $data $direction $view",
    ({ data, direction, view }: { data: string; direction: TestDirection; view: string }) => {
      const dataString = richtext(data);
      const htmlString = `<body>${view}</body>`;
      const tester = new RulesTester(ruleConfigurations, "p", "p");

      tester.executeTests({
        dataString,
        direction,
        htmlString,
      });
    }
  );
});
