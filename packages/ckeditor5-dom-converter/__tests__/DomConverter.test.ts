import { dataNs, html, serialize } from "./ElementUtils";
import { createDocument } from "../src/dom/Document";
import { DomConverter } from "../src/DomConverter";

describe("DomConverter", () => {
  describe("Use Cases", () => {
    describe("toData", () => {
      it("toData: should transform simple HTML to Rich Text as is", () => {
        const document = html(`<body><p/></body>`);
        const targetDocument = createDocument({ namespaceURI: dataNs, qualifiedName: "div" });
        const domConverter = new DomConverter(targetDocument);

        // Typical process in DataProcessor implementation, to work on
        // fragments initially.
        const range = document.createRange();
        range.selectNodeContents(document.body);
        const fragment = range.extractContents();

        const converted = domConverter.convert(fragment, true);

        targetDocument.documentElement.append(converted);

        expect(serialize(targetDocument)).toStrictEqual(`<div xmlns="${dataNs}"><p/></div>`);
      });
    });
  });
});
