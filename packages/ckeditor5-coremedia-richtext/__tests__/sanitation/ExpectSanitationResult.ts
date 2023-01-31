import { RichTextSanitizer } from "../../src/sanitation/RichTextSanitizer";
import { expectNoIssues, sanitationListener, ListenerExpectations } from "./TestSanitationListener";
import { Strictness } from "../../src/Strictness";
import { parseXml, serialize } from "./XmlTestUtils";

export const expectSanitationResult = (
  sanitizer: RichTextSanitizer,
  inputXml: string,
  sanitizedXml: string,
  listenerExpectations: ListenerExpectations = expectNoIssues
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
