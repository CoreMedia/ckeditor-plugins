import { richtext } from "@coremedia-internal/ckeditor5-coremedia-example-data";
import * as aut from "../../src/rules/LanguageAttributes";
import { bijective, TestDirection, toData, toView } from "./TestDirection";
import { RulesTester } from "./RulesTester";

describe("HeadingElements", () => {
  const ruleConfigurations = [aut.languageAttributes];

  const text = "T";

  describe.each`
    data                                        | direction    | view
    ${`<p>${text}</p>`}                         | ${bijective} | ${`<p>${text}</p>`}
    ${`<p xml:lang="en">${text}</p>`}           | ${bijective} | ${`<p lang="en">${text}</p>`}
    ${`<p lang="en">${text}</p>`}               | ${toView}    | ${`<p lang="en">${text}</p>`}
    ${`<p xml:lang="en">${text}</p>`}           | ${toData}    | ${`<p xml:lang="en">${text}</p>`}
    ${`<p xml:lang="en">${text}</p>`}           | ${toData}    | ${`<p xml:lang="en" lang="de">${text}</p>`}
    ${`<p xml:lang="en" lang="de">${text}</p>`} | ${toView}    | ${`<p lang="en">${text}</p>`}
    ${`<p xml:lang="de">${text}</p>`}           | ${toData}    | ${`<p xml:lang="" lang="de">${text}</p>`}
    ${`<p xml:lang="de">${text}</p>`}           | ${toData}    | ${`<p xml:lang=" " lang="de">${text}</p>`}
    ${`<p xml:lang="" lang="de">${text}</p>`}   | ${toView}    | ${`<p lang="de">${text}</p>`}
    ${`<p xml:lang=" " lang="de">${text}</p>`}  | ${toView}    | ${`<p lang="de">${text}</p>`}
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
    },
  );
});
