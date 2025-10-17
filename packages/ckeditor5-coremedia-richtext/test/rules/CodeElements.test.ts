import "global-jsdom/register";
import { describe } from "node:test";
import { p, richtext } from "@coremedia-internal/ckeditor5-coremedia-example-data";
import * as aut from "../../src/rules/CodeElements";
import { RulesTester } from "./RulesTester";
import type { TestDirection } from "./TestDirection";
import { bijective } from "./TestDirection";

void describe("CodeElements", () => {
  const ruleConfigurations = [aut.codeElements];
  const text = "T";

  const codeMappingTestCases: { data: string; direction: TestDirection; view: string }[] = [
    { data: `<span class="code">${text}</span>`, direction: bijective, view: `<code>${text}</code>` },
    {
      data: `<span class="CLASS code">${text}</span>`,
      direction: bijective,
      view: `<code class="CLASS">${text}</code>`,
    },
    {
      data: `<span dir="ltr" class="code">${text}</span>`,
      direction: bijective,
      view: `<code dir="ltr">${text}</code>`,
    },
  ];

  for (const [index, { data, direction, view }] of codeMappingTestCases.entries()) {
    void describe(`[${index}] Should provide mapping from data ${direction} view: ${data} ${direction} ${view}`, () => {
      const dataString = richtext(p(data));
      const htmlString = `<body><p>${view}</p></body>`;
      const tester = new RulesTester(ruleConfigurations, "p > *");

      tester.executeTests({
        dataString,
        direction,
        htmlString,
      });
    });
  }
});
