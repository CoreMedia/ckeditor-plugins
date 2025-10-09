/* eslint no-null/no-null: off */
import "global-jsdom/register";
import test, { describe } from "node:test";
import expect from "expect";
import { RequiredNonNull, RequiredNonNullPropertiesMissingError, requireNonNulls } from "../src/RequiredNonNull";

interface WithOptionalNullableValues {
  optionalNullable?: number | null;
  requiredNullable: number | null;
}

class WithOptionalNullableValuesImpl implements WithOptionalNullableValues {
  constructor(
    public requiredNullable: number | null,
    public optionalNullable?: number | null,
  ) {}
}

describe("RequiredNonNull", () => {
  test("Use Case: RequiredNonNull", () => {
    // Only required needs to be set and `null` is a valid option.
    const defaultProbe: WithOptionalNullableValues = {
      requiredNullable: null,
    };

    // Both values need to be set to non-null.
    const allRequiredNonNullProbe: RequiredNonNull<WithOptionalNullableValues> = {
      optionalNullable: 42,
      requiredNullable: 42,
    };

    const onlySelectedRequiredNonNullProbe: RequiredNonNull<WithOptionalNullableValues, "requiredNullable"> = {
      requiredNullable: 42,
    };

    // @ts-expect-error - The "Test". We expect an error here for unset properties.
    const erredProbe: RequiredNonNull<WithOptionalNullableValues> = defaultProbe;

    // Just use to satisfy static code analysis.
    [defaultProbe, allRequiredNonNullProbe, onlySelectedRequiredNonNullProbe, erredProbe].forEach((probe) =>
      expect(probe).toBeDefined(),
    );
  });

  describe("requireNonNulls", () => {
    test("should pass for all unset, but none required to be non-null", () => {
      const probe: WithOptionalNullableValues = { requiredNullable: null };
      const probeFn = () => requireNonNulls(probe);
      expect(probeFn).not.toThrow();
    });

    test("should fail for unset optional property", () => {
      const probe: WithOptionalNullableValues = new WithOptionalNullableValuesImpl(null);
      const probeFn = () => requireNonNulls(probe, "optionalNullable");
      expect(probeFn).toThrow(RequiredNonNullPropertiesMissingError);
      // The error message should contain the type and affected property.
      expect(probeFn).toThrow(/property.*WithOptionalNullableValuesImpl.*optionalNullable/);
    });

    test("should fail for optional property set to null", () => {
      const probe: WithOptionalNullableValues = new WithOptionalNullableValuesImpl(null, null);
      const probeFn = () => requireNonNulls(probe, "optionalNullable");
      expect(probeFn).toThrow(RequiredNonNullPropertiesMissingError);
      // The error message should contain the type and affected property.
      expect(probeFn).toThrow(/property.*WithOptionalNullableValuesImpl.*optionalNullable/);
    });

    test("should fail for required property set to null", () => {
      const probe: WithOptionalNullableValues = new WithOptionalNullableValuesImpl(null);
      const probeFn = () => requireNonNulls(probe, "requiredNullable");
      expect(probeFn).toThrow(RequiredNonNullPropertiesMissingError);
      // The error message should contain the type and affected property.
      expect(probeFn).toThrow(/property.*WithOptionalNullableValuesImpl.*requiredNullable/);
    });

    test("should fail for both properties set to null", () => {
      const probe: WithOptionalNullableValues = new WithOptionalNullableValuesImpl(null);
      const probeFn = () => requireNonNulls(probe, "requiredNullable", "optionalNullable");
      expect(probeFn).toThrow(RequiredNonNullPropertiesMissingError);
      // The error message should contain the type and affected properties.
      expect(probeFn).toThrow(/properties.*WithOptionalNullableValuesImpl.*((requiredNullable|optionalNullable).*){2}/);
    });

    test("should pass for all set to non-null", () => {
      const probe: WithOptionalNullableValues = new WithOptionalNullableValuesImpl(21, 42);
      const probeFn = () => requireNonNulls(probe);
      expect(probeFn).not.toThrow();
    });
  });
});
