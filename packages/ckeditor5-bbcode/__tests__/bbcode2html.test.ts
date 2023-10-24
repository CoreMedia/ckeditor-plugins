import { bbCodeDefaultRules } from "../src";
import { bbcode2html } from "../src/bbcode2html";

const supportedTags = bbCodeDefaultRules.flatMap((r) => r.tags ?? ([] as string[]));

const aut = {
  bbcode2html: (input: string): string => bbcode2html(input, supportedTags),
};

/**
 * These are high-level integration tests based on core processing by BBob.
 * It uses all defaults typically applied for BBCode to HTML mapping when
 * using the CKEditor 5 BBCode plugin.
 */
describe("bbcode2html", () => {
  describe("Security", () => {
    describe("tainted on* handlers", () => {
      test.each`
        tainted
        ${`[b onclick=">8-<~"]T[/b]`}
        ${`[code onclick=">8-<~"]T[/code]`}
        ${`[color=red onclick=">8-<~"]T[/color]`}
        ${`[h1 onclick=">8-<~"]T[/h1]`}
        ${`[i onclick=">8-<~"]T[/i]`}
        ${`[list onclick=">8-<~"][* onclick=">8-<~"]T[/list]`}
        ${`[quote onclick=">8-<~"]T[/quote]`}
        ${`[s onclick=">8-<~"]T[/s]`}
        ${`[table onclick=">8-<~"][tr onclick=">8-<~"][td onclick=">8-<~"]T[/td][/tr][/table]`}
        ${`[u onclick=">8-<~"]T[/u]`}
        ${`[url=https://example.org/ onclick=">8-<~"]T[/url]`}
      `("[$#] Should prevent onclick-attack for: $tainted", ({ tainted }: { tainted: string }) => {
        expect(aut.bbcode2html(tainted)).not.toContain("onclick");
      });
    });
  });
});
