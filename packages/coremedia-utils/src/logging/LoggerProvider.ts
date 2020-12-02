import Logger from "./Logger";
import LoggerImpl from "./LoggerImpl";
import { LogLevel } from "./LogLevel";

export default class LoggerProvider {
  static defaultLogLevel: LogLevel = LogLevel.INFO;
  static defaultRootLogLevel: LogLevel = LogLevel.WARN;
  static rootLoggerName: string = "ckdebug";
  static hashParamRegExp: RegExp = /([^=]*)=(.*)/;

  static getLogger(name: string | undefined, ...context: any[]): Logger {
    let contextName: string = context.join(".");
    let loggerName: string | undefined = (!!name && !!contextName) ? contextName + ":" + name : name;
    let logLevel: LogLevel = LoggerProvider.getLoggerLevel(name);

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
    let logLevelParam: string | boolean = LoggerProvider.getHashParam(name);
    let rootLogLevel: string | boolean = LoggerProvider.getHashParam(LoggerProvider.rootLoggerName);
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
   * @return the corresponding level
   * @private
   */
  static toLogLevel(nameOrSwitch: string | boolean): LogLevel {
    if (typeof nameOrSwitch === 'boolean') {
      return nameOrSwitch ? LoggerProvider.defaultLogLevel : LogLevel.NONE;
    }
    switch ((<string>nameOrSwitch).toLowerCase()) {
      case 'verbose': {
        // Fallback for older CKEditor versions released with CoreMedia CMS.
        return LogLevel.DEBUG;
      }
      case 'none': {
        return LogLevel.NONE;
      }
      case 'debug': {
        return LogLevel.DEBUG;
      }
      case 'info': {
        return LogLevel.INFO;
      }
      case 'warn': {
        return LogLevel.WARN;
      }
      case 'error': {
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
