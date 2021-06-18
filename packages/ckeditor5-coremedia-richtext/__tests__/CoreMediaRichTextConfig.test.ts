import "jest-xml-matcher";
import { Strictness } from "../src/RichTextSchema";
// @ts-ignore
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
const attr_link_external = "https://example.org/";
// noinspection HttpUrlsUsage
const ns_richtext = "http://www.coremedia.com/2003/richtext-1.0";
const ns_xlink = "http://www.w3.org/1999/xlink";
const ns_xhtml = "http://www.w3.org/1999/xhtml";
// noinspection HttpUrlsUsage
const ns_xdiff = "http://www.coremedia.com/2015/xdiff";

function flatten<T>(arr: T[][]): T[] {
  const empty: T[] = [];
  return empty.concat.apply(empty, arr);
}

// noinspection JSNonASCIINames
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
  // noinspection XmlUnusedNamespaceDeclaration
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
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        inputFromView: `<div xmlns="${ns_richtext}" xmlns:xlink="${ns_xlink}"><p><a href="${attr_link_external}">${text}</a></p></div>`,
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
        // TODO[cke] Fix Bug.
        disabled: "For some unknown reason, the tbody element is removed in this case. Needs to be investigated.",
        comment: `${LAST_RESORT}`,
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        inputFromView: `<div xmlns="${ns_richtext}"><table>${text}<tbody class="${attr_class}"><tr><th>${text}</th></tr></tbody>${text}</table></div>`,
        expectedData: `<div xmlns="${ns_richtext}"><table><tbody class="${attr_class}"><tr><td class="td--header">${text}</td></tr></tbody></table></div>`,
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
        expectedData: `<div xmlns="${ns_richtext}"><table><tbody><tr><td>${text}</td></tr></tbody></table></div>`,
      },
    ],
    [
      "TEXT#19: Should keep text at TD.",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        inputFromView: `<div xmlns="${ns_richtext}"><table><tbody><tr><td>${text}</td></tr></tbody></table></div>`,
        expectedData: `<div xmlns="${ns_richtext}"><table><tbody><tr><td>${text}</td></tr></tbody></table></div>`,
        expectedView: true,
      },
    ],
  ];

  type XLinkBehavior = {
    show?: string,
    role?: string,
  };
  type XlinkBehaviorDefinition = XLinkBehavior & {
    comment?: string,
    non_bijective?: boolean;
  };
  /**
   * Represents an empty target attribute.
   */
  type ExpectedTargetToXlinkShowAndRole = {
    [target: string]: XlinkBehaviorDefinition,
  };
  /**
   * The mapping we agreed upon for `xlink:show` to some target value.
   * `other` is skipped here, as it is used for special meaning, which is,
   * that the `xlink:show` is ignored but `xlink:role` will take over representing
   * the `target` attribute.
   */
  const show = {
    /**
     * Open in new tab. Nothing to argue about.
     */
    new: "_blank",
    /**
     * May be either `_top` or `_self`. In CoreMedia CAE context we decided to
     * map `replace` to `_self` as this is, what is documented for example
     * at MDN.
     */
    replace: "_self",
    /**
     * Artificial mapping, we require, as there is no such `target` to represent
     * embedding links.
     */
    embed: "_embed",
    /**
     * Artificial mapping, we require, as there is no such `target` to represent
     * explicitly unspecified link behavior.
     */
    none: "_none",
  };
  // noinspection NonAsciiCharacters
  const specialCharacterTargets: ExpectedTargetToXlinkShowAndRole = {
    "äöü": {
      comment: "Special Characters in target: Umlauts",
      show: "other",
      role: "äöü",
    },
    "&quot;": {
      comment: "Special Character in target: Double-Quote",
      show: "other",
      role: "&quot;",
    },
    "'": {
      comment: "Special Character in target: Single-Quote",
      show: "other",
      role: "'",
    },
    "&lt;": {
      comment: "Special Character in target: Less-Than.",
      show: "other",
      role: "&lt;",
    },
    "&gt;": {
      comment: "Special Character in target: Greater-Than.",
      show: "other",
      role: "&gt;",
    },
  };
  const standardHtmlTargets: ExpectedTargetToXlinkShowAndRole = {
    [show.new]: {
      comment: `Decision: Map ${show.new} to xlink:show=new as it was for CKEditor 4.`,
      show: "new",
    },
    "_top": {
      comment: "Well-known target, which cannot be represented with xlink attributes. Mapped to other/_top instead.",
      show: "other",
      role: "_top",
    },
    "_parent": {
      comment: "Well-known target, which cannot be represented with xlink attributes. Mapped to other/_parent instead.",
      show: "other",
      role: "_parent",
    },
    [show.replace]: {
      comment: `Decision: Map ${show.replace} to xlink:show=replace.`,
      show: "replace",
    },
    "some target": {
      comment: "Some standard use-case: A named target got specified.",
      show: "other",
      role: "some target",
    },
  };
  /**
   * XLink States, which have no equivalent in well-known target attributes but
   * must be represented in some way. We have chosen to prefix them with underscores,
   * so that they feel like those well-known target names. This should provide nearly
   * no collision with targets found from external sources.
   */
  const artificialXlinkShowStates: ExpectedTargetToXlinkShowAndRole = {
    [show.embed]: {
      comment: "Chosen to represent xlink:show='embed'",
      show: "embed",
    },
    [show.none]: {
      comment: "Chosen to represent xlink:show='none'",
      show: "none",
    },
  };
  /**
   * Combinations, which may be modelled in CoreMedia RichText, but are unexpected
   * from clients such as CoreMedia Studio. Nevertheless, tools may decide to generate
   * these states, and we must ensure to represent them in model and view.
   */
  const artificialXlinkAttributeCombinations: ExpectedTargetToXlinkShowAndRole = {
    [`${show.new}_some_target`]: {
      show: "new",
      role: "some_target",
    },
    [`${show.replace}_some_target`]: {
      show: "replace",
      role: "some_target",
    },
    [`${show.embed}_some_target`]: {
      show: "embed",
      role: "some_target",
    },
    [`${show.none}_some_target`]: {
      show: "none",
      role: "some_target",
    },
    "_role_some_target": {
      comment: "Here we have an xlink:role without xlink:show in RichText.",
      role: "some_target",
    },
    "_other": {
      comment: "Here we have an xlink:show='other' without expected xlink:role.",
      show: "other",
    },
  };
  /**
   * Manual targets from external sources, which may be given trying to "hack"
   * into the mapping.
   */
  const penetrationTargets: ExpectedTargetToXlinkShowAndRole = {
    [`${show.new}_`]: {
      show: "other",
      role: `${show.new}_`,
    },
    [`${show.replace}_`]: {
      show: "other",
      role: `${show.replace}_`,
    },
    [`${show.embed}_`]: {
      show: "other",
      role: `${show.embed}_`,
    },
    [`${show.none}_`]: {
      show: "other",
      role: `${show.none}_`,
    },
    "_role_": {
      show: "other",
      role: "_role_",
    },
  };
  /**
   * Represents no target attribute.
   */
  const noTarget = "NoTarget";
  const expectedTargetToXlinkShowAndRole: ExpectedTargetToXlinkShowAndRole = {
    // TODO[cke]: Using [NO_TARGET] fails currently to compile in Babel. An update may help.
    NoTarget: {
      comment: "For no target, no xlink:show/xlink:role attributes should be added.",
    },
    "": {
      comment: "We assume empty targets to be non-existing. As the state disappears, it is not bijective as other mappings.",
      non_bijective: true,
    },
    "_role": {
      comment: "If artificial _role doesn't come with a role, assume to take it as target.",
      show: "other",
      role: "_role",
    },
    ...specialCharacterTargets,
    ...standardHtmlTargets,
    ...artificialXlinkShowStates,
    ...artificialXlinkAttributeCombinations,
    ...penetrationTargets,
  };
  const anchorFixtures: DataFilterTestFixture[] =
    Object.entries(expectedTargetToXlinkShowAndRole)
      .map(([target, { show, role, comment, non_bijective }], index) => {
        let name: string = `ANCHOR#${index}: Should map ${target === noTarget ? "no target" : `target="${target}"`} to ${!show ? "no xlink:show" : `xlink:show="${show}"`} and ${!role ? "no xlink:role" : `xlink:show="${role}"`}${non_bijective ? " and vice versa" : ""}.`;
        let viewTarget: string = `${target === noTarget ? "" : ` target="${target}"`}`;
        let dataShow: string = !show ? "" : ` xlink:show="${show}"`;
        let dataRole: string = !role ? "" : ` xlink:role="${role}"`;
        // noinspection XmlUnusedNamespaceDeclaration
        let inputFromView: string = `<div xmlns="${ns_richtext}" xmlns:xlink="${ns_xlink}"><p><a href="${attr_link_external}"${viewTarget}>${text}</a></p></div>`;
        let expectedData: string = `<div xmlns="${ns_richtext}" xmlns:xlink="${ns_xlink}"><p><a xlink:href="${attr_link_external}"${dataShow}${dataRole}>${text}</a></p></div>`;
        const testData: DataFilterRulesTestData = {
          strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
          inputFromView: inputFromView,
          expectedData: expectedData,
        };
        if (!non_bijective) {
          testData.expectedView = true;
        }
        if (!!comment) {
          testData.comment = comment;
        }

        return [name, testData];
      });

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
      `TEXT/ENTITY#${(index + 1)}: Entity should be resolved to plain character: ${entity}`,
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
      "TABLE#01: Empty table should be removed, as it is invalid.",
      {
        comment: `${LAST_RESORT}`,
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        inputFromView: `<div xmlns="${ns_richtext}"><table/></div>`,
        expectedData: `<div xmlns="${ns_richtext}"/>`,
      },
    ],
    [
      "TABLE#02: tbody should be added if missing.",
      {
        comment: "This is a design decision which eases data-processing implementation. If this is unexpected, it may be changed.",
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        inputFromView: `<div xmlns="${ns_richtext}"><table><tr><td>${text}</td></tr></table></div>`,
        expectedData: `<div xmlns="${ns_richtext}"><table><tbody><tr><td>${text}</td></tr></tbody></table></div>`,
        expectedView: `<div xmlns="${ns_richtext}"><table><tbody><tr><td>${text}</td></tr></tbody></table></div>`,
      },
    ],
    [
      "TABLE#03: thead should be transformed as being part of tbody.",
      {
        comment: "ckeditor/ckeditor5#9360: We must try at best effort to keep information about rows which are meant to be part of thead.",
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        inputFromView: `<div xmlns="${ns_richtext}"><table><thead><tr><th>Head</th></tr></thead></table></div>`,
        expectedData: `<div xmlns="${ns_richtext}"><table><tbody><tr class="tr--header"><td class="td--header">Head</td></tr></tbody></table></div>`,
        expectedView: true,
      },
    ],
    [
      "TABLE#04: tbody should be kept as is.",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        inputFromView: `<div xmlns="${ns_richtext}"><table><tbody><tr><td>Body</td></tr></tbody></table></div>`,
        expectedData: `<div xmlns="${ns_richtext}"><table><tbody><tr><td>Body</td></tr></tbody></table></div>`,
        expectedView: true,
      },
    ],
    [
      "TABLE#05: thead should merge into tbody",
      {
        comment: "One contract is, that thead merges into existing tbody, so that e.g. class attributes at tbody are kept.",
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        inputFromView: `<div xmlns="${ns_richtext}"><table><thead><tr><td>Head</td></tr></thead><tbody class="${attr_class}"><tr><td>Body</td></tr></tbody></table></div>`,
        expectedData: `<div xmlns="${ns_richtext}"><table><tbody class="${attr_class}"><tr class="tr--header"><td>Head</td></tr><tr><td>Body</td></tr></tbody></table></div>`,
        expectedView: true,
      },
    ],
    [
      "TABLE#06: th should be transformed to td with class.",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        inputFromView: `<div xmlns="${ns_richtext}"><table><tbody><tr><th>Head</th></tr></tbody></table></div>`,
        expectedData: `<div xmlns="${ns_richtext}"><table><tbody><tr><td class="td--header">Head</td></tr></tbody></table></div>`,
        expectedView: true,
      },
    ],
    [
      "TABLE#07: Should remove figure around table. By default CKEditor 5 adds a figure around table.",
      {
        comment: `${LAST_RESORT}`,
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        inputFromView: `<div xmlns="${ns_richtext}"><figure><table><tbody><tr><td>Body</td></tr></tbody></table></figure></div>`,
        expectedData: `<div xmlns="${ns_richtext}"><table><tbody><tr><td>Body</td></tr></tbody></table></div>`,
      },
    ],
    [
      "TABLE#08: Should remove empty tbody, and thus empty table.",
      {
        comment: `${LAST_RESORT}`,
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        inputFromView: `<div xmlns="${ns_richtext}"><table><tbody/></table></div>`,
        expectedData: `<div xmlns="${ns_richtext}"/>`,
      },
    ],
    [
      "TABLE#09: Should remove empty tr, and thus empty tbody, and thus empty table.",
      {
        comment: `${LAST_RESORT}`,
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        inputFromView: `<div xmlns="${ns_richtext}"><table><tbody><tr/></tbody></table></div>`,
        expectedData: `<div xmlns="${ns_richtext}"/>`,
      },
    ],
    [
      "TABLE#10: Should keep empty td.",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        inputFromView: `<div xmlns="${ns_richtext}"><table><tbody><tr><td/></tr></tbody></table></div>`,
        expectedData: `<div xmlns="${ns_richtext}"><table><tbody><tr><td/></tr></tbody></table></div>`,
        expectedView: true,
      },
    ],
    [
      "TABLE#11: Should keep td with several children.",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        inputFromView: `<div xmlns="${ns_richtext}"><table><tbody><tr><td><p>${text}</p><p>${text}</p></td></tr></tbody></table></div>`,
        expectedData: `<div xmlns="${ns_richtext}"><table><tbody><tr><td><p>${text}</p><p>${text}</p></td></tr></tbody></table></div>`,
        expectedView: true,
      },
    ],
    [
      "TABLE#12: Should remove singleton br in td.",
      {
        comment: "This is the behavior of CoreMedia RichText with CKEditor 4.",
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        inputFromView: `<div xmlns="${ns_richtext}"><table><tbody><tr><td><br/></td></tr></tbody></table></div>`,
        expectedData: `<div xmlns="${ns_richtext}"><table><tbody><tr><td/></tr></tbody></table></div>`,
        expectedView: `<div xmlns="${ns_richtext}"><table><tbody><tr><td/></tr></tbody></table></div>`,
      },
    ],
    [
      "TABLE#13: Should remove singleton p in td.",
      {
        comment: "This is the behavior of CoreMedia RichText with CKEditor 4.",
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        inputFromView: `<div xmlns="${ns_richtext}"><table><tbody><tr><td><p/></td></tr></tbody></table></div>`,
        expectedData: `<div xmlns="${ns_richtext}"><table><tbody><tr><td/></tr></tbody></table></div>`,
      },
    ],
    [
      "TABLE#14: Should remove singleton p in td if it only contains br.",
      {
        comment: "This is the behavior of CoreMedia RichText with CKEditor 4.",
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        inputFromView: `<div xmlns="${ns_richtext}"><table><tbody><tr><td><p><br/></p></td></tr></tbody></table></div>`,
        expectedData: `<div xmlns="${ns_richtext}"><table><tbody><tr><td/></tr></tbody></table></div>`,
      },
    ],
    [
      "TABLE#15: Should not remove singleton p in td if it contains text.",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        inputFromView: `<div xmlns="${ns_richtext}"><table><tbody><tr><td><p>${text}</p></td></tr></tbody></table></div>`,
        expectedData: `<div xmlns="${ns_richtext}"><table><tbody><tr><td><p>${text}</p></td></tr></tbody></table></div>`,
        expectedView: true,
      },
    ],
    [
      "TABLE#16: th should be transformed to td with class and continue with normal tds.",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        inputFromView: `<div xmlns="${ns_richtext}"><table><tbody><tr><th>Head</th></tr><tr><td>Data</td></tr></tbody></table></div>`,
        expectedData: `<div xmlns="${ns_richtext}"><table><tbody><tr><td class="td--header">Head</td></tr><tr><td>Data</td></tr></tbody></table></div>`,
        expectedView: true,
      },
    ],
    [
      "TABLE#17: tfoot should be transformed and merged to tbody.",
      {
        comment: "tfoot in CKEditor 5 24.x is not supported in view and will be merged to tbody.",
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        inputFromView: `<div xmlns="${ns_richtext}"><table><tfoot><tr><th>Foot</th></tr></tfoot></table></div>`,
        expectedData: `<div xmlns="${ns_richtext}"><table><tbody><tr class="tr--footer"><td class="td--header">Foot</td></tr></tbody></table></div>`,
        expectedView: true,
      },
    ],
    [
      "TABLE#18: Multiple tbodies should be merged into first.",
      {
        comment: "HTML may provide multiple tbodies, CoreMedia RichText may only have one. Design decision: Only keep attributes of first tbody.",
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        inputFromView: `<div xmlns="${ns_richtext}"><table><tbody class="body1"><tr><td>Body 1</td></tr></tbody><tbody class="body2"><tr><td>Body 2</td></tr></tbody></table></div>`,
        expectedData: `<div xmlns="${ns_richtext}"><table><tbody class="body1"><tr><td>Body 1</td></tr><tr><td>Body 2</td></tr></tbody></table></div>`,
        expectedView: `<div xmlns="${ns_richtext}"><table><tbody class="body1"><tr><td>Body 1</td></tr><tr><td>Body 2</td></tr></tbody></table></div>`,
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
      .map(({ view, data, bijective }) => {
        const key = view.toUpperCase();
        return [
          [
            `${key}#1: View: <${view}> ${bijective ? '<' : ''}-> Data: <${data}>.`,
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
      ].map(({ view, dataClass, bijective }) => {
        // bijective: Typically false for "alias" mappings.
        // The mapping which corresponds to the default representation in
        // CKEditor should be bijective (i.e. = true).
        const key = view.toUpperCase();
        return [
          [
            `${key}#1: View: <${view}> ${bijective ? '<' : ''}-> Data: by <span class="${dataClass}">.`,
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
        inputFromView: `<div xmlns="${ns_richtext}"><table><tbody><tr><td>${text}<br/></td></tr></tbody></table></div>`,
        expectedData: `<div xmlns="${ns_richtext}"><table><tbody><tr><td>${text}</td></tr></tbody></table></div>`,
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
        inputFromView: `<div xmlns="${ns_richtext}"><table><tbody><tr><td><br/></td></tr></tbody></table></div>`,
        expectedData: `<div xmlns="${ns_richtext}"><table><tbody><tr><td/></tr></tbody></table></div>`,
      },
    ],
    [
      "CLEANUP#5: Remove singleton <p> in <td>",
      {
        comment: "This is a CKEditor 4 CoreMedia RichText Behavior.",
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        inputFromView: `<div xmlns="${ns_richtext}"><table><tbody><tr><td><p/></td></tr></tbody></table></div>`,
        expectedData: `<div xmlns="${ns_richtext}"><table><tbody><tr><td/></tr></tbody></table></div>`,
      },
    ],
    [
      "CLEANUP#6: Remove singleton <p> only containing <br> in <td>",
      {
        comment: "This is a CKEditor 4 CoreMedia RichText Behavior.",
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        inputFromView: `<div xmlns="${ns_richtext}"><table><tbody><tr><td><p><br/></p></td></tr></tbody></table></div>`,
        expectedData: `<div xmlns="${ns_richtext}"><table><tbody><tr><td/></tr></tbody></table></div>`,
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
  // noinspection XmlUnusedNamespaceDeclaration
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
    ...anchorFixtures,
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
  // noinspection InnerHTMLJS
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
