// noinspection HtmlUnknownAttribute,HtmlRequiredAltAttribute

import "global-jsdom/register";
import test, { describe } from "node:test";
import * as aut from "../../src/rules/FixedAttributes";
import { richtext } from "@coremedia-internal/ckeditor5-coremedia-example-data/src/RichTextBase";
import { TestDirection, toData } from "./TestDirection";
import { RulesTester } from "./RulesTester";

void describe("FixedAttributes", () => {
  const ruleConfigurations = [aut.stripFixedAttributes()];

  const mappingTestCases: { view: string; direction: TestDirection; data: string }[] = [
    { view: `<pre xml:space="preserve"></pre>`, direction: toData, data: `<pre></pre>` },
    { view: `<a xlink:type="simple"></a>`, direction: toData, data: `<a></a>` },
    { view: `<img xlink:show="embed"/>`, direction: toData, data: `<img/>` },
    { view: `<img xlink:type="simple" xlink:show="embed" />`, direction: toData, data: `<img/>` },
    { view: `<a xlink:type="simple"><img xlink:actuate="onLoad" /></a>`, direction: toData, data: `<a><img/></a>` },
  ];

  for (const [index, { data, direction, view }] of mappingTestCases.entries()) {
    void test(`[${index}] Should provide mapping from data ${direction} view: ${data} ${direction} ${view}`, () => {
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
