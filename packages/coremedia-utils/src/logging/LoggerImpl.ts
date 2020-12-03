import { LogLevel } from "./LogLevel";
import Logger from "./Logger";

export default class LoggerImpl implements Logger {
  private readonly name: string | undefined;
  private readonly logLevel: LogLevel;

  constructor(name: string | undefined, logLevel: LogLevel) {
    this.name = name;
    this.logLevel = logLevel;
  }

  private addContext(data: any[]): any[] {
    if (name === undefined) {
      return data;
    }
    const contextualData: any[] = [this.name + ":"];
    return contextualData.concat(data);
  }

  isDebugEnabled(): boolean {
    return this.logLevel <= LogLevel.DEBUG;
  }

  debug(...data: any[]): void {
    this.isDebugEnabled() && console.debug(this.addContext(data));
  }

  isInfoEnabled(): boolean {
    return this.logLevel <= LogLevel.INFO;
  }

  info(...data: any[]): void {
    this.isInfoEnabled() && console.info(this.addContext(data));
  }

  isWarnEnabled(): boolean {
    return this.logLevel <= LogLevel.WARN;
  }

  warn(...data: any[]): void {
    this.isWarnEnabled() && console.warn(this.addContext(data));
  }

  isErrorEnabled(): boolean {
    return this.logLevel <= LogLevel.ERROR;
  }

  error(...data: any[]): void {
    this.isErrorEnabled() && console.error(this.addContext(data));
  }

  isEnabled(): boolean {
    return this.logLevel === LogLevel.NONE;
  }

  log(...data: any[]): void {
    this.isEnabled() && console.log(this.addContext(data));
  }
}
