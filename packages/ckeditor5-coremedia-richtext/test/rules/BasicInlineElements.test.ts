import { describe } from "node:test";
import { p, richtext } from "@coremedia-internal/ckeditor5-coremedia-example-data";
import * as aut from "../../src/rules/BasicInlineElements";
import { RulesTester } from "./RulesTester";
import type { TestDirection } from "./TestDirection";
import { bijective, toData } from "./TestDirection";

void describe("BasicInlineElements", () => {
  const ruleConfigurations = aut.basicInlineElements;
  const text = "T";

  const formattingTestCases: { data: string; direction: TestDirection; view: string }[] = [
    { data: `<strong>${text}</strong>`, direction: toData, view: `<b>${text}</b>` },
    { data: `<span class="underline">${text}</span>`, direction: bijective, view: `<u>${text}</u>` },
    { data: `<em>${text}</em>`, direction: bijective, view: `<i>${text}</i>` },
    { data: `<span class="strike">${text}</span>`, direction: bijective, view: `<s>${text}</s>` },
    { data: `<span class="strike">${text}</span>`, direction: toData, view: `<del>${text}</del>` },
    { data: `<span class="strike">${text}</span>`, direction: toData, view: `<strike>${text}</strike>` },
  ];

  for (const [index, { data, direction, view }] of formattingTestCases.entries()) {
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
