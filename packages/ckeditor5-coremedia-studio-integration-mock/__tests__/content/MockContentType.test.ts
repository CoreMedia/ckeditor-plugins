import {
  MockContentTypeSpecificProperties,
  MockContentTypeSpecificPropertiesConfig,
  withTypeDefaults,
} from "../../src/content/MockContentType";

describe("MockContentType", () => {
  describe("withTypeDefaults", () => {
    test("Should provide default configuration for only ID-config (folder)", () => {
      const input = { id: 13 };
      const expected = {
        type: "folder",
        linkable: false,
        embeddable: false,
        ...input,
      };
      const result = withTypeDefaults(input);
      expect(result).toStrictEqual(expected);
    });

    test("Should provide default configuration for only ID-config (document)", () => {
      const input: MockContentTypeSpecificPropertiesConfig = { id: 12 };
      const expected: MockContentTypeSpecificProperties = {
        type: "document",
        linkable: true,
        embeddable: false,
        ...input,
      };
      const result = withTypeDefaults(input);
      expect(result).toStrictEqual(expected);
    });

    test("Should provide linkable default if missing in config (folder)", () => {
      const input = {
        // Enforce check, that default relies on type not id.
        id: 42,
        type: "folder",
        embeddable: true,
      };
      const expected = {
        linkable: false,
        ...input,
      };
      const result = withTypeDefaults(input);
      expect(result).toStrictEqual(expected);
    });

    test("Should provide linkable default if missing in config (document)", () => {
      const input = {
        // Enforce check, that default relies on type not id.
        id: 43,
        type: "document",
        embeddable: true,
      };
      const expected = {
        linkable: true,
        ...input,
      };
      const result = withTypeDefaults(input);
      expect(result).toStrictEqual(expected);
    });

    test("Should provide embeddable default if missing in config", () => {
      const input = {
        id: 42,
        type: "document",
        linkable: false,
      };
      const expected = {
        embeddable: false,
        ...input,
      };
      const result = withTypeDefaults(input);
      expect(result).toStrictEqual(expected);
    });

    test("Should ignore default configuration if everything set", () => {
      const input = {
        id: 42,
        type: "document",
        linkable: false,
        embeddable: true,
      };
      const result = withTypeDefaults(input);
      expect(result).toStrictEqual(input);
    });

    test("Should keep additional settings in configuration as is", () => {
      type ExtendedType = MockContentTypeSpecificPropertiesConfig & { lorem: string };
      const input: ExtendedType = {
        id: 42,
        lorem: "Ipsum",
      };
      const expected = {
        type: "document",
        linkable: true,
        embeddable: false,
        ...input,
      };
      const result = withTypeDefaults(input);
      expect(result).toStrictEqual(expected);
    });
  });
});
