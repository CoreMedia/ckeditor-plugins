/* eslint no-null/no-null: off */

import {
  getUriList,
  getUriListValues,
  isHasData,
  isHasDataTransfer,
  toDataTransfer,
} from "../../src/content/DataTransferUtils";
import { URI_LIST_DATA } from "../../src/content/Constants";

describe("DataTransferUtils", () => {
  describe("isHasData", () => {
    test.each`
      value                                    | expectedResult
      ${undefined}                             | ${false}
      ${null}                                  | ${false}
      ${{}}                                    | ${false}
      ${{ getData: "Lorem" }}                  | ${false}
      ${{ getData: (s: string): string => s }} | ${true}
    `("[$#] isHasData should be $expectedResult for: $value", ({ value, expectedResult }) => {
      expect(isHasData(value)).toStrictEqual(expectedResult);
    });
  });

  describe("isHasDataTransfer", () => {
    test.each`
      value                                                      | expectedResult
      ${undefined}                                               | ${false}
      ${null}                                                    | ${false}
      ${{}}                                                      | ${false}
      ${{ dataTransfer: undefined }}                             | ${false}
      ${{ dataTransfer: null }}                                  | ${false}
      ${{ dataTransfer: "Lorem" }}                               | ${false}
      ${{ dataTransfer: {} }}                                    | ${false}
      ${{ dataTransfer: { getData: "Lorem" } }}                  | ${false}
      ${{ dataTransfer: { getData: (s: string): string => s } }} | ${true}
    `("[$#] isHasDataTransfer should be $expectedResult for: $value", ({ value, expectedResult }) => {
      expect(isHasDataTransfer(value)).toStrictEqual(expectedResult);
    });
  });

  describe("toDataTransfer", () => {
    test("Should respond with `undefined` on `null`.", () => {
      expect(toDataTransfer(null)).toBeUndefined();
    });

    test.each`
      value
      ${{ getData: (): string => "" }}
      ${{ getData: (s: string): string => s }}
    `("[$#] Should provide DataTransfer Object as is for: $value", ({ value }) => {
      expect(toDataTransfer(value)).toStrictEqual(value);
    });

    test.each`
      value                                                      | expectAsIs
      ${{ dataTransfer: { getData: (): string => "" } }}         | ${true}
      ${{ dataTransfer: { getData: (s: string): string => s } }} | ${true}
    `("[$#] Should extract DataTransfer from Event and similar: $value", ({ value }) => {
      if (!isHasDataTransfer(value)) {
        throw new Error("Invalid input for test.");
      }
      expect(toDataTransfer(value)).toStrictEqual(value.dataTransfer);
    });
  });

  describe("getUriList", () => {
    const uris = ["content/42", "content/44"];
    const beanReferences = uris.map((uri) => ({
      $Ref: uri,
    }));
    const beanReferencesJson = JSON.stringify(beanReferences);
    const getData = (format: string): string => (format === URI_LIST_DATA ? beanReferencesJson : "");

    test("Should respond with `undefined` on `null`", () => {
      expect(getUriList(null)).toBeUndefined();
    });

    test("Should respond with `undefined` on referenced `dataTransfer` to be `null`.", () => {
      expect(getUriList({ dataTransfer: null })).toBeUndefined();
    });

    test("Should respond with expected bean references for DataTransfer.", () => {
      expect(getUriList({ getData })).toStrictEqual(beanReferences);
    });

    test("Should respond with expected bean references for DataTransfer-Holder such as an Event.", () => {
      expect(getUriList({ dataTransfer: { getData } })).toStrictEqual(beanReferences);
    });
  });

  describe("getUriListValues", () => {
    const uris = ["content/42", "content/44"];
    const beanReferences = uris.map((uri) => ({
      $Ref: uri,
    }));
    const beanReferencesJson = JSON.stringify(beanReferences);
    const getData = (format: string): string => (format === URI_LIST_DATA ? beanReferencesJson : "");

    test("Should respond with `undefined` on `null`", () => {
      expect(getUriListValues(null)).toBeUndefined();
    });

    test("Should respond with `undefined` on referenced `dataTransfer` to be `null`.", () => {
      expect(getUriListValues({ dataTransfer: null })).toBeUndefined();
    });

    test("Should respond with expected bean references for DataTransfer.", () => {
      expect(getUriListValues({ getData })).toStrictEqual(uris);
    });

    test("Should respond with expected bean references for DataTransfer-Holder such as an Event.", () => {
      expect(getUriListValues({ dataTransfer: { getData } })).toStrictEqual(uris);
    });
  });
});
