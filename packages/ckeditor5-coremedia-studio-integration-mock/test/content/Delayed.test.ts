import test, { describe } from "node:test";
import expect from "expect";
import type { DelayedConfig } from "../../src/content/Delayed";
import { withDelayDefaults, DelayedDefaults } from "../../src/content/Delayed";

void describe("Delayed", () => {
  void describe("withDelayDefaults", () => {
    void test("Should provide default configuration for empty config", () => {
      const input: DelayedConfig = {};
      const expected = DelayedDefaults;
      const result = withDelayDefaults(input);
      expect(result).toStrictEqual(expected);
    });

    void test("Should provide initialDelayMs default if missing in config", () => {
      const input: DelayedConfig = {
        changeDelayMs: 42,
      };
      const expected = {
        ...DelayedDefaults,
        ...input,
      };
      const result = withDelayDefaults(input);
      expect(result).toStrictEqual(expected);
    });

    void test("Should provide changeDelayMs default if missing in config", () => {
      const input: DelayedConfig = {
        initialDelayMs: 42,
      };
      const expected = {
        ...DelayedDefaults,
        ...input,
      };
      const result = withDelayDefaults(input);
      expect(result).toStrictEqual(expected);
    });

    void test("Should ignore default configuration if everything set", () => {
      const input: DelayedConfig = {
        initialDelayMs: 42,
        changeDelayMs: 84,
      };
      const result = withDelayDefaults(input);
      expect(result).toStrictEqual(input);
    });

    void test("Should keep additional settings in configuration as is", () => {
      type ExtendedType = DelayedConfig & { lorem: string };
      const input: ExtendedType = {
        lorem: "Ipsum",
      };
      const expected = {
        ...DelayedDefaults,
        ...input,
      };
      const result = withDelayDefaults(input);
      expect(result).toStrictEqual(expected);
    });
  });
});
