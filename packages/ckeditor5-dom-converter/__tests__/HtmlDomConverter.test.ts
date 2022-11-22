import { dataNs, dataViewNs, html, serialize, xml } from "./ElementUtils";
import { createDocument } from "../src/dom/Document";
import { HtmlDomConverter } from "../src/HtmlDomConverter";

const toData = (htmlDocument: Document, domConverter: HtmlDomConverter, xmlDocument: Document): void => {
  // Typical process in DataProcessor implementation, to work on
  // fragments initially.
  const range = htmlDocument.createRange();
  range.selectNodeContents(htmlDocument.body);
  const fragment = range.extractContents();

  const converted = domConverter.convert(fragment);

  xmlDocument.documentElement.append(converted);
};

const toDataView = (xmlDocument: Document, domConverter: HtmlDomConverter, htmlDocument: Document): void => {
  // Typical process in DataProcessor implementation, to work on
  // fragments initially.
  const range = xmlDocument.createRange();
  range.selectNodeContents(xmlDocument.documentElement);
  const fragment = range.extractContents();

  const converted = domConverter.convert(fragment);

  htmlDocument.body.append(converted);
};

describe("HtmlDomConverter", () => {
  describe("Use Cases", () => {
    describe("toData", () => {
      it("should transform simple HTML to Rich Text as is", () => {
        const document = html(`<body><p/></body>`);
        const targetDocument = createDocument({ namespaceURI: dataNs, qualifiedName: "div" });
        const domConverter = new HtmlDomConverter(targetDocument);

        toData(document, domConverter, targetDocument);

        expect(serialize(targetDocument)).toStrictEqual(`<div xmlns="${dataNs}"><p/></div>`);
      });

      it("should transform simple HTML to Rich Text as is including supported attributes", () => {
        const document = html(`<body><p class="lorem" lang="en" dir="ltr"/></body>`);
        const targetDocument = createDocument({ namespaceURI: dataNs, qualifiedName: "div" });
        const domConverter = new HtmlDomConverter(targetDocument);

        toData(document, domConverter, targetDocument);

        expect(serialize(targetDocument)).toStrictEqual(
          `<div xmlns="${dataNs}"><p class="lorem" lang="en" dir="ltr"/></div>`
        );
      });
    });

    describe("toDataView", () => {
      it("should transform simple Rich Text to HTML as is", () => {
        const document = xml(`<div xmlns="${dataNs}"><p/></div>`);
        const targetDocument = html(`<body/>`);
        const domConverter = new HtmlDomConverter(targetDocument);

        toDataView(document, domConverter, targetDocument);

        expect(serialize(targetDocument.body)).toStrictEqual(`<body xmlns="${dataViewNs}"><p></p></body>`);
      });

      it("should transform simple Rich Text to HTML as is including supported attributes", () => {
        const document = xml(`<div xmlns="${dataNs}"><p class="lorem" lang="en" dir="ltr"/></div>`);
        const targetDocument = html(`<body/>`);
        const domConverter = new HtmlDomConverter(targetDocument);

        toDataView(document, domConverter, targetDocument);

        expect(serialize(targetDocument.body)).toStrictEqual(
          `<body xmlns="${dataViewNs}"><p class="lorem" lang="en" dir="ltr"></p></body>`
        );
      });
    });
  });
});
