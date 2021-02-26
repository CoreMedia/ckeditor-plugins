import "jest-xml-matcher";
import { Strictness } from "../src/RichTextSchema";
import HtmlFilter from "@coremedia/ckeditor5-dataprocessor-support/dataprocessor/HtmlFilter";
import { createToDataFilterRules } from "../src/RichTextDataProcessor";

type CommentableTestData = {
  /**
   * Some comment which may help understanding the test case better.
   */
  comment?: string;
};

type DisableableTestCase = {
  /**
   * If set to `true` or non-empty string this test will be ignored.
   * A string will be printed as message.
   */
  disabled?: boolean | string;
};

type StrictnessAwareTestData = {
  /**
   * To which strictness modes the test applies to.
   */
  strictness: Strictness[];
};

type XmlInputTestData = {
  /**
   * Input.
   */
  input: string;
};

type ExpectTransformationTestData = {
  expected: string;
};

const parser = new DOMParser();
const serializer = new XMLSerializer();
const strictnessKeys = Object.keys(Strictness).filter((x) => !(parseInt(x) >= 0));
const whitespace = " \t\n";
const text = `Lorem${whitespace}Ipsum`;
const ns_richtext = "http://www.coremedia.com/2003/richtext-1.0";
const ns_xhtml = "http://www.w3.org/1999/xhtml";
const ns_xdiff = "http://www.coremedia.com/2015/xdiff";

function flatten<T>(arr: T[][]): T[] {
  const empty: T[] = [];
  return empty.concat.apply(empty, arr);
}

describe("Default Data Filter Rules", () => {
  type DataFilterRulesTestData = CommentableTestData &
    DisableableTestCase &
    StrictnessAwareTestData &
    XmlInputTestData &
    ExpectTransformationTestData;
  type DataFilterTestFixture = [string, DataFilterRulesTestData];

  const uncategorizedFixtures: DataFilterTestFixture[] = [
    [
      "DISABLED#1: Example how you may (temporarily) disable a test.",
      {
        disabled: "Disabled for demonstration purpose only.",
        strictness: [Strictness.STRICT],
        input: `<div xmlns="${ns_richtext}"/>`,
        expected: `<div xmlns="${ns_richtext}"/>`,
      },
    ],
    [
      "EMPTY#1: Should not modify empty RichText.",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        input: `<div xmlns="${ns_richtext}"/>`,
        expected: `<div xmlns="${ns_richtext}"/>`,
      },
    ],
    [
      "DIV#1: Should replace nested DIVs by P.",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        input: `<div xmlns="${ns_richtext}"><div>${text}</div></div>`,
        expected: `<div xmlns="${ns_richtext}"><p>${text}</p></div>`,
      },
    ],
  ];
  const listFixtures: DataFilterTestFixture[] =
    flatten(["ul", "ol"].map(el => {
      const key = el.toUpperCase();
      return [
        [
          `${key}#1: Should remove if empty, as empty <${el}> not allowed by DTD.`,
          {
            strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
            input: `<div xmlns="${ns_richtext}"><${el}>${whitespace}</${el}></div>`,
            expected: `<div xmlns="${ns_richtext}"/>`,
          },
        ],
        [
          `${key}#2: Should keep if valid.`,
          {
            strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
            input: `<div xmlns="${ns_richtext}"><${el}><li>${text}</li></${el}></div>`,
            expected: `<div xmlns="${ns_richtext}"><${el}><li>${text}</li></${el}></div>`,
          },
        ],
        [
          `${key}#3: Should keep class attribute.`,
          {
            strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
            input: `<div xmlns="${ns_richtext}"><${el} class="alpha"><li>${text}</li></${el}></div>`,
            expected: `<div xmlns="${ns_richtext}"><${el} class="alpha"><li>${text}</li></${el}></div>`,
          },
        ],
      ];
    }));
  const headingFixtures: DataFilterTestFixture[] =
    flatten([1, 2, 3, 4, 5, 6].map(level => {
      const el = `h${level}`;
      const key = el.toUpperCase();
      const expectedClass = `p--heading-${level}`;

      return [
        [
          `${key}#1: Should transform to empty <p> if empty.`,
          {
            strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
            input: `<div xmlns="${ns_richtext}"><${el}/></div>`,
            expected: `<div xmlns="${ns_richtext}"><p class="${expectedClass}"/></div>`,
          },
        ],
        [
          `${key}#2: Should transform to <p> with class attribute.`,
          {
            strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
            input: `<div xmlns="${ns_richtext}"><${el}>${text}</${el}></div>`,
            expected: `<div xmlns="${ns_richtext}"><p class="${expectedClass}">${text}</p></div>`,
          },
        ],
      ];
    }));
  const defaultBlockFixtures: DataFilterTestFixture[] =
    flatten(["p", "pre", "blockquote"].map(el => {
      const key = el.toUpperCase();
      return [
        [
          `${key}#1: Should keep if empty.`,
          {
            strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
            input: `<div xmlns="${ns_richtext}"><${el}/></div>`,
            expected: `<div xmlns="${ns_richtext}"><${el}/></div>`,
          },
        ],
        [
          `${key}#2: Should adapt namespace if required.`,
          {
            strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
            input: `<div xmlns="${ns_richtext}"><${el} xmlns="${ns_xhtml}"/></div>`,
            expected: `<div xmlns="${ns_richtext}"><${el}/></div>`,
          },
        ],
        [
          `${key}#3: Should keep class attribute.`,
          {
            strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
            input: `<div xmlns="${ns_richtext}"><${el} class="alpha">${text}</${el}></div>`,
            expected: `<div xmlns="${ns_richtext}"><${el} class="alpha">${text}</${el}></div>`,
          },
        ],
      ];
    }));
  const replaceInlineSimpleFixtures: DataFilterTestFixture[] =
    flatten([["b", "strong"], ["i", "em"]].map(([from, to]) => {
      const key = from.toUpperCase();
      return [
        [
          `${key}#1: Should replace <${from}> by <${to}>.`,
          {
            strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
            input: `<div xmlns="${ns_richtext}"><p><${from}>${text}</${from}></p></div>`,
            expected: `<div xmlns="${ns_richtext}"><p><${to}>${text}</${to}></p></div>`,
          },
        ],
        [
          `${key}#2: Should keep <${to}> when transformed.`,
          {
            strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
            input: `<div xmlns="${ns_richtext}"><p><${to}>${text}</${to}></p></div>`,
            expected: `<div xmlns="${ns_richtext}"><p><${to}>${text}</${to}></p></div>`,
          },
        ],
      ];
    }));
  const replaceInlineBySpanFixtures: DataFilterTestFixture[] =
    flatten([
      ["u", "underline"],
      ["strike", "strike"],
      ["s", "strike"],
      ["del", "strike"],
    ].map(([from, toClass]) => {
      const key = from.toUpperCase();
      return [
        [
          `${key}#1: Should replace <${from}> by <span class="${toClass}">.`,
          {
            strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
            input: `<div xmlns="${ns_richtext}"><p><${from}>${text}</${from}></p></div>`,
            expected: `<div xmlns="${ns_richtext}"><p><span class="${toClass}">${text}</span></p></div>`,
          },
        ],
        [
          `${key}#2: Should keep <span class="${toClass}> when transformed.`,
          {
            strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
            input: `<div xmlns="${ns_richtext}"><p><span class="${toClass}">${text}</span></p></div>`,
            expected: `<div xmlns="${ns_richtext}"><p><span class="${toClass}">${text}</span></p></div>`,
          },
        ],
      ];
    }));
  /*
   * In CKEditor 4 data-processing we did some clean-up of elements. While this
   * was most likely dealing with shortcomings of CKEditor 4, we want to ensure
   * (for now) that the clean-up mechanisms still work, at least to provide
   * compatibility with existing richtext data.
   *
   * Later, it may become a configuration option to keep this legacy behavior.
   */
  const cleanupFixtures: DataFilterTestFixture[] = [
    [
      "CLEANUP#1: Remove top-level <br> tag.",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        input: `<div xmlns="${ns_richtext}"><br/></div>`,
        expected: `<div xmlns="${ns_richtext}"/>`,
      },
    ],
    [
      "CLEANUP#2: Remove trailing <br> tag in <td>.",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        input: `<div xmlns="${ns_richtext}"><table><tr><td>${text}<br/></td></tr></table></div>`,
        expected: `<div xmlns="${ns_richtext}"><table><tr><td>${text}</td></tr></table></div>`,
      },
    ],
    [
      "CLEANUP#3: Remove trailing <br> tag in <p>.",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        input: `<div xmlns="${ns_richtext}"><p>${text}<br/></p></div>`,
        expected: `<div xmlns="${ns_richtext}"><p>${text}</p></div>`,
      },
    ],
    [
      "CLEANUP#4: Remove <td> if it only contains <br>, along with any must-not-be-empty parents (tr and table)",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        input: `<div xmlns="${ns_richtext}"><table><tr><td><br/></td></tr></table></div>`,
        expected: `<div xmlns="${ns_richtext}"/>`,
      },
    ],
    [
      "CLEANUP#5: Remove <td> if it only contains <br>, along with any must-not-be-empty parents (tr, tbody and table)",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        input: `<div xmlns="${ns_richtext}"><table><tbody><tr><td><br/></td></tr></tbody></table></div>`,
        expected: `<div xmlns="${ns_richtext}"/>`,
      },
    ],
    [
      "CLEANUP#6: Remove irrelevant <span>.",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        input: `<div xmlns="${ns_richtext}"><p><span>${text}</span></p></div>`,
        expected: `<div xmlns="${ns_richtext}"><p>${text}</p></div>`,
      },
    ],
  ];
  /*
   * The <xdiff:span> element (xmlns:xdiff="http://www.coremedia.com/2015/xdiff")
   * must not make it to the server. There may be scenarios (for example
   * copy & paste), where these elements become part of the richtext to store
   * on the server.
   *
   * Note, that the namespace declaration will not make it onto the server, but
   * needs to be added for testing purpose only, as there is no "namespace
   * cleanup feature".
   */
  const xdiffFixtures: DataFilterTestFixture[] = [
    [
      "XDIFF#1: Should remove invalid <xdiff:span> tag, but keep children.",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        input: `<div xmlns="${ns_richtext}" xmlns:xdiff="${ns_xdiff}"><p><xdiff:span xdiff:class="diff-html-removed">${text}</xdiff:span></p></div>`,
        expected: `<div xmlns="${ns_richtext}" xmlns:xdiff="${ns_xdiff}"><p>${text}</p></div>`,
      },
    ],
  ];
  const testFixtures: DataFilterTestFixture[] = [
    ...uncategorizedFixtures,
    ...listFixtures,
    ...headingFixtures,
    ...defaultBlockFixtures,
    ...replaceInlineSimpleFixtures,
    ...replaceInlineBySpanFixtures,
    ...cleanupFixtures,
    ...xdiffFixtures,
  ].sort((a, b) => {
    const nameA = a[0];
    const nameB = b[0];
    if (nameA < nameB) {
      return -1;
    }
    if (nameA > nameB) {
      return 1;
    }
    return 0;
  });

  describe.each<DataFilterTestFixture>(testFixtures)(
    "(%#) %s",
    (name: string, testData: DataFilterRulesTestData) => {
      const { disabled, strictness, input, expected } = testData;

      for (const currentStrictness of strictness) {
        const filter = new HtmlFilter(createToDataFilterRules(currentStrictness));

        const testCaseName = `${name} (mode: ${strictnessKeys[currentStrictness]})`;
        const testCase = () => {
          const xmlDocument: Document = parser.parseFromString(input, "text/xml");
          filter.applyTo(xmlDocument.documentElement);
          const actualXml = serializer.serializeToString(xmlDocument.documentElement);
          expect(actualXml).toEqualXML(expected);
        };

        if (disabled) {
          const disabledMessage = typeof disabled === "string" ? ` (${disabled})` : "";
          const disabledName = `${testCaseName}${disabledMessage}`;
          test.skip(disabledName, testCase);
        } else {
          test(testCaseName, testCase);
        }
      }
    }
  )
});
