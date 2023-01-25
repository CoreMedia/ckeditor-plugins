// noinspection HtmlUnknownAttribute,HtmlRequiredAltAttribute

import * as aut from "../../src/rules/ImageElements";
import { richtext } from "@coremedia-internal/ckeditor5-coremedia-example-data/RichTextBase";
import { bijective, TestDirection, toData } from "./TestDirection";
import { INLINE_IMG } from "../../src/rules/ImageElements";
import { RulesTester } from "./RulesTester";

describe("ImageElements", () => {
  const ruleConfigurations = [aut.imageElements];
  const imgHref = "content/0#properties.data";
  const text = "T";
  const someImageUrl = "https://e.org/external.webp";

  describe.each`
    data                                                          | direction    | view
    ${`<p><img alt="" xlink:href="${imgHref}"/></p>`}             | ${bijective} | ${`<p><img alt="" data-xlink-href="${imgHref}" src="${INLINE_IMG}"/></p>`}
    ${`<p><img alt="${text}" xlink:href="${imgHref}"/></p>`}      | ${bijective} | ${`<p><img alt="${text}" data-xlink-href="${imgHref}" src="${INLINE_IMG}"/></p>`}
    ${`<p><img xlink:href="${imgHref}" alt=""/></p>`}             | ${toData}    | ${`<p><img data-xlink-href="${imgHref}" src="${INLINE_IMG}"/></p>`}
    ${`<p><img alt="" height="42" xlink:href="${imgHref}"/></p>`} | ${bijective} | ${`<p><img alt="" height="42" data-xlink-href="${imgHref}" src="${INLINE_IMG}"/></p>`}
    ${`<p><img alt="" width="42" xlink:href="${imgHref}"/></p>`}  | ${bijective} | ${`<p><img alt="" width="42" data-xlink-href="${imgHref}" src="${INLINE_IMG}"/></p>`}
    ${`<p></p>`}                                                  | ${toData}    | ${`<p><img alt="" src="${someImageUrl}"/></p>`}
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
