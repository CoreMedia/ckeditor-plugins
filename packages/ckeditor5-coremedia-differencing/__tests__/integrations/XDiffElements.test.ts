import * as aut from "../../src/integrations/XDiffElements";
import { blockquote, richtext } from "@coremedia-internal/ckeditor5-coremedia-example-data/RichTextBase";
import { TestDirection, toData, toView } from "./TestDirection";
import { RulesTester } from "./RulesTester";

describe("XDiffElements", () => {
  const ruleConfigurations = [aut.xDiffElements];

  describe.each`
    data                                                                                                 | direction | view
    ${`<p><xdiff:span xdiff:class="del">A</xdiff:span><xdiff:span xdiff:class="add">B</xdiff:span></p>`} | ${toView} | ${`<p><xdiff:span xdiff:class="del">A</xdiff:span><xdiff:span xdiff:class="add">B</xdiff:span></p>`}
    ${`<p><xdiff:span xdiff:class="del">A</xdiff:span></p>`}                                             | ${toView} | ${`<p><xdiff:span xdiff:class="del">A</xdiff:span></p>`}
    ${`<p><xdiff:span xdiff:id="del-0">A</xdiff:span></p>`}                                              | ${toView} | ${`<p><xdiff:span xdiff:id="del-0">A</xdiff:span></p>`}
    ${`<p><xdiff:span xdiff:next="add-0">A</xdiff:span></p>`}                                            | ${toView} | ${`<p><xdiff:span xdiff:next="add-0">A</xdiff:span></p>`}
    ${`<p><xdiff:span xdiff:previous="add-0">A</xdiff:span></p>`}                                        | ${toView} | ${`<p><xdiff:span xdiff:previous="add-0">A</xdiff:span></p>`}
    ${`<p>A</p>`}                                                                                        | ${toData} | ${`<p><xdiff:span xdiff:class="del">A</xdiff:span></p>`}
    ${`<p>A<xdiff:span xdiff:class="add"/></p><p>B</p>`}                                                 | ${toView} | ${`<p>A<xdiff:br xdiff:class="add"/></p><p>B</p>`}
    ${`<p>A</p><p>B</p>`}                                                                                | ${toData} | ${`<p>A<xdiff:br xdiff:class="add"/></p><p>B</p>`}
  `(
    "[$#] Should provide mapping from data $direction view: $data $direction $view",
    ({ data, direction, view }: { data: string; direction: TestDirection; view: string }) => {
      // Using blockquote as it may contain multiple paragraphs, and we need one central
      // element to do the comparison.
      const dataString = richtext(blockquote(data));
      const htmlString = `<body><blockquote>${view}</blockquote></body>`;
      const tester = new RulesTester(ruleConfigurations, "blockquote");

      tester.executeTests({
        dataString,
        direction,
        htmlString,
      });
    }
  );
});
