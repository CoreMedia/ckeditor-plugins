import "jest-xml-matcher";
import {
  parseFilterRuleSetConfigurations,
  ElementFilterRule,
  FilterRuleSetConfiguration,
  HtmlFilter,
} from "../../src/dataprocessor";
import Editor from "@ckeditor/ckeditor5-core/src/editor/editor";

jest.mock("@ckeditor/ckeditor5-core/src/editor/editor");

const MOCK_EDITOR = new Editor();

const parser = new DOMParser();
const serializer = new XMLSerializer();

type CommentableTestData = {
  /**
   * Some comment which may help understanding the test case better.
   */
  comment?: string;
};

type DisableableTestCase = {
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

const replaceByChildren: ElementFilterRule = (p) => {
  p.node.replaceByChildren = true
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
    DisableableTestCase &
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
      "#toDataOnly: Should handle toData-only-rules.",
      {
        config: {
          elements: {
            el: replaceByChildren,
          }
        },
        from: "<root>Lorem <el>Ipsum</el> Dolor</root>",
        data: "<root>Lorem Ipsum Dolor</root>",
        view: "<root>Lorem Ipsum Dolor</root>",
      },
    ],
    [
      "#toViewOnly: Should handle toView-only-rules (Object Setup).",
      {
        config: {
          elements: {
            el: {
              toView: {
                el: replaceByChildren,
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
      "#toViewOnly: Should handle toView-only-rules (Function Setup).",
      {
        config: {
          elements: {
            el: {
              toView: replaceByChildren,
            },
          }
        },
        from: "<root>Lorem <el>Ipsum</el> Dolor</root>",
        data: "<root>Lorem <el>Ipsum</el> Dolor</root>",
        view: "<root>Lorem Ipsum Dolor</root>",
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

  test.each<TestFixture>(testFixtures)("(%#) %s", (name, testData) => {
    const from: Document = parser.parseFromString(testData.from, "text/xml");
    const config: FilterRuleSetConfiguration = testData.config;

    const { toData, toView } = parseFilterRuleSetConfigurations(config);

    const toDataFilter = new HtmlFilter(toData, MOCK_EDITOR);
    const toViewFilter = new HtmlFilter(toView, MOCK_EDITOR);

    toDataFilter.applyTo(from.documentElement);

    const dataXml: string = serializer.serializeToString(from.documentElement);
    expect(dataXml).toEqualXML(testData.data);

    const data: Document = parser.parseFromString(dataXml, "text/xml");

    toViewFilter.applyTo(data.documentElement);

    const viewXml: string = serializer.serializeToString(data.documentElement);
    expect(viewXml).toEqualXML(testData.view);
  });
});

describe("Rules.parseFilterRuleSetConfiguration, Parsing Configuration (Having Defaults)", () => {
  type TestData = CommentableTestData &
    DisableableTestCase &
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
      "#toDataOnly: Should handle nested toData-only-rules.",
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
    // TODO "VETO" Example
  ];

  test.each<TestFixture>(testFixtures)("(%#) %s", (name, testData) => {
    const from: Document = parser.parseFromString(testData.from, "text/xml");
    const defaultConfig: FilterRuleSetConfiguration = testData.default;
    const config: FilterRuleSetConfiguration = testData.config;

    const { toData, toView } = parseFilterRuleSetConfigurations(config, defaultConfig);

    const toDataFilter = new HtmlFilter(toData, MOCK_EDITOR);
    const toViewFilter = new HtmlFilter(toView, MOCK_EDITOR);

    toDataFilter.applyTo(from.documentElement);

    const dataXml: string = serializer.serializeToString(from.documentElement);
    expect(dataXml).toEqualXML(testData.data);

    const data: Document = parser.parseFromString(dataXml, "text/xml");

    toViewFilter.applyTo(data.documentElement);

    const viewXml: string = serializer.serializeToString(data.documentElement);
    expect(viewXml).toEqualXML(testData.view);
  });
});
