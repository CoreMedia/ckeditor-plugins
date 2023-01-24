// noinspection HtmlUnknownAttribute

import * as aut from "../../src/rules/AnchorElements";
import { silenced } from "../Silenced";
import { p, richtext } from "@coremedia-internal/ckeditor5-coremedia-example-data/RichTextBase";
import { ConversionApi } from "@coremedia/ckeditor5-dom-converter/ConversionApi";

describe("AnchorElement", () => {
  describe("parseDataContentLink", () => {
    it.each`
      data                                                     | expectedId
      ${`https://example.org/`}                                | ${undefined}
      ${`content/42`}                                          | ${42}
      ${`content/0`}                                           | ${0}
      ${`content/${Number.MAX_SAFE_INTEGER}`}                  | ${Number.MAX_SAFE_INTEGER}
      ${`content/42#postfix`}                                  | ${undefined}
      ${`content/-1`}                                          | ${undefined}
      ${`content/${Number.MIN_SAFE_INTEGER}`}                  | ${undefined}
      ${`content/example`}                                     | ${undefined}
      ${`coremedia:///cap/content/42`}                         | ${42}
      ${`coremedia:///cap/content/0`}                          | ${0}
      ${`coremedia:///cap/content/${Number.MAX_SAFE_INTEGER}`} | ${Number.MAX_SAFE_INTEGER}
      ${`coremedia:///cap/content/42#postfix`}                 | ${undefined}
      ${`coremedia:///cap/content/-1`}                         | ${undefined}
      ${`coremedia:///cap/content/${Number.MIN_SAFE_INTEGER}`} | ${undefined}
      ${`coremedia:///cap/content/example`}                    | ${undefined}
    `(
      "[$#] Should parse $data to $expectedId",
      ({ data, expectedId }: { data: string; expectedId: number | undefined }) => {
        expect(aut.parseDataContentLink(data)).toStrictEqual(expectedId);
      }
    );
  });

  describe("parseViewContentLink", () => {
    it.each`
      view                                    | expectedId
      ${`https://example.org/`}               | ${undefined}
      ${`content:42`}                         | ${42}
      ${`content:0`}                          | ${0}
      ${`content:${Number.MAX_SAFE_INTEGER}`} | ${Number.MAX_SAFE_INTEGER}
      ${`content:-1`}                         | ${undefined}
      ${`content:${Number.MIN_SAFE_INTEGER}`} | ${undefined}
      ${`content:example`}                    | ${undefined}
    `(
      "[$#] Should parse $view to $expectedId",
      ({ view, expectedId }: { view: string; expectedId: number | undefined }) => {
        expect(aut.parseViewContentLink(view)).toStrictEqual(expectedId);
      }
    );
  });

  describe("toDataContentLink", () => {
    it.each`
      id                         | expectedLink
      ${0}                       | ${`content/0`}
      ${42}                      | ${`content/42`}
      ${Number.MAX_SAFE_INTEGER} | ${`content/${Number.MAX_SAFE_INTEGER}`}
    `("[$#] Should format $id to $expectedLink", ({ id, expectedLink }: { id: number; expectedLink: string }) => {
      expect(aut.toDataContentLink(id)).toStrictEqual(expectedLink);
    });
  });

  describe("toViewContentLink", () => {
    it.each`
      id                         | expectedLink
      ${0}                       | ${`content:0`}
      ${42}                      | ${`content:42`}
      ${Number.MAX_SAFE_INTEGER} | ${`content:${Number.MAX_SAFE_INTEGER}`}
    `("[$#] Should format $id to $expectedLink", ({ id, expectedLink }: { id: number; expectedLink: string }) => {
      expect(aut.toViewContentLink(id)).toStrictEqual(expectedLink);
    });
  });

  describe("formatHrefForData", () => {
    it.each`
      view                                    | expectedHref
      ${`https://example.org/`}               | ${`https://example.org/`}
      ${`content:42`}                         | ${`content/42`}
      ${`content:0`}                          | ${`content/0`}
      ${`content:${Number.MAX_SAFE_INTEGER}`} | ${`content/${Number.MAX_SAFE_INTEGER}`}
      ${`content:-1`}                         | ${`content:-1`}
      ${`content:${Number.MIN_SAFE_INTEGER}`} | ${`content:${Number.MIN_SAFE_INTEGER}`}
      ${`content:example`}                    | ${`content:example`}
    `(
      "[$#] Should format data view representation $view to HREF for data: $expectedHref",
      ({ view, expectedHref }: { view: string; expectedHref: string }) => {
        expect(aut.formatHrefForData(view)).toStrictEqual(expectedHref);
      }
    );
  });

  describe("formatHrefForView", () => {
    it.each`
      data                                                     | expectedHref
      ${`https://example.org/`}                                | ${`https://example.org/`}
      ${`content/42`}                                          | ${`content:42`}
      ${`content/0`}                                           | ${`content:0`}
      ${`content/${Number.MAX_SAFE_INTEGER}`}                  | ${`content:${Number.MAX_SAFE_INTEGER}`}
      ${`content/42#postfix`}                                  | ${`content/42#postfix`}
      ${`content/-1`}                                          | ${`content/-1`}
      ${`content/${Number.MIN_SAFE_INTEGER}`}                  | ${`content/${Number.MIN_SAFE_INTEGER}`}
      ${`content/example`}                                     | ${`content/example`}
      ${`coremedia:///cap/content/42`}                         | ${`content:42`}
      ${`coremedia:///cap/content/0`}                          | ${`content:0`}
      ${`coremedia:///cap/content/${Number.MAX_SAFE_INTEGER}`} | ${`content:${Number.MAX_SAFE_INTEGER}`}
      ${`coremedia:///cap/content/42#postfix`}                 | ${`coremedia:///cap/content/42#postfix`}
      ${`coremedia:///cap/content/-1`}                         | ${`coremedia:///cap/content/-1`}
      ${`coremedia:///cap/content/${Number.MIN_SAFE_INTEGER}`} | ${`coremedia:///cap/content/${Number.MIN_SAFE_INTEGER}`}
      ${`coremedia:///cap/content/example`}                    | ${`coremedia:///cap/content/example`}
    `(
      "[$#] Should format data representation $data to HREF well supported by CKEditor 5 Link Feature: $expectedHref",
      ({ data, expectedHref }: { data: string; expectedHref: number | undefined }) => {
        expect(aut.formatHrefForView(data)).toStrictEqual(expectedHref);
      }
    );
  });

  describe("formatTarget & parseTarget", () => {
    describe.each`
      show         | role         | target           | bijective
      ${undefined} | ${undefined} | ${""}            | ${true}
      ${"replace"} | ${undefined} | ${"_self"}       | ${true}
      ${"new"}     | ${undefined} | ${"_blank"}      | ${true}
      ${"embed"}   | ${undefined} | ${"_embed"}      | ${true}
      ${"none"}    | ${undefined} | ${"_none"}       | ${true}
      ${"other"}   | ${undefined} | ${"_other"}      | ${true}
      ${"unknown"} | ${undefined} | ${""}            | ${false}
      ${undefined} | ${"ROLE"}    | ${"_role_ROLE"}  | ${true}
      ${"replace"} | ${"ROLE"}    | ${"_self_ROLE"}  | ${true}
      ${"new"}     | ${"ROLE"}    | ${"_blank_ROLE"} | ${true}
      ${"embed"}   | ${"ROLE"}    | ${"_embed_ROLE"} | ${true}
      ${"none"}    | ${"ROLE"}    | ${"_none_ROLE"}  | ${true}
      ${"other"}   | ${"ROLE"}    | ${"ROLE"}        | ${true}
      ${"unknown"} | ${"ROLE"}    | ${"_role_ROLE"}  | ${false}
    `(
      "[$#] Should format xlink:show=$show and xlink:role=$role to target '$target' and vice versa (if bijective? $bijective)",
      ({
        show,
        role,
        target,
        bijective,
      }: {
        show: string | undefined;
        role: string | undefined;
        target: string;
        bijective: boolean;
      }) => {
        it("formatTarget", () => {
          // We expect some warnings and info logs. Thus, suppressing.
          const actual = silenced(() => aut.formatTarget({ show, role }));
          expect(actual).toStrictEqual(target);
        });

        if (bijective) {
          it("parseTarget", () => {
            // Validates the counterpart to formatTarget, that it is able to
            // parse the attributes again.
            // No strict check, as implementation may/will not set irrelevant
            // attributes.
            expect(aut.parseTarget(target)).toEqual({ show, role });
          });
        }
      }
    );
  });

  describe("Data Processing", () => {
    const xmlSerializer = new XMLSerializer();
    const domParser = new DOMParser();
    const url = "https://e.org/";
    const contentUriPath = aut.toDataContentLink(42);
    const contentUrl = aut.toViewContentLink(42);
    const text = "T";

    describe.each`
      data                                                                         | view
      ${`<a xlink:href="${url}">${text}</a>`}                                      | ${`<a href="${url}">${text}</a>`}
      ${`<a xlink:href="${contentUriPath}">${text}</a>`}                           | ${`<a href="${contentUrl}">${text}</a>`}
      ${`<a xlink:show="replace" xlink:href="${url}">${text}</a>`}                 | ${`<a href="${url}" target="_self">${text}</a>`}
      ${`<a xlink:show="other" xlink:role="ROLE" xlink:href="${url}">${text}</a>`} | ${`<a href="${url}" target="ROLE">${text}</a>`}
      ${`<a xlink:type="simple" xlink:href="${url}">${text}</a>`}                  | ${`<a href="${url}" data-xlink-type="simple">${text}</a>`}
      ${`<a xlink:actuate="onRequest" xlink:href="${url}">${text}</a>`}            | ${`<a href="${url}" data-xlink-actuate="onRequest">${text}</a>`}
    `(
      "[$#] Should transform data to view and vice versa: data: $data, view: $view",
      ({ data, view }: { data: string; view: string }) => {
        const dataString = richtext(p(data));
        const htmlString = `<body><p>${view}</p></body>`;
        let xmlDocument: Document;
        let htmlDocument: Document;
        let xmlAnchor: Element;
        let htmlAnchor: HTMLAnchorElement;
        let toDataApi: ConversionApi;
        let toViewApi: ConversionApi;

        beforeEach(() => {
          xmlDocument = domParser.parseFromString(dataString, "text/xml");
          htmlDocument = domParser.parseFromString(htmlString, "text/html");
          xmlAnchor = xmlDocument.documentElement.querySelector("a") as Element;
          htmlAnchor = htmlDocument.documentElement.querySelector("a") as HTMLAnchorElement;
          toDataApi = new ConversionApi(xmlDocument);
          toViewApi = new ConversionApi(htmlDocument);
        });

        it("transformLinkAttributesToData", () => {
          const expectedXml = xmlSerializer.serializeToString(xmlAnchor);
          // Early stage processing.
          aut.transformLinkAttributesToData(htmlAnchor);
          // Emulate post-processing.
          const importedNode = toDataApi.importNode(htmlAnchor, true);
          const actualXml = xmlSerializer.serializeToString(importedNode);
          expect(actualXml).toStrictEqual(expectedXml);
        });

        it("transformLinkAttributesToView", () => {
          const expectedHtml = htmlAnchor.outerHTML;
          // importNode: Emulate pre-processing.
          const importedNode = toViewApi.importNode(xmlAnchor, true);
          const result = aut.transformLinkAttributesToView(importedNode, { api: toViewApi }) as HTMLAnchorElement;
          const actualHtml = result.outerHTML;
          expect(actualHtml).toStrictEqual(expectedHtml);
        });
      }
    );
  });
});
