import "jest-xml-matcher";
import { HtmlFilter, FilterRuleSet } from "../../src/dataprocessor";
import Editor from "@ckeditor/ckeditor5-core/src/editor/editor";

jest.mock("@ckeditor/ckeditor5-core/src/editor/editor");

const MOCK_EDITOR = new Editor();

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
            el: (params) => {
              params.node.remove = true;
            },
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
            el: (params) => (params.node.replaceByChildren = true),
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
            el: (params) => (params.node.replaceByChildren = true),
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
              params.node.name = "replacement";
              params.node.attributes.was = "el";
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
              params.node.name = "replacement";
              params.node.attributes.was = "el";
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
              params.node.name = "stage1";
              params.node.attributes.was = "el";
            },
            stage1: (params) => {
              params.node.name = "stage2";
              params.node.attributes.was = "stage1";
            },
            stage2: (params) => {
              params.node.name = "replacement";
              params.node.attributes.was = "stage2";
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
              params.node.attributes.name = `${params.node.attributes.name ? params.node.attributes.name + "-" : ""}before`;
            },
            el: (params) => {
              params.node.attributes.name = `${params.node.attributes.name ? params.node.attributes.name + "-" : ""}el`;
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
              params.node.attributes.name = `${params.node.attributes.name ? params.node.attributes.name + "-" : ""}after`;
            },
            el: (params) => {
              params.node.attributes.name = `${params.node.attributes.name ? params.node.attributes.name + "-" : ""}el`;
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
              params.node.attributes.name = `${params.node.attributes.name ? params.node.attributes.name + "-" : ""}before`;
            },
            $: (params) => {
              params.node.attributes.name = `${params.node.attributes.name ? params.node.attributes.name + "-" : ""}after`;
            },
            el: (params) => {
              params.node.attributes.name = `${params.node.attributes.name ? params.node.attributes.name + "-" : ""}el`;
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
              params.node.attributes.name = `${params.node.attributes.name ? params.node.attributes.name + "-" : ""}before`;
            },
            $: (params) => {
              params.node.attributes.name = `${params.node.attributes.name ? params.node.attributes.name + "-" : ""}after`;
            },
            el: (params) => {
              params.node.name = "replacement";
              params.node.attributes.name = `${params.node.attributes.name ? params.node.attributes.name + "-" : ""}el`;
            },
            replacement: (params) => {
              params.node.attributes.name = `${params.node.attributes.name ? params.node.attributes.name + "-" : ""}replacement`;
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
    const filter = new HtmlFilter(testData.rules, MOCK_EDITOR);

    filter.applyTo(root);

    expect(document.body.innerHTML).toEqualXML(testData.to);
  });
});
