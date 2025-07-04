import "jest-xml-matcher";
import { HtmlFilter } from "@coremedia/ckeditor5-dataprocessor-support";
import { getV10Config, parseXml } from "./Utils";
import { silenced } from "../../Silenced";
import { Editor } from "ckeditor5";
import "../../config";

//@ts-expect-error We should rather mock ClassicEditor or similar here.
const MOCK_EDITOR = new Editor({ licenseKey: process.env.CKEDITOR_LICENSE_KEY });

/**
 * A test case, which comes with a name.
 */
export interface NamedTestCase {
  /**
   * A name for the test case.
   */
  name: string;
  /**
   * Some comment. Only meant for internal developer comments, not used
   * during test.
   */
  comment?: string;
}

/**
 * A test case, which may be skipped.
 */
export interface SkippableTestCase {
  /**
   * Marks a test-case as skipped, if set to `true` or a non-empty string.
   */
  skip?: boolean | string;
}

/**
 * A test case, which may be marked to be the only one to be run.
 */
export interface OnlyTestCase {
  /**
   * Marks a test-case as the only test to be run, if set to `true`.
   */
  only?: boolean;
}

/**
 * Allows suppressing console output while calling production code.
 */
export interface SilentTestCase {
  /**
   * `true` to suppress console output while calling production code.
   */
  silent?: boolean;
}

/**
 * Data processing direction to test or under test.
 */
export enum Direction {
  toDataView,
  toData,
  both,
}

/**
 * Restricts a testcase to be only run on matched direction.
 */
export interface DirectionRestriction {
  /**
   * The data transformation direction a test is applicable for. Defaults
   * to `both`.
   */
  direction?: Direction;
}

export type DocumentPostProcessor = (document: Document) => void;

/**
 * Data for data processing tests.
 */
export interface DataProcessingData {
  /**
   * The Data Layer (CoreMedia RichText).
   */
  data: string;
  /**
   * CKEditor's Data View Layer (HTML), not to be misunderstood with the
   * Editing View (HTML in Browser to be edited).
   */
  dataView: string;
  /**
   * Optional post-processor for actual data after transformation. Used,
   * for example, to ignore the value of certain attributes during test.
   *
   * @param document - document to possibly post-process.
   */
  postProcessActual?: DocumentPostProcessor;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const hasDirectionRestriction = (data: any): data is DirectionRestriction => {
  if (!("direction" in data)) {
    return false;
  }
  return typeof data.direction === "number";
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isSkippable = (data: any): data is SkippableTestCase => {
  if (!("skip" in data)) {
    return false;
  }
  return typeof data.skip === "boolean" || typeof data.skip === "string";
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isOnly = (data: any): data is OnlyTestCase => {
  if (!("only" in data)) {
    return false;
  }
  return typeof data.only === "boolean";
};
export const ddTest = <T extends NamedTestCase>(
  direction: Direction,
  data: T | (T & SkippableTestCase) | (T & OnlyTestCase) | (T & DirectionRestriction),
  fn: (data: T) => void,
): void => {
  const testFn = () => {
    fn(data);
  };
  const { name } = data;
  if (hasDirectionRestriction(data)) {
    if (data.direction !== Direction.both && data.direction !== direction) {
      test.skip(`Not applicable for current data processing direction: ${name}`, testFn);
      return;
    }
  }
  if (isSkippable(data)) {
    if (data.skip) {
      let skipName: string;
      if (typeof data.skip === "boolean") {
        skipName = `Skipped: ${name}`;
      } else {
        skipName = `Skipped: ${name} (${data.skip})`;
      }
      test.skip(skipName, testFn);
      return;
    }
  }
  if (isOnly(data)) {
    if (data.only) {
      test.only(name, testFn);
      return;
    }
  }
  test(name, testFn);
};

/**
 * Workaround for Jest issue with less nice handling of array-driven tests
 * compared to table syntax tests.
 *
 * @param data - test data to transform into [name, data] pattern.
 * @param generator - strategy to generate a name for the test case
 * @see https://github.com/facebook/jest/issues/6413
 */
export const testData = <T extends NamedTestCase>(data: T[], generator = (d: T) => d.name): [string, T][] =>
  data.map((d) => [generator(d), d]);
export type DataProcessingTestCase = NamedTestCase &
  SkippableTestCase &
  OnlyTestCase &
  SilentTestCase &
  DataProcessingData &
  DirectionRestriction;
const { toData, toView } = getV10Config();
export const toDataFilter = new HtmlFilter(toData, MOCK_EDITOR);
export const toViewFilter = new HtmlFilter(toView, MOCK_EDITOR);
const serializer = new XMLSerializer();
export const getFilter = (direction: Direction.toData | Direction.toDataView): HtmlFilter =>
  direction === Direction.toDataView ? toViewFilter : toDataFilter;
export const applyFilter = (
  filter: HtmlFilter,
  input: string,
  silent?: boolean,
  postProcessor?: DocumentPostProcessor,
): string => {
  const xmlDocument: Document = parseXml(input);
  silenced(() => filter.applyTo(xmlDocument.documentElement), silent);
  postProcessor?.(xmlDocument);
  return serializer.serializeToString(xmlDocument);
};
export const dataProcessingTest = (
  direction: Direction.toData | Direction.toDataView,
  data: DataProcessingTestCase,
): void => {
  const filter: HtmlFilter = getFilter(direction);
  let input: string;
  let output: string;
  if (direction === Direction.toDataView) {
    input = data.data;
    output = data.dataView;
  } else {
    input = data.dataView;
    output = data.data;
  }
  ddTest(direction, data, () => {
    const actualXml = applyFilter(filter, input, data.silent, data.postProcessActual);
    expect(actualXml).toEqualXML(output);
  });
};
export const eachDataProcessingTest = (
  direction: Direction.toData | Direction.toDataView,
  testCases: DataProcessingTestCase[],
): void => {
  const name = `[%#] %s`;
  const data = testData(testCases);
  describe.each<[string, DataProcessingTestCase]>(data)(name, (name, data) => {
    dataProcessingTest(direction, data);
  });
};
export const allDataProcessingTests = (testCases: DataProcessingTestCase[]): void => {
  describe("Data → Data View", () => {
    eachDataProcessingTest(Direction.toDataView, testCases);
  });
  describe("Data View → Data", () => {
    eachDataProcessingTest(Direction.toData, testCases);
  });
};
