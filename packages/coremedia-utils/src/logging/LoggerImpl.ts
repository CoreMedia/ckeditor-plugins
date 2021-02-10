import { LogLevel } from "./LogLevel";
import Logger from "./Logger";

export default class LoggerImpl implements Logger {
  private readonly name: string | undefined;
  private readonly logLevel: LogLevel;

  constructor(name: string | undefined, logLevel: LogLevel) {
    this.name = name;
    this.logLevel = logLevel;
  }

  private out(logFn: (...data: any[]) => void, data: any[]): void {
    const level = logFn.name.toUpperCase();
    const contextPrefix = !!this.name ? ` ${this.name}:` : '';
    const prefix = `[${level}]${contextPrefix}`
    const prefixData: any[] = [prefix];
    const prefixedData: any[] = prefixData.concat(data);
    logFn.apply(null, prefixedData);
  }

  isEnabled(logLevel: LogLevel): boolean {
    return this.logLevel <= logLevel;
  }

  isDebugEnabled(): boolean {
    return this.isEnabled(LogLevel.DEBUG);
  }

  debug(...data: any[]): void {
    this.isDebugEnabled() && this.out(console.debug, data);
  }

  isInfoEnabled(): boolean {
    return this.isEnabled(LogLevel.INFO);
  }

  info(...data: any[]): void {
    this.isInfoEnabled() && this.out(console.info, data);
  }

  isWarnEnabled(): boolean {
    return this.isEnabled(LogLevel.WARN);
  }

  warn(...data: any[]): void {
    this.isWarnEnabled() && this.out(console.warn, data);
  }

  isErrorEnabled(): boolean {
    return this.isEnabled(LogLevel.ERROR);
  }

  error(...data: any[]): void {
    this.isErrorEnabled() && this.out(console.error, data);
  }

  isAnyEnabled(): boolean {
    return this.logLevel !== LogLevel.NONE;
  }

  log(...data: any[]): void {
    this.isAnyEnabled() && this.out(console.log, data);
  }
}
