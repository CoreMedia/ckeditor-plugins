import LoggerProvider from "../../src/logging/LoggerProvider";

test('should log nothing when log level is none', () => {
  setupConsoleMocks();

  window.location.hash="#loggerName=none";

  LoggerProvider.getLogger("loggerName").debug("I'm logging stuff");

  expect(console.debug).toHaveBeenCalledTimes(0);
  expect(console.log).toHaveBeenCalledTimes(0);
  expect(console.info).toHaveBeenCalledTimes(0);
  expect(console.warn).toHaveBeenCalledTimes(0);
  expect(console.error).toHaveBeenCalledTimes(0);
});

test('should log on debug when log level is debug', () => {
  setupConsoleMocks();

  window.location.hash="#loggerName=debug";

  LoggerProvider.getLogger("loggerName").debug("I'm logging stuff");

  expect(console.debug).toHaveBeenCalledWith(["loggerName:", "I'm logging stuff"])
});

test('should log on info when log level is info', () => {
  setupConsoleMocks();

  window.location.hash="#loggerName=info";

  LoggerProvider.getLogger("loggerName").info("I'm logging stuff");

  expect(console.info).toHaveBeenCalledWith(["loggerName:", "I'm logging stuff"])
});

test('should log on warn when log level is warn', () => {
  setupConsoleMocks();

  window.location.hash="#loggerName=warn";

  LoggerProvider.getLogger("loggerName").warn("I'm logging stuff");

  expect(console.warn).toHaveBeenCalledWith(["loggerName:", "I'm logging stuff"])
});

test('should log on error when log level is error', () => {
  setupConsoleMocks();

  window.location.hash="#loggerName=error";

  LoggerProvider.getLogger("loggerName").error("I'm logging stuff");

  expect(console.error).toHaveBeenCalledWith(["loggerName:", "I'm logging stuff"])
});

test('should log on debug when root logger is on debug', () => {
  setupConsoleMocks();

  window.location.hash="#ckdebug=debug";

  LoggerProvider.getLogger("loggerName").debug("I'm logging stuff");

  expect(console.debug).toHaveBeenCalledWith(["loggerName:", "I'm logging stuff"])
});

test('should log on logger name level when logger name and ckdebug are specified', () => {
  setupConsoleMocks();

  window.location.hash="#ckdebug=debug&loggerName=info";

  LoggerProvider.getLogger("loggerName").info("I'm logging stuff");
  LoggerProvider.getLogger("loggerName").debug("Logging stuff on debug");

  expect(console.info).toHaveBeenCalledWith(["loggerName:", "I'm logging stuff"]);
  expect(console.debug).toHaveBeenCalledTimes(0);
});

function setupConsoleMocks() {
  console.debug = jest.fn();
  console.log = jest.fn();
  console.info = jest.fn();
  console.warn = jest.fn();
  console.error = jest.fn();
}
