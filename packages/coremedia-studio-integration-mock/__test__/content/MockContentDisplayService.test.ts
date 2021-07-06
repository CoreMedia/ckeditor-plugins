import ContentDisplayService, { DisplayHint } from "@coremedia/coremedia-studio-integration/src/content/ContentDisplayService";
import MockContentDisplayService, {
  CONTENT_NAME_FALSY,
  CONTENT_NAME_TRUTHY,
  CONTENT_NAME_UNREADABLE
} from "../../src/content/MockContentDisplayService";
import { UriPath } from "@coremedia/coremedia-studio-integration/dist/content/UriPath";
import { Observable } from "rxjs";
import { serviceAgent } from "@coremedia/studio-apps-service-agent";
// TODO[cke] Import does not work in IntelliJ Idea (it requires src/ in path).
//@ts-ignore
import ContentDisplayServiceDescriptor from "@coremedia/coremedia-studio-integration/content/ContentDisplayServiceDescriptor";

const MOCK_SERVICE_TEST_CONFIG = {
  maxFirstDelayMs: 0,
  changeDelayMs: 0
};

describe("serviceAgent Integration", () => {
  const service = new MockContentDisplayService();
  serviceAgent.registerService(service);

  test("Should be able to retrieve mock service.", () => {
    expect(serviceAgent.fetchService<ContentDisplayService>(new ContentDisplayServiceDescriptor())).resolves.toBe(service);
  });
});

/**
 * Test modes especially meant for debugging or known issues.
 */
interface TestMode {
  /**
   * If `true`, will skip the corresponding test data with test.skip.
   */
  skip?: boolean;
  /**
   * If `true`, will only run the corresponding test data with test.only.
   */
  only?: boolean;
}

/**
 * Give the test a name.
 */
interface Named {
  name: string;
}

/**
 * The actual test data from a given URI Path to an expected display hint.
 */
interface UriPath2DisplayHint {
  /**
   * The URI path which _contains_ the configuration as part of its magic
   * numeric ID. This will be the input to the service.
   */
  uriPath: string;
  /**
   * Expected states to take before _complete_ is triggered (in case of the
   * immediate mode with all-zero timeouts/intervals).
   */
  expected: DisplayHint | DisplayHint[];
}

/**
 * Supports modal test execution for debugging or known issues. Provides
 * the actual test function to use.
 *
 * @param skip `true` to mark a test as skipped
 * @param only `true` to only execute this test
 * @return test function
 */
const modalTest = ({ skip, only }: TestMode): jest.It => {
  if (skip) {
    return test.skip;
  }
  return only ? test.only : test;
};

describe("Unit Tests: MockContentDisplayService", () => {
  type TestData = UriPath2DisplayHint & TestMode & Named;
  /**
   * Immediate service, i.e. without timeouts.
   */
  const service: ContentDisplayService = new MockContentDisplayService(MOCK_SERVICE_TEST_CONFIG);

  const testEachDisplayHint = (serviceFn: (uriPath: UriPath) => Observable<DisplayHint>, testCases: TestData[]): void => {
    describe.each<TestData>(testCases)('[$#] $name - Input: $uriPath',
      ({ name, uriPath, expected, ...config }: TestData) => {
        const testFn = modalTest(config);
        const expectedHints: DisplayHint[] = (<DisplayHint[]>[]).concat(expected);

        testFn(`Async Test for: ${name}`, (done) => {
          serviceFn.call(service, uriPath).subscribe({
            next: ({ name, classes }: DisplayHint) => {
              // We should still have some states defined. Otherwise, we got more
              // states than we expected.
              expect(expectedHints.length).toBeGreaterThan(0);

              const current = expectedHints.shift();

              expect(name).toBe(current?.name);
              expect(classes?.sort()).toEqual(current?.classes?.sort() || []);
            },
            error: (error: unknown) => {
              throw error;
            },
            complete: () => done(),
          });
        });
      });
  };

  describe("getDisplayHint", () => {
    /**
     * Tests for display name behavior.
     */
    const nameCases: TestData[] = [
      {
        name: "Should provide first name.",
        uriPath: `content/555${0 /* first name */}002`,
        expected: {
          name: `${CONTENT_NAME_FALSY} Document #5550002`,
          classes: ["content--0"],
        }
      },
      {
        name: "Should provide second name.",
        uriPath: `content/555${1 /* second name */}002`,
        expected: {
          name: `${CONTENT_NAME_TRUTHY} Document #5551002`,
          classes: ["content--1"],
        }
      },
      {
        name: "Should provide a sequence of name changes.",
        uriPath: `content/555${2 /* changing names */}002`,
        expected: [
          {
            name: `${CONTENT_NAME_FALSY} Document #5552002`,
            classes: ["content--0"],
          },
          {
            name: `${CONTENT_NAME_TRUTHY} Document #5552002`,
            classes: ["content--1"],
          },
          {
            name: `${CONTENT_NAME_FALSY} Document #5552002`,
            classes: ["content--0"],
          },
        ],
      },
    ];

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

    const unreadableCases: TestData[] = [
      {
        name: "Should provide a readable name.",
        uriPath: `content/6660${0 /* readable */}02`,
        expected: {
          name: `${CONTENT_NAME_FALSY} Document #6660002`,
          classes: ["content--0"],
        }
      },
      {
        name: "Should provide an unreadable name.",
        uriPath: `content/6660${1 /* unreadable */}02`,
        expected: {
          name: `${CONTENT_NAME_UNREADABLE} Document #6660102`,
          classes: [],
        }
      },
      {
        name: "Should provide a sequence of readable/unreadable changes.",
        uriPath: `content/6660${2 /* changing state */}02`,
        expected: [
          {
            name: `${CONTENT_NAME_FALSY} Document #6660202`,
            classes: ["content--0"],
          },
          {
            name: `${CONTENT_NAME_UNREADABLE} Document #6660202`,
            classes: [],
          },
          {
            name: `${CONTENT_NAME_FALSY} Document #6660202`,
            classes: ["content--0"],
          },
        ],
      },
    ];

    const testCases: TestData[] = [
      ...nameCases,
      ...unmatchedCases,
      ...unreadableCases,
    ];

    testEachDisplayHint(MockContentDisplayService.prototype.getDisplayHint, testCases);
  });

  describe("getStateDisplayHint", () => {
    const expectedCheckedOutState: DisplayHint = {
      name: `Checked Out`,
      classes: ["icon--checked-out"],
    };
    const expectedCheckedInState: DisplayHint = {
      name: `Checked In`,
      classes: ["icon--checked-in"],
    };
    const expectedUnreadableState: DisplayHint = {
      name: "",
      classes: [],
    };

    /**
     * Tests for display content state.
     */
    const contentStateCases: TestData[] = [
      {
        name: "Should signal checked-out state.",
        uriPath: `content/77700${0 /* checked out */}2`,
        expected: expectedCheckedOutState,
      },
      {
        name: "Should signal checked-in state.",
        uriPath: `content/77700${1 /* checked in */}2`,
        expected: expectedCheckedInState,
      },
      {
        name: "Should provide a sequence of state changes.",
        uriPath: `content/77700${2 /* changing state */}2`,
        expected: [
          expectedCheckedOutState,
          expectedCheckedInState,
          expectedCheckedOutState,
        ],
      },
    ];

    const cornerCases: TestData[] = [
      {
        name: "Should never signal checked-out state for folders.",
        uriPath: `content/77700${0 /* checked out */}1`,
        expected: expectedCheckedInState,
      },
    ];

    /**
     * Test cases for URI paths, which don't match the "magic pattern" to trigger
     * some configured state or state-change.
     */
    const unmatchedCases: TestData[] = [
      {
        name: "Should use falsy defaults, i.e. should be checked out by default for documents.",
        uriPath: "content/0",
        expected: expectedCheckedOutState,
      },
      {
        name: "Should use falsy defaults. Nevertheless, should be checked in by default for folders.",
        uriPath: "content/1",
        expected: expectedCheckedInState,
      },
    ];

    const unreadableCases: TestData[] = [
      {
        name: "Should provide readable checked-out state.",
        uriPath: `content/7770${0 /* readable */}${0 /* checked out */}2`,
        expected: expectedCheckedOutState,
      },
      {
        name: "Should provide readable checked-in state.",
        uriPath: `content/7770${0 /* readable */}${0 /* checked in */}2`,
        expected: expectedCheckedInState,
      },
      {
        name: "Should provide unreadable checked-out state.",
        uriPath: `content/7770${1 /* unreadable */}${0 /* checked out */}2`,
        expected: expectedUnreadableState,
      },
      {
        name: "Should provide unreadable checked-in state.",
        uriPath: `content/7770${1 /* unreadable */}${0 /* checked in */}2`,
        expected: expectedUnreadableState,
      },
      {
        name: "Should provide a sequence of readable/unreadable changes for checked-out state.",
        uriPath: `content/7770${2 /* toggle readable */}${0 /* checked out */}2`,
        expected: [
          expectedCheckedOutState,
          expectedUnreadableState,
          expectedCheckedOutState,
        ],
      },
      {
        name: "Should provide a sequence of readable/unreadable changes for checked-in state.",
        uriPath: `content/7770${2 /* toggle readable */}${1 /* checked in */}2`,
        expected: [
          expectedCheckedInState,
          expectedUnreadableState,
          expectedCheckedInState,
        ],
      },
    ];

    const testCases: TestData[] = [
      ...contentStateCases,
      ...cornerCases,
      ...unmatchedCases,
      ...unreadableCases,
    ];

    testEachDisplayHint(MockContentDisplayService.prototype.getStateDisplayHint, testCases);
  });

  describe("getTypeDisplayHint", () => {
    const expectedFolderState: DisplayHint = {
      name: `Folder`,
      classes: ["icon--folder"],
    };
    const expectedDocumentState: DisplayHint = {
      name: `Document`,
      classes: ["icon--document"],
    };
    const expectedUnreadableState: DisplayHint = {
      name: "Unreadable",
      classes: ["icon--lock"],
    };

    const numbers = [...Array(10).keys()];
    const typeTestCases: TestData[] = numbers.map((no) => {
      if (no % 2 === 0) {
        return {
          name: "Should signal document type.",
          uriPath: `content/888000${no}`,
          expected: expectedDocumentState,
        };
      } else {
        return {
          name: "Should signal folder type.",
          uriPath: `content/888000${no}`,
          expected: expectedFolderState,
        };
      }
    });

    const unreadableCases: TestData[] = [
      {
        name: "Should provide unreadable type hint for document.",
        uriPath: `content/8880${1 /* unreadable */}0${0 /* document */}`,
        expected: expectedUnreadableState,
      },
      {
        name: "Should provide unreadable type hint for folder.",
        uriPath: `content/8880${1 /* unreadable */}0${1 /* folder */}`,
        expected: expectedUnreadableState,
      },
      {
        name: "Should provide a sequence of readable/unreadable changes for folder type.",
        uriPath: `content/7770${2 /* toggle readable */}0${1 /* folder */}`,
        expected: [
          expectedFolderState,
          expectedUnreadableState,
          expectedFolderState,
        ],
      },
      {
        name: "Should provide a sequence of readable/unreadable changes for document type.",
        uriPath: `content/7770${2 /* toggle readable */}0${0 /* document */}`,
        expected: [
          expectedDocumentState,
          expectedUnreadableState,
          expectedDocumentState,
        ],
      },
    ];

    const testCases: TestData[] = [
      ...typeTestCases,
      ...unreadableCases,
    ];

    testEachDisplayHint(MockContentDisplayService.prototype.getStateDisplayHint, testCases);
  });
});
