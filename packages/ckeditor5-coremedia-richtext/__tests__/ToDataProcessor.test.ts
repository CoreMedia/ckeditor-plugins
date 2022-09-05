import "jest-xml-matcher";
import ToDataProcessor from "../src/ToDataProcessor";
import Editor from "@ckeditor/ckeditor5-core/src/editor/editor";
import { getConfig } from "../src/CoreMediaRichTextConfig";
import HtmlFilter from "@coremedia/ckeditor5-dataprocessor-support/HtmlFilter";

jest.mock("@ckeditor/ckeditor5-core/src/editor/editor");

const EXECUTION_REPETITIONS = 100;
const FIBONACCI_INDEX_FROM = 1;
/**
 * This is the fibonacci number index to calculate the maximum
 * repetitions for a complex HTML structure to transform. It should be
 * `1` for a "one time" repetition in CI but may be increased to generate
 * time series.
 * <p>
 * Note, that the time limit will only be checked for no repetition (fib = 1).
 * <ol>
 * <li>1 = 1</li>
 * <li>2 = 2</li>
 * <li>3 = 3</li>
 * <li>4 = 5</li>
 * <li>5 = 8</li>
 * <li>6 = 13</li>
 * <li>7 = 21</li>
 * <li>8 = 34</li>
 * <li>9 = 55</li>
 * <li>10 = 89</li>
 * <li>11 = 144</li>
 * <li>12 = 233</li>
 * <li>13 = 377</li>
 * </ol>
 */
const FIBONACCI_INDEX_TO = 2;

// https://medium.com/developers-writing/fibonacci-sequence-algorithm-in-javascript-b253dc7e320e
function fib(idx: number, memo?: Map<number, number>): number {
  const myMemo: Map<number, number> = memo || new Map<number, number>();
  if (idx <= 1) {
    return 1;
  }
  let result: number = myMemo.get(idx) || 0;
  if (result === 0) {
    result = fib(idx - 1, memo) + fib(idx - 2, memo);
    myMemo.set(idx, result);
  }
  return result;
}

//@ts-expect-error
const MOCK_EDITOR = new Editor();
const PARSER = new DOMParser();

function parseAndValidate(xmlString: string): Document {
  const xmlDocument = PARSER.parseFromString(xmlString, "text/html");
  const xPathResult: XPathResult = xmlDocument.evaluate(
    "/parsererror/text()",
    xmlDocument,
    null,
    XPathResult.STRING_TYPE
  );
  if (xPathResult.stringValue) {
    throw new Error(`Error while parsing XML: ${xPathResult.stringValue}\n\tXML: ${xmlString}`);
  }
  return xmlDocument;
}

/**
 * Specifies performance expectations. Note, that a sufficient grace period
 * should be given to be stable across multiple platforms.
 */
interface PerformanceTestData {
  /**
   * The desired optimal (maximal) milliseconds a transformation should take.
   */
  optimalMilliseconds: number;
  /**
   * A given "grace timeout" given as percentage. `1.0` denotes a grace of
   * the same amount as the optimal milliseconds, which doubles the timeout.
   * `0.5` will provide 50% grace, which, having 1000 ms optimal time will
   * end up in a failure after 1500 ms. `0.0` disables any grace time.
   */
  gracePercentage: number;
}

interface TestData extends PerformanceTestData {
  /**
   * The DOM we start from.
   */
  from: string;
}

type NamedTestData = [
  /**
   * A name/description for the test (will be printed to output).
   */
  string,
  TestData
];

/**
 * Processing Instructions.
 */
const pi = `<?xml version="1.0" encoding="utf-8"?>`;
/**
 * Some text fixture for testing.
 */
const fxLtrText = "Lorem ipsum dolor.";
const fxRtlText = "ב היא יסוד.";
const fxClass = "class--fixture";
const fxLang = "ja-JP-u-ca-japanese-x-lvariant-JP";

const { toData } = getConfig();
const filter: HtmlFilter = new HtmlFilter(toData, MOCK_EDITOR);
const dataProcessor: ToDataProcessor = new ToDataProcessor(filter);

function wrapView(xml: string): string {
  return `<view>${xml}</view>`;
}

function median(sequence: number[]): number {
  sequence.sort();
  return sequence[Math.ceil(sequence.length / 2)];
}

// https://stackoverflow.com/questions/7343890/standard-deviation-javascript
function standardDeviation(sequence: number[]): number {
  const n = sequence.length;
  const mean = sequence.reduce((a, b) => a + b) / n;
  return Math.sqrt(sequence.map((x) => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / n);
}

const blockquoteFixtures: string[] = [
  `<blockquote class="${fxClass}" lang="${fxLang}" dir="ltr">${fxLtrText}</blockquote>`,
  `<blockquote class="${fxClass}" lang="${fxLang}" dir="ltr" cite="https://example.org/">${fxLtrText}</blockquote>`,
];

const preFixtures: string[] = [
  `<pre class="${fxClass}" lang="${fxLang}" dir="ltr">${fxLtrText}</pre>`,
  `<pre class="${fxClass}" lang="${fxLang}" dir="ltr" xml:space="preserve">${fxLtrText}</pre>`,
];

function generateInlineFixtures(el: string): string[] {
  return [
    `<${el}>${fxLtrText}<br class="${fxClass}"/>${fxLtrText}</${el}>`,
    `<${el}><span class="${fxClass}" lang="${fxLang}" dir="ltr">${fxLtrText}</span></${el}>`,
    `<${el}><em class="${fxClass}" lang="${fxLang}" dir="ltr">${fxLtrText}</em></${el}>`,
    `<${el}><i class="${fxClass}" lang="${fxLang}" dir="ltr">${fxLtrText}</i></${el}>`,
    `<${el}><strong class="${fxClass}" lang="${fxLang}" dir="ltr">${fxLtrText}</strong></${el}>`,
    `<${el}><b class="${fxClass}" lang="${fxLang}" dir="ltr">${fxLtrText}</b></${el}>`,
    `<${el}><sub class="${fxClass}" lang="${fxLang}" dir="ltr">${fxLtrText}</sub></${el}>`,
    `<${el}><sup class="${fxClass}" lang="${fxLang}" dir="ltr">${fxLtrText}</sup></${el}>`,
    // Override of class for underline currently expected. May change in the future.
    `<${el}><u class="${fxClass}" lang="${fxLang}" dir="ltr">${fxLtrText}</u></${el}>`,
    // Override of class for underline currently expected. May change in the future.
    `<${el}><del class="${fxClass}" lang="${fxLang}" dir="ltr">${fxLtrText}</del></${el}>`,
    // Override of class for underline currently expected. May change in the future.
    `<${el}><s class="${fxClass}" lang="${fxLang}" dir="ltr">${fxLtrText}</s></${el}>`,
    // Override of class for underline currently expected. May change in the future.
    `<${el}><strike class="${fxClass}" lang="${fxLang}" dir="ltr">${fxLtrText}</strike></${el}>`,
  ];
}

function generateHeadingFixtures(el: string): string[] {
  return [
    `<${el}>${fxLtrText}</${el}>`,
    `<${el} lang="${fxLang}" dir="ltr">${fxLtrText}</${el}>`,
    // Currently, we assume that this class gets overridden. Later on, we may want to add a class instead.
    `<${el} class="${fxClass}" lang="${fxLang}" dir="ltr">${fxLtrText}</${el}>`,
  ];
}

const headingFixtures: string[] = [
  ...generateHeadingFixtures("h1"),
  ...generateHeadingFixtures("h2"),
  ...generateHeadingFixtures("h3"),
  ...generateHeadingFixtures("h4"),
  ...generateHeadingFixtures("h5"),
  ...generateHeadingFixtures("h6"),
];

const paragraphFixtures: string[] = [
  `<p dir="ltr">${fxLtrText}</p>`,
  `<p dir="rtl">${fxRtlText}</p>`,
  `<p class="${fxClass}" lang="${fxLang}" dir="ltr">${fxLtrText}</p>`,
  ...generateInlineFixtures("p"),
];

function generateSimpleRows(el: string, cells: number, rows = 1): string[] {
  const result: string[] = [];
  const singleRow: string[] = [];

  singleRow.push(`<tr class="${fxClass}" lang="${fxLang}" dir="ltr">`);
  for (let i = 0; i < cells; i++) {
    singleRow.push(`<${el}> class="${fxClass}" lang="${fxLang}" dir="ltr">`, fxLtrText, `</${el}>`);
  }
  singleRow.push(`</tr>`);

  for (let j = 0; j < rows; j++) {
    result.push(...singleRow);
  }

  return result;
}

const tableFixtures: string[] = [
  [
    `<table class="${fxClass}" lang="${fxLang}" dir="ltr">`,
    `<thead>`,
    ...generateSimpleRows("th", 5),
    `</thead>`,
    `<tbody>`,
    ...generateSimpleRows("td", 5, 3),
    `<tr>`,
    `<td abbr="${fxLtrText}" rowspan="1" colspan="3">${fxLtrText}</td>`,
    `<td abbr="${fxLtrText}" rowspan="2" colspan="1">${fxLtrText}</td>`,
    `<td abbr="${fxLtrText}" rowspan="1" colspan="3">${fxLtrText}</td>`,
    `</tr>`,
    ...generateSimpleRows("td", 5, 3),
    `</tbody>`,
    `</table>`,
  ].join(""),
];

function generateListFixtures(el: string): string[] {
  return [
    `<${el} class="${fxClass}" lang="${fxLang}" dir="ltr"><li class="${fxClass}" lang="${fxLang}" dir="ltr">${fxLtrText}</li></${el}>`,
  ];
}

const listFixtures: string[] = [...generateListFixtures("ol"), ...generateListFixtures("ul")];

function generateComplexView(count: number): string[] {
  const result: string[] = [];
  const initial: string[] = [
    ...headingFixtures,
    ...paragraphFixtures,
    ...preFixtures,
    ...blockquoteFixtures,
    ...listFixtures,
    ...tableFixtures,
  ];
  for (let i = 0; i < count; i++) {
    result.push(...initial);
  }
  return result;
}

function viewToDom(xml: string): DocumentFragment {
  const view = parseAndValidate(xml);
  const nodes = Array.from(view.documentElement.childNodes);
  const fragment = document.createDocumentFragment();
  fragment.append(...nodes);
  return fragment;
}

describe("RichTextDataProcessor.toData", () => {
  const testData: NamedTestData[] = [
    [
      "BASIC#1: First basic test with simple text content.",
      {
        from: wrapView("<p></p>"),
        optimalMilliseconds: 2,
        gracePercentage: 5,
      },
    ],
  ];

  for (let i = FIBONACCI_INDEX_FROM; i <= FIBONACCI_INDEX_TO; i++) {
    const f = fib(i);
    testData.push([
      `COMPLEX#${i}: Transforming some complex structure (${f} repetition(s)).`,
      {
        from: wrapView(generateComplexView(f).join("")),
        // Only measure for no repetition.
        optimalMilliseconds: f > 1 ? -1 : 30,
        gracePercentage: 5,
      },
    ]);
  }

  describe.each<NamedTestData>(testData)("(%#) %s", (name: string, data: TestData) => {
    const { optimalMilliseconds, gracePercentage } = data;
    const maximumMilliseconds = optimalMilliseconds + optimalMilliseconds * gracePercentage;

    function performToData(): { data: Document; elements: number } {
      const viewData: DocumentFragment = viewToDom(data.from);
      const elements = viewData.querySelectorAll("*").length;
      return {
        data: dataProcessor.toData(viewData),
        elements,
      };
    }

    test(`Should not have consumed more than ${
      maximumMilliseconds >= 0 ? maximumMilliseconds : "<unlimited>"
    } ms (median).`, () => {
      const { elements } = performToData();
      const measuredMilliseconds: number[] = [];

      for (let i = 0; i < EXECUTION_REPETITIONS; i++) {
        const startMilliseconds = performance.now();
        performToData();
        const endMilliseconds = performance.now();
        measuredMilliseconds.push(endMilliseconds - startMilliseconds);
      }

      const actualTime = median(measuredMilliseconds);
      const stddev = standardDeviation(measuredMilliseconds);
      const minTime = Math.min(...measuredMilliseconds);
      const maxTime = Math.max(...measuredMilliseconds);

      console.log(
        `${data.from.length} characters, ${elements} elements: Actual median time: ${actualTime.toFixed(
          1
        )} ms vs. allowed ${
          maximumMilliseconds > 0 ? maximumMilliseconds.toFixed(1) : "<unlimited>"
        } ms. (std. deviation: ${stddev.toFixed(1)} ms, min: ${minTime.toFixed(1)} ms, max: ${maxTime.toFixed(1)} ms)`
      );

      if (maximumMilliseconds >= 0) {
        // Otherwise, we just measure.
        expect(actualTime).toBeLessThanOrEqual(maximumMilliseconds);
      }
    });
  });
});
