/**
 * Provides a logging facilities, which can be triggered by hash-parameters.
 *
 * To control the log level of all loggers (also known as root logger), you may
 * use the hash parameter `ckdebug` and for more verbose output
 * `ckdebug=verbose`. In addition to that, you can control the output of any
 * logger using `loggerName=level`.
 *
 * @example
 * ```typescript
 * import Logger from "@coremedia/ckeditor5-logging/logging/Logger";
 * import LoggerProvider from "@coremedia/ckeditor5-logging/logging/LoggerProvider";
 * class MyClass {
 *   static readonly #logger: Logger = LoggerProvider.getLogger("MyClass");
 *
 *   execute(): void {
 *     const logger = MyClass.#logger;
 *
 *     logger.info("Starting.");
 *     const result = ...
 *     logger.info("Finished.", { result });
 *   }
 * }
 * ```
 * @module ckeditor5-logging
 */
export * from "./DataDiffer";

export * from "./NormalizedData";

export * from "./Normalizers";
