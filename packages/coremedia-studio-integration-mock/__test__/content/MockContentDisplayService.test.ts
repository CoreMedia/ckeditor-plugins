import ContentDisplayService from "@coremedia/coremedia-studio-integration/src/content/ContentDisplayService";
import MockContentDisplayService, { CONTENT_NAME_FALSY } from "../../src/content/MockContentDisplayService";
import { DisplayHint } from "@coremedia/coremedia-studio-integration/src/content/ContentDisplayService";

interface TestMode {
  skip?: boolean;
  only?: boolean;
}

interface Named {
  name: string;
}

interface UriPath2DisplayHint {
  uriPath: string;
  expected: DisplayHint;
}

const modalTest = ({ skip, only }: TestMode): jest.It => {
  if (skip) {
    return test.skip;
  }
  return only ? test.only : test;
};

describe("Unit Tests: MockContentDisplayService", () => {
  type TestData = UriPath2DisplayHint & TestMode & Named;
  const service: ContentDisplayService = new MockContentDisplayService();

  /**
   * Test cases for URI paths, which don't match the "magic pattern" to trigger
   * some configured state or state-change.
   */
  const unmatchedCases: TestData[] = [
    {
      name: "Should use falsy defaults, but detect that this is a document.",
      uriPath: "content/0",
      expected: {
        name: `${CONTENT_NAME_FALSY} Document #0`,
        classes: ["content--0"]
      }
    },
    {
      name: "Should use falsy defaults, but detect that this is a folder.",
      uriPath: "content/1",
      expected: {
        name: `${CONTENT_NAME_FALSY} Folder #1`,
        classes: ["content--0"]
      }
    },
  ];

  const testCases: TestData[] = [
    ...unmatchedCases,
  ];

  describe.each<TestData>(testCases)('[$#] $name - Input: $uriPath, Expected: $expected',
    ({
       name,
       uriPath,
       expected
     }) => {
      test(`Async Test for: ${name}`, (done) => {
        service.getDisplayHint(uriPath).subscribe(({ name, classes }: DisplayHint) => {
          expect(name).toBe(expected.name);
          expect(classes?.sort()).toEqual(expected.classes?.sort() || []);
          done();
        })
      });
    });
});
