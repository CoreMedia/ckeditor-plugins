import "jest-xml-matcher";
import { Strictness } from "../src/RichTextSchema";
import { HtmlFilter } from "@coremedia/ckeditor5-dataprocessor-support/index";
import Editor from "@ckeditor/ckeditor5-core/src/editor/editor";
import { getConfig } from "../src/CoreMediaRichTextConfig";

jest.mock("@ckeditor/ckeditor5-core/src/editor/editor");

/**
 * Will be checked for "startsWith" for a given Data Driven Testname. Meant
 * to be used for debugging purpose. Example:
 *
 * `TEST_SELECTOR = "TABLE#3"`
 */
const TEST_SELECTOR = "";

const MOCK_EDITOR = new Editor();

const LAST_RESORT = "This is a last-resort fix, prior to sending data to the " +
  "server. It's actually almost an indicator of missing explicit data " +
  "processing. That's why `toView` will not be able to restore the original " +
  "result.";

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
   * Input. This is actually HTML, but already embedded in CoreMedia RichText
   * DIV, as this is the pre-processing done by RichTextDataProcessor.
   */
  inputFromView: string;
};

type ExpectTransformationTestData = {
  /**
   * Expected result of mapping input to data.
   */
  expectedData: string;
  /**
   * <p>
   * Optional: Expected result of mapping generated data back to view.
   * This still contains the RichText Namespace DIV, as this will be
   * removed later in processing.
   * </p>
   * <p>
   * If just "true", it will expect the same result as original input.
   * </p>
   */
  expectedView?: string | boolean;
};

const parser = new DOMParser();
const serializer = new XMLSerializer();
const strictnessKeys = Object.keys(Strictness).filter((x) => !(parseInt(x) >= 0));
const whitespace = " \t\n";
const text = `Lorem${whitespace}Ipsum`;
const attr_class = "alpha";
const attr_link_external = "https://example.org/"
const ns_richtext = "http://www.coremedia.com/2003/richtext-1.0";
const ns_xlink = "http://www.w3.org/1999/xlink";
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
        inputFromView: `<div xmlns="${ns_richtext}"/>`,
        expectedData: `<div xmlns="${ns_richtext}"/>`,
      },
    ],
    [
      "EMPTY#1: Should not modify empty RichText.",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        inputFromView: `<div xmlns="${ns_richtext}"/>`,
        expectedData: `<div xmlns="${ns_richtext}"/>`,
        expectedView: true,
      },
    ],
    [
      "DIV#1: Should replace nested DIVs by P.",
      {
        comment: `${LAST_RESORT}`,
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        inputFromView: `<div xmlns="${ns_richtext}"><div>${text}</div></div>`,
        expectedData: `<div xmlns="${ns_richtext}"><p>${text}</p></div>`,
      },
    ],
  ];
  const textFixtures: DataFilterTestFixture[] = [
    [
      "TEXT#1: Should remove text at root DIV.",
      {
        comment: `${LAST_RESORT}`,
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        inputFromView: `<div xmlns="${ns_richtext}">${text}</div>`,
        expectedData: `<div xmlns="${ns_richtext}"/>`,
      },
    ],
    [
      "TEXT#2: Should keep text at P.",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        inputFromView: `<div xmlns="${ns_richtext}"><p>${text}</p></div>`,
        expectedData: `<div xmlns="${ns_richtext}"><p>${text}</p></div>`,
        expectedView: true,
      },
    ],
    [
      "TEXT#3: Should remove text at UL (and remove empty UL).",
      {
        comment: `${LAST_RESORT}`,
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        inputFromView: `<div xmlns="${ns_richtext}"><ul>${text}</ul></div>`,
        expectedData: `<div xmlns="${ns_richtext}"/>`,
      },
    ],
    [
      "TEXT#4: Should remove text at OL (and remove empty OL).",
      {
        comment: `${LAST_RESORT}`,
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        inputFromView: `<div xmlns="${ns_richtext}"><ol>${text}</ol></div>`,
        expectedData: `<div xmlns="${ns_richtext}"/>`,
      },
    ],
    [
      "TEXT#5: Should keep text at LI.",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        inputFromView: `<div xmlns="${ns_richtext}"><ol><li>${text}</li></ol></div>`,
        expectedData: `<div xmlns="${ns_richtext}"><ol><li>${text}</li></ol></div>`,
        expectedView: true,
      },
    ],
    [
      "TEXT#6: Should keep text at PRE.",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        inputFromView: `<div xmlns="${ns_richtext}"><pre>${text}</pre></div>`,
        expectedData: `<div xmlns="${ns_richtext}"><pre>${text}</pre></div>`,
        expectedView: true,
      },
    ],
    [
      "TEXT#7: Should remove text at BLOCKQUOTE.",
      {
        comment: `${LAST_RESORT} CoreMedia RichText DTD requires blockquotes to contain for example <p> as nested element. As CKEditor by default adds a paragraph to blockquotes, we don't need any 'fix' such as surrounding the text by a paragraph.`,
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        inputFromView: `<div xmlns="${ns_richtext}"><blockquote>${text}</blockquote></div>`,
        expectedData: `<div xmlns="${ns_richtext}"><blockquote/></div>`,
      },
    ],
    [
      "TEXT#8: Should keep text at A.",
      {
        // TODO[cke] Will need to be adapted, once we officially support links.
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        inputFromView: `<div xmlns="${ns_richtext}" xmlns:xlink="${ns_xlink}"><p><a xlink:href="${attr_link_external}">${text}</a></p></div>`,
        expectedData: `<div xmlns="${ns_richtext}" xmlns:xlink="${ns_xlink}"><p><a xlink:href="${attr_link_external}">${text}</a></p></div>`,
        expectedView: true,
      },
    ],
    [
      "TEXT#9: Should keep text at SPAN.",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        inputFromView: `<div xmlns="${ns_richtext}"><p><span class="${attr_class}">${text}</span></p></div>`,
        expectedData: `<div xmlns="${ns_richtext}"><p><span class="${attr_class}">${text}</span></p></div>`,
        expectedView: true,
      },
    ],
    [
      "TEXT#10: Should remove text at BR.",
      {
        comment: `${LAST_RESORT}`,
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        inputFromView: `<div xmlns="${ns_richtext}"><p>${text}<br>${text}</br>${text}</p></div>`,
        expectedData: `<div xmlns="${ns_richtext}"><p>${text}<br/>${text}</p></div>`,
      },
    ],
    [
      "TEXT#11: Should keep text at EM.",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        inputFromView: `<div xmlns="${ns_richtext}"><p><i>${text}</i></p></div>`,
        expectedData: `<div xmlns="${ns_richtext}"><p><em>${text}</em></p></div>`,
        expectedView: true,
      },
    ],
    [
      "TEXT#12: Should keep text at STRONG.",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        inputFromView: `<div xmlns="${ns_richtext}"><p><strong>${text}</strong></p></div>`,
        expectedData: `<div xmlns="${ns_richtext}"><p><strong>${text}</strong></p></div>`,
        expectedView: true,
      },
    ],
    [
      "TEXT#13: Should keep text at SUB.",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        inputFromView: `<div xmlns="${ns_richtext}"><p><sub>${text}</sub></p></div>`,
        expectedData: `<div xmlns="${ns_richtext}"><p><sub>${text}</sub></p></div>`,
        expectedView: true,
      },
    ],
    [
      "TEXT#14: Should keep text at SUP.",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        inputFromView: `<div xmlns="${ns_richtext}"><p><sup>${text}</sup></p></div>`,
        expectedData: `<div xmlns="${ns_richtext}"><p><sup>${text}</sup></p></div>`,
        expectedView: true,
      },
    ],
    [
      "TEXT#15: Should remove text at IMG.",
      {
        comment: `${LAST_RESORT}`,
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        inputFromView: `<div xmlns="${ns_richtext}" xmlns:xlink="${ns_xlink}"><p><img alt="" xlink:href="${attr_link_external}">${text}</img></p></div>`,
        expectedData: `<div xmlns="${ns_richtext}" xmlns:xlink="${ns_xlink}"><p><img alt="" xlink:href="${attr_link_external}"/></p></div>`,
      },
    ],
    [
      "TEXT#16: Should remove text at TABLE.",
      {
        comment: `${LAST_RESORT}`,
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        inputFromView: `<div xmlns="${ns_richtext}"><table>${text}<tr><td>${text}</td></tr>${text}</table></div>`,
        expectedData: `<div xmlns="${ns_richtext}"><table><tr><td>${text}</td></tr></table></div>`,
      },
    ],
    [
      "TEXT#17: Should remove text at TBODY.",
      {
        comment: `${LAST_RESORT}`,
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        inputFromView: `<div xmlns="${ns_richtext}"><table><tbody>${text}<tr><td>${text}</td></tr>${text}</tbody></table></div>`,
        expectedData: `<div xmlns="${ns_richtext}"><table><tbody><tr><td>${text}</td></tr></tbody></table></div>`,
      },
    ],
    [
      "TEXT#18: Should remove text at TR.",
      {
        comment: `${LAST_RESORT}`,
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        inputFromView: `<div xmlns="${ns_richtext}"><table><tr>${text}<td>${text}</td>${text}</tr></table></div>`,
        expectedData: `<div xmlns="${ns_richtext}"><table><tr><td>${text}</td></tr></table></div>`,
      },
    ],
    [
      "TEXT#19: Should keep text at TD.",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        inputFromView: `<div xmlns="${ns_richtext}"><table><tr><td>${text}</td></tr></table></div>`,
        expectedData: `<div xmlns="${ns_richtext}"><table><tr><td>${text}</td></tr></table></div>`,
        expectedView: true,
      },
    ],
  ];

  const textEntityFixtures: DataFilterTestFixture[] = [
    "&nbsp;",
    "&cent;",
    "&plusmn;",
    "&Alpha;",
    "&piv;",
    "&bull;",
    "&hellip;",
    "&trade;",
    "&harr;",
    "&sum;",
    "&loz;",
    // Pile of Poo, testers favorite character
    "&#128169;",
  ].map(
    (entity, index) => [
      `TEXT/ENTITY#${(index+1)}: Entity should be resolved to plain character: ${entity}`,
      {
        comment: "toView: We don't want to introduce entities again - just because we cannot distinguish the source. General contract should be: Always use UTF-8 characters.",
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        inputFromView: `<div xmlns="${ns_richtext}"><p>${text}${encodeString(entity)}${text}</p></div>`,
        expectedData: `<div xmlns="${ns_richtext}"><p>${text}${decodeEntity(entity)}${text}</p></div>`,
        expectedView: `<div xmlns="${ns_richtext}"><p>${text}${decodeEntity(entity)}${text}</p></div>`,
      }
    ],
  );
  const tableFixtures: DataFilterTestFixture[] = [
    [
      "TABLE#1: Empty table should be removed, as it is invalid.",
      {
        comment: `${LAST_RESORT}`,
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        inputFromView: `<div xmlns="${ns_richtext}"><table/></div>`,
        expectedData: `<div xmlns="${ns_richtext}"/>`,
      },
    ],
    [
      "TABLE#2: thead should be transformed as being part of table body (not tbody...).",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        inputFromView: `<div xmlns="${ns_richtext}"><table><thead><tr><td>Head</td></tr></thead></table></div>`,
        expectedData: `<div xmlns="${ns_richtext}"><table><tr><td>Head</td></tr></table></div>`,
        expectedView: `<div xmlns="${ns_richtext}"><table><tr><td>Head</td></tr></table></div>`,
      },
    ],
    [
      "TABLE#3: tbody should be kept as is.",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        inputFromView: `<div xmlns="${ns_richtext}"><table><tbody><tr><td>Body</td></tr></tbody></table></div>`,
        expectedData: `<div xmlns="${ns_richtext}"><table><tbody><tr><td>Body</td></tr></tbody></table></div>`,
        expectedView: true,
      },
    ],
    [
      "TABLE#4: tbody should be removed, if contents need to be merged with previous thead section.",
      {
        comment: "This is a compromise due to processing order. As thead and its contents will be transformed first, there is no straightforward way to merge it with tbody.",
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        inputFromView: `<div xmlns="${ns_richtext}"><table><thead><tr><td>Head</td></tr></thead><tbody><tr><td>Body</td></tr></tbody></table></div>`,
        expectedData: `<div xmlns="${ns_richtext}"><table><tr><td>Head</td></tr><tr><td>Body</td></tr></table></div>`,
        expectedView: `<div xmlns="${ns_richtext}"><table><tr><td>Head</td></tr><tr><td>Body</td></tr></table></div>`,
      },
    ],
    [
      "TABLE#5: th should be transformed to td with class.",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        inputFromView: `<div xmlns="${ns_richtext}"><table><tr><th>Head</th></tr></table></div>`,
        expectedData: `<div xmlns="${ns_richtext}"><table><tr><td class="td--heading">Head</td></tr></table></div>`,
        expectedView: true,
      },
    ],
    [
      "TABLE#6: Should remove figure around table. By default CKEditor 5 adds a figure around table.",
      {
        comment: `${LAST_RESORT}`,
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        inputFromView: `<div xmlns="${ns_richtext}"><figure><table><tr><td>Body</td></tr></table></figure></div>`,
        expectedData: `<div xmlns="${ns_richtext}"><table><tr><td>Body</td></tr></table></div>`,
      },
    ],
    [
      "TABLE#7: Should remove empty tbody, and thus empty table.",
      {
        comment: `${LAST_RESORT}`,
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        inputFromView: `<div xmlns="${ns_richtext}"><table><tbody/></table></div>`,
        expectedData: `<div xmlns="${ns_richtext}"/>`,
      },
    ],
    [
      "TABLE#8: Should remove empty tr, and thus empty tbody, and thus empty table.",
      {
        comment: `${LAST_RESORT}`,
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        inputFromView: `<div xmlns="${ns_richtext}"><table><tbody><tr/></tbody></table></div>`,
        expectedData: `<div xmlns="${ns_richtext}"/>`,
      },
    ],
    [
      "TABLE#9: Should keep empty td.",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        inputFromView: `<div xmlns="${ns_richtext}"><table><tr><td/></tr></table></div>`,
        expectedData: `<div xmlns="${ns_richtext}"><table><tr><td/></tr></table></div>`,
        expectedView: true,
      },
    ],
    [
      "TABLE#10: Should keep td with several children.",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        inputFromView: `<div xmlns="${ns_richtext}"><table><tr><td><p>${text}</p><p>${text}</p></td></tr></table></div>`,
        expectedData: `<div xmlns="${ns_richtext}"><table><tr><td><p>${text}</p><p>${text}</p></td></tr></table></div>`,
        expectedView: true,
      },
    ],
    [
      "TABLE#11: Should remove singleton br in td.",
      {
        comment: "This is the behavior of CoreMedia RichText with CKEditor 4.",
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        inputFromView: `<div xmlns="${ns_richtext}"><table><tr><td><br/></td></tr></table></div>`,
        expectedData: `<div xmlns="${ns_richtext}"><table><tr><td/></tr></table></div>`,
        expectedView: `<div xmlns="${ns_richtext}"><table><tr><td/></tr></table></div>`,
      },
    ],
    [
      "TABLE#12: Should remove singleton p in td.",
      {
        comment: "This is the behavior of CoreMedia RichText with CKEditor 4.",
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        inputFromView: `<div xmlns="${ns_richtext}"><table><tr><td><p/></td></tr></table></div>`,
        expectedData: `<div xmlns="${ns_richtext}"><table><tr><td/></tr></table></div>`,
      },
    ],
    [
      "TABLE#13: Should remove singleton p in td if it only contains br.",
      {
        comment: "This is the behavior of CoreMedia RichText with CKEditor 4.",
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        inputFromView: `<div xmlns="${ns_richtext}"><table><tr><td><p><br/></p></td></tr></table></div>`,
        expectedData: `<div xmlns="${ns_richtext}"><table><tr><td/></tr></table></div>`,
      },
    ],
    [
      "TABLE#14: Should not remove singleton p in td if it contains text.",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        inputFromView: `<div xmlns="${ns_richtext}"><table><tr><td><p>${text}</p></td></tr></table></div>`,
        expectedData: `<div xmlns="${ns_richtext}"><table><tr><td><p>${text}</p></td></tr></table></div>`,
        expectedView: true,
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
            comment: `${LAST_RESORT}`,
            strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
            inputFromView: `<div xmlns="${ns_richtext}"><${el}>${whitespace}</${el}></div>`,
            expectedData: `<div xmlns="${ns_richtext}"/>`,
          },
        ],
        [
          `${key}#2: Should keep if valid.`,
          {
            strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
            inputFromView: `<div xmlns="${ns_richtext}"><${el}><li>${text}</li></${el}></div>`,
            expectedData: `<div xmlns="${ns_richtext}"><${el}><li>${text}</li></${el}></div>`,
            expectedView: true,
          },
        ],
        [
          `${key}#3: Should keep class attribute.`,
          {
            strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
            inputFromView: `<div xmlns="${ns_richtext}"><${el} class="${attr_class}"><li>${text}</li></${el}></div>`,
            expectedData: `<div xmlns="${ns_richtext}"><${el} class="${attr_class}"><li>${text}</li></${el}></div>`,
            expectedView: true,
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
            inputFromView: `<div xmlns="${ns_richtext}"><${el}/></div>`,
            expectedData: `<div xmlns="${ns_richtext}"><p class="${expectedClass}"/></div>`,
            expectedView: true,
          },
        ],
        [
          `${key}#2: Should transform to <p> with class attribute.`,
          {
            strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
            inputFromView: `<div xmlns="${ns_richtext}"><${el}>${text}</${el}></div>`,
            expectedData: `<div xmlns="${ns_richtext}"><p class="${expectedClass}">${text}</p></div>`,
            expectedView: true,
          },
        ],
      ];
    }));
  const invalidHeadingFixtures: DataFilterTestFixture[] =
    flatten([0, 7].map(level => {
      const key = `INVALID_H${level}`;
      const invalidHeadingClass = `p--heading-${level}`;

      return [
        [
          `${key}#1: Should not handle invalid heading class.`,
          {
            strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
            inputFromView: `<div xmlns="${ns_richtext}"><p class="${invalidHeadingClass}">${text}</p></div>`,
            expectedData: `<div xmlns="${ns_richtext}"><p class="${invalidHeadingClass}">${text}</p></div>`,
            expectedView: true,
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
            inputFromView: `<div xmlns="${ns_richtext}"><${el}/></div>`,
            expectedData: `<div xmlns="${ns_richtext}"><${el}/></div>`,
            expectedView: true,
          },
        ],
        [
          `${key}#2: Should adapt namespace if required.`,
          {
            strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
            inputFromView: `<div xmlns="${ns_richtext}"><${el} xmlns="${ns_xhtml}"/></div>`,
            expectedData: `<div xmlns="${ns_richtext}"><${el}/></div>`,
          },
        ],
        [
          `${key}#3: Should keep class attribute.`,
          {
            strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
            inputFromView: `<div xmlns="${ns_richtext}"><${el} class="${attr_class}"/></div>`,
            expectedData: `<div xmlns="${ns_richtext}"><${el} class="${attr_class}"/></div>`,
            expectedView: true,
          },
        ],
      ];
    }));
  const replaceInlineSimpleFixtures: DataFilterTestFixture[] =
    flatten([
      {
        view: "b",
        data: "strong",
        bijective: false,
      },
      {
        view: "i",
        data: "em",
        bijective: true,
      },
    ]
      .map(({view, data, bijective}) => {
      const key = view.toUpperCase();
      return [
        [
          `${key}#1: View: <${view}> ${bijective?'<':''}-> Data: <${data}>.`,
          {
            strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
            inputFromView: `<div xmlns="${ns_richtext}"><p><${view}>${text}</${view}></p></div>`,
            expectedData: `<div xmlns="${ns_richtext}"><p><${data}>${text}</${data}></p></div>`,
            expectedView: bijective,
          },
        ],
        [
          `${key}#2: Should keep <${data}> when transformed.`,
          {
            strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
            inputFromView: `<div xmlns="${ns_richtext}"><p><${data}>${text}</${data}></p></div>`,
            expectedData: `<div xmlns="${ns_richtext}"><p><${data}>${text}</${data}></p></div>`,
          },
        ],
      ];
    }));
  const replaceInlineBySpanFixtures: DataFilterTestFixture[] =
    flatten(
      [
        {
          view: "u",
          dataClass: "underline",
          bijective: true,
        },
        {
          view: "strike",
          dataClass: "strike",
          bijective: false,
        },
        {
          view: "s",
          dataClass: "strike",
          bijective: true,
        },
        {
          view: "del",
          dataClass: "strike",
          bijective: false,
        },
      ].map(({view, dataClass, bijective}) => {
        // bijective: Typically false for "alias" mappings.
        // The mapping which corresponds to the default representation in
        // CKEditor should be bijective (i.e. = true).
        const key = view.toUpperCase();
        return [
          [
            `${key}#1: View: <${view}> ${bijective?'<':''}-> Data: by <span class="${dataClass}">.`,
            {
              strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
              inputFromView: `<div xmlns="${ns_richtext}"><p><${view}>${text}</${view}></p></div>`,
              expectedData: `<div xmlns="${ns_richtext}"><p><span class="${dataClass}">${text}</span></p></div>`,
              expectedView: bijective,
            },
          ],
          [
            `${key}#2: Should keep <span class="${dataClass}"> when transformed.`,
            {
              strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
              inputFromView: `<div xmlns="${ns_richtext}"><p><span class="${dataClass}">${text}</span></p></div>`,
              expectedData: `<div xmlns="${ns_richtext}"><p><span class="${dataClass}">${text}</span></p></div>`,
            },
          ],
        ];
      })
    );
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
        inputFromView: `<div xmlns="${ns_richtext}"><br/></div>`,
        expectedData: `<div xmlns="${ns_richtext}"/>`,
      },
    ],
    [
      "CLEANUP#2: Remove trailing <br> tag in <td>.",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        inputFromView: `<div xmlns="${ns_richtext}"><table><tr><td>${text}<br/></td></tr></table></div>`,
        expectedData: `<div xmlns="${ns_richtext}"><table><tr><td>${text}</td></tr></table></div>`,
      },
    ],
    [
      "CLEANUP#3: Remove trailing <br> tag in <p>.",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        inputFromView: `<div xmlns="${ns_richtext}"><p>${text}<br/></p></div>`,
        expectedData: `<div xmlns="${ns_richtext}"><p>${text}</p></div>`,
      },
    ],
    [
      "CLEANUP#4: Remove singleton <br> in <td>",
      {
        comment: "This is a CKEditor 4 CoreMedia RichText Behavior.",
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        inputFromView: `<div xmlns="${ns_richtext}"><table><tr><td><br/></td></tr></table></div>`,
        expectedData: `<div xmlns="${ns_richtext}"><table><tr><td/></tr></table></div>`,
      },
    ],
    [
      "CLEANUP#5: Remove singleton <p> in <td>",
      {
        comment: "This is a CKEditor 4 CoreMedia RichText Behavior.",
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        inputFromView: `<div xmlns="${ns_richtext}"><table><tr><td><p/></td></tr></table></div>`,
        expectedData: `<div xmlns="${ns_richtext}"><table><tr><td/></tr></table></div>`,
      },
    ],
    [
      "CLEANUP#6: Remove singleton <p> only containing <br> in <td>",
      {
        comment: "This is a CKEditor 4 CoreMedia RichText Behavior.",
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        inputFromView: `<div xmlns="${ns_richtext}"><table><tr><td><p><br/></p></td></tr></table></div>`,
        expectedData: `<div xmlns="${ns_richtext}"><table><tr><td/></tr></table></div>`,
      },
    ],
    [
      "CLEANUP#7: Remove irrelevant <span>.",
      {
        comment: "This has been a design decision around 2011 or before. As the span does not violate RichText DTD we may argue about it.",
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        inputFromView: `<div xmlns="${ns_richtext}"><p><span>${text}</span></p></div>`,
        expectedData: `<div xmlns="${ns_richtext}"><p>${text}</p></div>`,
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
        inputFromView: `<div xmlns="${ns_richtext}" xmlns:xdiff="${ns_xdiff}"><p><xdiff:span xdiff:class="diff-html-removed">${text}</xdiff:span></p></div>`,
        expectedData: `<div xmlns="${ns_richtext}" xmlns:xdiff="${ns_xdiff}"><p>${text}</p></div>`,
      },
    ],
  ];
  const testFixtures: DataFilterTestFixture[] = [
    ...uncategorizedFixtures,
    ...textFixtures,
    ...textEntityFixtures,
    ...tableFixtures,
    ...listFixtures,
    ...headingFixtures,
    ...invalidHeadingFixtures,
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
      const { disabled, strictness, inputFromView, expectedData, expectedView } = testData;

      if (TEST_SELECTOR && !name.startsWith(TEST_SELECTOR)) {
        test.todo(`${name} (disabled by test selector for debugging purpose)`);
        return;
      }

      for (const currentStrictness of strictness) {
        const { toData, toView } = getConfig();
        const toDataFilter = new HtmlFilter(toData, MOCK_EDITOR);
        const toViewFilter = new HtmlFilter(toView, MOCK_EDITOR);

        const testCaseName = `${name} (mode: ${strictnessKeys[currentStrictness]})`;
        const toDataTestCase = () => {
          const xmlDocument: Document = parser.parseFromString(inputFromView, "text/xml");

          if (xmlDocument.documentElement.outerHTML.indexOf("parsererror") >= 0) {
            throw new Error(`Failed parsing XML: ${inputFromView}: ${xmlDocument.documentElement.outerHTML}`)
          }

          toDataFilter.applyTo(xmlDocument.documentElement);
          const actualXml = serializer.serializeToString(xmlDocument.documentElement);
          expect(actualXml).toEqualXML(expectedData);
        };

        const toViewTestCase = () => {
          if (!!expectedView) {
            // If `true` expect bijective mapping.
            const expectedViewXml = expectedView === true ? inputFromView : expectedView;
            const xmlDocument: Document = parser.parseFromString(expectedData, "text/xml");

            if (xmlDocument.documentElement.outerHTML.indexOf("parsererror") >= 0) {
              throw new Error(`Failed parsing XML: ${expectedData}: ${xmlDocument.documentElement.outerHTML}`)
            }

            toViewFilter.applyTo(xmlDocument.documentElement);
            const actualXml = serializer.serializeToString(xmlDocument.documentElement);
            expect(actualXml).toEqualXML(expectedViewXml);
          }
        };

        if (disabled) {
          const disabledMessage = typeof disabled === "string" ? ` (${disabled})` : "";
          const disabledName = `${testCaseName}${disabledMessage}`;
          test.skip(`toData: ${disabledName}`, toDataTestCase);
          !!expectedView && test.skip(`toView: ${disabledName}`, toViewTestCase);
        } else {
          test(`toData: ${testCaseName}`, toDataTestCase);
          !!expectedView && test(`toView: ${testCaseName}`, toViewTestCase);
        }
      }
    }
  )
});

/**
 * Decodes all entities to plain characters.
 */
function decodeEntity(str: string): string {
  const ENTITY_ELEMENT = document.createElement("div");
  ENTITY_ELEMENT.innerHTML = str;
  return <string>ENTITY_ELEMENT.textContent;
}

/**
 * Encodes all given characters to a decimal entity representation.
 */
function encodeString(str: string): string {
  const text: string = decodeEntity(str);
  // Takes care of Unicode characters. https://mathiasbynens.be/notes/javascript-unicode
  const chars: string[] = [...text];
  return chars.map((c) => `&#${c.codePointAt(0)};`).join('');
}
