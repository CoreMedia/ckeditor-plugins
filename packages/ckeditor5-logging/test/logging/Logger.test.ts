import type { TestContext } from "node:test";
import test from "node:test";
import expect from "expect";
import LoggerProvider from "../../src/logging/LoggerProvider";

const mockFunctionName = "ORIGINAL";
const loggerName = "loggerName";
const someMessage = "I'm logging stuff";
const contextPrefix = `[${mockFunctionName}] ${loggerName}:`;

type Mocked<T> = T & { mock: { calls: { arguments: unknown[] }[] } };

function mockConsole(t: TestContext) {
  console.debug = t.mock.fn();
  console.log = t.mock.fn();
  console.info = t.mock.fn();
  console.warn = t.mock.fn();
  console.error = t.mock.fn();

  return console as typeof console & {
    debug: Mocked<typeof console.debug>;
    log: Mocked<typeof console.log>;
    info: Mocked<typeof console.info>;
    warn: Mocked<typeof console.warn>;
    error: Mocked<typeof console.error>;
  };
}

void test("should log nothing when log level is none", (t) => {
  const mockedConsole = mockConsole(t);
  window.location.hash = `#${loggerName}=none`;

  logToAll();

  expect(mockedConsole.debug.mock.calls.length).toBe(0);
  expect(mockedConsole.info.mock.calls.length).toBe(0);
  expect(mockedConsole.warn.mock.calls.length).toBe(0);
  expect(mockedConsole.error.mock.calls.length).toBe(0);
  expect(mockedConsole.log.mock.calls.length).toBe(0);
});

void test("should log everything when log level is debug", (t) => {
  const mockedConsole = mockConsole(t);
  window.location.hash = `#${loggerName}=debug`;

  logToAll();

  expect(mockedConsole.debug.mock.calls.length).toBe(1);
  expect(mockedConsole.info.mock.calls.length).toBe(1);
  expect(mockedConsole.warn.mock.calls.length).toBe(1);
  expect(mockedConsole.error.mock.calls.length).toBe(1);
  expect(mockedConsole.log.mock.calls.length).toBe(1);
});

void test("should log everything above and including level info when log level is info", (t) => {
  const mockedConsole = mockConsole(t);
  window.location.hash = `#${loggerName}=info`;

  logToAll();

  expect(mockedConsole.debug.mock.calls.length).toBe(0);
  expect(mockedConsole.info.mock.calls.length).toBe(1);
  expect(mockedConsole.warn.mock.calls.length).toBe(1);
  expect(mockedConsole.error.mock.calls.length).toBe(1);
  expect(mockedConsole.log.mock.calls.length).toBe(1);
});

void test("should default to info logging for no log level provided", (t) => {
  const mockedConsole = mockConsole(t);
  window.location.hash = `#${loggerName}`;

  logToAll();

  expect(mockedConsole.debug.mock.calls.length).toBe(0);
  expect(mockedConsole.info.mock.calls.length).toBe(1);
  expect(mockedConsole.warn.mock.calls.length).toBe(1);
  expect(mockedConsole.error.mock.calls.length).toBe(1);
  expect(mockedConsole.log.mock.calls.length).toBe(1);
});

void test("should log everything above and including level warn when log level is warn", (t) => {
  const mockedConsole = mockConsole(t);
  window.location.hash = `#${loggerName}=warn`;

  logToAll();

  expect(mockedConsole.debug.mock.calls.length).toBe(0);
  expect(mockedConsole.info.mock.calls.length).toBe(0);
  expect(mockedConsole.warn.mock.calls.length).toBe(1);
  expect(mockedConsole.error.mock.calls.length).toBe(1);
  expect(mockedConsole.log.mock.calls.length).toBe(1);
});

void test("should log everything above and including level error when log level is error", (t) => {
  const mockedConsole = mockConsole(t);
  window.location.hash = `#${loggerName}=error`;

  logToAll();

  expect(mockedConsole.debug.mock.calls.length).toBe(0);
  expect(mockedConsole.info.mock.calls.length).toBe(0);
  expect(mockedConsole.warn.mock.calls.length).toBe(0);
  expect(mockedConsole.error.mock.calls.length).toBe(1);
  expect(mockedConsole.log.mock.calls.length).toBe(1);
});

void test("should log on debug when log level is debug", (t) => {
  const mockedConsole = mockConsole(t);
  window.location.hash = `#${loggerName}=debug`;

  LoggerProvider.getLogger("loggerName").debug(someMessage);

  expect(mockedConsole.debug.mock.calls[0].arguments).toStrictEqual([contextPrefix, someMessage]);
});

void test("should log on info when log level is info", (t) => {
  const mockedConsole = mockConsole(t);
  window.location.hash = `#${loggerName}=info`;

  LoggerProvider.getLogger("loggerName").info(someMessage);

  expect(mockedConsole.info.mock.calls[0].arguments).toStrictEqual([contextPrefix, someMessage]);
});

void test("should log on warn when log level is warn", (t) => {
  const mockedConsole = mockConsole(t);
  window.location.hash = `#${loggerName}=warn`;

  LoggerProvider.getLogger("loggerName").warn(someMessage);

  expect(mockedConsole.warn.mock.calls[0].arguments).toStrictEqual([contextPrefix, someMessage]);
});

void test("should log on error when log level is error", (t) => {
  const mockedConsole = mockConsole(t);
  window.location.hash = `#${loggerName}=error`;

  LoggerProvider.getLogger("loggerName").error(someMessage);

  expect(mockedConsole.error.mock.calls[0].arguments).toStrictEqual([contextPrefix, someMessage]);
});

void test("should log on debug when root logger is on debug", (t) => {
  const mockedConsole = mockConsole(t);
  window.location.hash = "#ckdebug=debug";

  LoggerProvider.getLogger("loggerName").debug(someMessage);

  expect(mockedConsole.debug.mock.calls[0].arguments).toStrictEqual([contextPrefix, someMessage]);
});

void test("Backwards compatibility: Should accept verbose as alias for debug", (t) => {
  const mockedConsole = mockConsole(t);
  window.location.hash = "#ckdebug=verbose";

  LoggerProvider.getLogger("loggerName").debug(someMessage);

  expect(mockedConsole.debug.mock.calls[0].arguments).toStrictEqual([contextPrefix, someMessage]);
});

void test("should log on all but debug when root logger is enabled without explicit level", (t) => {
  const mockedConsole = mockConsole(t);
  window.location.hash = "#ckdebug";

  logToAll();

  expect(mockedConsole.debug.mock.calls.length).toBe(0);
  expect(mockedConsole.info.mock.calls.length).toBe(1);
  expect(mockedConsole.warn.mock.calls.length).toBe(1);
  expect(mockedConsole.error.mock.calls.length).toBe(1);
  expect(mockedConsole.log.mock.calls.length).toBe(1);
});

void test("should log on logger name level when logger name and ckdebug are specified", (t) => {
  const mockedConsole = mockConsole(t);
  window.location.hash = "#ckdebug=debug&loggerName=info";

  LoggerProvider.getLogger("loggerName").info(someMessage);
  LoggerProvider.getLogger("loggerName").debug("Logging stuff on debug");

  expect(mockedConsole.info.mock.calls[0].arguments).toStrictEqual([contextPrefix, someMessage]);
  expect(mockedConsole.debug.mock.calls.length).toBe(0);
});

/**
 * Logs one message for each log level.
 */
function logToAll(): void {
  LoggerProvider.getLogger(loggerName).debug(someMessage);
  LoggerProvider.getLogger(loggerName).info(someMessage);
  LoggerProvider.getLogger(loggerName).warn(someMessage);
  LoggerProvider.getLogger(loggerName).error(someMessage);
  LoggerProvider.getLogger(loggerName).log(someMessage);
}
