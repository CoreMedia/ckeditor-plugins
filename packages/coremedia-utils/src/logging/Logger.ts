export default interface Logger {
  isDebugEnabled(): boolean;

  debug(...data: any[]): void;

  isInfoEnabled(): boolean;
  info(...data: any[]): void;

  isWarnEnabled(): boolean;

  warn(...data: any[]): void;

  isErrorEnabled(): boolean;

  error(...data: any[]): void;

  isEnabled(): boolean;

  log(...data: any[]): void;
}
