/**
 * A test case, which comes with a name.
 */
interface NamedTestCase {
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
interface SkippableTestCase {
  /**
   * Marks a test-case as skipped, if set to `true` or a non-empty string.
   */
  skip?: boolean | string;
}

/**
 * A test case, which may be marked to be the only one to be run.
 */
interface OnlyTestCase {
  /**
   * Marks a test-case as the only test to be run, if set to `true`.
   */
  only?: boolean;
}

/**
 * Data processing direction to test or under test.
 */
enum Direction {
  toDataView,
  toData,
  both,
}

/**
 * Restricts a testcase to be only run on matched direction.
 */
interface DirectionRestriction {
  /**
   * The data transformation direction a test is applicable for. Defaults
   * to `both`.
   */
  direction?: Direction;
}

/**
 * Data for data processing tests.
 */
interface DataProcessingData {
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
   * @param document document to possibly post-process.
   */
  postProcessActual?: (document: Document) => void;
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

const ddTest = <T extends NamedTestCase>(
  direction: Direction,
  data: T | (T & SkippableTestCase) | (T & OnlyTestCase) | (T & DirectionRestriction),
  fn: (data: T) => void
): void => {
  const testFn = () => {
    fn(data);
  };
  const { name } = data;

  if (hasDirectionRestriction(data)) {
    if (data.direction !== Direction.both && data.direction !== direction) {
      return test.skip(`Not applicable for current data processing direction: ${name}`, testFn);
    }
  }

  if (isSkippable(data)) {
    if (!!data.skip) {
      let skipName: string;
      if (typeof data.skip === "boolean") {
        skipName = `Skipped: ${name}`;
      } else {
        skipName = `Skipped: ${name} (${data.skip})`;
      }
      return test.skip(skipName, testFn);
    }
  }
  if (isOnly(data)) {
    if (!!data.only) {
      return test.only(name, testFn);
    }
  }
  test(name, testFn);
};

/**
 * Workaround for Jest issue with less nice handling of array-driven tests
 * compared to table syntax tests.
 * @param data test data to transform into [name, data] pattern.
 * @param generator strategy to generate a name for the test case
 * @see https://github.com/facebook/jest/issues/6413
 */
const testData = <T extends NamedTestCase>(data: T[], generator = (d: T) => d.name): [string, T][] => {
  return data.map((d) => [generator(d), d]);
};

export {
  DataProcessingData,
  Direction,
  DirectionRestriction,
  NamedTestCase,
  OnlyTestCase,
  SkippableTestCase,
  ddTest,
  testData,
};
