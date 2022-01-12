import LogLevel from "./LogLevel";

/**
 * Used to log at given levels.
 */
export default interface Logger {
  /**
   * Check if logging of given level or below is enabled.
   *
   * @param logLevel level to validate
   * @returns `true`, if logging at given level (or below) is enabled; `false` otherwise.
   */
  isEnabled(logLevel: LogLevel): boolean;

  /**
   * Check, if debug logging is enabled.
   *
   * @returns `true`, if debug logging is enabled; `false` otherwise.
   */
  isDebugEnabled(): boolean;

  /**
   * Logs the given data at debug level if enabled.
   *
   * @param data data to log, such as a message and some objects.
   */
  debug(...data: unknown[]): void;

  /**
   * Check, if info logging or below is enabled.
   *
   * @returns `true`, if info logging (or below) is enabled; `false` otherwise.
   */
  isInfoEnabled(): boolean;

  /**
   * Logs the given data at info level if enabled.
   *
   * @param data data to log, such as a message and some objects.
   */
  info(...data: unknown[]): void;

  /**
   * Check, if warn logging or below is enabled.
   *
   * @returns `true`, if warn logging (or below) is enabled; `false` otherwise.
   */
  isWarnEnabled(): boolean;

  /**
   * Logs the given data at warn level if enabled.
   *
   * @param data data to log, such as a message and some objects.
   */
  warn(...data: unknown[]): void;

  /**
   * Check, if error logging or below is enabled.
   *
   * @returns `true`, if error logging (or below) is enabled; `false` otherwise.
   */
  isErrorEnabled(): boolean;

  /**
   * Logs the given data at error level if enabled.
   *
   * @param data data to log, such as a message and some objects.
   */
  error(...data: unknown[]): void;

  /**
   * Check, if logging is enabled in general.
   *
   * @returns `true`, if logging is enabled; `false` otherwise.
   */
  isAnyEnabled(): boolean;

  /**
   * Logs the given data at if logging is enabled. Thus, unless the log level
   * is set to _none_, this will be logged.
   *
   * @param data data to log, such as a message and some objects.
   */
  log(...data: unknown[]): void;
}
