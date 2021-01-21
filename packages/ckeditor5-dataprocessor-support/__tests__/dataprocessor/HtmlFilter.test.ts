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
            el: (me) => (me.replaceByChildren = true),
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
            el: (me) => (me.replaceByChildren = true),
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
            el: (me) => {
              me.name = "replacement";
              me.attributes.was = "el";
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
            el: (me) => {
              me.name = "replacement";
              me.attributes.was = "el";
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
            el: (me) => {
              me.name = "stage1";
              me.attributes.was = "el";
            },
            stage1: (me) => {
              me.name = "stage2";
              me.attributes.was = "stage1";
            },
            stage2: (me) => {
              me.name = "replacement";
              me.attributes.was = "stage2";
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
            "^": (me) => {
              me.attributes.name = `${me.attributes.name ? me.attributes.name + "-" : ""}before`;
            },
            el: (me) => {
              me.attributes.name = `${me.attributes.name ? me.attributes.name + "-" : ""}el`;
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
            $: (me) => {
              me.attributes.name = `${me.attributes.name ? me.attributes.name + "-" : ""}after`;
            },
            el: (me) => {
              me.attributes.name = `${me.attributes.name ? me.attributes.name + "-" : ""}el`;
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
            "^": (me) => {
              me.attributes.name = `${me.attributes.name ? me.attributes.name + "-" : ""}before`;
            },
            $: (me) => {
              me.attributes.name = `${me.attributes.name ? me.attributes.name + "-" : ""}after`;
            },
            el: (me) => {
              me.attributes.name = `${me.attributes.name ? me.attributes.name + "-" : ""}el`;
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
            "^": (me) => {
              me.attributes.name = `${me.attributes.name ? me.attributes.name + "-" : ""}before`;
            },
            $: (me) => {
              me.attributes.name = `${me.attributes.name ? me.attributes.name + "-" : ""}after`;
            },
            el: (me) => {
              me.name = "replacement";
              me.attributes.name = `${me.attributes.name ? me.attributes.name + "-" : ""}el`;
            },
            replacement: (me) => {
              me.attributes.name = `${me.attributes.name ? me.attributes.name + "-" : ""}replacement`;
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
