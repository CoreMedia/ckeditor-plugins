import { USE_CASE_NAME } from "./Constants";
import { documentFromHtml, documentFromXml } from "../src/Documents";
import { serializeToXmlString } from "../src/Nodes";
import { fragmentFromNodeContents } from "../src/DocumentFragments";

describe("Nodes", () => {
  describe("serializeToXmlString", () => {
    it(USE_CASE_NAME, () => {
      const document = documentFromHtml("<body/>");
      const xmlString = serializeToXmlString(document);
      expect(xmlString).toBeDefined();
    });

    // noinspection HtmlRequiredTitleElement,HtmlRequiredLangAttribute
    it.each`
      node                                                                   | expectedXml
      ${new DocumentFragment()}                                              | ${``}
      ${fragmentFromNodeContents(documentFromHtml(`<p>1</p><p>2</p>`).body)} | ${`<p xmlns="http://www.w3.org/1999/xhtml">1</p><p xmlns="http://www.w3.org/1999/xhtml">2</p>`}
      ${documentFromXml("<root/>")}                                          | ${`<root/>`}
      ${documentFromHtml("<body/>")}                                         | ${`<html xmlns="http://www.w3.org/1999/xhtml"><head></head><body></body></html>`}
    `("[$#] Should transform $node to: $expectedXml", ({ node, expectedXml }: { node: Node; expectedXml: string }) => {
      const xmlString = serializeToXmlString(node);
      expect(xmlString).toStrictEqual(expectedXml);
    });
  });
});
