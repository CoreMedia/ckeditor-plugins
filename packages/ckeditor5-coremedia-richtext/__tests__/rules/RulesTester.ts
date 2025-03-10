import { RuleBasedHtmlDomConverterFactory } from "./RuleBasedHtmlDomConverters";
import { isToData, isToView, TestDirection } from "./TestDirection";
import { RuleConfig } from "@coremedia/ckeditor5-dom-converter";

import "jest-xml-matcher";

/**
 * Class to help writing data driven tests for `RuleConfig` objects.
 */
export class RulesTester {
  readonly factory = new RuleBasedHtmlDomConverterFactory();
  readonly xmlSerializer = new XMLSerializer();
  readonly domParser = new DOMParser();

  constructor(
    public readonly rules: RuleConfig[],
    public readonly xmlElementSelector: string,
    public readonly htmlElementSelector: string = xmlElementSelector,
  ) {
    this.factory.addRules(rules);
  }

  executeTests(config: { dataString: string; direction: TestDirection; htmlString: string }): void {
    const { dataString, direction, htmlString } = config;
    const { factory, xmlSerializer, domParser, xmlElementSelector, htmlElementSelector } = this;

    const setUp = () => {
      const xmlDocument = domParser.parseFromString(dataString, "text/xml");
      const htmlDocument = domParser.parseFromString(htmlString, "text/html");
      const xmlElement = xmlDocument.documentElement.querySelector(xmlElementSelector) as Element;
      const htmlElement = htmlDocument.documentElement.querySelector(htmlElementSelector) as HTMLElement;
      const xmlElementSerialized = xmlSerializer.serializeToString(xmlElement);
      const htmlElementSerialized = htmlElement.outerHTML;
      const toDataConverter = factory.createToDataConverter(xmlDocument);
      const toViewConverter = factory.createToViewConverter(htmlDocument);
      return {
        ...config,
        xmlDocument,
        htmlDocument,
        xmlElement,
        htmlElement,
        xmlElementSerialized,
        htmlElementSerialized,
        toDataConverter,
        toViewConverter,
      };
    };

    if (isToView(direction)) {
      it("toView", () => {
        const { toViewConverter, xmlElement, htmlElementSerialized } = setUp();
        const result = toViewConverter.convert(xmlElement) as HTMLElement;
        // Unfortunately, does not ignore order of attributes. If we struggle
        // with this, we may want to search for alternative approaches.
        expect(result.outerHTML).toEqualXML(htmlElementSerialized);
      });
    }

    if (isToData(direction)) {
      it("toData", () => {
        const { toDataConverter, htmlElement, xmlElementSerialized } = setUp();
        const result = toDataConverter.convert(htmlElement) as Element;
        // Unfortunately, does not ignore order of attributes. If we struggle
        // with this, we may want to search for alternative approaches.
        expect(xmlSerializer.serializeToString(result)).toEqualXML(xmlElementSerialized);
      });
    }
  }
}
