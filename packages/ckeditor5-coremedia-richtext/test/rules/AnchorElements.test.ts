// noinspection HtmlUnknownAttribute

import "global-jsdom/register";
import test, { describe } from "node:test";
import expect from "expect";
import * as aut from "../../src/rules/AnchorElements";
import { p, richtext } from "@coremedia-internal/ckeditor5-coremedia-example-data";
import { RulesTester } from "./RulesTester";
import { bijective, TestDirection } from "./TestDirection";

void describe("AnchorElement", () => {
  void describe("parseDataContentLink", () => {
    const cases: { data: string; expectedId: number | undefined }[] = [
      { data: ``, expectedId: undefined },
      { data: `https://example.org/`, expectedId: undefined },
      { data: `content/42`, expectedId: 42 },
      { data: `content/0`, expectedId: 0 },
      { data: `content/${Number.MAX_SAFE_INTEGER}`, expectedId: Number.MAX_SAFE_INTEGER },
      { data: `content/42#postfix`, expectedId: undefined },
      { data: `content/-1`, expectedId: undefined },
      { data: `content/${Number.MIN_SAFE_INTEGER}`, expectedId: undefined },
      { data: `content/example`, expectedId: undefined },
      { data: `coremedia:///cap/content/42`, expectedId: 42 },
      { data: `coremedia:///cap/content/0`, expectedId: 0 },
      { data: `coremedia:///cap/content/${Number.MAX_SAFE_INTEGER}`, expectedId: Number.MAX_SAFE_INTEGER },
      { data: `coremedia:///cap/content/42#postfix`, expectedId: undefined },
      { data: `coremedia:///cap/content/-1`, expectedId: undefined },
      { data: `coremedia:///cap/content/${Number.MIN_SAFE_INTEGER}`, expectedId: undefined },
      { data: `coremedia:///cap/content/example`, expectedId: undefined },
    ];

    for (const { data, expectedId } of cases) {
      void test(`Should parse "${data}" to ${expectedId}`, () => {
        expect(aut.parseDataContentLink(data)).toStrictEqual(expectedId);
      });
    }
  });

  void describe("parseViewContentLink", () => {
    const testCases: { view: string; expectedId: number | undefined }[] = [
      { view: `https://example.org/`, expectedId: undefined },
      { view: `content:42`, expectedId: 42 },
      { view: `content:0`, expectedId: 0 },
      { view: `content:${Number.MAX_SAFE_INTEGER}`, expectedId: Number.MAX_SAFE_INTEGER },
      { view: `content:-1`, expectedId: undefined },
      { view: `content:${Number.MIN_SAFE_INTEGER}`, expectedId: undefined },
      { view: `content:example`, expectedId: undefined },
    ];

    for (const { view, expectedId } of testCases) {
      void test(`Should parse "${view}" to ${expectedId}`, () => {
        expect(aut.parseViewContentLink(view)).toStrictEqual(expectedId);
      });
    }
  });

  void describe("toDataContentLink", () => {
    const testCases: { id: number; expectedLink: string }[] = [
      { id: 0, expectedLink: `content/0` },
      { id: 42, expectedLink: `content/42` },
      { id: Number.MAX_SAFE_INTEGER, expectedLink: `content/${Number.MAX_SAFE_INTEGER}` },
    ];

    for (const { id, expectedLink } of testCases) {
      void test(`Should format ${id} to ${expectedLink}`, () => {
        expect(aut.toDataContentLink(id)).toStrictEqual(expectedLink);
      });
    }
  });

  void describe("toViewContentLink", () => {
    const testCases: { id: number; expectedLink: string }[] = [
      { id: 0, expectedLink: `content:0` },
      { id: 42, expectedLink: `content:42` },
      { id: Number.MAX_SAFE_INTEGER, expectedLink: `content:${Number.MAX_SAFE_INTEGER}` },
    ];

    for (const [index, { id, expectedLink }] of testCases.entries()) {
      void test(`[${index}] Should format ${id} to ${expectedLink}`, () => {
        expect(aut.toViewContentLink(id)).toStrictEqual(expectedLink);
      });
    }
  });

  void describe("formatHrefForData", () => {
    const testCases: { view: string; expectedHref: string }[] = [
      { view: ``, expectedHref: `` },
      { view: `https://example.org/`, expectedHref: `https://example.org/` },
      { view: `content:42`, expectedHref: `content/42` },
      { view: `content:0`, expectedHref: `content/0` },
      { view: `content:${Number.MAX_SAFE_INTEGER}`, expectedHref: `content/${Number.MAX_SAFE_INTEGER}` },
      { view: `content:-1`, expectedHref: `content:-1` },
      { view: `content:${Number.MIN_SAFE_INTEGER}`, expectedHref: `content:${Number.MIN_SAFE_INTEGER}` },
      { view: `content:example`, expectedHref: `content:example` },
    ];

    for (const [index, { view, expectedHref }] of testCases.entries()) {
      void test(`[${index}] Should format data view representation ${view} to HREF for data: ${expectedHref}`, () => {
        expect(aut.formatHrefForData(view)).toStrictEqual(expectedHref);
      });
    }
  });

  void describe("formatHrefForView", () => {
    const testCases: { data: string; expectedHref: string }[] = [
      { data: `https://example.org/`, expectedHref: `https://example.org/` },
      { data: `content/42`, expectedHref: `content:42` },
      { data: `content/0`, expectedHref: `content:0` },
      { data: `content/${Number.MAX_SAFE_INTEGER}`, expectedHref: `content:${Number.MAX_SAFE_INTEGER}` },
      { data: `content/42#postfix`, expectedHref: `content/42#postfix` },
      { data: `content/-1`, expectedHref: `content/-1` },
      { data: `content/${Number.MIN_SAFE_INTEGER}`, expectedHref: `content/${Number.MIN_SAFE_INTEGER}` },
      { data: `content/example`, expectedHref: `content/example` },
      { data: `coremedia:///cap/content/42`, expectedHref: `content:42` },
      { data: `coremedia:///cap/content/0`, expectedHref: `content:0` },
      {
        data: `coremedia:///cap/content/${Number.MAX_SAFE_INTEGER}`,
        expectedHref: `content:${Number.MAX_SAFE_INTEGER}`,
      },
      { data: `coremedia:///cap/content/42#postfix`, expectedHref: `coremedia:///cap/content/42#postfix` },
      { data: `coremedia:///cap/content/-1`, expectedHref: `coremedia:///cap/content/-1` },
      {
        data: `coremedia:///cap/content/${Number.MIN_SAFE_INTEGER}`,
        expectedHref: `coremedia:///cap/content/${Number.MIN_SAFE_INTEGER}`,
      },
      { data: `coremedia:///cap/content/example`, expectedHref: `coremedia:///cap/content/example` },
    ];

    for (const [index, { data, expectedHref }] of testCases.entries()) {
      void test(`[${index}] Should format data representation ${data} to HREF well supported by CKEditor 5 Link Feature: ${expectedHref}`, () => {
        expect(aut.formatHrefForView(data)).toStrictEqual(expectedHref);
      });
    }
  });

  void describe("formatTarget & parseTarget", () => {
    const testCases: {
      show?: string;
      role?: string;
      target: string;
      bijective: boolean;
    }[] = [
      { show: undefined, role: undefined, target: "", bijective: true },
      { show: "replace", role: undefined, target: "_self", bijective: true },
      { show: "new", role: undefined, target: "_blank", bijective: true },
      { show: "embed", role: undefined, target: "_embed", bijective: true },
      { show: "none", role: undefined, target: "_none", bijective: true },
      { show: "other", role: undefined, target: "_other", bijective: true },
      { show: "unknown", role: undefined, target: "", bijective: false },
      { show: undefined, role: "ROLE", target: "_role_ROLE", bijective: true },
      { show: "replace", role: "ROLE", target: "_self_ROLE", bijective: true },
      { show: "new", role: "ROLE", target: "_blank_ROLE", bijective: true },
      { show: "embed", role: "ROLE", target: "_embed_ROLE", bijective: true },
      { show: "none", role: "ROLE", target: "_none_ROLE", bijective: true },
      { show: "other", role: "ROLE", target: "ROLE", bijective: true },
      { show: "unknown", role: "ROLE", target: "_role_ROLE", bijective: false },
    ];

    for (const [index, { show, role, target, bijective }] of testCases.entries()) {
      describe(`[${index}] Should format xlink:show=${show} and xlink:role=${role} to target '${target}' and vice versa (if bijective? ${bijective})`, () => {
        void test("formatTarget", () => {
          // We expect some warnings and info logs. Thus, suppressing.
          // TODO[ntr] const actual = silenced(() => aut.formatTarget({ show, role }));
          const actual = aut.formatTarget({ show, role });
          expect(actual).toStrictEqual(target);
        });

        if (bijective) {
          void test("parseTarget", () => {
            // Validates the counterpart to formatTarget, that it is able to
            // parse the attributes again.
            // No strict check, as implementation may/will not set irrelevant
            // attributes.
            expect(aut.parseTarget(target)).toEqual({ show, role });
          });
        }
      });
    }
  });

  void describe("Data Processing", () => {
    const ruleConfigurations = [aut.anchorElements];

    const url = "https://e.org/";
    const contentUriPath = aut.toDataContentLink(42);
    const contentUrl = aut.toViewContentLink(42);
    const text = "T";

    const testCases: {
      data: string;
      direction: TestDirection;
      view: string;
    }[] = [
      { data: `<a xlink:href="${url}">${text}</a>`, direction: bijective, view: `<a href="${url}">${text}</a>` },
      {
        data: `<a xlink:href="${contentUriPath}">${text}</a>`,
        direction: bijective,
        view: `<a href="${contentUrl}">${text}</a>`,
      },
      {
        data: `<a xlink:show="replace" xlink:href="${url}">${text}</a>`,
        direction: bijective,
        view: `<a href="${url}" target="_self">${text}</a>`,
      },
      {
        data: `<a xlink:show="other" xlink:role="ROLE" xlink:href="${url}">${text}</a>`,
        direction: bijective,
        view: `<a href="${url}" target="ROLE">${text}</a>`,
      },
      {
        data: `<a xlink:type="simple" xlink:href="${url}">${text}</a>`,
        direction: bijective,
        view: `<a href="${url}" data-xlink-type="simple">${text}</a>`,
      },
      {
        data: `<a xlink:actuate="onRequest" xlink:href="${url}">${text}</a>`,
        direction: bijective,
        view: `<a href="${url}" data-xlink-actuate="onRequest">${text}</a>`,
      },
    ];

    for (const [index, { data, direction, view }] of testCases.entries()) {
      describe(`[${index}] Should transform data to view and vice versa: data: ${data}, view: ${view}`, () => {
        void test("executeTests", () => {
          const dataString = richtext(p(data));
          const htmlString = `<body><p>${view}</p></body>`;
          const tester = new RulesTester(ruleConfigurations, "p > *");

          tester.executeTests({
            dataString,
            direction,
            htmlString,
          });
        });
      });
    }
  });

  void describe("Data Processing (Artificial Role Mapping)", () => {
    const ruleConfigurations = [
      aut.anchorElements,
      /*
       * Stores artificial `xlink:role` as class token with prefix `role_` in
       * `toView` processing and later restores it from `class` attribute in
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

    const testCases: { data: string; direction: TestDirection; view: string }[] = [
      {
        data: `<a xlink:role="ROLE" xlink:show="replace" xlink:href="${url}">${text}</a>`,
        direction: bijective,
        view: `<a class="role_ROLE" href="${url}" target="_self">${text}</a>`,
      },
      {
        data: `<a xlink:role="ROLE" xlink:show="new" xlink:href="${url}">${text}</a>`,
        direction: bijective,
        view: `<a class="role_ROLE" href="${url}" target="_blank">${text}</a>`,
      },
      {
        data: `<a xlink:role="ROLE" xlink:show="embed" xlink:href="${url}">${text}</a>`,
        direction: bijective,
        view: `<a class="role_ROLE" href="${url}" target="_embed">${text}</a>`,
      },
      {
        data: `<a xlink:role="ROLE" xlink:show="none" xlink:href="${url}">${text}</a>`,
        direction: bijective,
        view: `<a class="role_ROLE" href="${url}" target="_none">${text}</a>`,
      },
      {
        data: `<a class="CLASS" xlink:role="ROLE" xlink:show="replace" xlink:href="${url}">${text}</a>`,
        direction: bijective,
        view: `<a class="CLASS role_ROLE" href="${url}" target="_self">${text}</a>`,
      },
      {
        data: `<a xlink:show="other" xlink:role="ROLE" xlink:href="${url}">${text}</a>`,
        direction: bijective,
        view: `<a href="${url}" target="ROLE">${text}</a>`,
      },
    ];

    for (const [index, { data, direction, view }] of testCases.entries()) {
      describe(`[${index}] Should transform data to view and vice versa: data: ${data}, view: ${view}`, () => {
        void test("executeTests", () => {
          const dataString = richtext(p(data));
          const htmlString = `<body><p>${view}</p></body>`;
          const tester = new RulesTester(ruleConfigurations, "p > *");

          tester.executeTests({
            dataString,
            direction,
            htmlString,
          });
        });
      });
    }
  });
});
