// noinspection HtmlUnknownAttribute

import * as aut from "../../src/rules/DefaultRules";
import { RuleBasedHtmlDomConverterFactory } from "./RuleBasedHtmlDomConverters";
import { richtext } from "@coremedia-internal/ckeditor5-coremedia-example-data/RichTextBase";
import { RuleBasedHtmlDomConverter } from "@coremedia/ckeditor5-dom-converter/RuleBasedHtmlDomConverter";
import { bijective, Direction, isToData, isToView, toView } from "./Direction";
import { INLINE_IMG } from "../../src/rules/ImageElements";

/**
 * These tests are dedicated to the complete CoreMedia Rich Text 1.0 DTD.
 * Thus, it also applies tests for elements, that do not come with a custom
 * mapping.
 *
 * Find more detailed tests regarding the respective elements.
 */
describe("DefaultRules", () => {
  const ruleConfigurations = aut.defaultRules;
  const factory = new RuleBasedHtmlDomConverterFactory();
  const xmlSerializer = new XMLSerializer();
  const domParser = new DOMParser();
  const text = "T";
  const url = "https://e.org/";
  const imgHref = "content/0#properties.data";

  factory.addRules(ruleConfigurations);

  describe.each`
    data                                                                            | direction    | view
    ${`<p>${text}</p>`}                                                             | ${bijective} | ${`<p>${text}</p>`}
    ${`<p class="CLASS">${text}</p>`}                                               | ${bijective} | ${`<p class="CLASS">${text}</p>`}
    ${`<p dir="ltr">${text}</p>`}                                                   | ${bijective} | ${`<p dir="ltr">${text}</p>`}
    ${`<p xml:lang="en">${text}</p>`}                                               | ${bijective} | ${`<p lang="en">${text}</p>`}
    ${`<p lang="en">${text}</p>`}                                                   | ${toView}    | ${`<p lang="en">${text}</p>`}
    ${`<ul><li>${text}</li></ul>`}                                                  | ${bijective} | ${`<ul><li>${text}</li></ul>`}
    ${`<ul class="CLASS"><li>${text}</li></ul>`}                                    | ${bijective} | ${`<ul class="CLASS"><li>${text}</li></ul>`}
    ${`<ul dir="ltr"><li>${text}</li></ul>`}                                        | ${bijective} | ${`<ul dir="ltr"><li>${text}</li></ul>`}
    ${`<ul xml:lang="en"><li>${text}</li></ul>`}                                    | ${bijective} | ${`<ul lang="en"><li>${text}</li></ul>`}
    ${`<ol><li>${text}</li></ol>`}                                                  | ${bijective} | ${`<ol><li>${text}</li></ol>`}
    ${`<ol class="CLASS"><li>${text}</li></ol>`}                                    | ${bijective} | ${`<ol class="CLASS"><li>${text}</li></ol>`}
    ${`<ol dir="ltr"><li>${text}</li></ol>`}                                        | ${bijective} | ${`<ol dir="ltr"><li>${text}</li></ol>`}
    ${`<ol xml:lang="en"><li>${text}</li></ol>`}                                    | ${bijective} | ${`<ol lang="en"><li>${text}</li></ol>`}
    ${`<ul><li class="CLASS">${text}</li></ul>`}                                    | ${bijective} | ${`<ul><li class="CLASS">${text}</li></ul>`}
    ${`<ul><li dir="ltr">${text}</li></ul>`}                                        | ${bijective} | ${`<ul><li dir="ltr">${text}</li></ul>`}
    ${`<ul><li xml:lang="en">${text}</li></ul>`}                                    | ${bijective} | ${`<ul><li lang="en">${text}</li></ul>`}
    ${`<pre>${text}</pre>`}                                                         | ${bijective} | ${`<pre>${text}</pre>`}
    ${`<pre class="CLASS">${text}</pre>`}                                           | ${bijective} | ${`<pre class="CLASS">${text}</pre>`}
    ${`<pre dir="ltr">${text}</pre>`}                                               | ${bijective} | ${`<pre dir="ltr">${text}</pre>`}
    ${`<pre xml:lang="en">${text}</pre>`}                                           | ${bijective} | ${`<pre lang="en">${text}</pre>`}
    ${`<pre xml:space="preserve">${text}</pre>`}                                    | ${bijective} | ${`<pre xml:space="preserve">${text}</pre>`}
    ${`<blockquote>${text}</blockquote>`}                                           | ${bijective} | ${`<blockquote>${text}</blockquote>`}
    ${`<blockquote class="CLASS">${text}</blockquote>`}                             | ${bijective} | ${`<blockquote class="CLASS">${text}</blockquote>`}
    ${`<blockquote dir="ltr">${text}</blockquote>`}                                 | ${bijective} | ${`<blockquote dir="ltr">${text}</blockquote>`}
    ${`<blockquote xml:lang="en">${text}</blockquote>`}                             | ${bijective} | ${`<blockquote lang="en">${text}</blockquote>`}
    ${`<blockquote cite="${url}">${text}</blockquote>`}                             | ${bijective} | ${`<blockquote cite="${url}">${text}</blockquote>`}
    ${`<p><a xlink:href="${url}">${text}</a></p>`}                                  | ${bijective} | ${`<p><a href="${url}">${text}</a></p>`}
    ${`<p><a class="CLASS" xlink:href="${url}">${text}</a></p>`}                    | ${bijective} | ${`<p><a class="CLASS" href="${url}">${text}</a></p>`}
    ${`<p><a dir="ltr" xlink:href="${url}">${text}</a></p>`}                        | ${bijective} | ${`<p><a dir="ltr" href="${url}">${text}</a></p>`}
    ${`<p><a xlink:href="${url}" xml:lang="en">${text}</a></p>`}                    | ${bijective} | ${`<p><a href="${url}" lang="en">${text}</a></p>`}
    ${`<p><span>${text}</span></p>`}                                                | ${bijective} | ${`<p><span>${text}</span></p>`}
    ${`<p><span class="CLASS">${text}</span></p>`}                                  | ${bijective} | ${`<p><span class="CLASS">${text}</span></p>`}
    ${`<p><span dir="ltr">${text}</span></p>`}                                      | ${bijective} | ${`<p><span dir="ltr">${text}</span></p>`}
    ${`<p><span xml:lang="en">${text}</span></p>`}                                  | ${bijective} | ${`<p><span lang="en">${text}</span></p>`}
    ${`<p>${text}<br/>${text}</p>`}                                                 | ${bijective} | ${`<p>${text}<br/>${text}</p>`}
    ${`<p>${text}<br class="CLASS"/>${text}</p>`}                                   | ${bijective} | ${`<p>${text}<br class="CLASS"/>${text}</p>`}
    ${`<p><em>${text}</em></p>`}                                                    | ${bijective} | ${`<p><i>${text}</i></p>`}
    ${`<p><em class="CLASS">${text}</em></p>`}                                      | ${bijective} | ${`<p><i class="CLASS">${text}</i></p>`}
    ${`<p><em dir="ltr">${text}</em></p>`}                                          | ${bijective} | ${`<p><i dir="ltr">${text}</i></p>`}
    ${`<p><em xml:lang="en">${text}</em></p>`}                                      | ${bijective} | ${`<p><i lang="en">${text}</i></p>`}
    ${`<p><strong>${text}</strong></p>`}                                            | ${bijective} | ${`<p><strong>${text}</strong></p>`}
    ${`<p><strong class="CLASS">${text}</strong></p>`}                              | ${bijective} | ${`<p><strong class="CLASS">${text}</strong></p>`}
    ${`<p><strong dir="ltr">${text}</strong></p>`}                                  | ${bijective} | ${`<p><strong dir="ltr">${text}</strong></p>`}
    ${`<p><strong xml:lang="en">${text}</strong></p>`}                              | ${bijective} | ${`<p><strong lang="en">${text}</strong></p>`}
    ${`<p><sub>${text}</sub></p>`}                                                  | ${bijective} | ${`<p><sub>${text}</sub></p>`}
    ${`<p><sub class="CLASS">${text}</sub></p>`}                                    | ${bijective} | ${`<p><sub class="CLASS">${text}</sub></p>`}
    ${`<p><sub dir="ltr">${text}</sub></p>`}                                        | ${bijective} | ${`<p><sub dir="ltr">${text}</sub></p>`}
    ${`<p><sub xml:lang="en">${text}</sub></p>`}                                    | ${bijective} | ${`<p><sub lang="en">${text}</sub></p>`}
    ${`<p><sup>${text}</sup></p>`}                                                  | ${bijective} | ${`<p><sup>${text}</sup></p>`}
    ${`<p><sup class="CLASS">${text}</sup></p>`}                                    | ${bijective} | ${`<p><sup class="CLASS">${text}</sup></p>`}
    ${`<p><sup dir="ltr">${text}</sup></p>`}                                        | ${bijective} | ${`<p><sup dir="ltr">${text}</sup></p>`}
    ${`<p><sup xml:lang="en">${text}</sup></p>`}                                    | ${bijective} | ${`<p><sup lang="en">${text}</sup></p>`}
    ${`<p><img alt="" xlink:href="${imgHref}"/></p>`}                               | ${bijective} | ${`<p><img alt="" data-xlink-href="${imgHref}" src="${INLINE_IMG}"/></p>`}
    ${`<p><img alt="" height="42" xlink:href="${imgHref}"/></p>`}                   | ${bijective} | ${`<p><img alt="" height="42" data-xlink-href="${imgHref}" src="${INLINE_IMG}"/></p>`}
    ${`<p><img alt="" width="42" xlink:href="${imgHref}"/></p>`}                    | ${bijective} | ${`<p><img alt="" width="42" data-xlink-href="${imgHref}" src="${INLINE_IMG}"/></p>`}
    ${`<table><tbody><tr><td>${text}</td></tr></tbody></table>`}                    | ${bijective} | ${`<table><tbody><tr><td>${text}</td></tr></tbody></table>`}
    ${`<table><tbody><tr><td class="td--header">${text}</td></tr></tbody></table>`} | ${bijective} | ${`<table><tbody><tr><th>${text}</th></tr></tbody></table>`}
    ${`<table><tbody><tr class="tr--header"><td>${text}</td></tr></tbody></table>`} | ${bijective} | ${`<table><thead><tr><th>${text}</th></tr></thead></table>`}
    ${`<table><tbody><tr class="tr--footer"><td>${text}</td></tr></tbody></table>`} | ${bijective} | ${`<table><tfoot><tr><th>${text}</th></tr></tfoot></table>`}
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
