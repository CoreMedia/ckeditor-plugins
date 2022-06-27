import { isRaw } from "../src/AdvancedTypes";

describe("AdvancedTypes", () => {
  describe("isRaw", () => {
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
