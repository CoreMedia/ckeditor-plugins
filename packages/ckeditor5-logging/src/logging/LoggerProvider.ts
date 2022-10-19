import Logger from "./Logger";
import LoggerImpl from "./LoggerImpl";
import LogLevel from "./LogLevel";

/**
 * Used to retrieve a named logger instance.
 *
 * Loggers can be triggered by hash-parameters. To control the log level of
 * all loggers (also known as root logger), you may use the hash parameter
 * `ckdebug` and for more verbose output `ckdebug=verbose`.
 * In addition to that, you can control the output of any logger using
 * `loggerName=level`.
 *
 * @example
 * ```
 * private readonly logger: Logger =
 *   LoggerProvider.getLogger(SymbolOnPasteMapper.pluginName);
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export default class LoggerProvider {
  static readonly #verbose = "verbose";
  static readonly #none = "none";
  static readonly #debug = "debug";
  static readonly #info = "info";
  static readonly #warn = "warn";
  static readonly #error = "error";

  static readonly #defaultLogLevel: LogLevel = LogLevel.INFO;
  static readonly #defaultRootLogLevel: LogLevel = LogLevel.WARN;
  static readonly #rootLoggerName = "ckdebug";
  static readonly #hashParamRegExp = /([^=]*)=(.*)/;

  // noinspection JSUnusedLocalSymbols
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {
    // This is just a utility class. Must not be instantiated.
  }

  /**
   * Retrieve logger for the given name.
   *
   * @param name - some identifying name for the logger; used to toggle logging behavior
   * @param context - additional context, which will prefix the logger name in output (dot separated)
   */
  static getLogger(name: string | undefined, ...context: unknown[]): Logger {
    const contextName: string = context.join(".");
    const loggerName: string | undefined = !!name && !!contextName ? `${contextName}:${name}` : name;
    const logLevel: LogLevel = LoggerProvider.#getLoggerLevel(name);

    return new LoggerImpl(loggerName, logLevel);
  }

  /**
   * Gets the logger for a given (base) name. While you may adjust the
   * log level for specific logger name by an explicit hash-parameter,
   * the fallback is to use the root-logger-name.
   *
   * @param name - (base) name of the logger; if `undefined` explicit log-level
   * switching by name will not be available, thus,  only `ckdebug` can be used.
   */
  static #getLoggerLevel(name: string | undefined): LogLevel {
    const logLevelParam: string | boolean = LoggerProvider.#getHashParam(name);
    const rootLogLevel: string | boolean = LoggerProvider.#getHashParam(LoggerProvider.#rootLoggerName);
    let logLevel: LogLevel = LoggerProvider.#defaultRootLogLevel;

    if (logLevelParam) {
      logLevel = LoggerProvider.#toLogLevel(logLevelParam);
    } else if (rootLogLevel) {
      logLevel = LoggerProvider.#toLogLevel(rootLogLevel);
    }

    return logLevel;
  }

  /**
   * Converts the name or switch to a corresponding log-level.
   *
   * The value `verbose` is equivalent to `debug`
   * for compatibility reasons.
   *
   * If of type boolean, you will either get the default log level for
   * `true`, or log level `none` if the value is `false`.
   *
   * @param nameOrSwitch - log-level name
   * @returns the corresponding level
   */
  static #toLogLevel(nameOrSwitch: string | boolean): LogLevel {
    if (typeof nameOrSwitch === "boolean") {
      return nameOrSwitch ? LoggerProvider.#defaultLogLevel : LogLevel.NONE;
    }
    switch (nameOrSwitch.toLowerCase()) {
      case this.#verbose: {
        // Fallback for older CKEditor versions released with CoreMedia CMS.
        return LogLevel.DEBUG;
      }
      case this.#none: {
        return LogLevel.NONE;
      }
      case this.#debug: {
        return LogLevel.DEBUG;
      }
      case this.#info: {
        return LogLevel.INFO;
      }
      case this.#warn: {
        return LogLevel.WARN;
      }
      case this.#error: {
        return LogLevel.ERROR;
      }
      default: {
        // Log-Level change requested, thus, we assume that you want at least
        // info logging.
        return LoggerProvider.#defaultLogLevel;
      }
    }
  }

  /**
   * Get the given hash parameter value from the given url
   * @param key - the hash parameter key to read; `undefined` will always
   * return `false`
   * @returns false iff. hash parameter is not set; true iff. the hash parameter is given without
   * arguments; string value otherwise
   */
  static #getHashParam(key: string | undefined): string | boolean {
    // Check for `window`: Required when used from within Jest tests, where
    // 'jsdom' is not available.
    if (key === undefined || typeof window === "undefined") {
      return false;
    }
    if (window.location?.hash) {
      // substring: Remove hash
      const hash: string = window.location.hash.substring(1);
      const hashParams: string[] = hash.split(/&/);
      for (const hashParam of hashParams) {
        if (key === hashParam) {
          return true;
        }
        const paramMatch: RegExpExecArray | null = LoggerProvider.#hashParamRegExp.exec(hashParam);
        if (paramMatch) {
          if (paramMatch[1] === key) {
            // Map empty String to truthy value.
            return paramMatch[2] || true;
          }
        }
      }
    }
    return false;
  }
}
