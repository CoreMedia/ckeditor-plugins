import LoggerProvider from "../../src/logging/LoggerProvider";

const mockFunctionName: string = 'MOCKCONSTRUCTOR';
const loggerName: string = 'loggerName';
const someMessage: string = "I'm logging stuff";
const contextPrefix: string = `[${mockFunctionName}] ${loggerName}:`;

beforeEach(() => {
  setupConsoleMocks();
});

test('should log nothing when log level is none', () => {
  window.location.hash = `#${loggerName}=none`;

  logToAll();

  expect(console.debug).toHaveBeenCalledTimes(0);
  expect(console.info).toHaveBeenCalledTimes(0);
  expect(console.warn).toHaveBeenCalledTimes(0);
  expect(console.error).toHaveBeenCalledTimes(0);
  expect(console.log).toHaveBeenCalledTimes(0);
});

test('should log everything when log level is debug', () => {
  window.location.hash = `#${loggerName}=debug`;

  logToAll();

  expect(console.debug).toHaveBeenCalledTimes(1);
  expect(console.info).toHaveBeenCalledTimes(1);
  expect(console.warn).toHaveBeenCalledTimes(1);
  expect(console.error).toHaveBeenCalledTimes(1);
  expect(console.log).toHaveBeenCalledTimes(1);
});

test('should log everything above and including level info when log level is info', () => {
  window.location.hash = `#${loggerName}=info`;

  logToAll();

  expect(console.debug).toHaveBeenCalledTimes(0);
  expect(console.info).toHaveBeenCalledTimes(1);
  expect(console.warn).toHaveBeenCalledTimes(1);
  expect(console.error).toHaveBeenCalledTimes(1);
  expect(console.log).toHaveBeenCalledTimes(1);
});

test('should default to info logging for no log level provided', () => {
  window.location.hash = `#${loggerName}`;

  logToAll();

  expect(console.debug).toHaveBeenCalledTimes(0);
  expect(console.info).toHaveBeenCalledTimes(1);
  expect(console.warn).toHaveBeenCalledTimes(1);
  expect(console.error).toHaveBeenCalledTimes(1);
  expect(console.log).toHaveBeenCalledTimes(1);
});

test('should log everything above and including level warn when log level is warn', () => {
  window.location.hash = `#${loggerName}=warn`;

  logToAll();

  expect(console.debug).toHaveBeenCalledTimes(0);
  expect(console.info).toHaveBeenCalledTimes(0);
  expect(console.warn).toHaveBeenCalledTimes(1);
  expect(console.error).toHaveBeenCalledTimes(1);
  expect(console.log).toHaveBeenCalledTimes(1);
});

test('should log everything above and including level error when log level is error', () => {
  window.location.hash = `#${loggerName}=error`;

  logToAll();

  expect(console.debug).toHaveBeenCalledTimes(0);
  expect(console.info).toHaveBeenCalledTimes(0);
  expect(console.warn).toHaveBeenCalledTimes(0);
  expect(console.error).toHaveBeenCalledTimes(1);
  expect(console.log).toHaveBeenCalledTimes(1);
});

test('should log on debug when log level is debug', () => {
  window.location.hash = `#${loggerName}=debug`;

  LoggerProvider.getLogger("loggerName").debug(someMessage);

  expect(console.debug).toHaveBeenCalledWith(contextPrefix, someMessage);
});

test('should log on info when log level is info', () => {
  window.location.hash = `#${loggerName}=info`;

  LoggerProvider.getLogger("loggerName").info(someMessage);

  expect(console.info).toHaveBeenCalledWith(contextPrefix, someMessage);
});

test('should log on warn when log level is warn', () => {
  window.location.hash = `#${loggerName}=warn`;

  LoggerProvider.getLogger("loggerName").warn(someMessage);

  expect(console.warn).toHaveBeenCalledWith(contextPrefix, someMessage);
});

test('should log on error when log level is error', () => {
  window.location.hash = `#${loggerName}=error`;

  LoggerProvider.getLogger("loggerName").error(someMessage);

  expect(console.error).toHaveBeenCalledWith(contextPrefix, someMessage);
});

test('should log on debug when root logger is on debug', () => {
  window.location.hash = "#ckdebug=debug";

  LoggerProvider.getLogger("loggerName").debug(someMessage);

  expect(console.debug).toHaveBeenCalledTimes(1);
});

test('Backwards compatibility: Should accept verbose as alias for debug', () => {
  window.location.hash = "#ckdebug=verbose";

  LoggerProvider.getLogger("loggerName").debug(someMessage);

  expect(console.debug).toHaveBeenCalledTimes(1);
});

test('should log on all but debug when root logger is enabled without explicit level', () => {
  window.location.hash = "#ckdebug";

  logToAll();

  expect(console.debug).toHaveBeenCalledTimes(0);
  expect(console.info).toHaveBeenCalledTimes(1);
  expect(console.warn).toHaveBeenCalledTimes(1);
  expect(console.error).toHaveBeenCalledTimes(1);
  expect(console.log).toHaveBeenCalledTimes(1);
});

test('should log on logger name level when logger name and ckdebug are specified', () => {
  window.location.hash = "#ckdebug=debug&loggerName=info";

  LoggerProvider.getLogger("loggerName").info(someMessage);
  LoggerProvider.getLogger("loggerName").debug("Logging stuff on debug");

  expect(console.info).toHaveBeenCalledWith(contextPrefix, someMessage);
  expect(console.debug).toHaveBeenCalledTimes(0);
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

function setupConsoleMocks(): void {
  console.debug = jest.fn();
  console.log = jest.fn();
  console.info = jest.fn();
  console.warn = jest.fn();
  console.error = jest.fn();
}
