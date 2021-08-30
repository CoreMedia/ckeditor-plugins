import {requireContentCkeModelUris, requireContentUriPath} from "../../src/content/UriPath";
import {requireContentCkeModelUri} from "../../dist/content/UriPath";

test("requireContentCkeModelUri: should replace / with : for a CoreMedia Studio Uri", () => {
  const actual = requireContentCkeModelUri('content/12345');
  expect(actual).toBe('content:12345')
});

test("requireContentCkeModelUri: should do nothing when it is a cke model uri", () => {
  const actual = requireContentCkeModelUri('content:12345');
  expect(actual).toBe('content:12345')
});

test("requireContentCkeModelUri: should throw error when no content-id is part of the CoreMedia Studio Uri", () => {
  expect(() => requireContentCkeModelUri('content/')).toThrowError();
});

test("requireContentCkeModelUri: should throw error if it is completely other stuff", () => {
  expect(() => requireContentCkeModelUri('any text might be here')).toThrowError();
});

test("requireContentUriPath: should replace : with / for a CKE Model URI", () => {
  const actual = requireContentUriPath('content:12345');
  expect(actual).toBe('content/12345')
});

test("requireContentUriPath: should do nothing when it is a CoreMedia Studio URI", () => {
  const actual = requireContentUriPath('content/12345');
  expect(actual).toBe('content/12345')
});

test("requireContentUriPath: should throw error when no content-id is part of the CKE Model URI", () => {
  expect(() => requireContentUriPath('content:')).toThrowError();
});

test("requireContentUriPath: should throw error if it is completely other stuff", () => {
  expect( () => requireContentUriPath('any text might be here')).toThrowError();
});

