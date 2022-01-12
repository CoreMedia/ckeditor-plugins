/**
 * Log Levels to use. This includes the artificial level
 * `none` to suppress output by a given logger.
 */
enum LogLevel {
  /**
   * Level for debug and above output.
   */
  DEBUG,
  /**
   * Level for info and above output.
   */
  INFO,
  /**
   * Level for warn and above output.
   */
  WARN,
  /**
   * Level for error output.
   */
  ERROR,
  /**
   * Artificial level to disable logging.
   */
  NONE,
}

export default LogLevel;
