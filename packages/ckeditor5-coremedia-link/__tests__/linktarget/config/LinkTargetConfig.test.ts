/* eslint no-null/no-null: off */

import { Config } from "ckeditor5";
import { parseLinkTargetConfig } from "../../../src/linktarget/config/LinkTargetConfig";
import LinkTargetOptionDefinition from "../../../src/linktarget/config/LinkTargetOptionDefinition";

const someFunction = () => {
  // irrelevant, only type required
};
describe("LinkTargetConfig", () => {
  describe("parseLinkTargetConfig", () => {
    // @ts-expect-error - Requires generic type since CKEditor 37.x.
    let config: Config;
    beforeEach(() => {
      config = new Config();
    });
    test.each`
      config
      ${undefined}
      ${null}
      ${[]}
    `("[$#] should provide no definitiopns for no/empty config: $config", ({ config: emptyConfig }) => {
      config.set("link.targets", emptyConfig);
      const definitions = parseLinkTargetConfig(config);
      const names = definitions.map((definition) => definition.name);
      expect(definitions).toHaveLength(0);
      expect(names).toEqual([]);
    });
    test.each`
      name        | title
      ${"_self"}  | ${"Open in Current Tab"}
      ${"_blank"} | ${"Open in New Tab"}
      ${"_embed"} | ${"Show Embedded"}
      ${"_other"} | ${"Open in Frame"}
    `(
      "[$#] Should resolve well-known config (referenced as string) to full object for '$name' having title '$title'",
      ({ name, title: expectedTitle }) => {
        config.set("link.toolbar", [name]);
        const definitions = parseLinkTargetConfig(config);
        expect(definitions).toHaveLength(1);
        expect(definitions[0]?.title).toStrictEqual(expectedTitle);
      },
    );
    test.each`
      name        | title
      ${"_self"}  | ${"Open in Current Tab"}
      ${"_blank"} | ${"Open in New Tab"}
      ${"_embed"} | ${"Show Embedded"}
      ${"_other"} | ${"Open in Frame"}
    `(
      "[$#] Should resolve well-known config (referenced as string, also defined as string in link.targets) to full object for '$name' having title '$title'",
      ({ name, title: expectedTitle }) => {
        config.set("link.targets", [name]);
        config.set("link.toolbar", [name]);
        const definitions = parseLinkTargetConfig(config);
        expect(definitions).toHaveLength(1);
        expect(definitions[0]?.title).toStrictEqual(expectedTitle);
      },
    );
    test.each`
      name        | title
      ${"_self"}  | ${"Open in Current Tab"}
      ${"_blank"} | ${"Open in New Tab"}
      ${"_embed"} | ${"Show Embedded"}
      ${"_other"} | ${"Open in Frame"}
    `(
      "[$#] Should resolve well-known config (referenced as object) to full object for '$name' having title '$title'",
      ({ name, title: expectedTitle }) => {
        config.set("link.toolbar", [name]);
        config.set("link.targets", [
          {
            name,
          },
        ]);
        const definitions = parseLinkTargetConfig(config);
        expect(definitions).toHaveLength(1);
        // This also tests for "auto-completing object".
        expect(definitions[0]?.title).toStrictEqual(expectedTitle);
      },
    );
    test.each`
      names
      ${["_self", "_blank"]}
      ${["_blank", "_self"]}
      ${["_other", "_embed", "_blank", "_self"]}
    `("[$#] Should respect order for well-known config names: $names", ({ names }) => {
      config.set("link.toolbar", [...names]);
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
    `("[$#] Should be able to override well-known config name `$name` with new title: '$title'", ({ name, title }) => {
      config.set("link.toolbar", [name]);
      config.set("link.targets", [
        {
          name,
          title,
        },
      ]);
      const definitions = parseLinkTargetConfig(config);
      expect(definitions).toHaveLength(1);
      expect(definitions[0]?.title).toStrictEqual(title);
    });
    test("should be able providing an only-name custom configuration with some defaults applied", () => {
      const customName = "custom";
      config.set("link.targets", [customName]);
      config.set("link.toolbar", [customName]);
      const definitions = parseLinkTargetConfig(config);
      expect(definitions).toHaveLength(1);
      expect(definitions[0]?.name).toStrictEqual(customName);
      expect(definitions[0]?.title).toStrictEqual(customName);
    });
    test("should be able providing a custom configuration with name and title", () => {
      const customName = "custom";
      const customTitle = "My Custom Title";
      config.set("link.toolbar", [customName]);
      config.set("link.targets", [
        {
          name: customName,
          title: customTitle,
        },
      ]);
      const definitions = parseLinkTargetConfig(config);
      expect(definitions).toHaveLength(1);
      expect(definitions[0]?.name).toStrictEqual(customName);
      expect(definitions[0]?.title).toStrictEqual(customTitle);
    });
    test.each`
      mode
      ${"object"}
      ${"string"}
    `("[$#] should provide defaults for custom targets ($mode definition)", ({ mode }) => {
      const customName = "custom";
      config.set("link.toolbar", [customName]);
      config.set("link.targets", [createCustomNamedTarget(customName, mode)]);
      const definitions = parseLinkTargetConfig(config);
      expect(definitions).toHaveLength(1);
      expect(definitions[0]?.name).toStrictEqual(customName);
      expect(definitions[0]?.title).toStrictEqual(customName);
    });
    test.each`
      mode
      ${"object"}
      ${"string"}
    `("[$#] should fail for invalid custom names ($mode definition)", ({ mode }) => {
      // Knowing the code (white-box), this also tests for a target not having
      // any name set. But only testing empty name is fine here, as it should also
      // be forbidden.
      const customName = "";
      config.set("link.toolbar", [customName]);
      config.set("link.targets", [createCustomNamedTarget(customName, mode)]);
      expect(() => parseLinkTargetConfig(config)).toThrow();
    });
    test.each`
      config
      ${42}
      ${someFunction}
      ${"lorem ipsum"}
      ${""}
      ${true}
      ${false}
      ${{}}
      ${{
  lorem: "ipsum",
}}
    `("[$#] should fail on invalid configuration type for link.targets: $config", ({ config: brokenConfig }) => {
      config.set("link.targets", brokenConfig);
      config.set("link.toolbar", [brokenConfig]);
      expect(() => parseLinkTargetConfig(config)).toThrow();
    });
    test.each`
      entry
      ${42}
      ${someFunction}
      ${true}
      ${false}
    `(
      "[$#] should fail on invalid configuration entry types for link.targets array: $entry",
      ({ entry: invalidEntry }) => {
        config.set("link.toolbar", [invalidEntry]);
        config.set("link.targets", [invalidEntry]);
        expect(() => parseLinkTargetConfig(config)).toThrow();
      },
    );
  });
});
const createCustomNamedTarget = (name: string, mode: "object" | "string"): LinkTargetOptionDefinition | string => {
  switch (mode) {
    case "object":
      return {
        name,
      };
    case "string":
      return name;
  }
  throw new Error(`Unknown mode ${mode}.`);
};
