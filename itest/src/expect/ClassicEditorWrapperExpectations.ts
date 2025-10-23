import type { ClassicEditorWrapper } from "../aut/ClassicEditorWrapper";
import { extendingWaitForExpect } from "./ExpectationsBase";

/**
 * JEST Extension: Add matchers for `ClassicEditorWrapper`.
 */
expect.extend({
  async waitForDataContaining(w: ClassicEditorWrapper, expectedData: string): Promise<jest.CustomMatcherResult> {
    return extendingWaitForExpect(
      "waitForDataContaining",
      async () => expect(await w.getData()).toContain(expectedData),
      async () => expect(await w.getData()).not.toContain(expectedData),
      this,
    );
  },
  async waitForDataEqualTo(w: ClassicEditorWrapper, expectedData: string): Promise<jest.CustomMatcherResult> {
    return extendingWaitForExpect(
      "waitForDataEqualTo",
      async () => expect(await w.getData()).toStrictEqual(expectedData),
      async () => expect(await w.getData()).not.toStrictEqual(expectedData),
      this,
    );
  },
});

/**
 * Extension to matchers for `ClassicEditorWrapper`.
 */
export interface ClassicEditorWrapperMatchers<R = unknown, T = unknown> {
  /**
   * Waits for CKEditor data to contain the given substring.
   */
  waitForDataContaining: T extends ClassicEditorWrapper
    ? (expectedData: string) => R
    : "Type-level Error: Received value must be a ClassicEditorWrapper";
  /**
   * Waits for CKEditor data to be equal to the given string.
   */
  waitForDataEqualTo: T extends ClassicEditorWrapper
    ? (expectedData: string) => R
    : "Type-level Error: Received value must be a ClassicEditorWrapper";
}
