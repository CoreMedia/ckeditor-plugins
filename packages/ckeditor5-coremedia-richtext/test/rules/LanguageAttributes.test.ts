import "global-jsdom/register";
import test, { describe } from "node:test";
import { richtext } from "@coremedia-internal/ckeditor5-coremedia-example-data";
import * as aut from "../../src/rules/LanguageAttributes";
import type { TestDirection } from "./TestDirection";
import { bijective, toData, toView } from "./TestDirection";
import { RulesTester } from "./RulesTester";

void describe("HeadingElements", () => {
  const ruleConfigurations = [aut.languageAttributes];

  const text = "T";

  const testCases: { data: string; direction: TestDirection; view: string }[] = [
    { data: `<p>${text}</p>`, direction: bijective, view: `<p>${text}</p>` },
    { data: `<p xml:lang="en">${text}</p>`, direction: bijective, view: `<p lang="en">${text}</p>` },
    { data: `<p lang="en">${text}</p>`, direction: toView, view: `<p lang="en">${text}</p>` },
    { data: `<p xml:lang="en">${text}</p>`, direction: toData, view: `<p xml:lang="en">${text}</p>` },
    { data: `<p xml:lang="en">${text}</p>`, direction: toData, view: `<p xml:lang="en" lang="de">${text}</p>` },
    { data: `<p xml:lang="en" lang="de">${text}</p>`, direction: toView, view: `<p lang="en">${text}</p>` },
    { data: `<p xml:lang="de">${text}</p>`, direction: toData, view: `<p xml:lang="" lang="de">${text}</p>` },
    { data: `<p xml:lang="de">${text}</p>`, direction: toData, view: `<p xml:lang=" " lang="de">${text}</p>` },
    { data: `<p xml:lang="" lang="de">${text}</p>`, direction: toView, view: `<p lang="de">${text}</p>` },
    { data: `<p xml:lang=" " lang="de">${text}</p>`, direction: toView, view: `<p lang="de">${text}</p>` },
  ];

  for (const [index, { data, direction, view }] of testCases.entries()) {
    void test(`[${index}] Should provide mapping from data ${direction} view: ${data} -> ${view}`, () => {
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
