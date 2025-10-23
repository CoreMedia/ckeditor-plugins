import test, { describe } from "node:test";
import expect from "expect";
import { formatLink } from "../../../../src/compatibility/v10/rules/IdHelper";

void describe("IdHelper", () => {
  const cases = [
    { href: "", expected: "" },
    { href: "https://example.org/", expected: "https://example.org/" },
    { href: "content/2", expected: "content/2" },
    { href: "coremedia:///cap/content/2", expected: "content/2" },
    { href: "content/2#properties.data", expected: "content/2#properties.data" },
    { href: "coremedia:///cap/blob/content/2#data", expected: "content/2#properties.data" },
  ];

  for (const [index, { href, expected }] of cases.entries()) {
    void test(`[${index}] \`${href}\` -> \`${expected}\``, () => {
      const actual = formatLink(href);
      expect(actual).toStrictEqual(expected);
    });
  }
});
