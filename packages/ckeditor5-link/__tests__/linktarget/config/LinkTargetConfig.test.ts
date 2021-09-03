import Config from "@ckeditor/ckeditor5-utils/src/config";
import { parseLinkTargetConfig } from "../../../src/linktarget/config/LinkTargetConfig";

jest.mock("@ckeditor/ckeditor5-utils/src/config");

describe("LinkTargetConfig", () => {

  describe("parseLinkTargetConfig", () => {

    let config: Config;

    beforeEach(() => {
      config = new Config();
    });

    test("should provide defaults for no config", () => {
      // Just check precondition, that we mocked correctly.
      expect(config.get("link.targets")).toBeUndefined();

      const definitions = parseLinkTargetConfig(config);
      const names = definitions.map((definition) => definition.name);
      expect(names).toEqual(["_self", "_blank", "_embed", "_other"]);
    });

    test("should provide no definitions for empty config", () => {
      config.set("link.targets", []);

      const definitions = parseLinkTargetConfig(config);
      expect(definitions).toHaveLength(0);
    });

    test.each`
       name        | title
       ${"_self"}  | ${"Open in Current Tab"}
       ${"_blank"} | ${"Open in New Tab"}
       ${"_embed"} | ${"Show Embedded"}
       ${"_other"} | ${"Open in Frame"}
    `("[$#] Should resolve well-known config to full object for '$name' having title '$title'",
      ({
         name,
         title: expectedTitle
       }) => {
        config.set("link.targets", [name]);

        const definitions = parseLinkTargetConfig(config);
        expect(definitions).toHaveLength(1);
        expect(definitions[0]?.title).toStrictEqual(expectedTitle);
      });

    test.each`
       names
       ${["_self", "_blank"]}
       ${["_blank", "_self"]}
       ${["_other", "_embed", "_blank", "_self"]}
    `("[$#] Should respect order for well-known config names: $names",
      ({
         names,
       }) => {
        config.set("link.targets", [...names]);

        const definitions = parseLinkTargetConfig(config);
        const actualNames = definitions.map((d) => d.name);
        expect(definitions).toHaveLength(names.length);
        expect(actualNames).toStrictEqual(names);
      });

    test.each`
       name        | title
       ${"_self"}  | ${"Custom: Open in Current Tab"}
       ${"_blank"} | ${"Custom: Open in New Tab"}
       ${"_embed"} | ${"Custom: Show Embedded"}
       ${"_other"} | ${"Custom: Open in Frame"}
    `("[$#] Should be able to override well-known config name `$name` with new title: '$title'",
      ({
         name,
         title
       }) => {
        config.set("link.targets", [{
          name: name,
          title: title,
        }]);

        const definitions = parseLinkTargetConfig(config);
        expect(definitions).toHaveLength(1);
        expect(definitions[0]?.title).toStrictEqual(title);
      });

    test("should be able providing an only-name custom configuration with some defaults applied", () => {
      const customName = "custom";

      config.set("link.targets", [customName]);

      const definitions = parseLinkTargetConfig(config);

      expect(definitions).toHaveLength(1);
      expect(definitions[0]?.name).toStrictEqual(customName);
      expect(definitions[0]?.title).toStrictEqual(customName);
    });

    test("should be able providing a custom configuration with name and title", () => {
      const customName = "custom";
      const customTitle = "My Custom Title";

      config.set("link.targets", [{
        name: customName,
        title: customTitle,
      }]);

      const definitions = parseLinkTargetConfig(config);

      expect(definitions).toHaveLength(1);
      expect(definitions[0]?.name).toStrictEqual(customName);
      expect(definitions[0]?.title).toStrictEqual(customTitle);
    });
  });

});
