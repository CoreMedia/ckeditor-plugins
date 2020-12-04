/**
 * Used to log at given levels.
 */
export default interface Logger {
  /**
   * Check, if debug logging is enabled.
   *
   * @returns <code>true</code>, if debug logging is enabled; <code>false</code> otherwise.
   */
  isDebugEnabled(): boolean;

  /**
   * Logs the given data at debug level if enabled.
   *
   * @param data data to log, such as a message and some objects.
   */
  debug(...data: any[]): void;

  /**
   * Check, if info logging or below is enabled.
   *
   * @returns <code>true</code>, if info logging (or below) is enabled; <code>false</code> otherwise.
   */
  isInfoEnabled(): boolean;

  /**
   * Logs the given data at info level if enabled.
   *
   * @param data data to log, such as a message and some objects.
   */
  info(...data: any[]): void;

  /**
   * Check, if warn logging or below is enabled.
   *
   * @returns <code>true</code>, if warn logging (or below) is enabled; <code>false</code> otherwise.
   */
  isWarnEnabled(): boolean;

  /**
   * Logs the given data at warn level if enabled.
   *
   * @param data data to log, such as a message and some objects.
   */
  warn(...data: any[]): void;

  /**
   * Check, if error logging or below is enabled.
   *
   * @returns <code>true</code>, if error logging (or below) is enabled; <code>false</code> otherwise.
   */
  isErrorEnabled(): boolean;

  /**
   * Logs the given data at error level if enabled.
   *
   * @param data data to log, such as a message and some objects.
   */
  error(...data: any[]): void;

  /**
   * Check, if logging is enabled in general.
   *
   * @returns <code>true</code>, if logging is enabled; <code>false</code> otherwise.
   */
  isEnabled(): boolean;

  /**
   * Logs the given data at if logging is enabled.
   *
   * @param data data to log, such as a message and some objects.
   */
  log(...data: any[]): void;
}
