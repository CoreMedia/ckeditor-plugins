import { ActiveStrictnessKey, Strictness } from "../../src/Strictness";
import * as aut from "../../src/sanitation/AttributeContent";

describe("AttributeContent", () => {
  describe.each`
    strictness
    ${"STRICT"}
    ${"LOOSE"}
    ${"LEGACY"}
  `(
    "[$#] Testing strictness level $strictness",
    ({ strictness: strictnessKey }: { strictness: ActiveStrictnessKey }) => {
      const strictness = Strictness[strictnessKey];
      const validAlways = true;
      const validOnlyForLegacy = strictness === Strictness.LEGACY;

      describe("acAny", () => {
        const acUnderTest = aut.acAny;

        it.each`
          value  | expected
          ${""}  | ${validAlways}
          ${"T"} | ${validAlways}
        `("[$#] is '$value' valid? $expected", ({ value, expected }: { value: string; expected: boolean }) => {
          expect(acUnderTest.validateValue(value, strictness)).toStrictEqual(expected);
        });
      });

      describe("acCData", () => {
        const acUnderTest = aut.acCData;

        it.each`
          value  | expected
          ${""}  | ${validAlways}
          ${"T"} | ${validAlways}
        `("[$#] is '$value' valid? $expected", ({ value, expected }: { value: string; expected: boolean }) => {
          expect(acUnderTest.validateValue(value, strictness)).toStrictEqual(expected);
        });
      });

      describe("acEnum", () => {
        const acUnderTest = aut.acEnum("valid1", "valid2");

        it.each`
          value       | expected
          ${""}       | ${validOnlyForLegacy}
          ${"T"}      | ${validOnlyForLegacy}
          ${"valid1"} | ${validAlways}
          ${"valid2"} | ${validAlways}
        `("[$#] is '$value' valid? $expected", ({ value, expected }: { value: string; expected: boolean }) => {
          expect(acUnderTest.validateValue(value, strictness)).toStrictEqual(expected);
        });
      });

      describe("acNmToken", () => {
        const acUnderTest = aut.acNmToken;

        it.each`
          value    | expected
          ${""}    | ${validAlways}
          ${"T"}   | ${validAlways}
          ${"a b"} | ${validOnlyForLegacy}
        `("[$#] is '$value' valid? $expected", ({ value, expected }: { value: string; expected: boolean }) => {
          expect(acUnderTest.validateValue(value, strictness)).toStrictEqual(expected);
        });
      });
    },
  );
});
