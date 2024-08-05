/* eslint @typescript-eslint/naming-convention: off */
// noinspection InnerHTMLJS

import "jest-xml-matcher";
import HtmlFilter, { FilterRuleSet } from "../src/HtmlFilter";
import { Editor } from "ckeditor5";
jest.mock("@ckeditor/ckeditor5-core/src/editor/editor");

//@ts-expect-error We should rather mock ClassicEditor or similar here.
const MOCK_EDITOR = new Editor();

/**
 * Will be checked for "startsWith" for a given Data Driven Testname. Meant
 * to be used for debugging purpose. Example:
 *
 * `TEST_SELECTOR = "APPLY#3"`
 */
const TEST_SELECTOR = "";
type ApplyToData = [
  string,
  {
    comment?: string;
    rules: FilterRuleSet;
    from: string;
    to: string;
  },
];
describe("HtmlFilter.applyTo()", () => {
  describe.each<ApplyToData>([
    [
      "APPLY#1: should do nothing on empty rules",
      {
        rules: {},
        from: "<parent>Lorem <el>Ipsum</el> Dolor</parent>",
        to: "<parent>Lorem <el>Ipsum</el> Dolor</parent>",
      },
    ],
    [
      "APPLY#2: should remove elements and their children",
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
      "APPLY#3: should replace elements by their children",
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
      "APPLY#4: should replace elements by their children (nested)",
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
      "APPLY#5: should replace elements",
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
        to: '<parent>Lorem <replacement was="el">Ipsum</replacement> Dolor <replacement was="el">Sit</replacement></parent>',
      },
    ],
    [
      "APPLY#6: should replace elements (nested)",
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
        to: '<parent>Lorem <replacement was="el">Ipsum <replacement was="el">Dolor</replacement> Sit</replacement></parent>',
      },
    ],
    [
      "APPLY#7: should restart from scratch after replacement",
      {
        rules: {
          elements: {
            el: (params) => {
              params.node.attributes.was = params.node.name;
              params.node.name = "intermediate";
            },
            intermediate: (params) => {
              params.node.attributes.was = params.node.name;
              params.node.name = "replacement";
            },
          },
        },
        from: "<parent>Lorem <el>Ipsum <el>Dolor</el> Sit</el></parent>",
        to: '<parent>Lorem <replacement was="intermediate">Ipsum <replacement was="intermediate">Dolor</replacement> Sit</replacement></parent>',
      },
    ],
    [
      "APPLY#8: should respect before-handler",
      {
        rules: {
          elements: {
            "^": (params) => {
              params.node.attributes.name = `${params.node.attributes.name ? params.node.attributes.name + "-" : ""}before`;
            },
            "el": (params) => {
              params.node.attributes.name = `${params.node.attributes.name ? params.node.attributes.name + "-" : ""}el`;
            },
          },
        },
        from: "<parent>Lorem <el>Ipsum</el> Dolor</parent>",
        to: '<parent>Lorem <el name="before-el">Ipsum</el> Dolor</parent>',
      },
    ],
    [
      "APPLY#9: should respect after-handler",
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
      "APPLY#10: should respect before and after-handler",
      {
        rules: {
          elements: {
            "^": (params) => {
              params.node.attributes.name = `${params.node.attributes.name ? params.node.attributes.name + "-" : ""}before`;
            },
            "$": (params) => {
              params.node.attributes.name = `${params.node.attributes.name ? params.node.attributes.name + "-" : ""}after`;
            },
            "el": (params) => {
              params.node.attributes.name = `${params.node.attributes.name ? params.node.attributes.name + "-" : ""}el`;
            },
          },
        },
        from: "<parent>Lorem <el>Ipsum</el> Dolor</parent>",
        to: '<parent>Lorem <el name="before-el-after">Ipsum</el> Dolor</parent>',
      },
    ],
    [
      "APPLY#11: should continue with new identity on element change",
      {
        rules: {
          elements: {
            "^": (params) => {
              params.node.attributes.name = `${params.node.attributes.name ? params.node.attributes.name + "-" : ""}before`;
            },
            "$": (params) => {
              params.node.attributes.name = `${params.node.attributes.name ? params.node.attributes.name + "-" : ""}after`;
            },
            "el": (params) => {
              params.node.name = "replacement";
              params.node.attributes.name = `${params.node.attributes.name ? params.node.attributes.name + "-" : ""}el`;
            },
            "replacement": (params) => {
              // This should not be triggered.
              params.node.attributes.name = `${params.node.attributes.name ? params.node.attributes.name + "-" : ""}replacement`;
            },
          },
        },
        from: "<parent>Lorem <el>Ipsum</el> Dolor</parent>",
        to: '<parent>Lorem <replacement name="before-el-before-replacement-after">Ipsum</replacement> Dolor</parent>',
      },
    ],
    [
      "APPLY#12: should apply text rules",
      {
        rules: {
          text: (params) => (params.node.textContent = params.node.textContent.split("").reverse().join("")),
        },
        from: "<parent>Lorem Ipsum Dolor</parent>",
        to: "<parent>roloD muspI meroL</parent>",
      },
    ],
  ])("(%#) %s", (name, testData) => {
    if (TEST_SELECTOR && !name.startsWith(TEST_SELECTOR)) {
      test.todo(`${name} (disabled by test selector for debugging purpose)`);
      return;
    }
    test(name, () => {
      document.body.innerHTML = testData.from.trim();
      const root: Node = document.body.firstChild as Node;
      const filter = new HtmlFilter(testData.rules, MOCK_EDITOR);
      filter.applyTo(root);
      expect(document.body.innerHTML).toEqualXML(testData.to);
    });
  });
});
