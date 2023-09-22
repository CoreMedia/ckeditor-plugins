import { removeSpecialChars } from "../src/blocklistui";

describe("Blocklist", () => {
  describe("BlocklistEditing", () => {
    test.each`
      input            | expectedResult
      ${"lorem"}       | ${"lorem"}
      ${"_lorem"}      | ${"lorem"}
      ${"lorem-ipsum"} | ${"lorem-ipsum"}
      ${"lorem?"}      | ${"lorem"}
      ${"lor'em"}      | ${"lor'em"}
      ${'lor"em'}      | ${"lorem"}
      ${"lor`em"}      | ${"lorem"}
    `("[$#] Should remove special characters in $input and result in $expectedResult", ({ input, expectedResult }) => {
      const result = removeSpecialChars(input);
      expect(result).toStrictEqual(expectedResult);
    });
  });
});
