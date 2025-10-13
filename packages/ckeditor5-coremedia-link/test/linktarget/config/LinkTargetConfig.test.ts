import type { TestContext } from "node:test";
import test, { describe, beforeEach } from "node:test";
import expect from "expect";
import { Config } from "ckeditor5";
import { parseLinkTargetConfig } from "../../../src/linktarget/config/LinkTargetConfig";
import type LinkTargetOptionDefinition from "../../../src/linktarget/config/LinkTargetOptionDefinition";

const someFunction = () => {
  // irrelevant, only type required
};
void void describe("LinkTargetConfig", () => {
  void void describe("parseLinkTargetConfig", () => {
    // @ts-expect-error - Requires generic type since CKEditor 37.x.
    let config: Config;
    beforeEach(() => {
      config = new Config();
    });
    const cases = [undefined, null, []];

    void void test("cases", async (t: TestContext) => {
      for (const [i, emptyConfig] of cases.entries()) {
        await t.test(`[${i}] should provide no definitiopns for no/empty config: ${emptyConfig}`, () => {
          config.set("link.targets", emptyConfig);
          const definitions = parseLinkTargetConfig(config);
          const names = definitions.map((definition) => definition.name);
          expect(definitions).toHaveLength(0);
          expect(names).toEqual([]);
        });
      }
    });

    const wellKnownCases = [
      { name: "_self", title: "Open in Current Tab" },
      { name: "_blank", title: "Open in New Tab" },
      { name: "_embed", title: "Show Embedded" },
      { name: "_other", title: "Open in Frame" },
    ];

    void void test("cases", async (t: TestContext) => {
      for (const [i, { name, title: expectedTitle }] of wellKnownCases.entries()) {
        await t.test(
          `[${i}] Should resolve well-known config (referenced as string) to full object for '${name}' having title ${expectedTitle}`,
          () => {
            config.set("link.toolbar", [name]);
            const definitions = parseLinkTargetConfig(config);
            expect(definitions).toHaveLength(1);
            expect(definitions[0]?.title).toStrictEqual(expectedTitle);
          },
        );
      }
    });

    void void test("cases", async (t: TestContext) => {
      for (const [i, { name, title: expectedTitle }] of wellKnownCases.entries()) {
        await t.test(
          `[${i}] Should resolve well-known config (referenced as string, also defined as string in link.targets) to full object for '${name}' having title ${expectedTitle}`,
          () => {
            config.set("link.targets", [name]);
            config.set("link.toolbar", [name]);
            const definitions = parseLinkTargetConfig(config);
            expect(definitions).toHaveLength(1);
            expect(definitions[0]?.title).toStrictEqual(expectedTitle);
          },
        );
      }
    });

    void void test("cases", async (t: TestContext) => {
      for (const [i, { name, title: expectedTitle }] of wellKnownCases.entries()) {
        await t.test(
          `[${i}] Should resolve well-known config (referenced as object) to full object for '${name}' having title ${expectedTitle}`,
          () => {
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
      }
    });

    const namesCases = [
      { names: ["_self", "_blank"] },
      { names: ["_blank", "_self"] },
      { names: ["_other", "_embed", "_blank", "_self"] },
    ];

    void void test("cases", async (t: TestContext) => {
      for (const [i, { names }] of namesCases.entries()) {
        await t.test(`[${i}] Should respect order for well-known config names: ${names}`, () => {
          config.set("link.toolbar", [...names]);
          config.set("link.targets", [...names]);
          const definitions = parseLinkTargetConfig(config);
          const actualNames = definitions.map((d) => d.name);
          expect(definitions).toHaveLength(names.length);
          expect(actualNames).toStrictEqual(names);
        });
      }
    });

    const customCases = [
      { name: "_self", title: "Custom: Open in Current Tab" },
      { name: "_blank", title: "Custom: Open in New Tab" },
      { name: "_embed", title: "Custom: Show Embedded" },
      { name: "_other", title: "Custom: Open in Frame" },
    ];

    void void test("cases", async (t: TestContext) => {
      for (const [i, { name, title }] of customCases.entries()) {
        await t.test(
          `[${i}] Should be able to override well-known config name '${name}' with new title: '${title}'`,
          () => {
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
          },
        );
      }
    });

    void void test("should be able providing an only-name custom configuration with some defaults applied", () => {
      const customName = "custom";
      config.set("link.targets", [customName]);
      config.set("link.toolbar", [customName]);
      const definitions = parseLinkTargetConfig(config);
      expect(definitions).toHaveLength(1);
      expect(definitions[0]?.name).toStrictEqual(customName);
      expect(definitions[0]?.title).toStrictEqual(customName);
    });
    void void test("should be able providing a custom configuration with name and title", () => {
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

    const modeCases = [{ mode: "object" }, { mode: "string" }] as const;

    void void test("cases", async (t: TestContext) => {
      for (const [i, { mode }] of modeCases.entries()) {
        await t.test(`[${i}] should provide defaults for custom targets (${mode} definition)`, () => {
          const customName = "custom";
          config.set("link.toolbar", [customName]);
          config.set("link.targets", [createCustomNamedTarget(customName, mode)]);
          const definitions = parseLinkTargetConfig(config);
          expect(definitions).toHaveLength(1);
          expect(definitions[0]?.name).toStrictEqual(customName);
          expect(definitions[0]?.title).toStrictEqual(customName);
        });
      }
    });

    void void test("cases", async (t: TestContext) => {
      for (const [i, { mode }] of modeCases.entries()) {
        await t.test(`[${i}] should fail for invalid custom names (${mode} definition)`, () => {
          // Knowing the code (white-box), this also tests for a target not having
          // any name set. But only testing empty name is fine here, as it should also
          // be forbidden.
          const customName = "";
          config.set("link.toolbar", [customName]);
          config.set("link.targets", [createCustomNamedTarget(customName, mode)]);
          expect(() => parseLinkTargetConfig(config)).toThrow();
        });
      }
    });

    const configCases = [
      { config: 42 },
      { config: someFunction },
      { config: "lorem ipsum" },
      { config: "" },
      { config: true },
      { config: false },
      { config: {} },
      { config: { lorem: "ipsum" } },
    ] as const;

    void void test("cases", async (t: TestContext) => {
      for (const [i, { config: brokenConfig }] of configCases.entries()) {
        await t.test(`[${i}] should fail on invalid configuration type for link.targets: ${brokenConfig})`, () => {
          config.set("link.targets", brokenConfig);
          config.set("link.toolbar", [brokenConfig]);
          expect(() => parseLinkTargetConfig(config)).toThrow();
        });
      }
    });

    const entryCases = [{ entry: 42 }, { entry: someFunction }, { entry: true }, { entry: false }];

    void void test("cases", async (t: TestContext) => {
      for (const [i, { entry: invalidEntry }] of entryCases.entries()) {
        await t.test(
          `[${i}] should fail on invalid configuration entry types for link.targets array: ${invalidEntry})`,
          () => {
            config.set("link.toolbar", [invalidEntry]);
            config.set("link.targets", [invalidEntry]);
            expect(() => parseLinkTargetConfig(config)).toThrow();
          },
        );
      }
    });
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
