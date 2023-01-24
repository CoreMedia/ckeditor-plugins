import * as aut from "../../src/rules/DivElements";
import { RuleBasedHtmlDomConverterFactory } from "./RuleBasedHtmlDomConverters";
import { p, richtext } from "@coremedia-internal/ckeditor5-coremedia-example-data/RichTextBase";
import { RuleBasedHtmlDomConverter } from "@coremedia/ckeditor5-dom-converter/RuleBasedHtmlDomConverter";
import { bijective, Direction, isToData, isToView } from "./Direction";

describe("DivElements", () => {
  const ruleConfigurations = [aut.divElements];
  const factory = new RuleBasedHtmlDomConverterFactory();
  const xmlSerializer = new XMLSerializer();
  const domParser = new DOMParser();
  const text = "T";

  factory.addRules(ruleConfigurations);

  describe.each`
    data                                     | direction    | view
    ${`<p class="p--div">${text}</p>`}       | ${bijective} | ${`<div>${text}</div>`}
    ${`<p class="CLASS p--div">${text}</p>`} | ${bijective} | ${`<div class="CLASS">${text}</div>`}
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
