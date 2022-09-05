/* eslint no-null/no-null: off */

import { isRaw } from "../src/AdvancedTypes";

describe("AdvancedTypes", () => {
  describe("isRaw", () => {
    it("Demonstrate Use Case", () => {
      const value = "some value";
      const obj: unknown = { value };

      let actual1: string | undefined;
      let actual2: string | undefined;

      if (typeof obj === "object" && !!obj) {
        if ("value" in obj) {
          // @ts-expect-error Due to microsoft/TypeScript#21732 this access will
          // be marked as error. If this shows an error, the issue seems to be
          // fixed, and the workaround can be removed.
          actual1 = obj.value;
        }
      }
      if (isRaw(obj, "value")) {
        // This would fail without isRaw having microsoft/TypeScript#21732
        if (typeof obj.value === "string") {
          actual2 = obj.value;
        }
      }
      expect(actual1).toStrictEqual(actual2);
    });

    it.each`
      value
      ${"string"}
      ${["string"]}
      ${""}
      ${null}
      ${undefined}
      ${0}
      ${42}
      ${[0, 42]}
      ${true}
      ${false}
      ${{}}
      ${{ key: "value" }}
    `("[$#] Should signal `true` for existing property having value: `$value`.", ({ value }) => {
      const obj = { value };
      expect(isRaw(obj, "value")).toStrictEqual(true);
    });

    it("Should signal `false for missing property", () => {
      const value = "some value";
      const obj: unknown = { value };
      expect(isRaw(obj, "notExisting")).toStrictEqual(false);
    });
  });
});
