import expect from "expect";
import type { RichTextSanitizer } from "../../src/sanitation/RichTextSanitizer";
import { Strictness } from "../../src/Strictness";
import type { ListenerExpectations } from "./TestSanitationListener";
import { expectNoIssues, sanitationListener } from "./TestSanitationListener";
import { parseXml, serialize } from "./XmlTestUtils";

export const expectSanitationResult = (
  sanitizer: RichTextSanitizer,
  inputXml: string,
  sanitizedXml: string,
  listenerExpectations: ListenerExpectations = expectNoIssues,
): void => {
  const { strictness } = sanitizer;
  const disabled = strictness === Strictness.NONE;
  const inputDocument = parseXml(inputXml);
  const expectedOutputDocument = disabled ? inputDocument : parseXml(sanitizedXml);
  const expectedOutputDocumentXml = serialize(expectedOutputDocument);

  const result = sanitizer.sanitize(inputDocument);

  expect(result).toBe(inputDocument);

  const actualXml = serialize(inputDocument);

  expect(actualXml).toStrictEqual(expectedOutputDocumentXml);

  if (disabled) {
    expectNoIssues(sanitationListener);
  } else {
    listenerExpectations(sanitationListener);
  }
};
