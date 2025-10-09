/* eslint-disable @typescript-eslint/no-floating-promises */

import "global-jsdom/register";
import test, { describe } from "node:test";
import expect from "expect";
import { ActiveStrictnessKey, Strictness } from "../../src/Strictness";
import * as aut from "../../src/sanitation/AttributeContent";

describe("AttributeContent", () => {
  const strictnessLevels: ActiveStrictnessKey[] = ["STRICT", "LOOSE", "LEGACY"];

  for (const [index, strictnessKey] of strictnessLevels.entries()) {
    describe(`[${index}] Testing strictness level ${strictnessKey}`, () => {
      const strictness = Strictness[strictnessKey];
      const validAlways = true;
      const validOnlyForLegacy = strictness === Strictness.LEGACY;

      describe("acAny", () => {
        const acUnderTest = aut.acAny;

        const testCases: { value: string; expected: boolean }[] = [
          { value: "", expected: validAlways },
          { value: "T", expected: validAlways },
        ];

        for (const [index, { value, expected }] of testCases.entries()) {
          test(`[${index}] is '${value}' valid? ${expected}`, () => {
            expect(acUnderTest.validateValue(value, strictness)).toStrictEqual(expected);
          });
        }
      });

      describe("acCData", () => {
        const acUnderTest = aut.acCData;

        const cases = [
          { value: "", expected: validAlways },
          { value: "T", expected: validAlways },
        ];

        for (const [index, { value, expected }] of cases.entries()) {
          test(`[${index}] is '${value}' valid? ${expected}`, () => {
            expect(acUnderTest.validateValue(value, strictness)).toStrictEqual(expected);
          });
        }
      });

      describe("acEnum", () => {
        const acUnderTest = aut.acEnum("valid1", "valid2");

        const cases = [
          { value: "", expected: validOnlyForLegacy },
          { value: "T", expected: validOnlyForLegacy },
          { value: "valid1", expected: validAlways },
          { value: "valid2", expected: validAlways },
        ];

        for (const [index, { value, expected }] of cases.entries()) {
          test(`[${index}] is '${value}' valid? ${expected}`, () => {
            expect(acUnderTest.validateValue(value, strictness)).toStrictEqual(expected);
          });
        }
      });

      describe("acNmToken", () => {
        const acUnderTest = aut.acNmToken;

        const cases = [
          { value: "", expected: validAlways },
          { value: "T", expected: validAlways },
          { value: "a b", expected: validOnlyForLegacy },
        ];

        for (const [index, { value, expected }] of cases.entries()) {
          test(`[${index}] is '${value}' valid? ${expected}`, () => {
            expect(acUnderTest.validateValue(value, strictness)).toStrictEqual(expected);
          });
        }
      });
    });
  }
});
