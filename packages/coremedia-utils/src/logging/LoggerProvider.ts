import Logger from "./Logger";
import LoggerImpl from "./LoggerImpl";
import { LogLevel } from "./LogLevel";

/**
 * <p>
 * Used to retrieve a named logger instance.
 * </p>
 * <p>
 * Loggers can be triggered by hash-parameters. To control the log level of
 * all loggers (also known as root logger), you may use the hash parameter
 * <code>ckdebug</code> and for more verbose output <code>ckdebug=verbose</code>.
 * In addition to that, you can control the output of any logger using
 * <code>loggerName=level</code>.
 * </p>
 * <p><strong>Example:</strong></p>
 * <pre>
 * private readonly logger: Logger =
 *   LoggerProvider.getLogger(SymbolOnPasteMapper.pluginName);
 * </pre>
 */
export default class LoggerProvider {
  private static readonly _verbose = "verbose";
  private static readonly _none = "none";
  private static readonly _debug = "debug";
  private static readonly _info = "info";
  private static readonly _warn = "warn";
  private static readonly _error = "error";

  static defaultLogLevel: LogLevel = LogLevel.INFO;
  static defaultRootLogLevel: LogLevel = LogLevel.WARN;
  static rootLoggerName = "ckdebug";
  static hashParamRegExp = /([^=]*)=(.*)/;

  /**
   * Retrieve logger for the given name.
   * @param name
   * @param context
   */
  static getLogger(name: string | undefined, ...context: any[]): Logger {
    const contextName: string = context.join(".");
    const loggerName: string | undefined = !!name && !!contextName ? contextName + ":" + name : name;
    const logLevel: LogLevel = LoggerProvider.getLoggerLevel(name);

    return new LoggerImpl(loggerName, logLevel);
  }

  /**
   * Gets the logger for a given (base) name. While you may adjust the
   * log level for specific logger name by an explicit hash-parameter,
   * the fallback is to use the root-logger-name.
   *
   * @param name (base) name of the logger; if <code>undefined</code> explicit log-level
   * switching by name will not be available, thus,  only <code>ckdebug</code> can be used.
   * @private
   */
  static getLoggerLevel(name: string | undefined): LogLevel {
    const logLevelParam: string | boolean = LoggerProvider.getHashParam(name);
    const rootLogLevel: string | boolean = LoggerProvider.getHashParam(LoggerProvider.rootLoggerName);
    let logLevel: LogLevel = LoggerProvider.defaultRootLogLevel;

    if (!!logLevelParam) {
      logLevel = LoggerProvider.toLogLevel(logLevelParam);
    } else if (!!rootLogLevel) {
      logLevel = LoggerProvider.toLogLevel(rootLogLevel);
    }

    return logLevel;
  }

  /**
   * <p>
   * Converts the name or switch to a corresponding log-level.
   * </p>
   * <p>
   * The value <code>verbose</code> is equivalent to <code>debug</code>
   * for compatibility reasons.
   * </p>
   * <p>
   * If of type boolean, you will either get the default log level for
   * <code>true</code>, or log level <code>none</code> if the value is
   * <code>false</code>.
   * </p>
   *
   * @param nameOrSwitch log-level name
   * @returns the corresponding level
   * @private
   */
  static toLogLevel(nameOrSwitch: string | boolean): LogLevel {
    if (typeof nameOrSwitch === "boolean") {
      return nameOrSwitch ? LoggerProvider.defaultLogLevel : LogLevel.NONE;
    }
    switch (nameOrSwitch.toLowerCase()) {
      case this._verbose: {
        // Fallback for older CKEditor versions released with CoreMedia CMS.
        return LogLevel.DEBUG;
      }
      case this._none: {
        return LogLevel.NONE;
      }
      case this._debug: {
        return LogLevel.DEBUG;
      }
      case this._info: {
        return LogLevel.INFO;
      }
      case this._warn: {
        return LogLevel.WARN;
      }
      case this._error: {
        return LogLevel.ERROR;
      }
      default: {
        // Log-Level change requested, thus, we assume that you want at least
        // info logging.
        return LoggerProvider.defaultLogLevel;
      }
    }
  }

  /**
   * Get the given hash parameter value from the given url
   * @param {string|undefined} key the hash parameter key to read; <code>undefined</code> will always
   * return <code>false</code>
   * @returns {string/boolean} false iff. hash parameter is not set; true iff. the hash parameter is given without
   * arguments; string value otherwise
   */
  static getHashParam(key: string | undefined): string | boolean {
    if (key === undefined) {
      return false;
    }
    if (window.location && window.location.hash) {
      // substring: Remove hash
      const hash: string = window.location.hash.substring(1);
      const hashParams: string[] = hash.split(/[&]/);
      for (let i = 0; i < hashParams.length; i++) {
        const hashParam: string = hashParams[i];
        if (key === hashParam) {
          return true;
        }
        const paramMatch: RegExpExecArray | null = LoggerProvider.hashParamRegExp.exec(hashParam);
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
