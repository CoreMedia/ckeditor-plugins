import { isBeanReference, isBeanReferences, parseBeanReferences } from "../../src/content/BeanReference";

describe("BeanReference", () => {
  describe("isBeanReference", () => {
    test.each`
      value                     | expectedResult
      ${undefined}              | ${false}
      ${null}                   | ${false}
      ${{}}                     | ${false}
      ${{ $Ref: true }}         | ${false}
      ${{ $Ref: "content/42" }} | ${true}
    `("[$#] Should respond with $expectedResult on: $value", ({ value, expectedResult }) => {
      expect(isBeanReference(value)).toStrictEqual(expectedResult);
    });
  });

  describe("isBeanReferences", () => {
    test.each`
      value                                               | expectedResult
      ${undefined}                                        | ${false}
      ${null}                                             | ${false}
      ${[]}                                               | ${true}
      ${[{ $Ref: true }]}                                 | ${false}
      ${[{ $Ref: "content/42" }, { $Ref: true }]}         | ${false}
      ${[{ $Ref: true }, { $Ref: "content/42" }]}         | ${false}
      ${[{ $Ref: "content/42" }]}                         | ${true}
      ${[{ $Ref: "content/42" }, { $Ref: "content/44" }]} | ${true}
    `("[$#] Should respond with $expectedResult on: $value", ({ value, expectedResult }) => {
      expect(isBeanReferences(value)).toStrictEqual(expectedResult);
    });
  });

  describe("parseBeanReferences", () => {
    const uris = ["content/42", "content/44"];
    const beanReferences = uris.map((uri) => ({
      $Ref: uri,
    }));
    const beanReferencesJson = JSON.stringify(beanReferences);

    test.each`
      value                 | expectedResult
      ${""}                 | ${undefined}
      ${"invalidJson"}      | ${undefined}
      ${"[]"}               | ${[]}
      ${"[1, 2, 3]"}        | ${undefined}
      ${beanReferencesJson} | ${beanReferences}
    `("[$#] Should respond with $expectedResult on: $value", ({ value, expectedResult }) => {
      expect(parseBeanReferences(value)).toStrictEqual(expectedResult);
    });
  });
});
