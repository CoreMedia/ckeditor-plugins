import "jest-xml-matcher";
import {
  parseFilterRuleSetConfigurations,
  ElementFilterRule,
  FilterRuleSetConfiguration,
  HtmlFilter,
} from "../src";
import Editor from "@ckeditor/ckeditor5-core/src/editor/editor";
import { TextFilterRule } from "../dist";

jest.mock("@ckeditor/ckeditor5-core/src/editor/editor");

/**
 * Will be checked for "startsWith" for a given Data Driven Testname. Meant
 * to be used for debugging purpose. Example:
 *
 * `TEST_SELECTOR = "TABLE#3"`
 */
const TEST_SELECTOR = "";

const MOCK_EDITOR = new Editor();

const parser = new DOMParser();
const serializer = new XMLSerializer();

type CommentableTestData = {
  /**
   * Some comment which may help understanding the test case better.
   */
  comment?: string;
};

type DisablableTestCase = {
  /**
   * If set to `true` or non-empty string this test will be ignored.
   * A string will be printed as message.
   */
  disabled?: boolean | string;
};

type ParseFilterRuleSetConfigurationTestData = {
  config: FilterRuleSetConfiguration,
  // The original 'view'
  from: string,
  // The transformed data.
  data: string,
  // The view after re-transforming the previously generated data.
  view: string,
}

type WithDefaultsTestData = {
  default: FilterRuleSetConfiguration,
}

const replaceElementByChildren: ElementFilterRule = (p) => {
  p.node.replaceByChildren = true;
};

const reverseText: TextFilterRule = (p) => {
  p.node.textContent = p.node.textContent.split("").reverse().join("");
};

describe("Rules.parseFilterRuleSetConfiguration, All Empty Handling", () => {
  test("Should accept empty configuration.", () => {
    const toDataAndView = parseFilterRuleSetConfigurations({});
    expect(toDataAndView).toHaveProperty("toData", {});
    expect(toDataAndView).toHaveProperty("toView", {});
  });

  test("Invariant: Should accept empty custom configuration and empty default.", () => {
    const toDataAndView = parseFilterRuleSetConfigurations({}, {});
    expect(toDataAndView).toHaveProperty("toData", {});
    expect(toDataAndView).toHaveProperty("toView", {});
  });

});

describe("Rules.parseFilterRuleSetConfiguration, Parsing Main Configuration (No Defaults)", () => {
  type TestData = CommentableTestData &
    DisablableTestCase &
    ParseFilterRuleSetConfigurationTestData;
  type TestFixture = [string, TestData];
  const testFixtures: TestFixture[] = [
    [
      "#empty: Should do no processing on empty rules.",
      {
        config: {},
        from: "<root>Lorem <el>Ipsum</el> Dolor</root>",
        data: "<root>Lorem <el>Ipsum</el> Dolor</root>",
        view: "<root>Lorem <el>Ipsum</el> Dolor</root>",
      },
    ],
    [
      "#toDataOnly: Should handle toData-only-rules (elements).",
      {
        config: {
          elements: {
            el: replaceElementByChildren,
          }
        },
        from: "<root>Lorem <el>Ipsum</el> Dolor</root>",
        data: "<root>Lorem Ipsum Dolor</root>",
        view: "<root>Lorem Ipsum Dolor</root>",
      },
    ],
    [
      "#toDataOnly: Should handle toData-only-rules (text).",
      {
        config: {
          text: reverseText,
        },
        from: "<root>Lorem <el>Ipsum</el> Dolor</root>",
        data: "<root> meroL<el>muspI</el>roloD </root>",
        view: "<root> meroL<el>muspI</el>roloD </root>",
      },
    ],
    [
      "#toViewOnly: Should handle toView-only-rules (elements, Object Setup).",
      {
        config: {
          elements: {
            el: {
              toView: {
                el: replaceElementByChildren,
              },
            },
          }
        },
        from: "<root>Lorem <el>Ipsum</el> Dolor</root>",
        data: "<root>Lorem <el>Ipsum</el> Dolor</root>",
        view: "<root>Lorem Ipsum Dolor</root>",
      },
    ],
    [
      "#toViewOnly: Should handle toView-only-rules (elements, Function Setup).",
      {
        config: {
          elements: {
            el: {
              toView: replaceElementByChildren,
            },
          }
        },
        from: "<root>Lorem <el>Ipsum</el> Dolor</root>",
        data: "<root>Lorem <el>Ipsum</el> Dolor</root>",
        view: "<root>Lorem Ipsum Dolor</root>",
      },
    ],
    [
      "#toViewOnly: Should handle toView-only-rules (text).",
      {
        config: {
          text: {
            toView: reverseText,
          },
        },
        from: "<root>Lorem <el>Ipsum</el> Dolor</root>",
        data: "<root>Lorem <el>Ipsum</el> Dolor</root>",
        view: "<root> meroL<el>muspI</el>roloD </root>",
      },
    ],
    [
      "#textMapping: Should transform elements back and forth.",
      {
        config: {
          text: {
            toData: reverseText,
            toView: reverseText,
          },
        },
        from: "<root>Lorem <el>Ipsum</el> Dolor</root>",
        data: "<root> meroL<el>muspI</el>roloD </root>",
        view: "<root>Lorem <el>Ipsum</el> Dolor</root>",
      },
    ],
    [
      "#elementMapping: Should transform elements back and forth.",
      {
        config: {
          elements: {
            el: {
              toData: (p) => {
                p.node.name = "data";
              },
              toView: {
                data: (p) => {
                  p.node.name = "el";
                },
              }
            },
          }
        },
        from: "<root>Lorem <el>Ipsum</el> Dolor</root>",
        data: "<root>Lorem <data>Ipsum</data> Dolor</root>",
        view: "<root>Lorem <el>Ipsum</el> Dolor</root>",
      },
    ],
    [
      "#attributeMapping: Should transform attributes back and forth.",
      {
        config: {
          elements: {
            el: {
              toData: (p) => {
                p.node.attributes["dataattr"] = p.node.attributes["viewattr"];
                delete p.node.attributes["viewattr"];
              },
              toView: (p) => {
                p.node.attributes["viewattr"] = p.node.attributes["dataattr"];
                delete p.node.attributes["dataattr"];
              },
            },
          }
        },
        from: `<root>Lorem <el viewattr="value">Ipsum</el> Dolor</root>`,
        data: `<root>Lorem <el dataattr="value">Ipsum</el> Dolor</root>`,
        view: `<root>Lorem <el viewattr="value">Ipsum</el> Dolor</root>`,
      },
    ],
    [
      "#elementAttributeMapping: Should transform elements and attributes back and forth.",
      {
        comment: "This is similar to heading-handling for h1 to p with p--heading-1 as class attribute.",
        config: {
          elements: {
            el: {
              toData: (p) => {
                p.node.attributes["type"] = p.node.name;
                p.node.name = "data";
              },
              toView: {
                data: (p) => {
                  p.node.name = p.node.attributes["type"] || "missing-name";
                  delete p.node.attributes["type"];
                },
              },
            },
          }
        },
        from: `<root>Lorem <el>Ipsum</el> Dolor</root>`,
        data: `<root>Lorem <data type="el">Ipsum</data> Dolor</root>`,
        view: `<root>Lorem <el>Ipsum</el> Dolor</root>`,
      },
    ],
    [
      "#elementAttributeMapping: Should handle ambiguous toView-Mapping.",
      {
        comment: "This is similar to heading-handling for h1 to p with p--heading-1 as class attribute, here for two heading levels.",
        config: {
          elements: {
            el1: {
              toData: (p) => {
                p.node.attributes["type"] = p.node.name;
                p.node.name = "data";
              },
              toView: {
                data: (p) => {
                  if (p.node.attributes["type"] === "el1") {
                    p.node.name = p.node.attributes["type"];
                    delete p.node.attributes["type"];
                  }
                },
              },
            },
            el2: {
              toData: (p) => {
                p.node.attributes["type"] = p.node.name;
                p.node.name = "data";
              },
              toView: {
                data: (p) => {
                  if (p.node.attributes["type"] === "el2") {
                    p.node.name = p.node.attributes["type"];
                    delete p.node.attributes["type"];
                  }
                },
              },
            },
          }
        },
        from: `<root>Lorem <el1>Ipsum</el1> Dolor <el2>Sit</el2> Amet</root>`,
        data: `<root>Lorem <data type="el1">Ipsum</data> Dolor <data type="el2">Sit</data> Amet</root>`,
        view: `<root>Lorem <el1>Ipsum</el1> Dolor <el2>Sit</el2> Amet</root>`,
      },
    ],
  ];

  describe.each<TestFixture>(testFixtures)("(%#) %s", (name, testData) => {

    if (!!TEST_SELECTOR && !name.startsWith(TEST_SELECTOR)) {
      test.todo(`${name} (disabled by test selector for debugging purpose)`);
      return;
    }

    const from: Document = parser.parseFromString(testData.from, "text/xml");
    const config: FilterRuleSetConfiguration = testData.config;

    const { toData, toView } = parseFilterRuleSetConfigurations(config);

    const toDataFilter = new HtmlFilter(toData, MOCK_EDITOR);
    const toViewFilter = new HtmlFilter(toView, MOCK_EDITOR);

    toDataFilter.applyTo(from.documentElement);

    const dataXml: string = serializer.serializeToString(from.documentElement);

    test(`toData: Should have transformed as expected: ${testData.from} -> ${testData.data}.`, () => {
      expect(dataXml).toEqualXML(testData.data);
    });

    const data: Document = parser.parseFromString(dataXml, "text/xml");

    toViewFilter.applyTo(data.documentElement);

    const viewXml: string = serializer.serializeToString(data.documentElement);

    test(`toView: Should have transformed as expected: ${dataXml} -> ${testData.view}`, () => {
      expect(viewXml).toEqualXML(testData.view);
    });
  });
});

describe("Rules.parseFilterRuleSetConfiguration, Parsing Configuration (Having Defaults)", () => {
  type TestData = CommentableTestData &
    DisablableTestCase &
    ParseFilterRuleSetConfigurationTestData &
    WithDefaultsTestData;
  type TestFixture = [string, TestData];
  const testFixtures: TestFixture[] = [
    [
      "#empty: Should do no processing on empty rules.",
      {
        default: {},
        config: {},
        from: "<root>Lorem <el>Ipsum</el> Dolor</root>",
        data: "<root>Lorem <el>Ipsum</el> Dolor</root>",
        view: "<root>Lorem <el>Ipsum</el> Dolor</root>",
      },
    ],
    [
      "#toDataOnly/elements: Should handle nested toData-only-rules.",
      {
        default: {
          elements: {
            el: (p) => {
              p.node.attributes["label"] = "data";
            },
          }
        },
        config: {
          elements: {
            el: (p) => {
              p.parentRule(p);
              p.node.name = "data";
            },
          }
        },
        from: "<root>Lorem <el>Ipsum</el> Dolor</root>",
        data: `<root>Lorem <data label="data">Ipsum</data> Dolor</root>`,
        view: `<root>Lorem <data label="data">Ipsum</data> Dolor</root>`,
      },
    ],
    [
      "#toDataOnly/elements: Should be able to ignore parent rule.",
      {
        default: {
          elements: {
            el: (p) => {
              p.node.attributes["label"] = "data";
            },
          }
        },
        config: {
          elements: {
            el: (p) => {
              p.node.name = "data";
            },
          }
        },
        from: "<root>Lorem <el>Ipsum</el> Dolor</root>",
        data: `<root>Lorem <data>Ipsum</data> Dolor</root>`,
        view: `<root>Lorem <data>Ipsum</data> Dolor</root>`,
      },
    ],
    [
      "#toDataOnly/text: Should handle nested toData-only-rules (default, then override).",
      {
        default: {
          text: reverseText,
        },
        config: {
          text: (p) => {
            p.parentRule(p);
            p.node.textContent = p.node.textContent.split(/[aeiou]/i).join("[V]");
          },
        },
        from: "<root>Lorem <el>Ipsum</el> Dolor</root>",
        data: `<root> m[V]r[V]L<el>m[V]sp[V]</el>r[V]l[V]D </root>`,
        view: `<root> m[V]r[V]L<el>m[V]sp[V]</el>r[V]l[V]D </root>`,
      },
    ],
    [
      "#toDataOnly/text: Should handle nested toData-only-rules (override, then default).",
      {
        default: {
          text: reverseText,
        },
        config: {
          text: (p) => {
            p.node.textContent = p.node.textContent.split(/[aeiou]/i).join("[V]");
            p.parentRule(p);
          },
        },
        from: "<root>Lorem <el>Ipsum</el> Dolor</root>",
        data: `<root> m]V[r]V[L<el>m]V[sp]V[</el>r]V[l]V[D </root>`,
        view: `<root> m]V[r]V[L<el>m]V[sp]V[</el>r]V[l]V[D </root>`,
      },
    ],
    [
      "#fullExample: Should apply all rules from default, override and elements as well as texts.",
      {
        default: {
          text: {
            toData: reverseText,
            toView: reverseText,
          },
          elements: {
            el: {
              toData: (p) => p.node.name = "data",
              toView: {
                data: (p) => p.node.name = "view",
              },
            },
          }
        },
        config: {
          text: (p) => {
            p.parentRule(p);
            p.node.textContent = p.node.textContent.split(/[aeiou]/i).join("V");
          },
          elements: {
            el: {
              toData: (p) => {
                p.parentRule(p);
                p.node.attributes["as"] = "data";
              },
              toView: {
                data: (p) => {
                  p.parentRule(p);
                  p.node.attributes["as"] = "view";
                },
              },
            },
          }
        },
        from: "<root>Lorem <el>Ipsum</el> Dolor</root>",
        data: `<root> mVrVL<data as="data">mVspV</data>rVlVD </root>`,
        view: `<root>LVrVm <view as="view">VpsVm</view> DVlVr</root>`,
      },
    ],
  ];

  describe.each<TestFixture>(testFixtures)("(%#) %s", (name, testData) => {

    if (!!TEST_SELECTOR && !name.startsWith(TEST_SELECTOR)) {
      test.todo(`${name} (disabled by test selector for debugging purpose)`);
      return;
    }

    const from: Document = parser.parseFromString(testData.from, "text/xml");
    const defaultConfig: FilterRuleSetConfiguration = testData.default;
    const config: FilterRuleSetConfiguration = testData.config;

    const { toData, toView } = parseFilterRuleSetConfigurations(config, defaultConfig);

    const toDataFilter = new HtmlFilter(toData, MOCK_EDITOR);
    const toViewFilter = new HtmlFilter(toView, MOCK_EDITOR);

    toDataFilter.applyTo(from.documentElement);

    const dataXml: string = serializer.serializeToString(from.documentElement);

    test(`toData: Should have transformed as expected: ${testData.from} -> ${testData.data}.`, () => {
      expect(dataXml).toEqualXML(testData.data);
    });

    const data: Document = parser.parseFromString(dataXml, "text/xml");

    toViewFilter.applyTo(data.documentElement);

    const viewXml: string = serializer.serializeToString(data.documentElement);

    test(`toView: Should have transformed as expected: ${dataXml} -> ${testData.view}`, () => {
      expect(viewXml).toEqualXML(testData.view);
    });
  });
});
