import { jest as jestGlobal } from "@jest/globals";

/**
 * Suppresses Console Output while executing the given function, if
 * `silent === true`.
 *
 * @param call - function to execute
 * @param silent - flag, if output shall be suppressed or not
 */
const silenced = <T>(call: () => T, silent = true): T => {
  const consoleOutputs: (keyof Console)[] = ["log", "error", "warn", "info", "debug"];
  const spies: jest.SpyInstance[] = [];
  consoleOutputs.forEach((output) => {
    const spy = jestGlobal.spyOn(console, output);
    spies.push(spy);
    if (silent) {
      // eslint-disable-next-line no-null/no-null
      spy.mockImplementation(() => null as unknown as Console);
    }
  });
  try {
    return call();
  } finally {
    spies.forEach((spy) => spy.mockRestore());
  }
};
export { silenced };
