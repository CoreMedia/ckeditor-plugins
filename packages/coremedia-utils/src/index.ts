/**
 * This namespace provides some utility methods.
 */
export namespace coremedia {
  export class Logger {
    private readonly name: string | undefined;
    private readonly logLevel: Level;

    constructor(name: string | undefined, logLevel: Level) {
      this.name = name;
      this.logLevel = logLevel;
    }

    private addContext(data: any[]): any[] {
      if (name === undefined) {
        return data;
      }
      let contextualData: any[] = [this.name + ':'];
      return contextualData.concat(data);
    }

    isDebugEnabled(): boolean {
      return this.logLevel <= Level.DEBUG;
    }

    debug(...data: any[]): void {
      this.isDebugEnabled() && console.debug(this.addContext(data));
    }

    isInfoEnabled(): boolean {
      return this.logLevel <= Level.INFO;
    }

    info(...data: any[]): void {
      this.isInfoEnabled() && console.info(this.addContext(data));
    }

    isWarnEnabled(): boolean {
      return this.logLevel <= Level.WARN;
    }

    warn(...data: any[]): void {
      this.isWarnEnabled() && console.warn(this.addContext(data));
    }

    isErrorEnabled(): boolean {
      return this.logLevel <= Level.ERROR;
    }

    error(...data: any[]): void {
      this.isErrorEnabled() && console.error(this.addContext(data));
    }

    isEnabled(): boolean {
      return this.logLevel === Level.NONE;
    }

    log(...data: any[]): void {
      this.isEnabled() && console.log(this.addContext(data));
    }
  }

  enum Level {
    DEBUG,
    INFO,
    WARN,
    ERROR,
    NONE
  }

  const defaultLogLevel: Level = Level.INFO;
  const defaultRootLogLevel: Level = Level.WARN;
  const rootLoggerName: string = "ckdebug";
  const hashParamRegExp: RegExp = /([^=]*)=(.*)/;

  export function getLogger(name: string | undefined, ...context: any[]): Logger {
    let contextName: string = context.join(".");
    let loggerName: string | undefined = (!!name && !!contextName) ? contextName + ":" + name : name;
    let logLevel: Level = getLoggerLevel(name);

    return new Logger(loggerName, logLevel);
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
  function getLoggerLevel(name: string | undefined): Level {
    let logLevelParam: string | boolean = getHashParam(name);
    let rootLogLevel: string | boolean = getHashParam(rootLoggerName);
    let logLevel: Level = defaultRootLogLevel;

    if (!!logLevelParam) {
      logLevel = toLogLevel(logLevelParam);
    } else if (!!rootLogLevel) {
      logLevel = toLogLevel(rootLogLevel);
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
  function toLogLevel(nameOrSwitch: string | boolean): Level {
    if (typeof nameOrSwitch === 'boolean') {
      return nameOrSwitch ? defaultLogLevel : Level.NONE;
    }
    switch ((<string>name).toLowerCase()) {
      case 'verbose': {
        // Fallback for older CKEditor versions released with CoreMedia CMS.
        return Level.DEBUG;
      }
      case 'none': {
        return Level.NONE;
      }
      case 'debug': {
        return Level.DEBUG;
      }
      case 'info': {
        return Level.INFO;
      }
      case 'warn': {
        return Level.WARN;
      }
      case 'error': {
        return Level.ERROR;
      }
      default: {
        // Log-Level change requested, thus, we assume that you want at least
        // info logging.
        return defaultLogLevel;
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
  export function getHashParam(key: string | undefined): string | boolean {
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
        const paramMatch: RegExpExecArray | null = hashParamRegExp.exec(hashParam);
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
