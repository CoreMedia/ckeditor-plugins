import type { TestContext } from "node:test";
import test, { describe } from "node:test";
import type { TagNodeTree } from "@bbob/types";
import expect from "expect";
import bbob from "@bbob/core";

const render = (node: TagNodeTree | undefined) => {
  return JSON.stringify(node);
};

const aut = {
  /**
   * Uses `JSON.stringify` as renderer and no plugins, thus, we process the
   * raw tree to plain JSON.
   */
  toJSONRaw: (input: string) => {
    return bbob().process(input, { render });
  },
};

/**
 * These tests demonstrate known issues along with the BBob library.
 *
 * If they fail on upgrade, we may be lucky, that we may adjust our code
 * accordingly.
 *
 * For now, they are especially meant to document known limitations we have
 * rated as acceptable.
 *
 * The given probes may also be worth evaluating in context of alternative
 * BBCode processors (like KefirBB, for example).
 */
void describe("BBob Known Issues", () => {
  void describe("toJSONRaw", () => {
    /*
     * Active parameters:
     *
     * `bbCode`: Input data
     * `expectedActual`: Flawed raw JSON data.
     *
     * Documentation only parameters:
     *
     * `expected`: What we would have expected instead.
     * `issue`: If applicable, an issue reference.
     * `comment`: Some comment
     */
    const cases = [
      {
        bbCode: `[url=javascript:alert('XSS ME');]T[/url]`,
        expectedActual: `[{"tag":"url","attrs":{"javascript:alert('XSS ME');":"javascript:alert('XSS ME');"},"content":["T"]}]`,
        expected: `[{"tag":"url","attrs":{"javascript:alert('XSS ME');":"javascript:alert('XSS ME');"},"content":["T"],"start":{"from":0,"to":33},"end":{"from":34,"to":40}}]`,
        issue: "https://github.com/JiLiZART/BBob/issues/204",
        comment: `Space Handling in Unique Attributes; causes "ME');" to be regarded as link`,
      },
      {
        bbCode: `[quote=J. D.]T[/quote]`,
        expectedActual: `[{"tag":"quote","attrs":{"J. D.":"J. D."},"content":["T"]}]`,
        expected: `[{"tag":"quote","attrs":{"J. D.":"J. D."},"content":["T"],"start":{"from":0,"to":13},"end":{"from":14,"to":22}}]`,
        issue: "https://github.com/JiLiZART/BBob/issues/204",
        comment: "Space Handling in Unique Attributes; simpler data",
      },
      {
        bbCode: `[quote=J. "The T" D.]T[/quote]`,
        expectedActual: `[{"tag":"quote","attrs":{"J. \\"The T\\" D.":"J. \\"The T\\" D."},"content":["T"]}]`,
        expected: `[{"tag":"quote","attrs":{"J. \\"The T\\" D.":"J. \\"The T\\" D."},"content":["T"],"start":{"from":0,"to":21},"end":{"from":22,"to":30}}]`,
        issue: "https://github.com/JiLiZART/BBob/issues/204",
        comment: "Space And Quote Handling in Unique Attributes",
      },
    ] as const;

    void test("cases", async (t: TestContext) => {
      for (const [i, { bbCode, expectedActual, expected, issue, comment }] of cases.entries()) {
        await t.test(`[${i}] ${comment}: ${bbCode} -> ${expectedActual} (${issue}; expected: ${expected})`, () => {
          const result = aut.toJSONRaw(bbCode);
          expect(result.html).toBe(expected);
        });
      }
    });
  });
});
