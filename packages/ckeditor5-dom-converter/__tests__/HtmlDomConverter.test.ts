// noinspection HtmlRequiredLangAttribute,HtmlRequiredTitleElement,HtmlUnknownAttribute

import { HtmlDomConverter } from "../src/HtmlDomConverter";
import { dataNs, dataViewNs, USE_CASE_NAME } from "./Constants";
import { documentFromHtml, documentFromXml } from "@coremedia/ckeditor5-dom-support/Documents";
import { extractNodeContents, serializeToXmlString } from "@coremedia/ckeditor5-dom-support/Nodes";
import { toData, toDataView } from "./DataProcessorSimulation";
import { isElement, renameElement } from "@coremedia/ckeditor5-dom-support/Elements";
import { wrapIfTableElement } from "@coremedia/ckeditor5-dom-support/HTMLTableElements";

describe("HtmlDomConverter", () => {
  describe(USE_CASE_NAME, () => {
    describe("toData Transformation", () => {
      it("should transform simple HTML to Rich Text just by adapting namespaces", () => {
        const dataViewDocument = documentFromHtml(`<body><p class="CLASS">TEXT</p></body>`);
        const dataDocument = documentFromXml(`<div xmlns="${dataNs}"></div>`);

        const converter = new HtmlDomConverter(dataDocument);

        toData(converter, dataViewDocument, dataDocument);

        // In its default implementation, the responsibility of the
        // HtmlDomConverter is especially aligning default namespaces: If an
        // element/attribute in the originating document is of default namespace
        // it will get automatically transferred to default namespace of target
        // document.
        expect(serializeToXmlString(dataDocument)).toStrictEqual(
          `<div xmlns="${dataNs}"><p class="CLASS">TEXT</p></div>`
        );
      });
    });

    describe("toDataView Transformation", () => {
      it("should transform simple Rich Text to HTML just by adapting namespaces", () => {
        const dataViewDocument = documentFromHtml(`<body/>`);
        const dataDocument = documentFromXml(`<div xmlns="${dataNs}"><p class="CLASS">TEXT</p></div>`);

        const converter = new HtmlDomConverter(dataViewDocument);

        toDataView(converter, dataDocument, dataViewDocument);

        // In its default implementation, the responsibility of the
        // HtmlDomConverter is especially aligning default namespaces: If an
        // element/attribute in the originating document is of default namespace
        // it will get automatically transferred to default namespace of target
        // document.
        expect(serializeToXmlString(dataViewDocument.body)).toStrictEqual(
          `<body xmlns="${dataViewNs}"><p class="CLASS">TEXT</p></body>`
        );
      });
    });
  });

  describe("Default Behaviors", () => {
    it("should align default namespace for elements", () => {
      const dataViewDocument = documentFromHtml(`<body><p/></body>`);
      const dataDocument = documentFromXml(`<div xmlns="${dataNs}"></div>`);

      const converter = new HtmlDomConverter(dataDocument);

      toData(converter, dataViewDocument, dataDocument);

      expect(serializeToXmlString(dataDocument)).toStrictEqual(`<div xmlns="${dataNs}"><p/></div>`);
    });

    it("should not align namespace for elements different to default namespace", () => {
      const customNs = "https://example.org/custom";
      const dataViewDocument = documentFromHtml(`<body/>`);
      const dataDocument = documentFromXml(`<div xmlns="${dataNs}" xmlns:c="${customNs}"><c:customEl/></div>`);

      const converter = new HtmlDomConverter(dataViewDocument);

      toDataView(converter, dataDocument, dataViewDocument);

      // Note, that the namespace propagation to the document element is part
      // of the data-processor simulation. Later, the same should be done in
      // production to minify the resulting XML (thus, at least for the
      // `toData` transformation, we should apply the propagation).
      expect(serializeToXmlString(dataViewDocument)).toStrictEqual(
        `<html xmlns="http://www.w3.org/1999/xhtml" xmlns:c="https://example.org/custom"><head></head><body><c:customEl/></body></html>`
      );
    });

    it("should align default namespace for attributes", () => {
      const dataViewDocument = documentFromHtml(`<body><p class="CLASS" id="ID" lang="en" dir="ltr"/></body>`);
      const dataDocument = documentFromXml(`<div xmlns="${dataNs}"></div>`);

      const converter = new HtmlDomConverter(dataDocument);

      toData(converter, dataViewDocument, dataDocument);

      // In its default implementation, the responsibility of the
      // HtmlDomConverter is especially aligning default namespaces: If an
      // element/attribute in the originating document is of default namespace
      // it will get automatically transferred to default namespace of target
      // document.
      expect(serializeToXmlString(dataDocument)).toStrictEqual(
        `<div xmlns="${dataNs}"><p class="CLASS" id="ID" lang="en" dir="ltr"/></div>`
      );
    });

    it("should not align namespace for attributes of different namespace than the default", () => {
      const customNs = "https://example.org/custom";
      const dataViewDocument = documentFromHtml(`<body/>`);
      const dataDocument = documentFromXml(
        `<div xmlns="${dataNs}" xmlns:c="${customNs}"><p c:customAttr="CUSTOM"/></div>`
      );

      const converter = new HtmlDomConverter(dataViewDocument);

      toDataView(converter, dataDocument, dataViewDocument);

      // In its default implementation, the responsibility of the
      // HtmlDomConverter is especially aligning default namespaces: If an
      // element/attribute in the originating document is of default namespace
      // it will get automatically transferred to default namespace of target
      // document.
      expect(serializeToXmlString(dataViewDocument)).toStrictEqual(
        `<html xmlns="http://www.w3.org/1999/xhtml" xmlns:c="https://example.org/custom"><head></head><body><p c:customAttr="CUSTOM"></p></body></html>`
      );
    });

    it("should process nested elements", () => {
      const dataViewDocument = documentFromHtml(`<body><p><span class="CLASS">TEXT</span></p></body>`);
      const dataDocument = documentFromXml(`<div xmlns="${dataNs}"></div>`);

      const converter = new HtmlDomConverter(dataDocument);

      toData(converter, dataViewDocument, dataDocument);

      expect(serializeToXmlString(dataDocument)).toStrictEqual(
        `<div xmlns="http://www.coremedia.com/2003/richtext-1.0"><p><span class="CLASS">TEXT</span></p></div>`
      );
    });
  });

  /**
   * The `HtmlDomConverter` is rather simple regarding its use-case. Its main
   * objective is taking care of straightening namespaces when transferring
   * elements and attributes to another document.
   *
   * Thus, it is intended, that the `HtmlDomConverter` can be overridden, like,
   * for example, to replace elements by different elements or structures.
   */
  describe("Override Behaviors", () => {
    it("Replace element by different element", () => {
      const dataViewDocument = documentFromHtml(`<body><p><mark>Marked Text</mark></p></body>`);
      const dataDocument = documentFromXml(`<div xmlns="${dataNs}"></div>`);

      class CustomHtmlDomConverter extends HtmlDomConverter {
        protected postProcessImportedNode<T extends Node = Node>(originalNode: T, importedNode: T): Node | undefined {
          let postProcessImportedNode = super.postProcessImportedNode(originalNode, importedNode);
          if (isElement(postProcessImportedNode) && postProcessImportedNode.localName === "mark") {
            const renamed = renameElement(postProcessImportedNode, "span");
            renamed.classList.add("mark");
            postProcessImportedNode = renamed;
          }
          return postProcessImportedNode;
        }
      }

      const converter = new CustomHtmlDomConverter(dataDocument);

      toData(converter, dataViewDocument, dataDocument);

      expect(serializeToXmlString(dataDocument)).toStrictEqual(
        `<div xmlns="http://www.coremedia.com/2003/richtext-1.0"><p><span class="mark">TEXT</span></p></div>`
      );
    });

    it("Remove element along with its children", () => {
      const dataViewDocument = documentFromHtml(`<body><p><mark>Marked Text</mark></p></body>`);
      const dataDocument = documentFromXml(`<div xmlns="${dataNs}"></div>`);

      class CustomHtmlDomConverter extends HtmlDomConverter {
        protected postProcessImportedNode<T extends Node = Node>(originalNode: T, importedNode: T): Node | undefined {
          const postProcessImportedNode = super.postProcessImportedNode(originalNode, importedNode);
          if (isElement(postProcessImportedNode) && postProcessImportedNode.localName === "mark") {
            return undefined;
          }
          return postProcessImportedNode;
        }
      }

      const converter = new CustomHtmlDomConverter(dataDocument);

      toData(converter, dataViewDocument, dataDocument);

      expect(serializeToXmlString(dataDocument)).toStrictEqual(
        `<div xmlns="http://www.coremedia.com/2003/richtext-1.0"><p/></div>`
      );
    });

    it("Replace element by its children", () => {
      const dataViewDocument = documentFromHtml(`<body><p><mark>Marked Text</mark></p></body>`);
      const dataDocument = documentFromXml(`<div xmlns="${dataNs}"></div>`);

      class CustomHtmlDomConverter extends HtmlDomConverter {
        protected postProcessImportedNode<T extends Node = Node>(originalNode: T, importedNode: T): Node | undefined {
          const postProcessImportedNode = super.postProcessImportedNode(originalNode, importedNode);
          if (isElement(postProcessImportedNode) && postProcessImportedNode.localName === "mark") {
            return extractNodeContents(postProcessImportedNode);
          }
          return postProcessImportedNode;
        }
      }

      const converter = new CustomHtmlDomConverter(dataDocument);

      toData(converter, dataViewDocument, dataDocument);

      expect(serializeToXmlString(dataDocument)).toStrictEqual(
        `<div xmlns="http://www.coremedia.com/2003/richtext-1.0"><p>Marked Text</p></div>`
      );
    });

    /**
     * This simulates a typical pattern in CoreMedia Rich Text 1.0
     * data-processing: As `<table>` does not support `<thead>`, we instead
     * remember their original location by a _reserved class_ (here: `tr--head`).
     * Later on, this reserved class can be used, to restore the original
     * HTML structure.
     *
     * This test demonstrates the conversion from data view to data.
     */
    it("Restructure children for data view to data", () => {
      const dataViewDocument = documentFromHtml(`<body><table><thead><tr/></thead><tbody><tr/></tbody></table></body>`);
      const dataDocument = documentFromXml(`<div xmlns="${dataNs}"></div>`);

      class CustomHtmlDomConverter extends HtmlDomConverter {
        protected finishNodeConversion(originalNode: Node, importedNode: Node): Node | undefined {
          const finishedNode = super.finishNodeConversion(originalNode, importedNode);
          if (!isElement(finishedNode)) {
            return finishedNode;
          }

          if (finishedNode.localName === "thead") {
            // Mark all child elements as belonging to `<thead>` where, in a
            // second step, these children will be moved to the body.
            for (const headerElement of finishedNode.children) {
              headerElement.classList.add("tr--head");
            }
          }

          wrapIfTableElement(finishedNode)?.mergeAllRowsOfAllSectionsIntoTBody();

          return finishedNode;
        }
      }

      const converter = new CustomHtmlDomConverter(dataDocument);

      toData(converter, dataViewDocument, dataDocument);

      expect(serializeToXmlString(dataDocument)).toStrictEqual(
        `<div xmlns="${dataNs}"><table><tbody><tr class="tr--head"/><tr/></tbody></table></div>`
      );
    });

    /**
     * Just as before, this simulates a typical pattern in CoreMedia Rich Text
     * 1.0 data-processing to deal with table sections.
     *
     * This test demonstrates the conversion from data to data view.
     */
    it("Restructure children for data to data view", () => {
      const dataViewDocument = documentFromHtml(`<body/>`);
      const dataDocument = documentFromXml(
        `<div xmlns="${dataNs}"><table><tbody><tr class="tr--head"/><tr/></tbody></table></div>`
      );

      class CustomHtmlDomConverter extends HtmlDomConverter {
        protected finishNodeConversion(originalNode: Node, importedNode: Node): Node | undefined {
          const finishedNode = super.finishNodeConversion(originalNode, importedNode);
          if (!isElement(finishedNode)) {
            return finishedNode;
          }

          wrapIfTableElement(finishedNode)?.moveRowsWithClassToTHead("tr--head");

          return finishedNode;
        }
      }

      const converter = new CustomHtmlDomConverter(dataViewDocument);

      toDataView(converter, dataDocument, dataViewDocument);

      expect(serializeToXmlString(dataViewDocument)).toStrictEqual(
        `<html xmlns="http://www.w3.org/1999/xhtml"><head></head><body><table><thead><tr></tr></thead><tbody><tr></tr></tbody></table></body></html>`
      );
    });
  });
});
