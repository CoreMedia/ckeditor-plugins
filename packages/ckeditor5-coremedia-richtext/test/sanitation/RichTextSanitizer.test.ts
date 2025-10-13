// noinspection HtmlRequiredAltAttribute,RequiredAttributes

import "global-jsdom/register";
import test, { beforeEach, describe } from "node:test";
import expect from "expect";
import {
  a,
  blockquote,
  br,
  em,
  img,
  li,
  ol,
  p,
  pre,
  richtext,
  span,
  strong,
  sub,
  sup,
  table,
  tbody,
  td,
  tr,
  ul,
} from "@coremedia-internal/ckeditor5-coremedia-example-data";
import type { StrictnessKey } from "../../src/Strictness";
import { defaultStrictness, Strictness } from "../../src/Strictness";
import { RichTextSanitizer } from "../../src/sanitation/RichTextSanitizer";
import { sanitationListener } from "./TestSanitationListener";
import { parseXml } from "./XmlTestUtils";
import { expectSanitationResult } from "./ExpectSanitationResult";

export const createRichTextSanitizer = (strictness: Strictness = defaultStrictness): RichTextSanitizer =>
  new RichTextSanitizer(strictness, sanitationListener);

/*
 * =====================================================================================================================
 *                                                                                                          Test Suite
 * =====================================================================================================================
 */

void describe("RichTextSanitizer", () => {
  beforeEach(() => {
    sanitationListener.clear();
  });

  const strictnessLevels: StrictnessKey[] = ["STRICT", "LOOSE", "LEGACY", "NONE"];

  for (const strictnessKey of strictnessLevels) {
    describe(`Testing strictness level ${strictnessKey}`, () => {
      const strictness = Strictness[strictnessKey];
      const sanitizer = createRichTextSanitizer(strictness);
      const disabled = strictness === Strictness.NONE;

      void test("Should not modify empty richtext on sanitation", () => {
        const inputXml = richtext();
        expectSanitationResult(sanitizer, inputXml, inputXml);
      });

      void test("Should fail on any non-richtext Document despite for Strictness.NONE", () => {
        const document = parseXml("<root/>");

        const result = sanitizer.sanitize(document);

        if (disabled) {
          expect(result).toBe(document);
          expect(sanitationListener.empty).toBeTruthy();
          return;
        }

        expect(result).toBeFalsy();
        expect(sanitationListener.fatals).toHaveLength(1);
      });

      describe(`Element Sanitation; strictness: ${strictnessKey}`, () => {
        // ======================================================================================================[ <div> ]

        describe(`<div>; strictness: ${strictnessKey}`, () => {
          const elementUnderTest = "<div>";

          describe(`${elementUnderTest} attributes; strictness: ${strictnessKey}`, () => {
            void test("Should not modify for only strictly valid attributes", () => {
              const validXml = richtext("", true, ["xlink"]);
              expectSanitationResult(sanitizer, validXml, validXml);
            });

            void test("Should remove invalid attributes", () => {
              const validXml = richtext();
              const invalidXml = validXml.replace("div", `div invalid="true" stillinvalid="true"`);
              expectSanitationResult(sanitizer, invalidXml, validXml, (listener) => {
                expect(listener.totalLength).toStrictEqual(2);
                expect(listener.removedInvalidAttrs).toHaveLength(2);
              });
            });
          });

          describe(`${elementUnderTest} children; strictness: ${strictnessKey}`, () => {
            const validChildren = ["", p(), ul(li()), ol(li()), pre(), blockquote(), table(tr(td()))];

            for (const [i, validChild] of validChildren.entries()) {
              void test(`[${i}] Should keep valid child: ${validChild}`, () => {
                const validXml = richtext(validChild);
                expectSanitationResult(sanitizer, validXml, validXml);
              });
            }

            const invalidChildrenCases: { invalidChild: string; sanitizedChildren: string }[] = [
              { invalidChild: "T", sanitizedChildren: "" },
              { invalidChild: span(), sanitizedChildren: "" },
              { invalidChild: `<div>${p()}</div>`, sanitizedChildren: p() },
            ];

            for (const [i, { invalidChild, sanitizedChildren }] of invalidChildrenCases.entries()) {
              void test(`[${i}] Should clean up invalid children: ${invalidChild} to ${sanitizedChildren}`, () => {
                const invalidXml = richtext(invalidChild);
                const sanitizedXml = richtext(sanitizedChildren);
                expectSanitationResult(sanitizer, invalidXml, sanitizedXml, (listener) => {
                  expect(listener.totalLength).toStrictEqual(1);
                  expect(listener.removedNodes).toHaveLength(1);
                });
              });
            }
          });
        });

        // ========================================================================================================[ <p> ]

        describe(`<p>; strictness: ${strictnessKey}`, () => {
          const elementUnderTest = "<p>";

          describe(`${elementUnderTest} attributes; strictness: ${strictnessKey}`, () => {
            const validElements: { validElement: string }[] = [
              { validElement: p() },
              { validElement: p("", { dir: "ltr" }) },
              { validElement: p("", { "xml:lang": "en" }) },
              { validElement: p("", { lang: "en" }) },
              { validElement: p("", { class: "C" }) },
              { validElement: p("", { "xml:lang": "" }) },
              { validElement: p("", { lang: "" }) },
              { validElement: p("", { class: "" }) },
            ];

            for (const [i, { validElement }] of validElements.entries()) {
              void test(`[${i}] Should not modify for only strictly valid attributes: ${validElement}`, () => {
                const validXml = richtext(validElement);
                expectSanitationResult(sanitizer, validXml, validXml);
              });
            }

            void test("Should remove invalid attributes", () => {
              const validXml = richtext(p());
              const invalidXml = richtext(p("", { class: "I", lang: "en" }))
                .replace("class", "invalid")
                .replace("lang", "moreinvalid");
              expectSanitationResult(sanitizer, invalidXml, validXml, (listener) => {
                expect(listener.totalLength).toStrictEqual(2);
                expect(listener.removedInvalidAttrs).toHaveLength(2);
              });
            });

            const invalidAttrsTestCases: {
              invalidAttributes: string;
              invalidAttributesCount: number;
            }[] = [
              { invalidAttributes: `xml:lang="in valid"`, invalidAttributesCount: 1 },
              { invalidAttributes: `lang="in valid"`, invalidAttributesCount: 1 },
              { invalidAttributes: `dir="invalid"`, invalidAttributesCount: 1 },
              { invalidAttributes: `xml:lang="in valid" lang="in valid"`, invalidAttributesCount: 2 },
            ];

            for (const [i, { invalidAttributes, invalidAttributesCount }] of invalidAttrsTestCases.entries()) {
              void test(`[${i}] Should keep invalid attribute value only in legacy mode for: ${invalidAttributes}`, () => {
                const validXml = richtext(p());
                const invalidXml = richtext(`<p ${invalidAttributes}/>`);
                const expectedXml = strictness === Strictness.LEGACY ? invalidXml : validXml;
                const expectedInvalidAttributes = strictness === Strictness.LEGACY ? 0 : invalidAttributesCount;

                expectSanitationResult(sanitizer, invalidXml, expectedXml, (listener) => {
                  expect(listener.totalLength).toStrictEqual(expectedInvalidAttributes);
                  expect(listener.removedInvalidAttrs).toHaveLength(expectedInvalidAttributes);
                });
              });
            }
          });

          describe(`${elementUnderTest} children; strictness: ${strictnessKey}`, () => {
            const validChildTestCases: { validChild: string }[] = [
              { validChild: "" },
              { validChild: "T" },
              { validChild: a("T", { "xlink:href": "" }) },
              { validChild: br() },
              { validChild: span() },
              { validChild: img({ "alt": "", "xlink:href": "" }) },
              { validChild: em() },
              { validChild: strong() },
              { validChild: sub() },
              { validChild: sup() },
            ];

            for (const [i, { validChild }] of validChildTestCases.entries()) {
              void test(`[${i}] Should keep valid child: ${validChild}`, () => {
                const validXml = richtext(p(validChild));
                expectSanitationResult(sanitizer, validXml, validXml);
              });
            }

            const invalidChildTestCases: { invalidChild: string; sanitizedChildren: string }[] = [
              { invalidChild: p(), sanitizedChildren: "" },
              { invalidChild: p("T"), sanitizedChildren: "T" },
            ];

            for (const [i, { invalidChild, sanitizedChildren }] of invalidChildTestCases.entries()) {
              void test(`[${i}] Should clean up invalid children: ${invalidChild} to ${sanitizedChildren}`, () => {
                const invalidXml = richtext(p(invalidChild));
                const sanitizedXml = richtext(p(sanitizedChildren));
                expectSanitationResult(sanitizer, invalidXml, sanitizedXml, (listener) => {
                  expect(listener.totalLength).toStrictEqual(1);
                  expect(listener.removedNodes).toHaveLength(1);
                });
              });
            }
          });
        });

        // ====================================================================================================[ <ol/ul> ]

        const lists = [
          { element: "ol", factory: ol },
          { element: "ul", factory: ul },
        ];

        for (const { element, factory } of lists) {
          describe(`<${element}>; strictness: ${strictnessKey}`, () => {
            const elementUnderTest = `<${element}>`;

            describe(`${elementUnderTest} attributes; strictness: ${strictnessKey}`, () => {
              const cases = [
                { validElement: factory(li()) },
                { validElement: factory(li(), { dir: "ltr" }) },
                { validElement: factory(li(), { "xml:lang": "en" }) },
                { validElement: factory(li(), { lang: "en" }) },
                { validElement: factory(li(), { class: "C" }) },
                { validElement: factory(li(), { "xml:lang": "" }) },
                { validElement: factory(li(), { lang: "" }) },
                { validElement: factory(li(), { class: "" }) },
              ];

              for (const [i, { validElement }] of cases.entries()) {
                void test(`[${i}] Should not modify for only strictly valid attributes: ${validElement}`, () => {
                  const validXml = richtext(validElement);
                  expectSanitationResult(sanitizer, validXml, validXml);
                });
              }

              void test("Should remove invalid attributes", () => {
                const validXml = richtext(factory(li()));
                const invalidXml = richtext(factory(li(), { class: "I", lang: "en" }))
                  .replace("class", "invalid")
                  .replace("lang", "moreinvalid");
                expectSanitationResult(sanitizer, invalidXml, validXml, (listener) => {
                  expect(listener.totalLength).toStrictEqual(2);
                  expect(listener.removedInvalidAttrs).toHaveLength(2);
                });
              });

              const invalidAttributeCases: { invalidAttributes: string; invalidAttributesCount: number }[] = [
                { invalidAttributes: `xml:lang="in valid"`, invalidAttributesCount: 1 },
                { invalidAttributes: `lang="in valid"`, invalidAttributesCount: 1 },
                { invalidAttributes: `dir="invalid"`, invalidAttributesCount: 1 },
                { invalidAttributes: `xml:lang="in valid" dir="invalid"`, invalidAttributesCount: 2 },
              ];

              for (const [i, { invalidAttributes, invalidAttributesCount }] of invalidAttributeCases.entries()) {
                void test(`[${i}] Should keep invalid attribute value only in legacy mode for: ${invalidAttributes}`, () => {
                  const validXml = richtext(factory(li()));
                  const invalidXml = richtext(`<${element} ${invalidAttributes}>${li()}</${element}>`);
                  const expectedXml = strictness === Strictness.LEGACY ? invalidXml : validXml;
                  const expectedInvalidAttributes = strictness === Strictness.LEGACY ? 0 : invalidAttributesCount;

                  expectSanitationResult(sanitizer, invalidXml, expectedXml, (listener) => {
                    expect(listener.totalLength).toStrictEqual(expectedInvalidAttributes);
                    expect(listener.removedInvalidAttrs).toHaveLength(expectedInvalidAttributes);
                  });
                });
              }
            });

            describe(`${elementUnderTest} children; strictness: ${strictnessKey}`, () => {
              const validChildCases: { validChild: string | string[] }[] = [
                { validChild: li() },
                { validChild: [li(), li()] },
              ];

              for (const [i, { validChild }] of validChildCases.entries()) {
                void test(`[${i}] Should keep valid child: ${Array.isArray(validChild) ? validChild.join(", ") : validChild}`, () => {
                  const validXml = richtext(factory(validChild));
                  expectSanitationResult(sanitizer, validXml, validXml);
                });
              }

              void test("Should remove illegal empty element", () => {
                const validXml = richtext();
                const invalidXml = richtext(`<${element}/>`);
                expectSanitationResult(sanitizer, invalidXml, validXml, (listener) => {
                  expect(listener.totalLength).toStrictEqual(1);
                  expect(listener.removedNodes).toHaveLength(1);
                });
              });

              const invalidChildCases: {
                invalidChild: string | string[];
                sanitizedChildren: string | string[];
              }[] = [
                { invalidChild: [p(), li()], sanitizedChildren: li() },
                { invalidChild: [li(), p()], sanitizedChildren: li() },
                { invalidChild: [p(em()), li()], sanitizedChildren: li() },
                { invalidChild: [factory(li()), li()], sanitizedChildren: [li(), li()] },
              ];

              for (const [i, { invalidChild, sanitizedChildren }] of invalidChildCases.entries()) {
                void test(`[${i}] Should clean up invalid children: ${Array.isArray(invalidChild) ? invalidChild.join(", ") : invalidChild} → ${Array.isArray(sanitizedChildren) ? sanitizedChildren.join(", ") : sanitizedChildren}`, () => {
                  const invalidXml = richtext(factory(invalidChild));
                  const sanitizedXml = richtext(factory(sanitizedChildren));

                  expectSanitationResult(sanitizer, invalidXml, sanitizedXml, (listener) => {
                    // Note: if the paragraphs had content, this would also
                    // increase the failure count. Thus, we can only ensure
                    // that it is _greater than_.
                    expect(listener.totalLength).toBeGreaterThanOrEqual(1);
                    expect(listener.removedNodes.length).toBeGreaterThanOrEqual(1);
                  });
                });
              }
            });
          });
        }

        // =======================================================================================================[ <li> ]

        describe(`<li>; strictness: ${strictnessKey}`, () => {
          const container = ul;
          const elementUnderTest = "<li>";

          describe(`${elementUnderTest} attributes; strictness: ${strictnessKey}`, () => {
            const validElementCases: { validElement: string }[] = [
              { validElement: li() },
              { validElement: li("", { dir: "ltr" }) },
              { validElement: li("", { "xml:lang": "en" }) },
              { validElement: li("", { lang: "en" }) },
              { validElement: li("", { class: "C" }) },
              { validElement: li("", { "xml:lang": "" }) },
              { validElement: li("", { lang: "" }) },
              { validElement: li("", { class: "" }) },
            ];

            for (const [i, { validElement }] of validElementCases.entries()) {
              void test(`[${i}] Should not modify for only strictly valid attributes: ${validElement}`, () => {
                const validXml = richtext(container(validElement));
                expectSanitationResult(sanitizer, validXml, validXml);
              });
            }

            void test("Should remove invalid attributes", () => {
              const validXml = richtext(container(li()));
              const invalidXml = richtext(container(li("", { class: "I", lang: "en" })))
                .replace("class", "invalid")
                .replace("lang", "moreinvalid");
              expectSanitationResult(sanitizer, invalidXml, validXml, (listener) => {
                expect(listener.totalLength).toStrictEqual(2);
                expect(listener.removedInvalidAttrs).toHaveLength(2);
              });
            });

            const invalidAttributeCases: {
              invalidAttributes: string;
              invalidAttributesCount: number;
            }[] = [
              { invalidAttributes: `xml:lang="in valid"`, invalidAttributesCount: 1 },
              { invalidAttributes: `lang="in valid"`, invalidAttributesCount: 1 },
              { invalidAttributes: `dir="invalid"`, invalidAttributesCount: 1 },
              { invalidAttributes: `lang="in valid" dir="invalid"`, invalidAttributesCount: 2 },
            ];

            for (const [i, { invalidAttributes, invalidAttributesCount }] of invalidAttributeCases.entries()) {
              void test(`[${i}] Should keep invalid attribute value only in legacy mode for: ${invalidAttributes}`, () => {
                const validXml = richtext(container(li()));
                const invalidXml = richtext(container(`<li ${invalidAttributes}/>`));
                const expectedXml = strictness === Strictness.LEGACY ? invalidXml : validXml;
                const expectedInvalidAttributes = strictness === Strictness.LEGACY ? 0 : invalidAttributesCount;

                expectSanitationResult(sanitizer, invalidXml, expectedXml, (listener) => {
                  expect(listener.totalLength).toStrictEqual(expectedInvalidAttributes);
                  expect(listener.removedInvalidAttrs).toHaveLength(expectedInvalidAttributes);
                });
              });
            }
          });

          describe(`${elementUnderTest} children; strictness: ${strictnessKey}`, () => {
            const validChildCases: { validChild: string }[] = [
              { validChild: "" },
              { validChild: "T" },
              { validChild: a("T", { "xlink:href": "" }) },
              { validChild: br() },
              { validChild: span() },
              { validChild: img({ "alt": "", "xlink:href": "" }) },
              { validChild: em() },
              { validChild: strong() },
              { validChild: sub() },
              { validChild: sup() },
            ];

            for (const [i, { validChild }] of validChildCases.entries()) {
              void test(`[${i}] Should keep valid child: ${validChild}`, () => {
                const validXml = richtext(container(li(validChild)));
                expectSanitationResult(sanitizer, validXml, validXml);
              });
            }

            const invalidChildCases: { invalidChild: string; sanitizedChildren: string }[] = [
              { invalidChild: li(), sanitizedChildren: "" },
            ];

            for (const [i, { invalidChild, sanitizedChildren }] of invalidChildCases.entries()) {
              void test(`[${i}] Should clean up invalid children: ${invalidChild} to ${sanitizedChildren}`, () => {
                const invalidXml = richtext(p(invalidChild));
                const sanitizedXml = richtext(p(sanitizedChildren));
                expectSanitationResult(sanitizer, invalidXml, sanitizedXml, (listener) => {
                  expect(listener.totalLength).toStrictEqual(1);
                  expect(listener.removedNodes).toHaveLength(1);
                });
              });
            }
          });
        });

        // ======================================================================================================[ <pre> ]

        describe(`<pre>; strictness: ${strictnessKey}`, () => {
          const elementUnderTest = "<pre>";

          describe(`${elementUnderTest} attributes; strictness: ${strictnessKey}`, () => {
            const validElements: string[] = [
              pre(),
              pre("", { dir: "ltr" }),
              pre("", { "xml:lang": "en" }),
              pre("", { lang: "en" }),
              pre("", { class: "C" }),
              pre("", { "xml:lang": "" }),
              pre("", { lang: "" }),
              pre("", { class: "" }),
            ];

            for (const [i, validElement] of validElements.entries()) {
              void test(`[${i}] Should not modify for only strictly valid attributes: ${validElement}`, () => {
                const validXml = richtext(validElement);
                expectSanitationResult(sanitizer, validXml, validXml);
              });
            }

            void test("Should remove invalid attributes", () => {
              const validXml = richtext(pre());
              const invalidXml = richtext(pre("", { class: "I", lang: "en" }))
                .replace("class", "invalid")
                .replace("lang", "moreinvalid");
              expectSanitationResult(sanitizer, invalidXml, validXml, (listener) => {
                expect(listener.totalLength).toStrictEqual(2);
                expect(listener.removedInvalidAttrs).toHaveLength(2);
              });
            });

            void test("Should keep valid fixed attribute", () => {
              const validXml = richtext(pre("", { "xml:space": "preserve" }));
              expectSanitationResult(sanitizer, validXml, validXml);
            });

            const invalidAttributeCases: { invalidAttributes: string; invalidAttributesCount: number }[] = [
              { invalidAttributes: `xml:lang="in valid"`, invalidAttributesCount: 1 },
              { invalidAttributes: `lang="in valid"`, invalidAttributesCount: 1 },
              { invalidAttributes: `dir="invalid"`, invalidAttributesCount: 1 },
              { invalidAttributes: `xml:space="invalid"`, invalidAttributesCount: 1 },
              { invalidAttributes: `xml:lang="in valid" xml:space="invalid"`, invalidAttributesCount: 2 },
            ];

            for (const [i, { invalidAttributes, invalidAttributesCount }] of invalidAttributeCases.entries()) {
              void test(`[${i}] Should keep invalid attribute value only in legacy mode for: ${invalidAttributes}`, () => {
                const validXml = richtext(pre());
                const invalidXml = richtext(`<pre ${invalidAttributes}/>`);
                const expectedXml = strictness === Strictness.LEGACY ? invalidXml : validXml;
                const expectedInvalidAttributes = strictness === Strictness.LEGACY ? 0 : invalidAttributesCount;

                expectSanitationResult(sanitizer, invalidXml, expectedXml, (listener) => {
                  expect(listener.totalLength).toStrictEqual(expectedInvalidAttributes);
                  expect(listener.removedInvalidAttrs).toHaveLength(expectedInvalidAttributes);
                });
              });
            }
          });

          describe(`${elementUnderTest} children; strictness: ${strictnessKey}`, () => {
            const validChildCases: string[] = [
              "",
              "T",
              a("T", { "xlink:href": "" }),
              br(),
              span(),
              em(),
              strong(),
              sub(),
              sup(),
            ];

            for (const [i, validChild] of validChildCases.entries()) {
              void test(`[${i}] Should keep valid child: ${validChild}`, () => {
                const validXml = richtext(pre(validChild));
                expectSanitationResult(sanitizer, validXml, validXml);
              });
            }

            const cases: { invalidChild: string; sanitizedChildren: string }[] = [
              { invalidChild: p(), sanitizedChildren: "" },
              { invalidChild: p("T"), sanitizedChildren: "T" },
            ];

            for (const [i, { invalidChild, sanitizedChildren }] of cases.entries()) {
              void test(`[${i}] Should clean up invalid children: ${invalidChild} to ${sanitizedChildren}`, () => {
                const invalidXml = richtext(pre(invalidChild));
                const sanitizedXml = richtext(pre(sanitizedChildren));

                expectSanitationResult(sanitizer, invalidXml, sanitizedXml, (listener) => {
                  expect(listener.totalLength).toStrictEqual(1);
                  expect(listener.removedNodes).toHaveLength(1);
                });
              });
            }
          });
        });

        // ===============================================================================================[ <blockquote> ]

        describe(`<blockquote>; strictness: ${strictnessKey}`, () => {
          const elementUnderTest = "<blockquote>";

          describe(`${elementUnderTest} attributes; strictness: ${strictnessKey}`, () => {
            const validElements: string[] = [
              blockquote(),
              blockquote("", { dir: "ltr" }),
              blockquote("", { "xml:lang": "en" }),
              blockquote("", { lang: "en" }),
              blockquote("", { class: "C" }),
              blockquote("", { "xml:lang": "" }),
              blockquote("", { lang: "" }),
              blockquote("", { class: "" }),
              blockquote("", { cite: "" }),
              blockquote("", { cite: "https://e.org/" }),
            ];

            for (const [i, validElement] of validElements.entries()) {
              void test(`[${i}] Should not modify for only strictly valid attributes: ${validElement}`, () => {
                const validXml = richtext(validElement);
                expectSanitationResult(sanitizer, validXml, validXml);
              });
            }

            void test("Should remove invalid attributes", () => {
              const validXml = richtext(blockquote());
              const invalidXml = richtext(blockquote("", { class: "I", lang: "en" }))
                .replace("class", "invalid")
                .replace("lang", "moreinvalid");
              expectSanitationResult(sanitizer, invalidXml, validXml, (listener) => {
                expect(listener.totalLength).toStrictEqual(2);
                expect(listener.removedInvalidAttrs).toHaveLength(2);
              });
            });

            const invalidAttributesCases: { invalidAttributes: string; invalidAttributesCount: number }[] = [
              { invalidAttributes: `xml:lang="in valid"`, invalidAttributesCount: 1 },
              { invalidAttributes: `lang="in valid"`, invalidAttributesCount: 1 },
              { invalidAttributes: `dir="invalid"`, invalidAttributesCount: 1 },
              { invalidAttributes: `xml:lang="in valid" dir="invalid"`, invalidAttributesCount: 2 },
            ];

            for (const [i, { invalidAttributes, invalidAttributesCount }] of invalidAttributesCases.entries()) {
              void test(`[${i}] Should keep invalid attribute value only in legacy mode for: ${invalidAttributes}`, () => {
                const validXml = richtext(blockquote());
                const invalidXml = richtext(`<blockquote ${invalidAttributes}/>`);
                const expectedXml = strictness === Strictness.LEGACY ? invalidXml : validXml;
                const expectedInvalidAttributes = strictness === Strictness.LEGACY ? 0 : invalidAttributesCount;

                expectSanitationResult(sanitizer, invalidXml, expectedXml, (listener) => {
                  expect(listener.totalLength).toStrictEqual(expectedInvalidAttributes);
                  expect(listener.removedInvalidAttrs).toHaveLength(expectedInvalidAttributes);
                });
              });
            }
          });

          describe(`${elementUnderTest} children; strictness: ${strictnessKey}`, () => {
            const validChildren: string[] = ["", p(), ul(li()), ol(li()), pre(), blockquote(), table(tr(td()))];

            for (const [i, validChild] of validChildren.entries()) {
              void test(`[${i}] Should keep valid child: ${validChild}`, () => {
                const validXml = richtext(blockquote(validChild));
                expectSanitationResult(sanitizer, validXml, validXml);
              });
            }

            const invalidChildren: string[] = ["T", br(), span(), em(), strong(), sub(), sup()];

            for (const [i, invalidChild] of invalidChildren.entries()) {
              void test(`[${i}] Should clean up invalid children: ${invalidChild}`, () => {
                const invalidXml = richtext(blockquote(invalidChild));
                const sanitizedXml = richtext(blockquote());
                expectSanitationResult(sanitizer, invalidXml, sanitizedXml, (listener) => {
                  expect(listener.totalLength).toStrictEqual(1);
                  expect(listener.removedNodes).toHaveLength(1);
                });
              });
            }
          });
        });

        // ========================================================================================================[ <a> ]

        describe(`<a>; strictness: ${strictnessKey}`, () => {
          const elementUnderTest = "<a>";

          describe(`${elementUnderTest} attributes; strictness: ${strictnessKey}`, () => {
            const validElements = [
              a("", { "xlink:href": "" }),
              a("", { "xlink:href": "", "xlink:role": "" }),
              a("", { "xlink:href": "", "xlink:title": "" }),
              a("", { "xlink:href": "", "xlink:show": "new" }),
              a("", { "xlink:href": "", "xlink:actuate": "onLoad" }),
              a("", { "xlink:href": "", "dir": "ltr" }),
              a("", { "xlink:href": "", "xml:lang": "en" }),
              a("", { "xlink:href": "", "lang": "en" }),
              a("", { "xlink:href": "", "class": "C" }),
              a("", { "xlink:href": "", "xml:lang": "" }),
              a("", { "xlink:href": "", "lang": "" }),
              a("", { "xlink:href": "", "class": "" }),
            ];

            for (const [i, validElement] of validElements.entries()) {
              void test(`[${i}] Should not modify for only strictly valid attributes: ${validElement}`, () => {
                const validXml = richtext(p(validElement));
                expectSanitationResult(sanitizer, validXml, validXml);
              });
            }

            void test("Should remove invalid attributes", () => {
              const validXml = richtext(p(a("", { "xlink:href": "" })));
              const invalidXml = richtext(p(a("", { "xlink:href": "", "class": "I", "lang": "en" })))
                .replace("class", "invalid")
                .replace("lang", "moreinvalid");
              expectSanitationResult(sanitizer, invalidXml, validXml, (listener) => {
                expect(listener.totalLength).toStrictEqual(2);
                expect(listener.removedInvalidAttrs).toHaveLength(2);
              });
            });

            void test("Should add missing required attribute (silently)", () => {
              const validXml = richtext(p(a("", { "xlink:href": "" })));
              const invalidXml = validXml.replace(`xlink:href=""`, "");
              expectSanitationResult(sanitizer, invalidXml, validXml, (listener) => {
                expect(listener.totalLength).toStrictEqual(0);
                expect(listener.removedInvalidAttrs).toHaveLength(0);
              });
            });

            void test("Should keep valid fixed attribute", () => {
              const validXml = richtext(p(a("", { "xlink:href": "", "xlink:type": "simple" })));
              expectSanitationResult(sanitizer, validXml, validXml);
            });

            const testCases = [
              { invalidAttributes: `xml:lang="in valid"`, invalidAttributesCount: 1 },
              { invalidAttributes: `lang="in valid"`, invalidAttributesCount: 1 },
              { invalidAttributes: `dir="invalid"`, invalidAttributesCount: 1 },
              { invalidAttributes: `xlink:type="invalid"`, invalidAttributesCount: 1 },
              { invalidAttributes: `xlink:show="invalid"`, invalidAttributesCount: 1 },
              { invalidAttributes: `xlink:actuate="invalid"`, invalidAttributesCount: 1 },
              {
                invalidAttributes: `xml:lang="in valid" lang="in valid" xlink:show="invalid" xlink:actuate="invalid"`,
                invalidAttributesCount: 4,
              },
            ];

            for (const [i, { invalidAttributes, invalidAttributesCount }] of testCases.entries()) {
              void test(`[${i}] Should keep invalid attribute value only in legacy mode for: ${invalidAttributes}`, () => {
                const validXml = richtext(p(a("", { "xlink:href": "" })));
                const invalidXml = richtext(p(a("", { "xlink:href": "" }))).replace("<a", `<a ${invalidAttributes}`);
                const expectedXml = strictness === Strictness.LEGACY ? invalidXml : validXml;
                const expectedInvalidAttributes = strictness === Strictness.LEGACY ? 0 : invalidAttributesCount;

                expectSanitationResult(sanitizer, invalidXml, expectedXml, (listener) => {
                  expect(listener.totalLength).toStrictEqual(expectedInvalidAttributes);
                  expect(listener.removedInvalidAttrs).toHaveLength(expectedInvalidAttributes);
                });
              });
            }
          });

          describe(`${elementUnderTest} children; strictness: ${strictnessKey}`, () => {
            const validChildren = [
              "",
              "T",
              br(),
              span(),
              img({ "alt": "", "xlink:href": "" }),
              em(),
              strong(),
              sub(),
              sup(),
            ];

            for (const [i, validChild] of validChildren.entries()) {
              void test(`[${i}] Should keep valid child: ${validChild}`, () => {
                const validXml = richtext(p(a(validChild, { "xlink:href": "" })));
                expectSanitationResult(sanitizer, validXml, validXml);
              });
            }

            const cases: { invalidChild: string; sanitizedChildren: string }[] = [
              { invalidChild: p(), sanitizedChildren: "" },
              { invalidChild: p("T"), sanitizedChildren: "T" },
              { invalidChild: a("T", { "xlink:href": "" }), sanitizedChildren: "T" },
            ];

            for (const [i, { invalidChild, sanitizedChildren }] of cases.entries()) {
              void test(`[${i}] Should clean up invalid children: ${invalidChild} to ${sanitizedChildren}`, () => {
                const invalidXml = richtext(p(a(invalidChild, { "xlink:href": "" })));
                const sanitizedXml = richtext(p(a(sanitizedChildren, { "xlink:href": "" })));

                expectSanitationResult(sanitizer, invalidXml, sanitizedXml, (listener) => {
                  expect(listener.totalLength).toStrictEqual(1);
                  expect(listener.removedNodes).toHaveLength(1);
                });
              });
            }
          });
        });

        // ====================================================================[ Common Inline: <span/em/strong/sub/sup> ]

        const elements: {
          element: string;
          factory: typeof span | typeof em | typeof strong | typeof sub | typeof sup;
        }[] = [
          { element: "span", factory: span },
          { element: "em", factory: em },
          { element: "strong", factory: strong },
          { element: "sub", factory: sub },
          { element: "sup", factory: sup },
        ];

        for (const { element, factory } of elements) {
          describe(`<${element}>; strictness: ${strictnessKey}`, () => {
            const elementUnderTest = `<${element}>`;

            describe(`${elementUnderTest} attributes; strictness: ${strictnessKey}`, () => {
              const validElements: { validElement: string }[] = [
                { validElement: factory("") },
                { validElement: factory("", { dir: "ltr" }) },
                { validElement: factory("", { "xml:lang": "en" }) },
                { validElement: factory("", { lang: "en" }) },
                { validElement: factory("", { class: "C" }) },
                { validElement: factory("", { "xml:lang": "" }) },
                { validElement: factory("", { lang: "" }) },
                { validElement: factory("", { class: "" }) },
              ];

              for (const [i, { validElement }] of validElements.entries()) {
                void test(`[${i}] Should not modify for only strictly valid attributes: ${validElement}`, () => {
                  const validXml = richtext(p(validElement));
                  expectSanitationResult(sanitizer, validXml, validXml);
                });
              }

              void test("Should remove invalid attributes", () => {
                const validXml = richtext(p(factory()));
                const invalidXml = richtext(p(factory("", { class: "I", lang: "en" })))
                  .replace("class", "invalid")
                  .replace("lang", "moreinvalid");
                expectSanitationResult(sanitizer, invalidXml, validXml, (listener) => {
                  expect(listener.totalLength).toStrictEqual(2);
                  expect(listener.removedInvalidAttrs).toHaveLength(2);
                });
              });

              const invalidAttributesCases: {
                invalidAttributes: string;
                invalidAttributesCount: number;
              }[] = [
                { invalidAttributes: `xml:lang="in valid"`, invalidAttributesCount: 1 },
                { invalidAttributes: `lang="in valid"`, invalidAttributesCount: 1 },
                { invalidAttributes: `dir="invalid"`, invalidAttributesCount: 1 },
                { invalidAttributes: `xml:lang="in valid" dir="invalid"`, invalidAttributesCount: 2 },
              ];

              for (const [i, { invalidAttributes, invalidAttributesCount }] of invalidAttributesCases.entries()) {
                void test(`[${i}] Should keep invalid attribute value only in legacy mode for: ${invalidAttributes}`, () => {
                  const validXml = richtext(p(factory()));
                  const invalidXml = validXml.replace(`<${element}`, `<${element} ${invalidAttributes}`);
                  const expectedXml = strictness === Strictness.LEGACY ? invalidXml : validXml;
                  const expectedInvalidAttributes = strictness === Strictness.LEGACY ? 0 : invalidAttributesCount;

                  expectSanitationResult(sanitizer, invalidXml, expectedXml, (listener) => {
                    expect(listener.totalLength).toStrictEqual(expectedInvalidAttributes);
                    expect(listener.removedInvalidAttrs).toHaveLength(expectedInvalidAttributes);
                  });
                });
              }
            });

            describe(`${elementUnderTest} children; strictness: ${strictnessKey}`, () => {
              const validChildren: string[] = [
                "",
                "T",
                a("T", { "xlink:href": "" }),
                br(),
                span(),
                img({ "alt": "", "xlink:href": "" }),
                em(),
                strong(),
                sub(),
                sup(),
              ];

              for (const [i, validChild] of validChildren.entries()) {
                void test(`[${i}] Should keep valid child: ${validChild}`, () => {
                  const validXml = richtext(p(factory(validChild)));
                  expectSanitationResult(sanitizer, validXml, validXml);
                });
              }

              const testCases: { invalidChild: string; sanitizedChildren: string }[] = [
                { invalidChild: p(), sanitizedChildren: "" },
                { invalidChild: p("T"), sanitizedChildren: "T" },
              ];

              for (const [i, { invalidChild, sanitizedChildren }] of testCases.entries()) {
                void test(`[${i}] Should clean up invalid children: ${invalidChild} to ${sanitizedChildren}`, () => {
                  const invalidXml = richtext(p(factory(invalidChild)));
                  const sanitizedXml = richtext(p(factory(sanitizedChildren)));
                  expectSanitationResult(sanitizer, invalidXml, sanitizedXml, (listener) => {
                    expect(listener.totalLength).toStrictEqual(1);
                    expect(listener.removedNodes).toHaveLength(1);
                  });
                });
              }
            });
          });
        }

        // ======================================================================================================[ <img> ]

        describe(`<img>; strictness: ${strictnessKey}`, () => {
          const elementUnderTest = "<img>";

          describe(`${elementUnderTest} attributes; strictness: ${strictnessKey}`, () => {
            const validElements: { validElement: string }[] = [
              { validElement: img({ "alt": "", "xlink:href": "" }) },
              { validElement: img({ "alt": "", "xlink:href": "", "width": 1 }) },
              { validElement: img({ "alt": "", "xlink:href": "", "height": 1 }) },
              { validElement: img({ "alt": "", "xlink:href": "", "xlink:role": "" }) },
              { validElement: img({ "alt": "", "xlink:href": "", "xlink:title": "" }) },
              { validElement: img({ "alt": "", "xlink:href": "", "dir": "ltr" }) },
              { validElement: img({ "alt": "", "xlink:href": "", "xml:lang": "en" }) },
              { validElement: img({ "alt": "", "xlink:href": "", "lang": "en" }) },
              { validElement: img({ "alt": "", "xlink:href": "", "class": "C" }) },
              { validElement: img({ "alt": "", "xlink:href": "", "xml:lang": "" }) },
              { validElement: img({ "alt": "", "xlink:href": "", "lang": "" }) },
              { validElement: img({ "alt": "", "xlink:href": "", "class": "" }) },
            ];

            for (const [i, { validElement }] of validElements.entries()) {
              void test(`[${i}] Should not modify for only strictly valid attributes: ${validElement}`, () => {
                const validXml = richtext(p(validElement));
                expectSanitationResult(sanitizer, validXml, validXml);
              });
            }

            void test("Should remove invalid attributes", () => {
              const validXml = richtext(p(img({ "alt": "", "xlink:href": "" })));
              const invalidXml = richtext(p(img({ "alt": "", "xlink:href": "", "class": "I", "lang": "en" })))
                .replace("class", "invalid")
                .replace("lang", "moreinvalid");
              expectSanitationResult(sanitizer, invalidXml, validXml, (listener) => {
                expect(listener.totalLength).toStrictEqual(2);
                expect(listener.removedInvalidAttrs).toHaveLength(2);
              });
            });

            const fixedAttributes: { withFixed: string }[] = [
              { withFixed: img({ "alt": "", "xlink:href": "", "xlink:type": "simple" }) },
              { withFixed: img({ "alt": "", "xlink:href": "", "xlink:show": "embed" }) },
              { withFixed: img({ "alt": "", "xlink:href": "", "xlink:actuate": "onLoad" }) },
            ];

            for (const [i, { withFixed }] of fixedAttributes.entries()) {
              void test(`[${i}] Should keep fixed attribute: ${withFixed}`, () => {
                const validXml = richtext(p(withFixed));
                expectSanitationResult(sanitizer, validXml, validXml);
              });
            }

            void test("Should add missing required attribute (silently)", () => {
              // Skipping test for required `alt` attribute here, as we had hassle
              // with attribute orders during validation – and for some reason, the
              // alt attribute is serialized having a `ns1` attribute prefix applied,
              // although it is of the default namespaceURI.
              // It works correctly in manual testing, though.
              const validXml = richtext(p(img({ "alt": "", "xlink:href": "" })));
              const invalidXml = validXml.replace(`xlink:href=""`, "");
              expectSanitationResult(sanitizer, invalidXml, validXml, (listener) => {
                expect(listener.totalLength).toStrictEqual(0);
                expect(listener.removedInvalidAttrs).toHaveLength(0);
              });
            });

            const invalidAttrs: { invalidAttributes: string; invalidAttributesCount: number }[] = [
              { invalidAttributes: `xml:lang="in valid"`, invalidAttributesCount: 1 },
              { invalidAttributes: `lang="in valid"`, invalidAttributesCount: 1 },
              { invalidAttributes: `dir="invalid"`, invalidAttributesCount: 1 },
              { invalidAttributes: `xml:lang="in valid" lang="in valid"`, invalidAttributesCount: 2 },
              { invalidAttributes: `xlink:type="invalid"`, invalidAttributesCount: 1 },
              { invalidAttributes: `xlink:show="invalid"`, invalidAttributesCount: 1 },
              { invalidAttributes: `xlink:actuate="invalid"`, invalidAttributesCount: 1 },
              {
                invalidAttributes: `xlink:type="invalid" xlink:show="invalid" xlink:actuate="invalid"`,
                invalidAttributesCount: 3,
              },
            ];

            for (const [i, { invalidAttributes, invalidAttributesCount }] of invalidAttrs.entries()) {
              void test(`[${i}] Should keep invalid attribute value only in legacy mode for: ${invalidAttributes}`, () => {
                const validXml = richtext(p(img({ "alt": "", "xlink:href": "" })));
                const invalidXml = richtext(p(img({ "alt": "", "xlink:href": "" }))).replace(
                  "<img",
                  `<img ${invalidAttributes}`,
                );
                const expectedXml = strictness === Strictness.LEGACY ? invalidXml : validXml;
                const expectedInvalidAttributes = strictness === Strictness.LEGACY ? 0 : invalidAttributesCount;

                expectSanitationResult(sanitizer, invalidXml, expectedXml, (listener) => {
                  expect(listener.totalLength).toStrictEqual(expectedInvalidAttributes);
                  expect(listener.removedInvalidAttrs).toHaveLength(expectedInvalidAttributes);
                });
              });
            }
          });

          describe(`${elementUnderTest} children; strictness: ${strictnessKey}`, () => {
            const invalidChildren: string[] = [p(), p("T")];

            for (const [i, invalidChild] of invalidChildren.entries()) {
              void test(`[${i}] Should clean up invalid children: ${invalidChild}`, () => {
                const invalidXml = richtext(p(img({ "alt": "", "xlink:href": "" }))).replace(
                  "/>",
                  `>${invalidChild}</img>`,
                );
                const sanitizedXml = richtext(p(img({ "alt": "", "xlink:href": "" })));

                expectSanitationResult(sanitizer, invalidXml, sanitizedXml, (listener) => {
                  expect(listener.totalLength).toBeGreaterThanOrEqual(1);
                  expect(listener.removedNodes.length).toBeGreaterThanOrEqual(1);
                });
              });
            }
          });
        });

        // ====================================================================================================[ <table> ]

        describe(`<table>; strictness: ${strictnessKey}`, () => {
          const elementUnderTest = "<table>";

          describe(`${elementUnderTest} attributes; strictness: ${strictnessKey}`, () => {
            const validElements = [
              table(tr(td())),
              table(tr(td()), { dir: "ltr" }),
              table(tr(td()), { "xml:lang": "en" }),
              table(tr(td()), { lang: "en" }),
              table(tr(td()), { class: "C" }),
              table(tr(td()), { "xml:lang": "" }),
              table(tr(td()), { lang: "" }),
              table(tr(td()), { class: "" }),
              table(tr(td()), { summary: "" }),
            ];

            for (const [i, validElement] of validElements.entries()) {
              void test(`[${i}] Should not modify for only strictly valid attributes: ${validElement}`, () => {
                const validXml = richtext(validElement);
                expectSanitationResult(sanitizer, validXml, validXml);
              });
            }

            void test("Should remove invalid attributes", () => {
              const validXml = richtext(table(tr(td())));
              const invalidXml = richtext(table(tr(td()), { class: "I", lang: "en" }))
                .replace("class", "invalid")
                .replace("lang", "moreinvalid");
              expectSanitationResult(sanitizer, invalidXml, validXml, (listener) => {
                expect(listener.totalLength).toStrictEqual(2);
                expect(listener.removedInvalidAttrs).toHaveLength(2);
              });
            });

            const testCases = [
              { invalidAttributes: `xml:lang="in valid"`, invalidAttributesCount: 1 },
              { invalidAttributes: `lang="in valid"`, invalidAttributesCount: 1 },
              { invalidAttributes: `dir="invalid"`, invalidAttributesCount: 1 },
              { invalidAttributes: `lang="in valid" dir="invalid"`, invalidAttributesCount: 2 },
            ];

            for (const [i, { invalidAttributes, invalidAttributesCount }] of testCases.entries()) {
              void test(`[${i}] Should keep invalid attribute value only in legacy mode for: ${invalidAttributes}`, () => {
                const validXml = richtext(table(tr(td())));
                const invalidXml = validXml.replace("<table", `<table ${invalidAttributes}`);
                const expectedXml = strictness === Strictness.LEGACY ? invalidXml : validXml;
                const expectedInvalidAttributes = strictness === Strictness.LEGACY ? 0 : invalidAttributesCount;

                expectSanitationResult(sanitizer, invalidXml, expectedXml, (listener) => {
                  expect(listener.totalLength).toStrictEqual(expectedInvalidAttributes);
                  expect(listener.removedInvalidAttrs).toHaveLength(expectedInvalidAttributes);
                });
              });
            }
          });

          describe(`${elementUnderTest} children; strictness: ${strictnessKey}`, () => {
            const testCases = [{ validChild: tr(td()) }, { validChild: tbody(tr(td())) }];

            for (const [i, { validChild }] of testCases.entries()) {
              void test(`[${i}] Should keep valid child: ${validChild}`, () => {
                const validXml = richtext(table(validChild));
                expectSanitationResult(sanitizer, validXml, validXml);
              });
            }

            void test("Should remove illegal empty element", () => {
              const validXml = richtext();
              const invalidXml = richtext(`<table/>`);
              expectSanitationResult(sanitizer, invalidXml, validXml, (listener) => {
                expect(listener.totalLength).toStrictEqual(1);
                expect(listener.removedNodes).toHaveLength(1);
              });
            });

            const testCases2 = [{ invalidChild: "T" }, { invalidChild: p() }];

            for (const [i, { invalidChild }] of testCases2.entries()) {
              void test(`[${i}] Should clean up invalid children: ${invalidChild}`, () => {
                const invalidXml = richtext(table([invalidChild, tr(td()), invalidChild]));
                const sanitizedXml = richtext(table(tr(td())));
                expectSanitationResult(sanitizer, invalidXml, sanitizedXml, (listener) => {
                  expect(listener.totalLength).toStrictEqual(2);
                  expect(listener.removedNodes).toHaveLength(2);
                });
              });
            }
          });
        });

        // ====================================================================================================[ <tbody> ]

        describe(`<tbody>; strictness: ${strictnessKey}`, () => {
          const elementUnderTest = "<tbody>";

          describe(`${elementUnderTest} attributes; strictness: ${strictnessKey}`, () => {
            const validElements = [
              tbody(tr(td())),
              tbody(tr(td()), { dir: "ltr" }),
              tbody(tr(td()), { "xml:lang": "en" }),
              tbody(tr(td()), { lang: "en" }),
              tbody(tr(td()), { class: "C" }),
              tbody(tr(td()), { "xml:lang": "" }),
              tbody(tr(td()), { lang: "" }),
              tbody(tr(td()), { class: "" }),
              tbody(tr(td()), { align: "left" }),
              tbody(tr(td()), { valign: "top" }),
            ];

            for (const [i, validElement] of validElements.entries()) {
              void test(`[${i}] Should not modify for only strictly valid attributes: ${validElement}`, () => {
                const validXml = richtext(table(validElement));
                expectSanitationResult(sanitizer, validXml, validXml);
              });
            }

            void test("Should remove invalid attributes", () => {
              const validXml = richtext(table(tbody(tr(td()))));
              const invalidXml = richtext(table(tbody(tr(td()), { class: "I", lang: "en" })))
                .replace("class", "invalid")
                .replace("lang", "moreinvalid");
              expectSanitationResult(sanitizer, invalidXml, validXml, (listener) => {
                expect(listener.totalLength).toStrictEqual(2);
                expect(listener.removedInvalidAttrs).toHaveLength(2);
              });
            });

            const invalidAttributeCases = [
              { invalidAttributes: `xml:lang="in valid"`, invalidAttributesCount: 1 },
              { invalidAttributes: `lang="in valid"`, invalidAttributesCount: 1 },
              { invalidAttributes: `dir="invalid"`, invalidAttributesCount: 1 },
              { invalidAttributes: `align="invalid"`, invalidAttributesCount: 1 },
              { invalidAttributes: `valign="invalid"`, invalidAttributesCount: 1 },
              { invalidAttributes: `xml:lang="in valid" dir="invalid" valign="invalid"`, invalidAttributesCount: 3 },
            ];

            for (const [i, { invalidAttributes, invalidAttributesCount }] of invalidAttributeCases.entries()) {
              void test(`[${i}] Should keep invalid attribute value only in legacy mode for: ${invalidAttributes}`, () => {
                const validXml = richtext(table(tbody(tr(td()))));
                const invalidXml = validXml.replace("<tbody", `<tbody ${invalidAttributes}`);
                const expectedXml = strictness === Strictness.LEGACY ? invalidXml : validXml;
                const expectedInvalidAttributes = strictness === Strictness.LEGACY ? 0 : invalidAttributesCount;

                expectSanitationResult(sanitizer, invalidXml, expectedXml, (listener) => {
                  expect(listener.totalLength).toStrictEqual(expectedInvalidAttributes);
                  expect(listener.removedInvalidAttrs).toHaveLength(expectedInvalidAttributes);
                });
              });
            }
          });

          describe(`${elementUnderTest} children; strictness: ${strictnessKey}`, () => {
            const validChildrenCases: { validChildren: string | string[] }[] = [
              { validChildren: tr(td()) },
              { validChildren: [tr(td()), tr(td())] },
            ];

            for (const [i, { validChildren }] of validChildrenCases.entries()) {
              void test(`[${i}] Should keep valid children: ${JSON.stringify(validChildren)}`, () => {
                const validXml = richtext(table(tbody(validChildren)));
                expectSanitationResult(sanitizer, validXml, validXml);
              });
            }

            void test("Should remove illegal empty element", () => {
              const validXml = richtext();
              const invalidXml = richtext(table(`<tbody/>`));
              expectSanitationResult(sanitizer, invalidXml, validXml, (listener) => {
                expect(listener.totalLength).toStrictEqual(2);
                expect(listener.removedNodes).toHaveLength(2);
              });
            });

            const invalidChildrenCases: { invalidChild: string }[] = [{ invalidChild: "T" }, { invalidChild: p() }];

            for (const [i, { invalidChild }] of invalidChildrenCases.entries()) {
              void test(`[${i}] Should clean up invalid children: ${JSON.stringify(invalidChild)}`, () => {
                const invalidXml = richtext(table(tbody([invalidChild, tr(td()), invalidChild])));
                const sanitizedXml = richtext(table(tbody(tr(td()))));

                expectSanitationResult(sanitizer, invalidXml, sanitizedXml, (listener) => {
                  expect(listener.totalLength).toStrictEqual(2);
                  expect(listener.removedNodes).toHaveLength(2);
                });
              });
            }
          });
        });

        // =======================================================================================================[ <tr> ]

        describe(`<tr>; strictness: ${strictnessKey}`, () => {
          const elementUnderTest = "<tr>";

          describe(`${elementUnderTest} attributes; strictness: ${strictnessKey}`, () => {
            const validElements = [
              tr(td()),
              tr(td(), { dir: "ltr" }),
              tr(td(), { "xml:lang": "en" }),
              tr(td(), { lang: "en" }),
              tr(td(), { class: "C" }),
              tr(td(), { "xml:lang": "" }),
              tr(td(), { lang: "" }),
              tr(td(), { class: "" }),
              tr(td(), { align: "left" }),
              tr(td(), { valign: "top" }),
            ];

            for (const [i, validElement] of validElements.entries()) {
              void test(`[${i}] Should not modify for only strictly valid attributes: ${JSON.stringify(validElement)}`, () => {
                const validXml = richtext(table(validElement));
                expectSanitationResult(sanitizer, validXml, validXml);
              });
            }

            void test("Should remove invalid attributes", () => {
              const validXml = richtext(table(tr(td())));
              const invalidXml = richtext(table(tr(td(), { class: "I", lang: "en" })))
                .replace("class", "invalid")
                .replace("lang", "moreinvalid");
              expectSanitationResult(sanitizer, invalidXml, validXml, (listener) => {
                expect(listener.totalLength).toStrictEqual(2);
                expect(listener.removedInvalidAttrs).toHaveLength(2);
              });
            });

            const invalidAttrsCases: { invalidAttributes: string; invalidAttributesCount: number }[] = [
              { invalidAttributes: `xml:lang="in valid"`, invalidAttributesCount: 1 },
              { invalidAttributes: `lang="in valid"`, invalidAttributesCount: 1 },
              { invalidAttributes: `dir="invalid"`, invalidAttributesCount: 1 },
              { invalidAttributes: `align="invalid"`, invalidAttributesCount: 1 },
              { invalidAttributes: `valign="invalid"`, invalidAttributesCount: 1 },
              { invalidAttributes: `align="invalid" valign="invalid"`, invalidAttributesCount: 2 },
            ];

            for (const [i, { invalidAttributes, invalidAttributesCount }] of invalidAttrsCases.entries()) {
              void test(`[${i}] Should keep invalid attribute value only in legacy mode for: ${invalidAttributes}`, () => {
                const validXml = richtext(table(tr(td())));
                const invalidXml = validXml.replace("<tr", `<tr ${invalidAttributes}`);
                const expectedXml = strictness === Strictness.LEGACY ? invalidXml : validXml;
                const expectedInvalidAttributes = strictness === Strictness.LEGACY ? 0 : invalidAttributesCount;

                expectSanitationResult(sanitizer, invalidXml, expectedXml, (listener) => {
                  expect(listener.totalLength).toStrictEqual(expectedInvalidAttributes);
                  expect(listener.removedInvalidAttrs).toHaveLength(expectedInvalidAttributes);
                });
              });
            }
          });

          describe(`${elementUnderTest} children; strictness: ${strictnessKey}`, () => {
            const validChildrenCases: { validChildren: string | string[] }[] = [
              { validChildren: td() },
              { validChildren: [td(), td()] },
            ];

            for (const [i, { validChildren }] of validChildrenCases.entries()) {
              void test(`[${i}] Should keep valid children: ${validChildren}`, () => {
                const validXml = richtext(table(tr(validChildren)));
                expectSanitationResult(sanitizer, validXml, validXml);
              });
            }

            void test("Should remove illegal empty element", () => {
              const validXml = richtext();
              const invalidXml = richtext(table(`<tr/>`));
              expectSanitationResult(sanitizer, invalidXml, validXml, (listener) => {
                expect(listener.totalLength).toStrictEqual(2);
                expect(listener.removedNodes).toHaveLength(2);
              });
            });

            const invalidChildrenCases: { invalidChild: string }[] = [{ invalidChild: "T" }, { invalidChild: p() }];

            for (const [i, { invalidChild }] of invalidChildrenCases.entries()) {
              void test(`[${i}] Should clean up invalid children: ${invalidChild}`, () => {
                const invalidXml = richtext(table(tr([invalidChild, td(), invalidChild])));
                const sanitizedXml = richtext(table(tr(td())));
                expectSanitationResult(sanitizer, invalidXml, sanitizedXml, (listener) => {
                  expect(listener.totalLength).toStrictEqual(2);
                  expect(listener.removedNodes).toHaveLength(2);
                });
              });
            }
          });
        });

        // =======================================================================================================[ <td> ]

        describe(`<td>; strictness: ${strictnessKey}`, () => {
          const elementUnderTest = "<td>";

          describe(`${elementUnderTest} attributes; strictness: ${strictnessKey}`, () => {
            const validElements: { validElement: string }[] = [
              { validElement: td() },
              { validElement: td("", { dir: "ltr" }) },
              { validElement: td("", { "xml:lang": "en" }) },
              { validElement: td("", { lang: "en" }) },
              { validElement: td("", { class: "C" }) },
              { validElement: td("", { "xml:lang": "" }) },
              { validElement: td("", { lang: "" }) },
              { validElement: td("", { class: "" }) },
              { validElement: td("", { align: "left" }) },
              { validElement: td("", { valign: "top" }) },
              { validElement: td("", { abbr: "" }) },
              { validElement: td("", { colspan: 2 }) },
              { validElement: td("", { rowspan: 2 }) },
            ];

            for (const [i, { validElement }] of validElements.entries()) {
              void test(`[${i}] Should not modify for only strictly valid attributes: ${validElement}`, () => {
                const validXml = richtext(table(tr(validElement)));
                expectSanitationResult(sanitizer, validXml, validXml);
              });
            }

            void test("Should remove invalid attributes", () => {
              const validXml = richtext(table(tr(td(""))));
              const invalidXml = richtext(table(tr(td("", { class: "I", lang: "en" }))))
                .replace("class", "invalid")
                .replace("lang", "moreinvalid");
              expectSanitationResult(sanitizer, invalidXml, validXml, (listener) => {
                expect(listener.totalLength).toStrictEqual(2);
                expect(listener.removedInvalidAttrs).toHaveLength(2);
              });
            });

            const invalidAttributesCases: {
              invalidAttributes: string;
              invalidAttributesCount: number;
            }[] = [
              { invalidAttributes: `xml:lang="in valid"`, invalidAttributesCount: 1 },
              { invalidAttributes: `lang="in valid"`, invalidAttributesCount: 1 },
              { invalidAttributes: `dir="invalid"`, invalidAttributesCount: 1 },
              { invalidAttributes: `align="invalid"`, invalidAttributesCount: 1 },
              { invalidAttributes: `valign="invalid"`, invalidAttributesCount: 1 },
              { invalidAttributes: `lang="in valid" align="invalid" valign="invalid"`, invalidAttributesCount: 3 },
            ];

            for (const [i, { invalidAttributes, invalidAttributesCount }] of invalidAttributesCases.entries()) {
              void test(`[${i}] Should keep invalid attribute value only in legacy mode for: ${invalidAttributes}`, () => {
                const validXml = richtext(table(tr(td())));
                const invalidXml = validXml.replace("<td", `<td ${invalidAttributes}`);
                const expectedXml = strictness === Strictness.LEGACY ? invalidXml : validXml;
                const expectedInvalidAttributes = strictness === Strictness.LEGACY ? 0 : invalidAttributesCount;

                expectSanitationResult(sanitizer, invalidXml, expectedXml, (listener) => {
                  expect(listener.totalLength).toStrictEqual(expectedInvalidAttributes);
                  expect(listener.removedInvalidAttrs).toHaveLength(expectedInvalidAttributes);
                });
              });
            }

            const suspiciousAttributesCases: {
              suspiciousAttributes: string;
              suspiciousAttributesCount: number;
            }[] = [
              { suspiciousAttributes: `rowspan="invalid"`, suspiciousAttributesCount: 1 },
              { suspiciousAttributes: `colspan="invalid"`, suspiciousAttributesCount: 1 },
              { suspiciousAttributes: `rowspan="invalid" colspan="invalid"`, suspiciousAttributesCount: 2 },
            ];

            for (const [
              i,
              { suspiciousAttributes, suspiciousAttributesCount },
            ] of suspiciousAttributesCases.entries()) {
              void test(`[${i}] Should remove suspicious attribute value only in strict mode for: ${suspiciousAttributes}`, () => {
                const validXml = richtext(table(tr(td())));
                const invalidXml = validXml.replace("<td", `<td ${suspiciousAttributes}`);
                const expectedXml = strictness !== Strictness.STRICT ? invalidXml : validXml;
                const expectedInvalidAttributes = strictness !== Strictness.STRICT ? 0 : suspiciousAttributesCount;

                expectSanitationResult(sanitizer, invalidXml, expectedXml, (listener) => {
                  expect(listener.totalLength).toStrictEqual(expectedInvalidAttributes);
                  expect(listener.removedInvalidAttrs).toHaveLength(expectedInvalidAttributes);
                });
              });
            }
          });

          describe(`${elementUnderTest} children; strictness: ${strictnessKey}`, () => {
            const validChildrenCases: { validChildren: string | string[] }[] = [
              { validChildren: "" },
              { validChildren: "T" },
              { validChildren: p("T") },
              { validChildren: em("T") },
              { validChildren: table(tr(td())) },
            ];

            for (const [i, { validChildren }] of validChildrenCases.entries()) {
              void test(`[${i}] Should keep valid children: ${validChildren}`, () => {
                const validXml = richtext(table(tr(td(validChildren))));
                expectSanitationResult(sanitizer, validXml, validXml);
              });
            }

            const invalidChildrenCases: { invalidChild: string }[] = [
              { invalidChild: td() },
              { invalidChild: `<div/>` },
            ];

            for (const [i, { invalidChild }] of invalidChildrenCases.entries()) {
              void test(`[${i}] Should clean up invalid children: ${invalidChild}`, () => {
                const invalidXml = richtext(table(tr(td(invalidChild))));
                const sanitizedXml = richtext(table(tr(td())));
                expectSanitationResult(sanitizer, invalidXml, sanitizedXml, (listener) => {
                  expect(listener.totalLength).toStrictEqual(1);
                  expect(listener.removedNodes).toHaveLength(1);
                });
              });
            }
          });
        });
      });
    });
  }
});
