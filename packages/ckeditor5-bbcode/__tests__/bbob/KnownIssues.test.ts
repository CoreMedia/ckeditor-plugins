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
    it.each`
      bbCode                                        | expectedActual                                                                                                 | expected                                                                                                          | issue                                            | comment
      ${`[url=javascript:alert('XSS ME');]T[/url]`} | ${`[{"tag":"url","attrs":{"javascript:alert('XSS":"javascript:alert('XSS","ME');":"ME');"},"content":["T"]}]`} | ${`[{"tag": "url","attrs": {"javascript:alert('XSS ME');": "javascript:alert('XSS ME');"},"content": ["TEXT"]}]`} | ${`https://github.com/JiLiZART/BBob/issues/204`} | ${`Space Handling in Unique Attributes; causes "ME');" to be regarded as link`}
      ${`[quote=J. D.]T[/quote]`}                   | ${`[{"tag":"quote","attrs":{"J.":"J.","D.":"D."},"content":["T"]}]`}                                           | ${`[{"tag": "quote","attrs": {"J. D.": "J. D."},"content": ["T"]}]`}                                              | ${`https://github.com/JiLiZART/BBob/issues/204`} | ${`Space Handling in Unique Attributes; simpler data`}
      ${`[quote=J. "The T" D.]T[/quote]`}           | ${`[{"tag":"quote","attrs":{"J.":"J.","The":"The","T":"T","D.":"D."},"content":["T"]}]`}                       | ${`[{"tag": "quote","attrs": {"J. \\"The T\\" D.": "J. \\"The T\\" D."},"content": ["T"]}]`}                      | ${`https://github.com/JiLiZART/BBob/issues/204`} | ${`Space And Quote Handling in Unique Attributes`}
    `(
      "[$#] $comment: $bbCode -> $expectedActual ($issue; expected: $expected)",
      ({ bbCode, expectedActual }: { bbCode: string; expectedActual: string }) => {
        expect(aut.toJSONRaw(bbCode)).toBe(expectedActual);
      },
    );
  });
});
