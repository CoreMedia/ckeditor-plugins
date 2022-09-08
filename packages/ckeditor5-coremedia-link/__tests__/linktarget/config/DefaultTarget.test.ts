import {
  DEFAULT_TARGETS_ARRAY,
  getDefaultTargetDefinition,
  requireDefaultTargetDefinition,
} from "../../../src/linktarget/config/DefaultTarget";

describe("DefaultTarget", () => {
  describe("DEFAULT_TARGETS_ARRAY", () => {
    test("should contain entries in expected order", () => {
      const names = DEFAULT_TARGETS_ARRAY.map((definition) => definition.name);
      // These are the buttons we want to see in the given order by default,
      // if no other configuration got provided.
      expect(names).toEqual(["_self", "_blank", "_embed", "_other"]);
    });

    test.each`
      name        | title
      ${"_self"}  | ${"Open in Current Tab"}
      ${"_blank"} | ${"Open in New Tab"}
      ${"_embed"} | ${"Show Embedded"}
      ${"_other"} | ${"Open in Frame"}
    `("[$#] Should provide expected title for $name: $title", ({ name, title: expectedTitle }) => {
      const options = DEFAULT_TARGETS_ARRAY.find((definition) => name === definition.name);
      // Precondition-check
      expect(options).toBeDefined();
      const { title: actualTitle } = options ?? { title: "unexpected undefined state" };
      expect(actualTitle).toStrictEqual(expectedTitle);
    });

    test.each`
      name
      ${"_self"}
      ${"_blank"}
      ${"_embed"}
      ${"_other"}
    `("[$#] Should provide an icon $name", ({ name }) => {
      const options = DEFAULT_TARGETS_ARRAY.find((definition) => name === definition.name);
      // Precondition-check
      expect(options).toBeDefined();
      // default: provoke failure, unexpected as previous check guaranteed options to be defined.
      const { icon: actualIcon } = options ?? { icon: false };
      expect(actualIcon).toBeTruthy();
    });
  });

  describe("getDefaultTargetDefinition", () => {
    const defTarget = "Default Standard Target";
    const xLinkBehavior = "While used for xlink:show, not part of our standard definitions";
    const htmlBehavior = "While standard HTML target, not part of our standard definitions";

    test.each`
      name         | exists   | comment
      ${"_self"}   | ${true}  | ${defTarget}
      ${"_blank"}  | ${true}  | ${defTarget}
      ${"_embed"}  | ${true}  | ${defTarget}
      ${"_other"}  | ${true}  | ${defTarget}
      ${"_other"}  | ${true}  | ${defTarget}
      ${"_none"}   | ${false} | ${xLinkBehavior}
      ${"_parent"} | ${false} | ${htmlBehavior}
      ${"_top"}    | ${false} | ${htmlBehavior}
      ${"custom"}  | ${false} | ${"Any custom target is not expected to be defined by default"}
    `("[$#] Expecting default definition for $name? $exists ($comment)", ({ name, exists }) => {
      const definition = getDefaultTargetDefinition(name);
      if (exists) {
        expect(definition).toBeDefined();
      } else {
        expect(definition).toBeUndefined();
      }
    });

    test.each`
      name        | title
      ${"_self"}  | ${"Open in Current Tab"}
      ${"_blank"} | ${"Open in New Tab"}
      ${"_embed"} | ${"Show Embedded"}
      ${"_other"} | ${"Open in Frame"}
    `("[$#] Should provide expected title for $name: $title", ({ name, title: expectedTitle }) => {
      const options = getDefaultTargetDefinition(name);
      // Precondition-check
      expect(options).toBeDefined();
      const { title: actualTitle } = options ?? { title: "unexpected undefined state" };
      expect(actualTitle).toStrictEqual(expectedTitle);
    });
  });

  describe("requireDefaultTargetDefinition", () => {
    const defTarget = "Default Standard Target";
    const xLinkBehavior = "While used for xlink:show, not part of our standard definitions";
    const htmlBehavior = "While standard HTML target, not part of our standard definitions";

    test.each`
      name         | exists   | comment
      ${"_self"}   | ${true}  | ${defTarget}
      ${"_blank"}  | ${true}  | ${defTarget}
      ${"_embed"}  | ${true}  | ${defTarget}
      ${"_other"}  | ${true}  | ${defTarget}
      ${"_other"}  | ${true}  | ${defTarget}
      ${"_none"}   | ${false} | ${xLinkBehavior}
      ${"_parent"} | ${false} | ${htmlBehavior}
      ${"_top"}    | ${false} | ${htmlBehavior}
      ${"custom"}  | ${false} | ${"Any custom target is not expected to be defined by default"}
    `("[$#] Expecting default definition for $name? $exists ($comment)", ({ name, exists }) => {
      const definitionCallback = () => requireDefaultTargetDefinition(name);
      if (exists) {
        expect(definitionCallback).not.toThrow();
      } else {
        expect(definitionCallback).toThrow();
      }
    });
  });
});
