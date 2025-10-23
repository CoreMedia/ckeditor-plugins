import { describe } from "node:test";
import { blockquote, richtext } from "@coremedia-internal/ckeditor5-coremedia-example-data";
import * as aut from "../../src/integrations/XDiffElements";
import { RulesTester } from "./RulesTester";
import type { TestDirection } from "./TestDirection";
import { toData, toView } from "./TestDirection";

void describe("XDiffElements", () => {
  const ruleConfigurations = [aut.xDiffElements];

  const cases: { data: string; direction: TestDirection; view: string }[] = [
    {
      data: `<p><xdiff:span xdiff:class="del">A</xdiff:span><xdiff:span xdiff:class="add">B</xdiff:span></p>`,
      direction: toView,
      view: `<p><xdiff:span xdiff:class="del">A</xdiff:span><xdiff:span xdiff:class="add">B</xdiff:span></p>`,
    },
    {
      data: `<p><xdiff:span xdiff:class="del">A</xdiff:span></p>`,
      direction: toView,
      view: `<p><xdiff:span xdiff:class="del">A</xdiff:span></p>`,
    },
    {
      data: `<p><xdiff:span xdiff:id="del-0">A</xdiff:span></p>`,
      direction: toView,
      view: `<p><xdiff:span xdiff:id="del-0">A</xdiff:span></p>`,
    },
    {
      data: `<p><xdiff:span xdiff:next="add-0">A</xdiff:span></p>`,
      direction: toView,
      view: `<p><xdiff:span xdiff:next="add-0">A</xdiff:span></p>`,
    },
    {
      data: `<p><xdiff:span xdiff:previous="add-0">A</xdiff:span></p>`,
      direction: toView,
      view: `<p><xdiff:span xdiff:previous="add-0">A</xdiff:span></p>`,
    },
    {
      data: `<p>A</p>`,
      direction: toData,
      view: `<p><xdiff:span xdiff:class="del">A</xdiff:span></p>`,
    },
    {
      data: `<p>A<xdiff:span xdiff:class="add"/></p><p>B</p>`,
      direction: toView,
      view: `<p>A<xdiff:br xdiff:class="add"/></p><p>B</p>`,
    },
    {
      data: `<p>A</p><p>B</p>`,
      direction: toData,
      view: `<p>A<xdiff:br xdiff:class="add"/></p><p>B</p>`,
    },
  ];

  void describe("cases", () => {
    for (const { data, direction, view } of cases) {
      void describe(`Should provide mapping from data ${direction} view: ${data} ${direction} ${view}`, () => {
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
      });
    }
  });
});
