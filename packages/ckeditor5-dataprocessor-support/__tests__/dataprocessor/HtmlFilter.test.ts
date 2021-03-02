import "jest-xml-matcher";
import { HtmlFilter, FilterRuleSet } from "../../src/dataprocessor";

type ApplyToData = [
  string,
  {
    rules: FilterRuleSet;
    from: string;
    to: string;
  }
];

describe("HtmlFilter.applyTo(); Element Rules", () => {
  test.each<ApplyToData>([
    [
      "should do nothing on empty rules",
      {
        rules: {},
        from: "<parent>Lorem <el>Ipsum</el> Dolor</parent>",
        to: "<parent>Lorem <el>Ipsum</el> Dolor</parent>",
      },
    ],
    [
      "should remove elements and their children",
      {
        rules: {
          elements: {
            el: () => false,
          },
        },
        from: "<parent>Lorem <el>Ipsum</el> Dolor <el>Sit</el></parent>",
        // TODO[cke] Any way to get of unwanted whitespace? What is the CKEditor 4 filter doing about it?
        to: "<parent>Lorem  Dolor </parent>",
      },
    ],
    [
      "should replace elements by their children",
      {
        rules: {
          elements: {
            el: (params) => (params.el.replaceByChildren = true),
          },
        },
        from: "<parent>Lorem <el>Ipsum</el> Dolor <el>Sit</el></parent>",
        to: "<parent>Lorem Ipsum Dolor Sit</parent>",
      },
    ],
    [
      "should replace elements by their children (nested)",
      {
        rules: {
          elements: {
            el: (params) => (params.el.replaceByChildren = true),
          },
        },
        from: "<parent>Lorem <el>Ipsum <el>Dolor</el> Sit</el></parent>",
        to: "<parent>Lorem Ipsum Dolor Sit</parent>",
      },
    ],
    [
      "should replace elements",
      {
        rules: {
          elements: {
            el: (params) => {
              params.el.name = "replacement";
              params.el.attributes.was = "el";
            },
          },
        },
        from: "<parent>Lorem <el>Ipsum</el> Dolor <el>Sit</el></parent>",
        to:
          '<parent>Lorem <replacement was="el">Ipsum</replacement> Dolor <replacement was="el">Sit</replacement></parent>',
      },
    ],
    [
      "should replace elements (nested)",
      {
        rules: {
          elements: {
            el: (params) => {
              params.el.name = "replacement";
              params.el.attributes.was = "el";
            },
          },
        },
        from: "<parent>Lorem <el>Ipsum <el>Dolor</el> Sit</el></parent>",
        to:
          '<parent>Lorem <replacement was="el">Ipsum <replacement was="el">Dolor</replacement> Sit</replacement></parent>',
      },
    ],
    [
      "should restart after replacement",
      {
        rules: {
          elements: {
            el: (params) => {
              params.el.name = "stage1";
              params.el.attributes.was = "el";
            },
            stage1: (params) => {
              params.el.name = "stage2";
              params.el.attributes.was = "stage1";
            },
            stage2: (params) => {
              params.el.name = "replacement";
              params.el.attributes.was = "stage2";
            },
          },
        },
        from: "<parent>Lorem <el>Ipsum <el>Dolor</el> Sit</el></parent>",
        to:
          '<parent>Lorem <replacement was="stage2">Ipsum <replacement was="stage2">Dolor</replacement> Sit</replacement></parent>',
      },
    ],
    [
      "should respect before-handler",
      {
        rules: {
          elements: {
            "^": (params) => {
              params.el.attributes.name = `${params.el.attributes.name ? params.el.attributes.name + "-" : ""}before`;
            },
            el: (params) => {
              params.el.attributes.name = `${params.el.attributes.name ? params.el.attributes.name + "-" : ""}el`;
            },
          },
        },
        from: "<parent>Lorem <el>Ipsum</el> Dolor</parent>",
        to: '<parent>Lorem <el name="before-el">Ipsum</el> Dolor</parent>',
      },
    ],
    [
      "should respect after-handler",
      {
        rules: {
          elements: {
            $: (params) => {
              params.el.attributes.name = `${params.el.attributes.name ? params.el.attributes.name + "-" : ""}after`;
            },
            el: (params) => {
              params.el.attributes.name = `${params.el.attributes.name ? params.el.attributes.name + "-" : ""}el`;
            },
          },
        },
        from: "<parent>Lorem <el>Ipsum</el> Dolor</parent>",
        to: '<parent>Lorem <el name="el-after">Ipsum</el> Dolor</parent>',
      },
    ],
    [
      "should respect before and after-handler",
      {
        rules: {
          elements: {
            "^": (params) => {
              params.el.attributes.name = `${params.el.attributes.name ? params.el.attributes.name + "-" : ""}before`;
            },
            $: (params) => {
              params.el.attributes.name = `${params.el.attributes.name ? params.el.attributes.name + "-" : ""}after`;
            },
            el: (params) => {
              params.el.attributes.name = `${params.el.attributes.name ? params.el.attributes.name + "-" : ""}el`;
            },
          },
        },
        from: "<parent>Lorem <el>Ipsum</el> Dolor</parent>",
        to: '<parent>Lorem <el name="before-el-after">Ipsum</el> Dolor</parent>',
      },
    ],
    [
      "should restart processing on element change",
      {
        rules: {
          elements: {
            "^": (params) => {
              params.el.attributes.name = `${params.el.attributes.name ? params.el.attributes.name + "-" : ""}before`;
            },
            $: (params) => {
              params.el.attributes.name = `${params.el.attributes.name ? params.el.attributes.name + "-" : ""}after`;
            },
            el: (params) => {
              params.el.name = "replacement";
              params.el.attributes.name = `${params.el.attributes.name ? params.el.attributes.name + "-" : ""}el`;
            },
            replacement: (params) => {
              params.el.attributes.name = `${params.el.attributes.name ? params.el.attributes.name + "-" : ""}replacement`;
            },
          },
        },
        from: "<parent>Lorem <el>Ipsum</el> Dolor</parent>",
        to: '<parent>Lorem <replacement name="before-el-before-replacement-after">Ipsum</replacement> Dolor</parent>',
      },
    ],
  ])("(%#) %s", (name, testData) => {
    document.body.innerHTML = testData.from.trim();
    const root: Node = <Node>document.body.firstChild;
    const filter = new HtmlFilter(testData.rules);

    filter.applyTo(root);

    expect(document.body.innerHTML).toEqualXML(testData.to);
  });
});
