import { DEFAULT_TARGETS_ARRAY } from "../../../dist/linktarget/config/DefaultTarget";

describe("DefaultTarget", () => {

  describe("DEFAULT_TARGETS_ARRAY", () => {

    test("should contain entries in expected order", () => {
      const names = DEFAULT_TARGETS_ARRAY.map((definition) => definition.name);
      // These are the buttons we want to see in the given order by default,
      // if no other configuration got provided.
      expect(names).toEqual(["_self", "_blank", "_embed", "_other"]);
    });

    test.each`
       name | title
       ${"_self"} | ${"Open in Current Tab"}
       ${"_blank"} | ${"Open in New Tab"}
       ${"_embed"} | ${"Show Embedded"}
       ${"_other"} | ${"Open in Frame"}
    `("[$#] Should provide expected title for $name: $title", ({ name, title: expectedTitle }) => {
      const options = DEFAULT_TARGETS_ARRAY.find((definition) => name === definition.name);
      // Precondition-check
      expect(options).toBeTruthy();
      const { title: actualTitle } = options!;
      expect(actualTitle).toStrictEqual(expectedTitle);
    });

  });

});
