// noinspection HtmlUnknownAttribute

import * as aut from "../../src/rules/AnchorElements";
import { silenced } from "../Silenced";
import { p, richtext } from "@coremedia-internal/ckeditor5-coremedia-example-data/src/RichTextBase";
import { RulesTester } from "./RulesTester";
import { bijective, TestDirection } from "./TestDirection";

describe("AnchorElement", () => {
  describe("parseDataContentLink", () => {
    it.each`
      data                                                     | expectedId
      ${``}                                                    | ${undefined}
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
      ${``}                                   | ${``}
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
    const ruleConfigurations = [aut.anchorElements];

    const url = "https://e.org/";
    const contentUriPath = aut.toDataContentLink(42);
    const contentUrl = aut.toViewContentLink(42);
    const text = "T";

    describe.each`
      data                                                                         | direction    | view
      ${`<a xlink:href="${url}">${text}</a>`}                                      | ${bijective} | ${`<a href="${url}">${text}</a>`}
      ${`<a xlink:href="${contentUriPath}">${text}</a>`}                           | ${bijective} | ${`<a href="${contentUrl}">${text}</a>`}
      ${`<a xlink:show="replace" xlink:href="${url}">${text}</a>`}                 | ${bijective} | ${`<a href="${url}" target="_self">${text}</a>`}
      ${`<a xlink:show="other" xlink:role="ROLE" xlink:href="${url}">${text}</a>`} | ${bijective} | ${`<a href="${url}" target="ROLE">${text}</a>`}
      ${`<a xlink:type="simple" xlink:href="${url}">${text}</a>`}                  | ${bijective} | ${`<a href="${url}" data-xlink-type="simple">${text}</a>`}
      ${`<a xlink:actuate="onRequest" xlink:href="${url}">${text}</a>`}            | ${bijective} | ${`<a href="${url}" data-xlink-actuate="onRequest">${text}</a>`}
    `(
      "[$#] Should transform data to view and vice versa: data: $data, view: $view",
      ({ data, direction, view }: { data: string; direction: TestDirection; view: string }) => {
        const dataString = richtext(p(data));
        const htmlString = `<body><p>${view}</p></body>`;
        const tester = new RulesTester(ruleConfigurations, "p > *");

        tester.executeTests({
          dataString,
          direction,
          htmlString,
        });
      }
    );
  });

  describe("Data Processing (Artificial Role Mapping)", () => {
    const ruleConfigurations = [
      aut.anchorElements,
      /*
       * Stores artificial `xlink:role` as class token with prefix `role_` in
       * `toView` processing and later restores in from `class` attribute in
       * `toData` processing.
       *
       * Note: If this configuration changes, please review the TSdoc of
       * `mapArtificialXLinkRole` regarding the example given in the
       * example.
       */
      aut.mapArtificialXLinkRole({
        toView: (element, role) => {
          const sanitizedRole = role.replaceAll(/\s/g, "_");
          element.classList.add(`role_${sanitizedRole}`);
        },
        toData: (element) => {
          const matcher = /^role_(\S*)$/;
          const matchedClasses: string[] = [];
          let role: string | undefined;
          for (const cls of element.classList) {
            const match = cls.match(matcher);
            if (match) {
              const [matchedCls, matchedRole] = match;
              role = matchedRole;
              matchedClasses.push(matchedCls);
            }
          }
          // Clean-up any matched classes and possibly left-over `class=""`.
          element.classList.remove(...matchedClasses);
          if (element.classList.length === 0) {
            element.removeAttribute("class");
          }
          return role;
        },
      }),
    ];

    const url = "https://e.org/";
    const text = "T";

    describe.each`
      data                                                                                         | direction    | view
      ${`<a xlink:role="ROLE" xlink:show="replace" xlink:href="${url}">${text}</a>`}               | ${bijective} | ${`<a class="role_ROLE" href="${url}" target="_self">${text}</a>`}
      ${`<a xlink:role="ROLE" xlink:show="new" xlink:href="${url}">${text}</a>`}                   | ${bijective} | ${`<a class="role_ROLE" href="${url}" target="_blank">${text}</a>`}
      ${`<a xlink:role="ROLE" xlink:show="embed" xlink:href="${url}">${text}</a>`}                 | ${bijective} | ${`<a class="role_ROLE" href="${url}" target="_embed">${text}</a>`}
      ${`<a xlink:role="ROLE" xlink:show="none" xlink:href="${url}">${text}</a>`}                  | ${bijective} | ${`<a class="role_ROLE" href="${url}" target="_none">${text}</a>`}
      ${`<a class="CLASS" xlink:role="ROLE" xlink:show="replace" xlink:href="${url}">${text}</a>`} | ${bijective} | ${`<a class="CLASS role_ROLE" href="${url}" target="_self">${text}</a>`}
      ${`<a xlink:show="other" xlink:role="ROLE" xlink:href="${url}">${text}</a>`}                 | ${bijective} | ${`<a href="${url}" target="ROLE">${text}</a>`}
    `(
      "[$#] Should transform data to view and vice versa: data: $data, view: $view",
      ({ data, direction, view }: { data: string; direction: TestDirection; view: string }) => {
        const dataString = richtext(p(data));
        const htmlString = `<body><p>${view}</p></body>`;
        const tester = new RulesTester(ruleConfigurations, "p > *");

        tester.executeTests({
          dataString,
          direction,
          htmlString,
        });
      }
    );
  });
});
