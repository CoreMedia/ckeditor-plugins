// noinspection HtmlUnknownAttribute,HtmlRequiredAltAttribute

import * as aut from "../../src/rules/FixedAttributes";
import { richtext } from "@coremedia-internal/ckeditor5-coremedia-example-data/src/RichTextBase";
import { TestDirection, toData } from "./TestDirection";
import { RulesTester } from "./RulesTester";

describe("FixedAttributes", () => {
  const ruleConfigurations = [aut.stripFixedAttributes()];

  describe.each`
    view                                                           | direction | data
    ${`<pre xml:space="preserve"></pre>`}                          | ${toData} | ${`<pre></pre>)>`}
    ${`<a xlink:type="simple"></a>`}                               | ${toData} | ${`<a></a>`}
    ${`<img xlink:show="embed"/>`}                                 | ${toData} | ${`<img/>`}
    ${`<img xlink:type="simple" xlink:show="embed" />`}            | ${toData} | ${`<img/>`}
    ${`<a xlink:type="simple"><img xlink:actuate="onLoad" /></a>`} | ${toData} | ${`<a><img/></a>`}
  `(
    "[$#] Should provide mapping from data $direction view: $data $direction $view",
    ({ data, direction, view }: { data: string; direction: TestDirection; view: string }) => {
      const dataString = richtext(data);
      const htmlString = `<body>${view}</body>`;
      const tester = new RulesTester(ruleConfigurations, "*", "body > *");

      tester.executeTests({
        dataString,
        direction,
        htmlString,
      });
    },
  );
});
