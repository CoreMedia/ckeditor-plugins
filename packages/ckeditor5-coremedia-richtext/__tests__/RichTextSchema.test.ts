import "jest-xml-matcher";
import RichTextSchema, { Strictness } from "../src/RichTextSchema";
import { MutableElement } from "@coremedia/ckeditor5-dataprocessor-support/src/dataprocessor";

describe("RichTextSchema.adjustAttributes", () => {
  type TestData = {
    /**
     * To which strictness modes the test applies to.
     */
    strictness: Strictness[];
    /**
     * XPath to element handed over.
     */
    xpath: string;
    /**
     * Input.
     */
    from: string;
    /**
     * Expected result.
     */
    to: string;
  };

  type TestFixture = [string, TestData];

  const testFixtures: TestFixture[] = [
    [
      "empty richtext should not be changed",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        xpath: "/div",
        from: `<div xmlns="http://www.coremedia.com/2003/richtext-1.0" xmlns:xlink="http://www.w3.org/1999/xlink"><p><br/></p></div>`,
        to: `<div xmlns="http://www.coremedia.com/2003/richtext-1.0" xmlns:xlink="http://www.w3.org/1999/xlink"><p><br/></p></div>`,
      },
    ],
  ];

  test.each<TestFixture>(testFixtures)("(%#) %s", (name: string, testData: TestData) => {
    for (const strictness of testData.strictness) {
      document.body.innerHTML = testData.from.trim();
      const element: Element = <Element>(
        document.evaluate(testData.xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE).singleNodeValue
      );
      const mutableElement = new MutableElement(element);
      const schema = new RichTextSchema(strictness);
      schema.adjustAttributes(mutableElement);
      expect(document.body.innerHTML).toEqualXML(testData.to);
    }
  });
});
