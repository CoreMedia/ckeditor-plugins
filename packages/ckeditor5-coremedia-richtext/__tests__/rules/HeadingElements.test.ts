import * as aut from "../../src/rules/HeadingElements";
import { RuleBasedHtmlDomConverterFactory } from "./RuleBasedHtmlDomConverters";
import { richtext } from "@coremedia-internal/ckeditor5-coremedia-example-data/RichTextBase";
import { RuleBasedHtmlDomConverter } from "@coremedia/ckeditor5-dom-converter/RuleBasedHtmlDomConverter";
import { bijective, Direction, isToData, isToView } from "./Direction";

describe("HeadingElements", () => {
  const ruleConfigurations = [aut.headingElements];
  const factory = new RuleBasedHtmlDomConverterFactory();
  const xmlSerializer = new XMLSerializer();
  const domParser = new DOMParser();
  const text = "T";

  factory.addRules(ruleConfigurations);

  describe.each`
    data                                           | direction    | view
    ${`<p class="p--heading-1">${text}</p>`}       | ${bijective} | ${`<h1>${text}</h1>`}
    ${`<p class="p--heading-2">${text}</p>`}       | ${bijective} | ${`<h2>${text}</h2>`}
    ${`<p class="p--heading-3">${text}</p>`}       | ${bijective} | ${`<h3>${text}</h3>`}
    ${`<p class="p--heading-4">${text}</p>`}       | ${bijective} | ${`<h4>${text}</h4>`}
    ${`<p class="p--heading-5">${text}</p>`}       | ${bijective} | ${`<h5>${text}</h5>`}
    ${`<p class="p--heading-6">${text}</p>`}       | ${bijective} | ${`<h6>${text}</h6>`}
    ${`<p class="CLASS p--heading-1">${text}</p>`} | ${bijective} | ${`<h1 class="CLASS">${text}</h1>`}
  `(
    "[$#] Should provide mapping from data $direction view: $data $direction $view",
    ({ data, direction, view }: { data: string; direction: Direction; view: string }) => {
      const dataString = richtext(data);
      const htmlString = `<body>${view}</body>`;
      let xmlDocument: Document;
      let htmlDocument: Document;
      let xmlElement: Element;
      let htmlElement: HTMLElement;
      let toDataConverter: RuleBasedHtmlDomConverter;
      let toViewConverter: RuleBasedHtmlDomConverter;
      let xmlElementSerialized: string;
      let htmlElementSerialized: string;

      beforeEach(() => {
        xmlDocument = domParser.parseFromString(dataString, "text/xml");
        htmlDocument = domParser.parseFromString(htmlString, "text/html");
        xmlElement = xmlDocument.documentElement.querySelector("*") as Element;
        htmlElement = htmlDocument.documentElement.querySelector("body > *") as HTMLElement;
        xmlElementSerialized = xmlSerializer.serializeToString(xmlElement);
        htmlElementSerialized = htmlElement.outerHTML;
        toDataConverter = factory.createToDataConverter(xmlDocument);
        toViewConverter = factory.createToViewConverter(htmlDocument);
      });

      if (isToView(direction)) {
        it("toView", () => {
          const result = toViewConverter.convert(xmlElement) as HTMLElement;
          expect(result.outerHTML).toStrictEqual(htmlElementSerialized);
        });
      }

      if (isToData(direction)) {
        it("toData", () => {
          const result = toDataConverter.convert(htmlElement) as Element;
          expect(xmlSerializer.serializeToString(result)).toStrictEqual(xmlElementSerialized);
        });
      }
    }
  );
});
