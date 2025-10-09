
import "global-jsdom/register";
import test, { describe } from "node:test";
import * as aut from "../../src/rules/DivElements";
import { richtext } from "@coremedia-internal/ckeditor5-coremedia-example-data";
import { bijective, TestDirection } from "./TestDirection";
import { RulesTester } from "./RulesTester";

void describe("DivElements", () => {
  const ruleConfigurations = [aut.divElements];
  const text = "T";

  const divMappingTestCases: { data: string; direction: TestDirection; view: string }[] = [
    { data: `<p class="p--div">${text}</p>`, direction: bijective, view: `<div>${text}</div>` },
    { data: `<p class="CLASS p--div">${text}</p>`, direction: bijective, view: `<div class="CLASS">${text}</div>` },
  ];

  for (const [index, { data, direction, view }] of divMappingTestCases.entries()) {
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
