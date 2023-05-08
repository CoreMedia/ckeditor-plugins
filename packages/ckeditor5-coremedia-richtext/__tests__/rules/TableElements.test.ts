// noinspection HtmlUnknownAttribute

import * as aut from "../../src/rules/TableElements";
import { richtext } from "@coremedia-internal/ckeditor5-coremedia-example-data/src/RichTextBase";
import { bijective, TestDirection, toData, toView } from "./TestDirection";
import { RulesTester } from "./RulesTester";

describe("TableElements", () => {
  const ruleConfigurations = aut.tableElements;
  const text = "T";
  const text1 = "T1";
  const text2 = "T2";

  describe.each`
    data                                                                                                                          | direction    | view
    ${`<table><tbody><tr><td>${text}</td></tr></tbody></table>`}                                                                  | ${bijective} | ${`<table><tbody><tr><td>${text}</td></tr></tbody></table>`}
    ${`<table><tbody><tr><td class="td--header">${text}</td></tr></tbody></table>`}                                               | ${bijective} | ${`<table><tbody><tr><th>${text}</th></tr></tbody></table>`}
    ${`<table><tbody><tr class="tr--header"><td>${text}</td></tr></tbody></table>`}                                               | ${bijective} | ${`<table><thead><tr><td>${text}</td></tr></thead></table>`}
    ${`<table><tbody><tr class="tr--footer"><td>${text}</td></tr></tbody></table>`}                                               | ${bijective} | ${`<table><tfoot><tr><td>${text}</td></tr></tfoot></table>`}
    ${`<table><tr><td>${text}</td></tr></table>`}                                                                                 | ${toView}    | ${`<table><tbody><tr><td>${text}</td></tr></tbody></table>`}
    ${`<table><tbody><tr><td>${text}</td></tr></tbody></table>`}                                                                  | ${toData}    | ${`<table><tr><td>${text}</td></tr></table>`}
    ${`<table><tbody><tr><td>${text1}</td></tr><tr><td>${text2}</td></tr></tbody></table>`}                                       | ${toData}    | ${`<table><tbody><tr><td>${text1}</td></tr></tbody><tbody><tr><td>${text2}</td></tr></tbody></table>`}
    ${`<table><tbody><tr class="tr--header"><td class="td--header">${text1}</td></tr><tr><td>${text2}</td></tr></tbody></table>`} | ${bijective} | ${`<table><thead><tr><th>${text1}</th></tr></thead><tbody><tr><td>${text2}</td></tr></tbody></table>`}
    ${`<table><tbody><tr class="tr--header"><td class="td--header">${text1}</td></tr><tr><td>${text2}</td></tr></tbody></table>`} | ${toData}    | ${`<table><tbody><tr><td>${text2}</td></tr></tbody><thead><tr><th>${text1}</th></tr></thead></table>`}
    ${`<table><tbody><tr><td>${text1}</td></tr><tr class="tr--footer"><td>${text2}</td></tr></tbody></table>`}                    | ${bijective} | ${`<table><tbody><tr><td>${text1}</td></tr></tbody><tfoot><tr><td>${text2}</td></tr></tfoot></table>`}
    ${`<table><tbody><tr><td>${text1}</td></tr><tr class="tr--footer"><td>${text2}</td></tr></tbody></table>`}                    | ${toData}    | ${`<table><tfoot><tr><td>${text2}</td></tr></tfoot><tbody><tr><td>${text1}</td></tr></tbody></table>`}
    ${`<table><tbody class="CLASS"><tr class="tr--header"><td>${text1}</td></tr><tr><td>${text2}</td></tr></tbody></table>`}      | ${bijective} | ${`<table><thead class="CLASS"><tr><td>${text1}</td></tr></thead><tbody class="CLASS"><tr><td>${text2}</td></tr></tbody></table>`}
    ${`<table><tbody class="CLASS"><tr class="tr--header"><td>${text1}</td></tr><tr><td>${text2}</td></tr></tbody></table>`}      | ${toData}    | ${`<table><thead class="CLASS"><tr><td>${text1}</td></tr></thead><tbody><tr><td>${text2}</td></tr></tbody></table>`}
    ${`<table><tbody class="CLASS"><tr class="tr--header"><td>${text1}</td></tr><tr><td>${text2}</td></tr></tbody></table>`}      | ${toData}    | ${`<table><thead><tr><td>${text1}</td></tr></thead><tbody class="CLASS"><tr><td>${text2}</td></tr></tbody></table>`}
    ${`<table><tbody class="BODY"><tr class="tr--header"><td>${text1}</td></tr><tr><td>${text2}</td></tr></tbody></table>`}       | ${toData}    | ${`<table><thead class="HEAD"><tr><td>${text1}</td></tr></thead><tbody class="BODY"><tr><td>${text2}</td></tr></tbody></table>`}
    ${`<table><tbody class="BODY"><tr><td>${text1}</td></tr><tr class="tr--footer"><td>${text2}</td></tr></tbody></table>`}       | ${toData}    | ${`<table><tbody class="BODY"><tr><td>${text1}</td></tr></tbody><tfoot class="FOOT"><tr><td>${text2}</td></tr></tfoot></table>`}
    ${`<table><tbody class="BODY1"><tr><td>${text1}</td></tr><tr><td>${text2}</td></tr></tbody></table>`}                         | ${toData}    | ${`<table><tbody class="BODY1"><tr><td>${text1}</td></tr></tbody><tbody class="BODY2"><tr><td>${text2}</td></tr></tbody></table>`}
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
    }
  );
});
