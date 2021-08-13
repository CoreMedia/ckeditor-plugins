import ContentDisplayService from "@coremedia/coremedia-studio-integration/content/ContentDisplayService";
import MockContentDisplayService, {
  CONTENT_NAME_FALSY,
  CONTENT_NAME_TRUTHY,
  CONTENT_NAME_UNREADABLE,
  EVIL_CONTENT_NAME_FALSY,
  EVIL_CONTENT_NAME_TRUTHY
} from "../../src/content/MockContentDisplayService";
import { UriPath } from "@coremedia/coremedia-studio-integration/content/UriPath";
import { Observable } from "rxjs";
import { serviceAgent } from "@coremedia/studio-apps-service-agent";
import ContentDisplayServiceDescriptor
  from "@coremedia/coremedia-studio-integration/content/ContentDisplayServiceDescriptor";
import DisplayHint from "@coremedia/coremedia-studio-integration/content/DisplayHint";
import ContentAsLink from "@coremedia/coremedia-studio-integration/content/ContentAsLink";

const MOCK_SERVICE_TEST_CONFIG = {
  maxFirstDelayMs: 0,
  changeDelayMs: 0
};

const CHECKED_OUT = "Checked Out";
const CHECKED_OUT_ICON = "icon--checked-out";
const CHECKED_IN = "Checked In";
const CHECKED_IN_ICON = "icon--checked-in";
const FOLDER_TYPE = "Folder";
const FOLDER_ICON = "icon--folder";
const DOCUMENT_TYPE = "Document";
const DOCUMENT_ICON = "icon--document";
const UNREADABLE_TYPE = "Unreadable";
const UNREADABLE_ICON = "icon--lock";

const escapeRegExp = (str: string): string => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

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

interface UriPath2ContentAsLink {
  /**
   * The URI path which _contains_ the configuration as part of its magic
   * numeric ID. This will be the input to the service.
   */
  uriPath: string;
  /**
   * Expected states to take before _complete_ is triggered (in case of the
   * immediate mode with all-zero timeouts/intervals).
   */
  expected: ContentAsLink | ContentAsLink[];
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

  describe("serviceAgent Integration", () => {
    const service = new MockContentDisplayService();
    serviceAgent.registerService(service);

    test("Should be able to retrieve mock service.", () => {
      expect(serviceAgent.fetchService<ContentDisplayService>(new ContentDisplayServiceDescriptor())).resolves.toBe(service);
    });
  });

  type DisplayHintTestData = UriPath2DisplayHint & TestMode & Named;
  type ContentAsLinkTestData = UriPath2ContentAsLink & TestMode & Named;

  /**
   * Immediate service, i.e. without timeouts.
   */
  const service: ContentDisplayService = new MockContentDisplayService(MOCK_SERVICE_TEST_CONFIG);

  const testEachDisplayHint = (serviceFn: (uriPath: UriPath) => Observable<DisplayHint>, testCases: DisplayHintTestData[]): void => {
    describe.each<DisplayHintTestData>(testCases)('[$#] $name - Input: $uriPath',
      ({ name, uriPath, expected, ...config }: DisplayHintTestData) => {
        const testFn = modalTest(config);
        const expectedHints: DisplayHint[] = (<DisplayHint[]>[]).concat(expected);
        const recordedHints: DisplayHint[] = [];

        testFn(`Async Test for: ${name}`, (done) => {
          expect.assertions(1 + 3 * expectedHints.length);
          serviceFn.call(service, uriPath).subscribe({
            next: (received: DisplayHint) => recordedHints.push(received),
            error: (error: unknown) => {
              done(error);
            },
            complete: () => {
              expect(recordedHints).toHaveLength(expectedHints.length);
              recordedHints.forEach(({ name, classes }: DisplayHint) => {
                // We should still have some states defined. Otherwise, we got more
                // states than we expected.
                expect(expectedHints.length).toBeGreaterThan(0);

                const current = expectedHints.shift();

                expect(name).toBe(current?.name);
                expect(classes?.sort()).toEqual(current?.classes?.sort() || []);
              });
              done();
            },
          });
        });
      });
  };

  const testEachContentAsLink = (serviceFn: (uriPath: UriPath) => Observable<ContentAsLink>, testCases: ContentAsLinkTestData[]): void => {
    describe.each<ContentAsLinkTestData>(testCases)('[$#] $name - Input: $uriPath',
      ({ name, uriPath, expected, ...config }: ContentAsLinkTestData) => {
        const testFn = modalTest(config);
        const expectedHints: ContentAsLink[] = (<ContentAsLink[]>[]).concat(expected);
        const recordedHints: ContentAsLink[] = [];

        testFn(`Async Test for: ${name}`, (done) => {
          expect.assertions(1 + 7 * expectedHints.length);
          serviceFn.call(service, uriPath).subscribe({
            next: (received: ContentAsLink) => recordedHints.push(received),
            error: (error: unknown) => {
              done(error);
            },
            complete: () => {
              expect(recordedHints).toHaveLength(expectedHints.length);
              recordedHints.forEach(({ content, type, state }: ContentAsLink) => {
                // We should still have some states defined. Otherwise, we got more
                // states than we expected.
                expect(expectedHints.length).toBeGreaterThan(0);

                const current = expectedHints.shift();

                expect(content.name).toBe(current?.content.name);
                expect(type.name).toBe(current?.type.name);
                expect(state.name).toBe(current?.state.name);
                expect(content.classes?.sort()).toEqual(current?.content.classes?.sort() || []);
                expect(type.classes?.sort()).toEqual(current?.type.classes?.sort() || []);
                expect(state.classes?.sort()).toEqual(current?.state.classes?.sort() || []);
              });
              done();
            },
          });
        });
      });
  };

  describe("name", () => {

    test.each`
    uriPath              | expected
    ${"content/80000"}   | ${CONTENT_NAME_FALSY}
    ${"content/81000"}   | ${CONTENT_NAME_TRUTHY}
    ${"content/82000"}   | ${CONTENT_NAME_TRUTHY}
    ${"content/6660000"} | ${EVIL_CONTENT_NAME_FALSY}
    ${"content/6661000"} | ${EVIL_CONTENT_NAME_TRUTHY}
    ${"content/6662000"} | ${EVIL_CONTENT_NAME_TRUTHY}
    `("[$#] URI path $uriPath should resolve to name: $expected", ({ uriPath, expected }) => {
      const contentId = parseInt(uriPath.replace("content/", ""));
      const regExp = new RegExp(`^${escapeRegExp(expected)}.*${contentId}.*$`);
      expect.assertions(1);
      expect(service.name(uriPath)).resolves.toMatch(regExp);
    });

    test.each`
    uriPath
    ${"content/80100"}
    ${"content/81200"}
    ${"content/6660100"}
    ${"content/6661200"}
    `("[$#] URI path $uriPath should reject promise, as it is unreadable", ({ uriPath }) => {
      expect.assertions(1);
      expect(service.name(uriPath)).rejects.toContain(uriPath);
    });

  });

  describe("observe_asLink", () => {
    const falsyContentStatic = {
      classes: ["content--0"],
    };
    const truthyContentStatic = {
      classes: ["content--1"],
    };
    const falsyType = {
      type: {
        name: DOCUMENT_TYPE,
        classes: [DOCUMENT_ICON],
      },
    };
    const truthyType = {
      type: {
        name: FOLDER_TYPE,
        classes: [FOLDER_ICON],
      },
    };
    const falsyState = {
      state: {
        name: CHECKED_OUT,
        classes: [CHECKED_OUT_ICON],
      },
    };
    const truthyState = {
      state: {
        name: CHECKED_IN,
        classes: [CHECKED_IN_ICON],
      },
    };
    /*
     * Pitfall: For toggle mode, ensure that you toggle only one state, as you
     * may get unpredictable results, otherwise.
     *
     * The tests in here are not as "deep" as for the internal observables. It
     * is just meant to ensure, that the combination (which is actually part
     * of RxJS) works as expected.
     */
    const testCases: ContentAsLinkTestData[] = [
      {
        name: "Should provide first name with all others as default.",
        uriPath: `content/444${0 /* first name */}${0 /* readable */}${0 /* checked out */}${2 /* document */}`,
        expected: {
          content: {
            name: `${CONTENT_NAME_FALSY} Document #4440002`,
            ...falsyContentStatic,
          },
          ...falsyType,
          ...falsyState,
        }
      },
      {
        name: "Should provide second name with all others as default, despite that it should be a folder now.",
        uriPath: `content/444${1 /* first name */}${0 /* readable */}${0 /* checked out, ignored for folder */}${1 /* folder */}`,
        expected: {
          content: {
            name: `${CONTENT_NAME_TRUTHY} Folder #4441001`,
            ...truthyContentStatic,
          },
          ...truthyType,
          ...truthyState,
        }
      },
      {
        name: "Should toggle name with all others as default.",
        uriPath: `content/444${2 /* first name */}${0 /* readable */}${0 /* checked out */}${2 /* document */}`,
        expected: [
          {
            content: {
              name: `${CONTENT_NAME_FALSY} Document #4442002`,
              ...falsyContentStatic,
            },
            ...falsyType,
            ...falsyState,
          },
          {
            content: {
              name: `${CONTENT_NAME_TRUTHY} Document #4442002`,
              ...truthyContentStatic,
            },
            ...falsyType,
            ...falsyState,
          },
          {
            content: {
              name: `${CONTENT_NAME_FALSY} Document #4442002`,
              ...falsyContentStatic,
            },
            ...falsyType,
            ...falsyState,
          },
        ]
      },
    ];

    testEachContentAsLink(MockContentDisplayService.prototype.observe_asLink, testCases);
  });

  describe("observe_name", () => {
    const nameCases: DisplayHintTestData[] = [
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

    const evilCases: DisplayHintTestData[] = [
      {
        name: "Should provide first name.",
        uriPath: `content/666${0 /* first name */}002`,
        expected: {
          name: `${EVIL_CONTENT_NAME_FALSY} Document #6660002`,
          classes: ["content--0"],
        }
      },
      {
        name: "Should provide second name.",
        uriPath: `content/666${1 /* second name */}002`,
        expected: {
          name: `${EVIL_CONTENT_NAME_TRUTHY} Document #6661002`,
          classes: ["content--1"],
        }
      },
      {
        name: "Should provide a sequence of name changes.",
        uriPath: `content/666${2 /* changing names */}002`,
        expected: [
          {
            name: `${EVIL_CONTENT_NAME_FALSY} Document #6662002`,
            classes: ["content--0"],
          },
          {
            name: `${EVIL_CONTENT_NAME_TRUTHY} Document #6662002`,
            classes: ["content--1"],
          },
          {
            name: `${EVIL_CONTENT_NAME_FALSY} Document #6662002`,
            classes: ["content--0"],
          },
        ],
      },
    ];

    /**
     * Test cases for URI paths, which don't match the "magic pattern" to trigger
     * some configured state or state-change.
     */
    const unmatchedCases: DisplayHintTestData[] = [
      {
        name: "Should use falsy defaults, but detect that this is a document.",
        uriPath: "content/0",
        expected: {
          name: `${CONTENT_NAME_FALSY} Document #0`,
          classes: ["content--0"],
        }
      },
      {
        name: "Special case: Root Folder must provide empty name.",
        uriPath: "content/1",
        expected: {
          name: ``,
          classes: [],
        }
      },
      {
        name: "Should use falsy defaults, but detect that this is a folder.",
        uriPath: "content/3",
        expected: {
          name: `${CONTENT_NAME_FALSY} Folder #3`,
          classes: ["content--0"],
        }
      },
    ];

    const unreadableCases: DisplayHintTestData[] = [
      {
        name: "Should provide a readable name.",
        uriPath: `content/7770${0 /* readable */}02`,
        expected: {
          name: `${CONTENT_NAME_FALSY} Document #7770002`,
          classes: ["content--0"],
        }
      },
      {
        name: "Should provide an unreadable name.",
        uriPath: `content/7770${1 /* unreadable */}02`,
        expected: {
          name: `${CONTENT_NAME_UNREADABLE} Document #7770102`,
          classes: [],
        }
      },
      {
        name: "Should provide a sequence of readable/unreadable changes.",
        uriPath: `content/7770${2 /* changing state */}02`,
        expected: [
          {
            name: `${CONTENT_NAME_FALSY} Document #7770202`,
            classes: ["content--0"],
          },
          {
            name: `${CONTENT_NAME_UNREADABLE} Document #7770202`,
            classes: [],
          },
          {
            name: `${CONTENT_NAME_FALSY} Document #7770202`,
            classes: ["content--0"],
          },
        ],
      },
    ];

    const testCases: DisplayHintTestData[] = [
      ...nameCases,
      ...evilCases,
      ...unmatchedCases,
      ...unreadableCases,
    ];

    testEachDisplayHint(MockContentDisplayService.prototype.observe_name, testCases);
  });

  describe("observe_state", () => {
    const expectedCheckedOutState: DisplayHint = {
      name: CHECKED_OUT,
      classes: [CHECKED_OUT_ICON],
    };
    const expectedCheckedInState: DisplayHint = {
      name: CHECKED_IN,
      classes: [CHECKED_IN_ICON],
    };
    const expectedUnreadableState: DisplayHint = {
      name: "",
      classes: [],
    };

    /**
     * Tests for display content state.
     */
    const contentStateCases: DisplayHintTestData[] = [
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

    const cornerCases: DisplayHintTestData[] = [
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
    const unmatchedCases: DisplayHintTestData[] = [
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

    const unreadableCases: DisplayHintTestData[] = [
      {
        name: "Should provide readable checked-out state.",
        uriPath: `content/7770${0 /* readable */}${0 /* checked out */}2`,
        expected: expectedCheckedOutState,
      },
      {
        name: "Should provide readable checked-in state.",
        uriPath: `content/7770${0 /* readable */}${1 /* checked in */}2`,
        expected: expectedCheckedInState,
      },
      {
        name: "Should provide unreadable checked-out state.",
        uriPath: `content/7770${1 /* unreadable */}${0 /* checked out */}2`,
        expected: expectedUnreadableState,
      },
      {
        name: "Should provide unreadable checked-in state.",
        uriPath: `content/7770${1 /* unreadable */}${1 /* checked in */}2`,
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

    const testCases: DisplayHintTestData[] = [
      ...contentStateCases,
      ...cornerCases,
      ...unmatchedCases,
      ...unreadableCases,
    ];

    testEachDisplayHint(MockContentDisplayService.prototype.observe_state, testCases);
  });

  describe("observe_type", () => {
    const expectedFolderState: DisplayHint = {
      name: FOLDER_TYPE,
      classes: [FOLDER_ICON],
    };
    const expectedDocumentState: DisplayHint = {
      name: DOCUMENT_TYPE,
      classes: [DOCUMENT_ICON],
    };
    const expectedUnreadableState: DisplayHint = {
      name: UNREADABLE_TYPE,
      classes: [UNREADABLE_ICON],
    };

    const numbers = [...Array(10).keys()];
    const typeTestCases: DisplayHintTestData[] = numbers.map((no) => {
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

    const unreadableCases: DisplayHintTestData[] = [
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

    const testCases: DisplayHintTestData[] = [
      ...typeTestCases,
      ...unreadableCases,
    ];

    testEachDisplayHint(MockContentDisplayService.prototype.observe_type, testCases);
  });
});
