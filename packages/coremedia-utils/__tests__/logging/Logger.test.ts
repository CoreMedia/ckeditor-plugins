import LoggerProvider from "../../src/logging/LoggerProvider";

test('should log on debug when log level is debug', () => {
  console.debug = jest.fn();
  window.location.hash="#myLogger=debug";

  let logger = LoggerProvider.getLogger("myLogger");
  logger.debug("I'm logging stuff");

  expect(console.debug).toHaveBeenCalledWith(["myLogger:", "I'm logging stuff"])
});
