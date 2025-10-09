import "global-jsdom/register";
import test, { describe, TestContext } from "node:test";
import expect from "expect";
import bbob, { CoreRenderer } from "@bbob/core/es";

const render: CoreRenderer = (node) => JSON.stringify(node);

const aut = {
  /**
   * Uses `JSON.stringify` as renderer and no plugins, thus, we process the
   * raw tree to plain JSON.
   */
  toJSONRaw: (input: string) => bbob().process(input, { render }).html,
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
describe("BBob Known Issues", () => {
  describe("toJSONRaw", () => {
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
        expectedActual: `[{"tag":"url","attrs":{"javascript:alert('XSS":"javascript:alert('XSS","ME');":"ME');"},"content":["T"]}]`,
        expected: `[{"tag": "url","attrs": {"javascript:alert('XSS ME');": "javascript:alert('XSS ME');"},"content": ["TEXT"]}]`,
        issue: "https://github.com/JiLiZART/BBob/issues/204",
        comment: `Space Handling in Unique Attributes; causes "ME');" to be regarded as link`,
      },
      {
        bbCode: `[quote=J. D.]T[/quote]`,
        expectedActual: `[{"tag":"quote","attrs":{"J.":"J.","D.":"D."},"content":["T"]}]`,
        expected: `[{"tag": "quote","attrs": {"J. D.": "J. D."},"content": ["T"]}]`,
        issue: "https://github.com/JiLiZART/BBob/issues/204",
        comment: "Space Handling in Unique Attributes; simpler data",
      },
      {
        bbCode: `[quote=J. "The T" D.]T[/quote]`,
        expectedActual: `[{"tag":"quote","attrs":{"J.":"J.","The":"The","T":"T","D.":"D."},"content":["T"]}]`,
        expected: `[{"tag": "quote","attrs": {"J. \\"The T\\" D.": "J. \\"The T\\" D."},"content": ["T"]}]`,
        issue: "https://github.com/JiLiZART/BBob/issues/204",
        comment: "Space And Quote Handling in Unique Attributes",
      },
    ] as const;

    test("cases", async (t: TestContext) => {
      for (const [i, { bbCode, expectedActual, expected, issue, comment }] of cases.entries()) {
        await t.test(`[${i}] ${comment}: ${bbCode} -> ${expectedActual} (${issue}; expected: ${expected})`, () => {
          expect(aut.toJSONRaw(bbCode)).toBe(expectedActual);
        });
      }
    });
  });
});
