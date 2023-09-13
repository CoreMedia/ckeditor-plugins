// noinspection HtmlRequiredAltAttribute,RequiredAttributes

import { defaultStrictness, Strictness, StrictnessKey } from "../../src/Strictness";
import { RichTextSanitizer } from "../../src/sanitation/RichTextSanitizer";
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
} from "@coremedia-internal/ckeditor5-coremedia-example-data/src/RichTextBase";
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

describe("RichTextSanitizer", () => {
  beforeEach(() => {
    sanitationListener.clear();
  });

  describe.each`
    strictness
    ${"STRICT"}
    ${"LOOSE"}
    ${"LEGACY"}
    ${"NONE"}
  `("[$#] Testing strictness level $strictness", ({ strictness: strictnessKey }: { strictness: StrictnessKey }) => {
    const strictness = Strictness[strictnessKey];
    const sanitizer = createRichTextSanitizer(strictness);
    const disabled = strictness === Strictness.NONE;

    it("Should not modify empty richtext on sanitation", () => {
      const inputXml = richtext();
      expectSanitationResult(sanitizer, inputXml, inputXml);
    });

    it("Should fail on any non-richtext Document despite for Strictness.NONE", () => {
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
          it("Should not modify for only strictly valid attributes", () => {
            const validXml = richtext("", true, ["xlink"]);
            expectSanitationResult(sanitizer, validXml, validXml);
          });

          it("Should remove invalid attributes", () => {
            const validXml = richtext();
            const invalidXml = validXml.replace("div", `div invalid="true"`);
            expectSanitationResult(sanitizer, invalidXml, validXml, (listener) => {
              expect(listener.totalLength).toStrictEqual(1);
              expect(listener.removedInvalidAttrs).toHaveLength(1);
            });
          });
        });

        describe(`${elementUnderTest} children; strictness: ${strictnessKey}`, () => {
          test.each`
            validChild
            ${""}
            ${p()}
            ${ul(li())}
            ${ol(li())}
            ${pre()}
            ${blockquote()}
            ${table(tr(td()))}
          `("[$#] Should keep valid child: $validChild", ({ validChild }: { validChild: string }) => {
            const validXml = richtext(validChild);
            expectSanitationResult(sanitizer, validXml, validXml);
          });

          test.each`
            invalidChild           | sanitizedChildren
            ${"T"}                 | ${""}
            ${span()}              | ${""}
            ${`<div>${p()}</div>`} | ${p()}
          `(
            "[$#] Should clean up invalid children: $invalidChild to $sanitizedChildren",
            ({ invalidChild, sanitizedChildren }: { invalidChild: string; sanitizedChildren: string }) => {
              const invalidXml = richtext(invalidChild);
              const sanitizedXml = richtext(sanitizedChildren);
              expectSanitationResult(sanitizer, invalidXml, sanitizedXml, (listener) => {
                expect(listener.totalLength).toStrictEqual(1);
                expect(listener.removedNodes).toHaveLength(1);
              });
            },
          );
        });
      });

      // ========================================================================================================[ <p> ]

      describe(`<p>; strictness: ${strictnessKey}`, () => {
        const elementUnderTest = "<p>";

        describe(`${elementUnderTest} attributes; strictness: ${strictnessKey}`, () => {
          it.each`
            validElement
            ${p()}
            ${p("", { dir: "ltr" })}
            ${p("", { "xml:lang": "en" })}
            ${p("", { lang: "en" })}
            ${p("", { class: "C" })}
            ${p("", { "xml:lang": "" })}
            ${p("", { lang: "" })}
            ${p("", { class: "" })}
          `(
            "[$#] Should not modify for only strictly valid attributes: $validElement",
            ({ validElement }: { validElement: string }) => {
              const validXml = richtext(validElement);
              expectSanitationResult(sanitizer, validXml, validXml);
            },
          );

          it("Should remove invalid attributes", () => {
            const validXml = richtext(p());
            const invalidXml = richtext(p("", { class: "I" })).replace("class", "invalid");
            expectSanitationResult(sanitizer, invalidXml, validXml, (listener) => {
              expect(listener.totalLength).toStrictEqual(1);
              expect(listener.removedInvalidAttrs).toHaveLength(1);
            });
          });

          it.each`
            invalidAttribute
            ${`xml:lang="in valid"`}
            ${`lang="in valid"`}
            ${`dir="invalid"`}
          `(
            "[$#] Should keep invalid attribute value only in legacy mode for: $invalidAttribute",
            ({ invalidAttribute }: { invalidAttribute: string }) => {
              const validXml = richtext(p());
              const invalidXml = richtext(`<p ${invalidAttribute}/>`);
              const expectedXml = strictness === Strictness.LEGACY ? invalidXml : validXml;
              const expectedInvalidAttributes = strictness === Strictness.LEGACY ? 0 : 1;

              expectSanitationResult(sanitizer, invalidXml, expectedXml, (listener) => {
                expect(listener.totalLength).toStrictEqual(expectedInvalidAttributes);
                expect(listener.removedInvalidAttrs).toHaveLength(expectedInvalidAttributes);
              });
            },
          );
        });

        describe(`${elementUnderTest} children; strictness: ${strictnessKey}`, () => {
          test.each`
            validChild
            ${""}
            ${"T"}
            ${a("T", { "xlink:href": "" })}
            ${br()}
            ${span()}
            ${img({ "alt": "", "xlink:href": "" })}
            ${em()}
            ${strong()}
            ${sub()}
            ${sup()}
          `("[$#] Should keep valid child: $validChild", ({ validChild }: { validChild: string }) => {
            const validXml = richtext(p(validChild));
            expectSanitationResult(sanitizer, validXml, validXml);
          });

          test.each`
            invalidChild | sanitizedChildren
            ${p()}       | ${""}
            ${p("T")}    | ${"T"}
          `(
            "[$#] Should clean up invalid children: $invalidChild to $sanitizedChildren",
            ({ invalidChild, sanitizedChildren }: { invalidChild: string; sanitizedChildren: string }) => {
              const invalidXml = richtext(p(invalidChild));
              const sanitizedXml = richtext(p(sanitizedChildren));
              expectSanitationResult(sanitizer, invalidXml, sanitizedXml, (listener) => {
                expect(listener.totalLength).toStrictEqual(1);
                expect(listener.removedNodes).toHaveLength(1);
              });
            },
          );
        });
      });

      // ====================================================================================================[ <ol/ul> ]

      describe.each`
        element | factory
        ${"ol"} | ${ol}
        ${"ul"} | ${ul}
      `(
        `<$element>; strictness: ${strictnessKey}`,
        ({ element, factory }: { element: string; factory: typeof ol | typeof ul }) => {
          const elementUnderTest = `<${element}>`;

          describe(`${elementUnderTest} attributes; strictness: ${strictnessKey}`, () => {
            it.each`
              validElement
              ${factory(li())}
              ${factory(li(), { dir: "ltr" })}
              ${factory(li(), { "xml:lang": "en" })}
              ${factory(li(), { lang: "en" })}
              ${factory(li(), { class: "C" })}
              ${factory(li(), { "xml:lang": "" })}
              ${factory(li(), { lang: "" })}
              ${factory(li(), { class: "" })}
            `(
              "[$#] Should not modify for only strictly valid attributes: $validElement",
              ({ validElement }: { validElement: string }) => {
                const validXml = richtext(validElement);
                expectSanitationResult(sanitizer, validXml, validXml);
              },
            );

            it("Should remove invalid attributes", () => {
              const validXml = richtext(factory(li()));
              const invalidXml = richtext(factory(li(), { class: "I" })).replace("class", "invalid");
              expectSanitationResult(sanitizer, invalidXml, validXml, (listener) => {
                expect(listener.totalLength).toStrictEqual(1);
                expect(listener.removedInvalidAttrs).toHaveLength(1);
              });
            });

            it.each`
              invalidAttribute
              ${`xml:lang="in valid"`}
              ${`lang="in valid"`}
              ${`dir="invalid"`}
            `(
              "[$#] Should keep invalid attribute value only in legacy mode for: $invalidAttribute",
              ({ invalidAttribute }: { invalidAttribute: string }) => {
                const validXml = richtext(factory(li()));
                const invalidXml = richtext(`<${element} ${invalidAttribute}>${li()}</${element}>`);
                const expectedXml = strictness === Strictness.LEGACY ? invalidXml : validXml;
                const expectedInvalidAttributes = strictness === Strictness.LEGACY ? 0 : 1;

                expectSanitationResult(sanitizer, invalidXml, expectedXml, (listener) => {
                  expect(listener.totalLength).toStrictEqual(expectedInvalidAttributes);
                  expect(listener.removedInvalidAttrs).toHaveLength(expectedInvalidAttributes);
                });
              },
            );
          });

          describe(`${elementUnderTest} children; strictness: ${strictnessKey}`, () => {
            test.each`
              validChild
              ${li()}
              ${[li(), li()]}
            `("[$#] Should keep valid child: $validChild", ({ validChild }: { validChild: string }) => {
              const validXml = richtext(factory(validChild));
              expectSanitationResult(sanitizer, validXml, validXml);
            });

            it("Should remove illegal empty element", () => {
              const validXml = richtext();
              const invalidXml = richtext(`<${element}/>`);
              expectSanitationResult(sanitizer, invalidXml, validXml, (listener) => {
                expect(listener.totalLength).toStrictEqual(1);
                expect(listener.removedNodes).toHaveLength(1);
              });
            });

            test.each`
              invalidChild             | sanitizedChildren
              ${[p(), li()]}           | ${li()}
              ${[li(), p()]}           | ${li()}
              ${[p(em()), li()]}       | ${li()}
              ${[factory(li()), li()]} | ${[li(), li()]}
            `(
              "[$#] Should clean up invalid children: $invalidChild to $sanitizedChildren",
              ({ invalidChild, sanitizedChildren }: { invalidChild: string; sanitizedChildren: string }) => {
                const invalidXml = richtext(factory(invalidChild));
                const sanitizedXml = richtext(factory(sanitizedChildren));
                expectSanitationResult(sanitizer, invalidXml, sanitizedXml, (listener) => {
                  // Note, that if the paragraphs had content, this will also
                  // increase the failure count. Thus, we can only ensure, that
                  // it is _greater than_.
                  expect(listener.totalLength).toBeGreaterThanOrEqual(1);
                  expect(listener.removedNodes.length).toBeGreaterThanOrEqual(1);
                });
              },
            );
          });
        },
      );

      // =======================================================================================================[ <li> ]

      describe(`<li>; strictness: ${strictnessKey}`, () => {
        const container = ul;
        const elementUnderTest = "<li>";

        describe(`${elementUnderTest} attributes; strictness: ${strictnessKey}`, () => {
          it.each`
            validElement
            ${li()}
            ${li("", { dir: "ltr" })}
            ${li("", { "xml:lang": "en" })}
            ${li("", { lang: "en" })}
            ${li("", { class: "C" })}
            ${li("", { "xml:lang": "" })}
            ${li("", { lang: "" })}
            ${li("", { class: "" })}
          `(
            "[$#] Should not modify for only strictly valid attributes: $validElement",
            ({ validElement }: { validElement: string }) => {
              const validXml = richtext(container(validElement));
              expectSanitationResult(sanitizer, validXml, validXml);
            },
          );

          it("Should remove invalid attributes", () => {
            const validXml = richtext(container(li()));
            const invalidXml = richtext(container(li("", { class: "I" }))).replace("class", "invalid");
            expectSanitationResult(sanitizer, invalidXml, validXml, (listener) => {
              expect(listener.totalLength).toStrictEqual(1);
              expect(listener.removedInvalidAttrs).toHaveLength(1);
            });
          });

          it.each`
            invalidAttribute
            ${`xml:lang="in valid"`}
            ${`lang="in valid"`}
            ${`dir="invalid"`}
          `(
            "[$#] Should keep invalid attribute value only in legacy mode for: $invalidAttribute",
            ({ invalidAttribute }: { invalidAttribute: string }) => {
              const validXml = richtext(container(li()));
              const invalidXml = richtext(container(`<li ${invalidAttribute}/>`));
              const expectedXml = strictness === Strictness.LEGACY ? invalidXml : validXml;
              const expectedInvalidAttributes = strictness === Strictness.LEGACY ? 0 : 1;

              expectSanitationResult(sanitizer, invalidXml, expectedXml, (listener) => {
                expect(listener.totalLength).toStrictEqual(expectedInvalidAttributes);
                expect(listener.removedInvalidAttrs).toHaveLength(expectedInvalidAttributes);
              });
            },
          );
        });

        describe(`${elementUnderTest} children; strictness: ${strictnessKey}`, () => {
          test.each`
            validChild
            ${""}
            ${"T"}
            ${a("T", { "xlink:href": "" })}
            ${br()}
            ${span()}
            ${img({ "alt": "", "xlink:href": "" })}
            ${em()}
            ${strong()}
            ${sub()}
            ${sup()}
          `("[$#] Should keep valid child: $validChild", ({ validChild }: { validChild: string }) => {
            const validXml = richtext(container(li(validChild)));
            expectSanitationResult(sanitizer, validXml, validXml);
          });

          test.each`
            invalidChild | sanitizedChildren
            ${li()}      | ${""}
          `(
            "[$#] Should clean up invalid children: $invalidChild to $sanitizedChildren",
            ({ invalidChild, sanitizedChildren }: { invalidChild: string; sanitizedChildren: string }) => {
              const invalidXml = richtext(p(invalidChild));
              const sanitizedXml = richtext(p(sanitizedChildren));
              expectSanitationResult(sanitizer, invalidXml, sanitizedXml, (listener) => {
                expect(listener.totalLength).toStrictEqual(1);
                expect(listener.removedNodes).toHaveLength(1);
              });
            },
          );
        });
      });

      // ======================================================================================================[ <pre> ]

      describe(`<pre>; strictness: ${strictnessKey}`, () => {
        const elementUnderTest = "<pre>";

        describe(`${elementUnderTest} attributes; strictness: ${strictnessKey}`, () => {
          it.each`
            validElement
            ${pre()}
            ${pre("", { dir: "ltr" })}
            ${pre("", { "xml:lang": "en" })}
            ${pre("", { lang: "en" })}
            ${pre("", { class: "C" })}
            ${pre("", { "xml:lang": "" })}
            ${pre("", { lang: "" })}
            ${pre("", { class: "" })}
          `(
            "[$#] Should not modify for only strictly valid attributes: $validElement",
            ({ validElement }: { validElement: string }) => {
              const validXml = richtext(validElement);
              expectSanitationResult(sanitizer, validXml, validXml);
            },
          );

          it("Should remove invalid attributes", () => {
            const validXml = richtext(pre());
            const invalidXml = richtext(pre("", { class: "I" })).replace("class", "invalid");
            expectSanitationResult(sanitizer, invalidXml, validXml, (listener) => {
              expect(listener.totalLength).toStrictEqual(1);
              expect(listener.removedInvalidAttrs).toHaveLength(1);
            });
          });

          it("Should remove fixed attribute (silently)", () => {
            const optimizedXml = richtext(pre());
            const originalXml = richtext(pre("", { "xml:space": "preserve" }));
            expectSanitationResult(sanitizer, originalXml, optimizedXml, (listener) => {
              expect(listener.totalLength).toStrictEqual(0);
            });
          });

          it.each`
            invalidAttribute
            ${`xml:lang="in valid"`}
            ${`lang="in valid"`}
            ${`dir="invalid"`}
            ${`xml:space="invalid"`}
          `(
            "[$#] Should keep invalid attribute value only in legacy mode for: $invalidAttribute",
            ({ invalidAttribute }: { invalidAttribute: string }) => {
              const validXml = richtext(pre());
              const invalidXml = richtext(`<pre ${invalidAttribute}/>`);
              const expectedXml = strictness === Strictness.LEGACY ? invalidXml : validXml;
              const expectedInvalidAttributes = strictness === Strictness.LEGACY ? 0 : 1;

              expectSanitationResult(sanitizer, invalidXml, expectedXml, (listener) => {
                expect(listener.totalLength).toStrictEqual(expectedInvalidAttributes);
                expect(listener.removedInvalidAttrs).toHaveLength(expectedInvalidAttributes);
              });
            },
          );
        });

        describe(`${elementUnderTest} children; strictness: ${strictnessKey}`, () => {
          test.each`
            validChild
            ${""}
            ${"T"}
            ${a("T", { "xlink:href": "" })}
            ${br()}
            ${span()}
            ${em()}
            ${strong()}
            ${sub()}
            ${sup()}
          `("[$#] Should keep valid child: $validChild", ({ validChild }: { validChild: string }) => {
            const validXml = richtext(pre(validChild));
            expectSanitationResult(sanitizer, validXml, validXml);
          });

          test.each`
            invalidChild | sanitizedChildren
            ${p()}       | ${""}
            ${p("T")}    | ${"T"}
          `(
            "[$#] Should clean up invalid children: $invalidChild to $sanitizedChildren",
            ({ invalidChild, sanitizedChildren }: { invalidChild: string; sanitizedChildren: string }) => {
              const invalidXml = richtext(pre(invalidChild));
              const sanitizedXml = richtext(pre(sanitizedChildren));
              expectSanitationResult(sanitizer, invalidXml, sanitizedXml, (listener) => {
                expect(listener.totalLength).toStrictEqual(1);
                expect(listener.removedNodes).toHaveLength(1);
              });
            },
          );
        });
      });

      // ===============================================================================================[ <blockquote> ]

      describe(`<blockquote>; strictness: ${strictnessKey}`, () => {
        const elementUnderTest = "<blockquote>";

        describe(`${elementUnderTest} attributes; strictness: ${strictnessKey}`, () => {
          it.each`
            validElement
            ${blockquote()}
            ${blockquote("", { dir: "ltr" })}
            ${blockquote("", { "xml:lang": "en" })}
            ${blockquote("", { lang: "en" })}
            ${blockquote("", { class: "C" })}
            ${blockquote("", { "xml:lang": "" })}
            ${blockquote("", { lang: "" })}
            ${blockquote("", { class: "" })}
            ${blockquote("", { cite: "" })}
            ${blockquote("", { cite: "https://e.org/" })}
          `(
            "[$#] Should not modify for only strictly valid attributes: $validElement",
            ({ validElement }: { validElement: string }) => {
              const validXml = richtext(validElement);
              expectSanitationResult(sanitizer, validXml, validXml);
            },
          );

          it("Should remove invalid attributes", () => {
            const validXml = richtext(blockquote());
            const invalidXml = richtext(blockquote("", { class: "I" })).replace("class", "invalid");
            expectSanitationResult(sanitizer, invalidXml, validXml, (listener) => {
              expect(listener.totalLength).toStrictEqual(1);
              expect(listener.removedInvalidAttrs).toHaveLength(1);
            });
          });

          it.each`
            invalidAttribute
            ${`xml:lang="in valid"`}
            ${`lang="in valid"`}
            ${`dir="invalid"`}
          `(
            "[$#] Should keep invalid attribute value only in legacy mode for: $invalidAttribute",
            ({ invalidAttribute }: { invalidAttribute: string }) => {
              const validXml = richtext(blockquote());
              const invalidXml = richtext(`<blockquote ${invalidAttribute}/>`);
              const expectedXml = strictness === Strictness.LEGACY ? invalidXml : validXml;
              const expectedInvalidAttributes = strictness === Strictness.LEGACY ? 0 : 1;

              expectSanitationResult(sanitizer, invalidXml, expectedXml, (listener) => {
                expect(listener.totalLength).toStrictEqual(expectedInvalidAttributes);
                expect(listener.removedInvalidAttrs).toHaveLength(expectedInvalidAttributes);
              });
            },
          );
        });

        describe(`${elementUnderTest} children; strictness: ${strictnessKey}`, () => {
          test.each`
            validChild
            ${""}
            ${p()}
            ${ul(li())}
            ${ol(li())}
            ${pre()}
            ${blockquote()}
            ${table(tr(td()))}
          `("[$#] Should keep valid child: $validChild", ({ validChild }: { validChild: string }) => {
            const validXml = richtext(blockquote(validChild));
            expectSanitationResult(sanitizer, validXml, validXml);
          });

          test.each`
            invalidChild
            ${"T"}
            ${br()}
            ${span()}
            ${em()}
            ${strong()}
            ${sub()}
            ${sup()}
          `("[$#] Should clean up invalid children: $invalidChild", ({ invalidChild }: { invalidChild: string }) => {
            const invalidXml = richtext(blockquote(invalidChild));
            const sanitizedXml = richtext(blockquote());
            expectSanitationResult(sanitizer, invalidXml, sanitizedXml, (listener) => {
              expect(listener.totalLength).toStrictEqual(1);
              expect(listener.removedNodes).toHaveLength(1);
            });
          });
        });
      });

      // ========================================================================================================[ <a> ]

      describe(`<a>; strictness: ${strictnessKey}`, () => {
        const elementUnderTest = "<a>";

        describe(`${elementUnderTest} attributes; strictness: ${strictnessKey}`, () => {
          it.each`
            validElement
            ${a("", { "xlink:href": "" })}
            ${a("", { "xlink:href": "", "xlink:role": "" })}
            ${a("", { "xlink:href": "", "xlink:title": "" })}
            ${a("", { "xlink:href": "", "xlink:show": "new" })}
            ${a("", { "xlink:href": "", "xlink:actuate": "onLoad" })}
            ${a("", { "xlink:href": "", "dir": "ltr" })}
            ${a("", { "xlink:href": "", "xml:lang": "en" })}
            ${a("", { "xlink:href": "", "lang": "en" })}
            ${a("", { "xlink:href": "", "class": "C" })}
            ${a("", { "xlink:href": "", "xml:lang": "" })}
            ${a("", { "xlink:href": "", "lang": "" })}
            ${a("", { "xlink:href": "", "class": "" })}
          `(
            "[$#] Should not modify for only strictly valid attributes: $validElement",
            ({ validElement }: { validElement: string }) => {
              const validXml = richtext(p(validElement));
              expectSanitationResult(sanitizer, validXml, validXml);
            },
          );

          it("Should remove invalid attributes", () => {
            const validXml = richtext(p(a("", { "xlink:href": "" })));
            const invalidXml = richtext(p(a("", { "xlink:href": "", "class": "I" }))).replace("class", "invalid");
            expectSanitationResult(sanitizer, invalidXml, validXml, (listener) => {
              expect(listener.totalLength).toStrictEqual(1);
              expect(listener.removedInvalidAttrs).toHaveLength(1);
            });
          });

          it("Should add missing required attribute (silently)", () => {
            const validXml = richtext(p(a("", { "xlink:href": "" })));
            const invalidXml = validXml.replace(`xlink:href=""`, "");
            expectSanitationResult(sanitizer, invalidXml, validXml, (listener) => {
              expect(listener.totalLength).toStrictEqual(0);
              expect(listener.removedInvalidAttrs).toHaveLength(0);
            });
          });

          it("Should remove fixed attribute (silently)", () => {
            const optimizedXml = richtext(p(a("", { "xlink:href": "" })));
            const originalXml = richtext(p(a("", { "xlink:href": "", "xlink:type": "simple" })));
            expectSanitationResult(sanitizer, originalXml, optimizedXml, (listener) => {
              expect(listener.totalLength).toStrictEqual(0);
            });
          });

          it.each`
            invalidAttribute
            ${`xml:lang="in valid"`}
            ${`lang="in valid"`}
            ${`dir="invalid"`}
            ${`xlink:type="invalid"`}
            ${`xlink:show="invalid"`}
            ${`xlink:actuate="invalid"`}
          `(
            "[$#] Should keep invalid attribute value only in legacy mode for: $invalidAttribute",
            ({ invalidAttribute }: { invalidAttribute: string }) => {
              const validXml = richtext(p(a("", { "xlink:href": "" })));
              const invalidXml = richtext(p(a("", { "xlink:href": "" }))).replace("<a", `<a ${invalidAttribute}`);
              const expectedXml = strictness === Strictness.LEGACY ? invalidXml : validXml;
              const expectedInvalidAttributes = strictness === Strictness.LEGACY ? 0 : 1;

              expectSanitationResult(sanitizer, invalidXml, expectedXml, (listener) => {
                expect(listener.totalLength).toStrictEqual(expectedInvalidAttributes);
                expect(listener.removedInvalidAttrs).toHaveLength(expectedInvalidAttributes);
              });
            },
          );
        });

        describe(`${elementUnderTest} children; strictness: ${strictnessKey}`, () => {
          test.each`
            validChild
            ${""}
            ${"T"}
            ${br()}
            ${span()}
            ${img({ "alt": "", "xlink:href": "" })}
            ${em()}
            ${strong()}
            ${sub()}
            ${sup()}
          `("[$#] Should keep valid child: $validChild", ({ validChild }: { validChild: string }) => {
            const validXml = richtext(p(a(validChild, { "xlink:href": "" })));
            expectSanitationResult(sanitizer, validXml, validXml);
          });

          test.each`
            invalidChild                    | sanitizedChildren
            ${p()}                          | ${""}
            ${p("T")}                       | ${"T"}
            ${a("T", { "xlink:href": "" })} | ${"T"}
          `(
            "[$#] Should clean up invalid children: $invalidChild to $sanitizedChildren",
            ({ invalidChild, sanitizedChildren }: { invalidChild: string; sanitizedChildren: string }) => {
              const invalidXml = richtext(p(a(invalidChild, { "xlink:href": "" })));
              const sanitizedXml = richtext(p(a(sanitizedChildren, { "xlink:href": "" })));
              expectSanitationResult(sanitizer, invalidXml, sanitizedXml, (listener) => {
                expect(listener.totalLength).toStrictEqual(1);
                expect(listener.removedNodes).toHaveLength(1);
              });
            },
          );
        });
      });

      // ====================================================================[ Common Inline: <span/em/strong/sub/sup> ]

      describe.each`
        element     | factory
        ${"span"}   | ${span}
        ${"em"}     | ${em}
        ${"strong"} | ${strong}
        ${"sub"}    | ${sub}
        ${"sup"}    | ${sup}
      `(
        `<$element>; strictness: ${strictnessKey}`,
        ({
          element,
          factory,
        }: {
          element: string;
          factory: typeof span | typeof em | typeof strong | typeof sub | typeof sup;
        }) => {
          const elementUnderTest = `<${element}>`;

          describe(`${elementUnderTest} attributes; strictness: ${strictnessKey}`, () => {
            it.each`
              validElement
              ${factory("")}
              ${factory("", { dir: "ltr" })}
              ${factory("", { "xml:lang": "en" })}
              ${factory("", { lang: "en" })}
              ${factory("", { class: "C" })}
              ${factory("", { "xml:lang": "" })}
              ${factory("", { lang: "" })}
              ${factory("", { class: "" })}
            `(
              "[$#] Should not modify for only strictly valid attributes: $validElement",
              ({ validElement }: { validElement: string }) => {
                const validXml = richtext(p(validElement));
                expectSanitationResult(sanitizer, validXml, validXml);
              },
            );

            it("Should remove invalid attributes", () => {
              const validXml = richtext(p(factory()));
              const invalidXml = richtext(p(factory("", { class: "I" }))).replace("class", "invalid");
              expectSanitationResult(sanitizer, invalidXml, validXml, (listener) => {
                expect(listener.totalLength).toStrictEqual(1);
                expect(listener.removedInvalidAttrs).toHaveLength(1);
              });
            });

            it.each`
              invalidAttribute
              ${`xml:lang="in valid"`}
              ${`lang="in valid"`}
              ${`dir="invalid"`}
            `(
              "[$#] Should keep invalid attribute value only in legacy mode for: $invalidAttribute",
              ({ invalidAttribute }: { invalidAttribute: string }) => {
                const validXml = richtext(p(factory()));
                const invalidXml = validXml.replace(`<${element}`, `<${element} ${invalidAttribute}`);
                const expectedXml = strictness === Strictness.LEGACY ? invalidXml : validXml;
                const expectedInvalidAttributes = strictness === Strictness.LEGACY ? 0 : 1;

                expectSanitationResult(sanitizer, invalidXml, expectedXml, (listener) => {
                  expect(listener.totalLength).toStrictEqual(expectedInvalidAttributes);
                  expect(listener.removedInvalidAttrs).toHaveLength(expectedInvalidAttributes);
                });
              },
            );
          });

          describe(`${elementUnderTest} children; strictness: ${strictnessKey}`, () => {
            test.each`
              validChild
              ${""}
              ${"T"}
              ${a("T", { "xlink:href": "" })}
              ${br()}
              ${span()}
              ${img({ "alt": "", "xlink:href": "" })}
              ${em()}
              ${strong()}
              ${sub()}
              ${sup()}
            `("[$#] Should keep valid child: $validChild", ({ validChild }: { validChild: string }) => {
              const validXml = richtext(p(factory(validChild)));
              expectSanitationResult(sanitizer, validXml, validXml);
            });

            test.each`
              invalidChild | sanitizedChildren
              ${p()}       | ${""}
              ${p("T")}    | ${"T"}
            `(
              "[$#] Should clean up invalid children: $invalidChild to $sanitizedChildren",
              ({ invalidChild, sanitizedChildren }: { invalidChild: string; sanitizedChildren: string }) => {
                const invalidXml = richtext(p(factory(invalidChild)));
                const sanitizedXml = richtext(p(factory(sanitizedChildren)));
                expectSanitationResult(sanitizer, invalidXml, sanitizedXml, (listener) => {
                  expect(listener.totalLength).toStrictEqual(1);
                  expect(listener.removedNodes).toHaveLength(1);
                });
              },
            );
          });
        },
      );

      // ======================================================================================================[ <img> ]

      describe(`<img>; strictness: ${strictnessKey}`, () => {
        const elementUnderTest = "<img>";

        describe(`${elementUnderTest} attributes; strictness: ${strictnessKey}`, () => {
          it.each`
            validElement
            ${img({ "alt": "", "xlink:href": "" })}
            ${img({ "alt": "", "xlink:href": "", "width": 1 })}
            ${img({ "alt": "", "xlink:href": "", "height": 1 })}
            ${img({ "alt": "", "xlink:href": "", "xlink:role": "" })}
            ${img({ "alt": "", "xlink:href": "", "xlink:title": "" })}
            ${img({ "alt": "", "xlink:href": "", "dir": "ltr" })}
            ${img({ "alt": "", "xlink:href": "", "xml:lang": "en" })}
            ${img({ "alt": "", "xlink:href": "", "lang": "en" })}
            ${img({ "alt": "", "xlink:href": "", "class": "C" })}
            ${img({ "alt": "", "xlink:href": "", "xml:lang": "" })}
            ${img({ "alt": "", "xlink:href": "", "lang": "" })}
            ${img({ "alt": "", "xlink:href": "", "class": "" })}
          `(
            "[$#] Should not modify for only strictly valid attributes: $validElement",
            ({ validElement }: { validElement: string }) => {
              const validXml = richtext(p(validElement));
              expectSanitationResult(sanitizer, validXml, validXml);
            },
          );

          it("Should remove invalid attributes", () => {
            const validXml = richtext(p(img({ "alt": "", "xlink:href": "" })));
            const invalidXml = richtext(p(img({ "alt": "", "xlink:href": "", "class": "I" }))).replace(
              "class",
              "invalid",
            );
            expectSanitationResult(sanitizer, invalidXml, validXml, (listener) => {
              expect(listener.totalLength).toStrictEqual(1);
              expect(listener.removedInvalidAttrs).toHaveLength(1);
            });
          });

          it.each`
            withFixed
            ${img({ "alt": "", "xlink:href": "", "xlink:show": "embed" })}
            ${img({ "alt": "", "xlink:href": "", "xlink:actuate": "onLoad" })}
          `("[$#] Should remove fixed attribute (silently): $withFixed", ({ withFixed }: { withFixed: string }) => {
            const optimizedXml = richtext(p(img({ "alt": "", "xlink:href": "" })));
            const originalXml = richtext(p(withFixed));
            expectSanitationResult(sanitizer, originalXml, optimizedXml, (listener) => {
              expect(listener.totalLength).toStrictEqual(0);
            });
          });

          it("Should add missing required attribute (silently)", () => {
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

          it.each`
            invalidAttribute
            ${`xml:lang="in valid"`}
            ${`lang="in valid"`}
            ${`dir="invalid"`}
            ${`xlink:type="invalid"`}
            ${`xlink:show="invalid"`}
            ${`xlink:actuate="invalid"`}
          `(
            "[$#] Should keep invalid attribute value only in legacy mode for: $invalidAttribute",
            ({ invalidAttribute }: { invalidAttribute: string }) => {
              const validXml = richtext(p(img({ "alt": "", "xlink:href": "" })));
              const invalidXml = richtext(p(img({ "alt": "", "xlink:href": "" }))).replace(
                "<img",
                `<img ${invalidAttribute}`,
              );
              const expectedXml = strictness === Strictness.LEGACY ? invalidXml : validXml;
              const expectedInvalidAttributes = strictness === Strictness.LEGACY ? 0 : 1;

              expectSanitationResult(sanitizer, invalidXml, expectedXml, (listener) => {
                expect(listener.totalLength).toStrictEqual(expectedInvalidAttributes);
                expect(listener.removedInvalidAttrs).toHaveLength(expectedInvalidAttributes);
              });
            },
          );
        });

        describe(`${elementUnderTest} children; strictness: ${strictnessKey}`, () => {
          test.each`
            invalidChild
            ${p()}
            ${p("T")}
          `("[$#] Should clean up invalid children: $invalidChild", ({ invalidChild }: { invalidChild: string }) => {
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
        });
      });

      // ====================================================================================================[ <table> ]

      describe(`<table>; strictness: ${strictnessKey}`, () => {
        const elementUnderTest = "<table>";

        describe(`${elementUnderTest} attributes; strictness: ${strictnessKey}`, () => {
          it.each`
            validElement
            ${table(tr(td()))}
            ${table(tr(td()), { dir: "ltr" })}
            ${table(tr(td()), { "xml:lang": "en" })}
            ${table(tr(td()), { lang: "en" })}
            ${table(tr(td()), { class: "C" })}
            ${table(tr(td()), { "xml:lang": "" })}
            ${table(tr(td()), { lang: "" })}
            ${table(tr(td()), { class: "" })}
            ${table(tr(td()), { summary: "" })}
          `(
            "[$#] Should not modify for only strictly valid attributes: $validElement",
            ({ validElement }: { validElement: string }) => {
              const validXml = richtext(validElement);
              expectSanitationResult(sanitizer, validXml, validXml);
            },
          );

          it("Should remove invalid attributes", () => {
            const validXml = richtext(table(tr(td())));
            const invalidXml = richtext(table(tr(td()), { class: "I" })).replace("class", "invalid");
            expectSanitationResult(sanitizer, invalidXml, validXml, (listener) => {
              expect(listener.totalLength).toStrictEqual(1);
              expect(listener.removedInvalidAttrs).toHaveLength(1);
            });
          });

          it.each`
            invalidAttribute
            ${`xml:lang="in valid"`}
            ${`lang="in valid"`}
            ${`dir="invalid"`}
          `(
            "[$#] Should keep invalid attribute value only in legacy mode for: $invalidAttribute",
            ({ invalidAttribute }: { invalidAttribute: string }) => {
              const validXml = richtext(table(tr(td())));
              const invalidXml = validXml.replace("<table", `<table ${invalidAttribute}`);
              const expectedXml = strictness === Strictness.LEGACY ? invalidXml : validXml;
              const expectedInvalidAttributes = strictness === Strictness.LEGACY ? 0 : 1;

              expectSanitationResult(sanitizer, invalidXml, expectedXml, (listener) => {
                expect(listener.totalLength).toStrictEqual(expectedInvalidAttributes);
                expect(listener.removedInvalidAttrs).toHaveLength(expectedInvalidAttributes);
              });
            },
          );
        });

        describe(`${elementUnderTest} children; strictness: ${strictnessKey}`, () => {
          test.each`
            validChild
            ${tr(td())}
            ${tbody(tr(td()))}
          `("[$#] Should keep valid child: $validChild", ({ validChild }: { validChild: string }) => {
            const validXml = richtext(table(validChild));
            expectSanitationResult(sanitizer, validXml, validXml);
          });

          it("Should remove illegal empty element", () => {
            const validXml = richtext();
            const invalidXml = richtext(`<table/>`);
            expectSanitationResult(sanitizer, invalidXml, validXml, (listener) => {
              expect(listener.totalLength).toStrictEqual(1);
              expect(listener.removedNodes).toHaveLength(1);
            });
          });

          test.each`
            invalidChild
            ${"T"}
            ${p()}
          `("[$#] Should clean up invalid children: $invalidChild", ({ invalidChild }: { invalidChild: string }) => {
            const invalidXml = richtext(table([invalidChild, tr(td()), invalidChild]));
            const sanitizedXml = richtext(table(tr(td())));
            expectSanitationResult(sanitizer, invalidXml, sanitizedXml, (listener) => {
              expect(listener.totalLength).toStrictEqual(2);
              expect(listener.removedNodes).toHaveLength(2);
            });
          });
        });
      });

      // ====================================================================================================[ <tbody> ]

      describe(`<tbody>; strictness: ${strictnessKey}`, () => {
        const elementUnderTest = "<tbody>";

        describe(`${elementUnderTest} attributes; strictness: ${strictnessKey}`, () => {
          it.each`
            validElement
            ${tbody(tr(td()))}
            ${tbody(tr(td()), { dir: "ltr" })}
            ${tbody(tr(td()), { "xml:lang": "en" })}
            ${tbody(tr(td()), { lang: "en" })}
            ${tbody(tr(td()), { class: "C" })}
            ${tbody(tr(td()), { "xml:lang": "" })}
            ${tbody(tr(td()), { lang: "" })}
            ${tbody(tr(td()), { class: "" })}
            ${tbody(tr(td()), { align: "left" })}
            ${tbody(tr(td()), { valign: "top" })}
          `(
            "[$#] Should not modify for only strictly valid attributes: $validElement",
            ({ validElement }: { validElement: string }) => {
              const validXml = richtext(table(validElement));
              expectSanitationResult(sanitizer, validXml, validXml);
            },
          );

          it("Should remove invalid attributes", () => {
            const validXml = richtext(table(tbody(tr(td()))));
            const invalidXml = richtext(table(tbody(tr(td()), { class: "I" }))).replace("class", "invalid");
            expectSanitationResult(sanitizer, invalidXml, validXml, (listener) => {
              expect(listener.totalLength).toStrictEqual(1);
              expect(listener.removedInvalidAttrs).toHaveLength(1);
            });
          });

          it.each`
            invalidAttribute
            ${`xml:lang="in valid"`}
            ${`lang="in valid"`}
            ${`dir="invalid"`}
            ${`align="invalid"`}
            ${`valign="invalid"`}
          `(
            "[$#] Should keep invalid attribute value only in legacy mode for: $invalidAttribute",
            ({ invalidAttribute }: { invalidAttribute: string }) => {
              const validXml = richtext(table(tbody(tr(td()))));
              const invalidXml = validXml.replace("<tbody", `<tbody ${invalidAttribute}`);
              const expectedXml = strictness === Strictness.LEGACY ? invalidXml : validXml;
              const expectedInvalidAttributes = strictness === Strictness.LEGACY ? 0 : 1;

              expectSanitationResult(sanitizer, invalidXml, expectedXml, (listener) => {
                expect(listener.totalLength).toStrictEqual(expectedInvalidAttributes);
                expect(listener.removedInvalidAttrs).toHaveLength(expectedInvalidAttributes);
              });
            },
          );
        });

        describe(`${elementUnderTest} children; strictness: ${strictnessKey}`, () => {
          test.each`
            validChildren
            ${tr(td())}
            ${[tr(td()), tr(td())]}
          `(
            "[$#] Should keep valid children: $validChildren",
            ({ validChildren }: { validChildren: string | string[] }) => {
              const validXml = richtext(table(tbody(validChildren)));
              expectSanitationResult(sanitizer, validXml, validXml);
            },
          );

          it("Should remove illegal empty element", () => {
            const validXml = richtext();
            const invalidXml = richtext(table(`<tbody/>`));
            expectSanitationResult(sanitizer, invalidXml, validXml, (listener) => {
              expect(listener.totalLength).toStrictEqual(2);
              expect(listener.removedNodes).toHaveLength(2);
            });
          });

          test.each`
            invalidChild
            ${"T"}
            ${p()}
          `("[$#] Should clean up invalid children: $invalidChild", ({ invalidChild }: { invalidChild: string }) => {
            const invalidXml = richtext(table(tbody([invalidChild, tr(td()), invalidChild])));
            const sanitizedXml = richtext(table(tbody(tr(td()))));
            expectSanitationResult(sanitizer, invalidXml, sanitizedXml, (listener) => {
              expect(listener.totalLength).toStrictEqual(2);
              expect(listener.removedNodes).toHaveLength(2);
            });
          });
        });
      });

      // =======================================================================================================[ <tr> ]

      describe(`<tr>; strictness: ${strictnessKey}`, () => {
        const elementUnderTest = "<tr>";

        describe(`${elementUnderTest} attributes; strictness: ${strictnessKey}`, () => {
          it.each`
            validElement
            ${tr(td())}
            ${tr(td(), { dir: "ltr" })}
            ${tr(td(), { "xml:lang": "en" })}
            ${tr(td(), { lang: "en" })}
            ${tr(td(), { class: "C" })}
            ${tr(td(), { "xml:lang": "" })}
            ${tr(td(), { lang: "" })}
            ${tr(td(), { class: "" })}
            ${tr(td(), { align: "left" })}
            ${tr(td(), { valign: "top" })}
          `(
            "[$#] Should not modify for only strictly valid attributes: $validElement",
            ({ validElement }: { validElement: string }) => {
              const validXml = richtext(table(validElement));
              expectSanitationResult(sanitizer, validXml, validXml);
            },
          );

          it("Should remove invalid attributes", () => {
            const validXml = richtext(table(tr(td())));
            const invalidXml = richtext(table(tr(td(), { class: "I" }))).replace("class", "invalid");
            expectSanitationResult(sanitizer, invalidXml, validXml, (listener) => {
              expect(listener.totalLength).toStrictEqual(1);
              expect(listener.removedInvalidAttrs).toHaveLength(1);
            });
          });

          it.each`
            invalidAttribute
            ${`xml:lang="in valid"`}
            ${`lang="in valid"`}
            ${`dir="invalid"`}
            ${`align="invalid"`}
            ${`valign="invalid"`}
          `(
            "[$#] Should keep invalid attribute value only in legacy mode for: $invalidAttribute",
            ({ invalidAttribute }: { invalidAttribute: string }) => {
              const validXml = richtext(table(tr(td())));
              const invalidXml = validXml.replace("<tr", `<tr ${invalidAttribute}`);
              const expectedXml = strictness === Strictness.LEGACY ? invalidXml : validXml;
              const expectedInvalidAttributes = strictness === Strictness.LEGACY ? 0 : 1;

              expectSanitationResult(sanitizer, invalidXml, expectedXml, (listener) => {
                expect(listener.totalLength).toStrictEqual(expectedInvalidAttributes);
                expect(listener.removedInvalidAttrs).toHaveLength(expectedInvalidAttributes);
              });
            },
          );
        });

        describe(`${elementUnderTest} children; strictness: ${strictnessKey}`, () => {
          test.each`
            validChildren
            ${td()}
            ${[td(), td()]}
          `(
            "[$#] Should keep valid children: $validChildren",
            ({ validChildren }: { validChildren: string | string[] }) => {
              const validXml = richtext(table(tr(validChildren)));
              expectSanitationResult(sanitizer, validXml, validXml);
            },
          );

          it("Should remove illegal empty element", () => {
            const validXml = richtext();
            const invalidXml = richtext(table(`<tr/>`));
            expectSanitationResult(sanitizer, invalidXml, validXml, (listener) => {
              expect(listener.totalLength).toStrictEqual(2);
              expect(listener.removedNodes).toHaveLength(2);
            });
          });

          test.each`
            invalidChild
            ${"T"}
            ${p()}
          `("[$#] Should clean up invalid children: $invalidChild", ({ invalidChild }: { invalidChild: string }) => {
            const invalidXml = richtext(table(tr([invalidChild, td(), invalidChild])));
            const sanitizedXml = richtext(table(tr(td())));
            expectSanitationResult(sanitizer, invalidXml, sanitizedXml, (listener) => {
              expect(listener.totalLength).toStrictEqual(2);
              expect(listener.removedNodes).toHaveLength(2);
            });
          });
        });
      });

      // =======================================================================================================[ <td> ]

      describe(`<td>; strictness: ${strictnessKey}`, () => {
        const elementUnderTest = "<td>";

        describe(`${elementUnderTest} attributes; strictness: ${strictnessKey}`, () => {
          it.each`
            validElement
            ${td()}
            ${td("", { dir: "ltr" })}
            ${td("", { "xml:lang": "en" })}
            ${td("", { lang: "en" })}
            ${td("", { class: "C" })}
            ${td("", { "xml:lang": "" })}
            ${td("", { lang: "" })}
            ${td("", { class: "" })}
            ${td("", { align: "left" })}
            ${td("", { valign: "top" })}
            ${td("", { abbr: "" })}
            ${td("", { colspan: 2 })}
            ${td("", { rowspan: 2 })}
          `(
            "[$#] Should not modify for only strictly valid attributes: $validElement",
            ({ validElement }: { validElement: string }) => {
              const validXml = richtext(table(tr(validElement)));
              expectSanitationResult(sanitizer, validXml, validXml);
            },
          );

          it("Should remove invalid attributes", () => {
            const validXml = richtext(table(tr(td(""))));
            const invalidXml = richtext(table(tr(td("", { class: "I" })))).replace("class", "invalid");
            expectSanitationResult(sanitizer, invalidXml, validXml, (listener) => {
              expect(listener.totalLength).toStrictEqual(1);
              expect(listener.removedInvalidAttrs).toHaveLength(1);
            });
          });

          it.each`
            invalidAttribute
            ${`xml:lang="in valid"`}
            ${`lang="in valid"`}
            ${`dir="invalid"`}
            ${`align="invalid"`}
            ${`valign="invalid"`}
          `(
            "[$#] Should keep invalid attribute value only in legacy mode for: $invalidAttribute",
            ({ invalidAttribute }: { invalidAttribute: string }) => {
              const validXml = richtext(table(tr(td())));
              const invalidXml = validXml.replace("<td", `<td ${invalidAttribute}`);
              const expectedXml = strictness === Strictness.LEGACY ? invalidXml : validXml;
              const expectedInvalidAttributes = strictness === Strictness.LEGACY ? 0 : 1;

              expectSanitationResult(sanitizer, invalidXml, expectedXml, (listener) => {
                expect(listener.totalLength).toStrictEqual(expectedInvalidAttributes);
                expect(listener.removedInvalidAttrs).toHaveLength(expectedInvalidAttributes);
              });
            },
          );

          it.each`
            suspiciousAttribute
            ${`rowspan="invalid"`}
            ${`colspan="invalid"`}
          `(
            "[$#] Should remove suspicious attribute value only in strict mode for: $suspiciousAttribute",
            ({ suspiciousAttribute }: { suspiciousAttribute: string }) => {
              const validXml = richtext(table(tr(td())));
              const invalidXml = validXml.replace("<td", `<td ${suspiciousAttribute}`);
              const expectedXml = strictness !== Strictness.STRICT ? invalidXml : validXml;
              const expectedInvalidAttributes = strictness !== Strictness.STRICT ? 0 : 1;

              expectSanitationResult(sanitizer, invalidXml, expectedXml, (listener) => {
                expect(listener.totalLength).toStrictEqual(expectedInvalidAttributes);
                expect(listener.removedInvalidAttrs).toHaveLength(expectedInvalidAttributes);
              });
            },
          );
        });

        describe(`${elementUnderTest} children; strictness: ${strictnessKey}`, () => {
          test.each`
            validChildren
            ${""}
            ${"T"}
            ${p("T")}
            ${em("T")}
            ${table(tr(td()))}
          `(
            "[$#] Should keep valid children: $validChildren",
            ({ validChildren }: { validChildren: string | string[] }) => {
              const validXml = richtext(table(tr(td(validChildren))));
              expectSanitationResult(sanitizer, validXml, validXml);
            },
          );

          test.each`
            invalidChild
            ${td()}
            ${`<div/>`}
          `("[$#] Should clean up invalid children: $invalidChild", ({ invalidChild }: { invalidChild: string }) => {
            const invalidXml = richtext(table(tr(td(invalidChild))));
            const sanitizedXml = richtext(table(tr(td())));
            expectSanitationResult(sanitizer, invalidXml, sanitizedXml, (listener) => {
              expect(listener.totalLength).toStrictEqual(1);
              expect(listener.removedNodes).toHaveLength(1);
            });
          });
        });
      });
    });
  });
});
