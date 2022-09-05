import "jest-xml-matcher";
import Editor from "@ckeditor/ckeditor5-core/src/editor/editor";
import TextProxy, { TextFilterRule } from "../src/TextProxy";

jest.mock("@ckeditor/ckeditor5-core/src/editor/editor");

//@ts-expect-error We should rather mock ClassicEditor or similar here.
const MOCK_EDITOR = new Editor();
const SERIALIZER = new XMLSerializer();
const PARSER = new DOMParser();

function parseAndValidate(xmlString: string): Document {
  const xmlDocument = PARSER.parseFromString(xmlString, "text/xml");
  const xPathResult: XPathResult = xmlDocument.evaluate(
    "/parsererror/text()",
    xmlDocument,
    null,
    XPathResult.STRING_TYPE
  );
  if (xPathResult.stringValue) {
    throw new Error(`Error while parsing XML: ${xPathResult.stringValue}\n\tXML: ${xmlString}`);
  }
  return xmlDocument;
}

/**
 * Enables comments on test data.
 */
interface CommentableTestData {
  /**
   * Some comment, like purpose of this test, or what decision this test is
   * based on.
   */
  comment?: string;
}

/**
 * Support for disabling certain test data during execution.
 */
interface DisablableTestData {
  /**
   * Signals, if to disable this test. Disabled tests should be marked
   * as "skipped". The decision may either be true or false, it may
   * contain a descriptive String (such as an issue ID), which, if non-empty
   * will mark the test as skipped and (for enhanced support) you may also
   * provide a function, which decides on the fly if a test should be
   * run or not.
   */
  disabled?: boolean | string | (() => boolean | string);
}

interface TextFilterTestData extends CommentableTestData, DisablableTestData {
  /**
   * The rules to apply.
   */
  rules: (TextFilterRule | undefined)[];
  /**
   * The DOM we start from.
   */
  from: string;
  /**
   * The expected DOM structure after we have applied the rules.
   */
  to: string;
  /**
   * XPath to the text-node in `from` we should wrap and then process.
   */
  nodePath: string;
  /**
   * XPath for a node in `to` result, which should have been returned as
   * `restartFrom`. Will not be checked, if unset.
   */
  restartPath?: string;
}

describe("TextProxy.applyRules()", () => {
  type ApplyRulesData = [
    /**
     * A name/description for the test (will be printed to output).
     */
    string,
    TextFilterTestData
  ];

  const asciiText = "Lorem ipsum dolor sit amet.";
  const otherAsciiText = "Hinter den Wortbergen.";

  const testData: ApplyRulesData[] = [
    [
      "NOOP#01: Should do nothing on empty rule set",
      {
        rules: [],
        from: `<parent><el>${asciiText}</el></parent>`,
        to: `<parent><el>${asciiText}</el></parent>`,
        nodePath: "//el/text()[1]",
      },
    ],
    [
      "NOOP#02: Should do nothing on empty rules",
      {
        rules: [undefined, undefined],
        from: `<parent><el>${asciiText}</el></parent>`,
        to: `<parent><el>${asciiText}</el></parent>`,
        nodePath: "//el/text()[1]",
      },
    ],
    [
      "REMOVE#01: Should remove if requested by 'remove'.",
      {
        rules: [
          (p) => {
            p.node.remove = true;
          },
        ],
        from: `<parent><el>${asciiText}</el></parent>`,
        to: `<parent><el/></parent>`,
        nodePath: "//el/text()[1]",
      },
    ],
    [
      "REMOVE#02: Should remove if requested by 'replaceByChildren'.",
      {
        rules: [
          (p) => {
            p.node.replaceByChildren = true;
          },
        ],
        from: `<parent><el>${asciiText}</el></parent>`,
        to: `<parent><el/></parent>`,
        nodePath: "//el/text()[1]",
      },
    ],
    [
      "REPLACE#01: Should replace by new text.",
      {
        rules: [
          (p) => {
            p.node.textContent = otherAsciiText;
          },
        ],
        from: `<parent><el>${asciiText}</el></parent>`,
        to: `<parent><el>${otherAsciiText}</el></parent>`,
        nodePath: "//el/text()[1]",
      },
    ],
  ];

  describe.each<ApplyRulesData>(testData)("(%#) %s", (name, testData) => {
    function getTextNode(): Text {
      const textNode: Text | null = <Text>(
        inputDocument.evaluate(testData.nodePath, inputDocument, null, XPathResult.FIRST_ORDERED_NODE_TYPE)
          .singleNodeValue
      );

      if (!textNode) {
        throw new Error(
          `Test Setup Issue: Unable resolving XPath '${testData.nodePath}' to element under test in: ${testData.from}`
        );
      }
      return textNode;
    }

    function getRestartNode(): Node | null {
      if (!testData.restartPath) {
        return null;
      }
      const restartNode: Node | null = <Node>(
        expectedDocument.evaluate(testData.restartPath, expectedDocument, null, XPathResult.FIRST_ORDERED_NODE_TYPE)
          .singleNodeValue
      );
      if (!restartNode) {
        throw new Error(
          `Test Setup Issue: Unable resolving XPath '${testData.restartPath}' to expected restart node in: ${testData.to}`
        );
      }
      return restartNode;
    }

    function parseDisabled(): { disabled: boolean; namePostfix: string } {
      if (!testData.disabled) {
        return { disabled: false, namePostfix: "" };
      }
      let state: string | boolean;
      if (typeof testData.disabled === "function") {
        state = testData.disabled();
      } else {
        state = testData.disabled;
      }
      if (!state) {
        return { disabled: false, namePostfix: "" };
      }
      return {
        disabled: true,
        namePostfix: ` (${typeof state === "string" ? state : "disabled"})`,
      };
    }

    const inputDocument: Document = parseAndValidate(testData.from);
    const expectedDocument: Document = parseAndValidate(testData.to);

    const proxy = new TextProxy(getTextNode(), MOCK_EDITOR, true);

    const { disabled, namePostfix } = parseDisabled();
    const testStrategy = !disabled ? test : test.skip;

    const result = proxy.applyRules(...testData.rules);

    testStrategy(`Should result in expected DOM.${namePostfix}`, () => {
      expect(SERIALIZER.serializeToString(inputDocument)).toEqualXML(testData.to);
    });

    testStrategy(`Should provide expected restartFrom-result.${namePostfix}`, () => {
      expect(result).toStrictEqual(getRestartNode());
    });
  });
});
