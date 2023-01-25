import * as aut from "../../src/rules/CodeElements";
import { RuleBasedHtmlDomConverterFactory } from "./RuleBasedHtmlDomConverters";
import { p, richtext } from "@coremedia-internal/ckeditor5-coremedia-example-data/RichTextBase";
import { RuleBasedHtmlDomConverter } from "@coremedia/ckeditor5-dom-converter/RuleBasedHtmlDomConverter";
import { bijective, TestDirection, isToData, isToView } from "./TestDirection";

describe("CodeElements", () => {
  const ruleConfigurations = [aut.codeElements];
  const factory = new RuleBasedHtmlDomConverterFactory();
  const xmlSerializer = new XMLSerializer();
  const domParser = new DOMParser();
  const text = "T";

  factory.addRules(ruleConfigurations);

  describe.each`
    data                                             | direction    | view
    ${`<span class="code">${text}</span>`}           | ${bijective} | ${`<code>${text}</code>`}
    ${`<span class="CLASS code">${text}</span>`}     | ${bijective} | ${`<code class="CLASS">${text}</code>`}
    ${`<span dir="ltr" class="code">${text}</span>`} | ${bijective} | ${`<code dir="ltr">${text}</code>`}
  `(
    "[$#] Should provide mapping from data $direction view: $data $direction $view",
    ({ data, direction, view }: { data: string; direction: TestDirection; view: string }) => {
      const dataString = richtext(p(data));
      const htmlString = `<body><p>${view}</p></body>`;
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
        xmlElement = xmlDocument.documentElement.querySelector("p > *") as Element;
        htmlElement = htmlDocument.documentElement.querySelector("p > *") as HTMLElement;
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
