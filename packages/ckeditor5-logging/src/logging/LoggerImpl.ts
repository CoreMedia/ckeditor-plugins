import LogLevel from "./LogLevel";
import Logger from "./Logger";

/**
 * Implementation of Logger.
 *
 * @internal
 */
export default class LoggerImpl implements Logger {
  readonly #name: string | undefined;
  readonly #logLevel: LogLevel;

  constructor(name: string | undefined, logLevel: LogLevel) {
    this.#name = name;
    this.#logLevel = logLevel;
  }

  #out(logFn: (...data: unknown[]) => void, data: unknown[]): void {
    const level = logFn.name.toUpperCase();
    const contextPrefix = this.#name ? ` ${this.#name}:` : "";
    const prefix = `[${level}]${contextPrefix}`;
    const prefixData: unknown[] = [prefix];
    const prefixedData: unknown[] = prefixData.concat(data);
    logFn(...prefixedData);
  }

  isEnabled(logLevel: LogLevel): boolean {
    return this.#logLevel <= logLevel;
  }

  isDebugEnabled(): boolean {
    return this.isEnabled(LogLevel.DEBUG);
  }

  debug(...data: unknown[]): void {
    this.isDebugEnabled() && this.#out(console.debug, data);
  }

  isInfoEnabled(): boolean {
    return this.isEnabled(LogLevel.INFO);
  }

  info(...data: unknown[]): void {
    this.isInfoEnabled() && this.#out(console.info, data);
  }

  isWarnEnabled(): boolean {
    return this.isEnabled(LogLevel.WARN);
  }

  warn(...data: unknown[]): void {
    this.isWarnEnabled() && this.#out(console.warn, data);
  }

  isErrorEnabled(): boolean {
    return this.isEnabled(LogLevel.ERROR);
  }

  error(...data: unknown[]): void {
    this.isErrorEnabled() && this.#out(console.error, data);
  }

  isAnyEnabled(): boolean {
    return this.#logLevel !== LogLevel.NONE;
  }

  log(...data: unknown[]): void {
    this.isAnyEnabled() && this.#out(console.log, data);
  }
}
