import Logger from "@coremedia/ckeditor5-logging/logging/Logger";
import LoggerProvider from "@coremedia/ckeditor5-logging/logging/LoggerProvider";
import Plugin, { PluginClassConstructor, PluginConstructor } from "@ckeditor/ckeditor5-core/src/plugin";

const pluginsLogger: Logger = LoggerProvider.getLogger("Plugins");

/**
 * Error, which signals that a requested plugin could not be found.
 */
export class PluginNotFoundError extends Error {
  readonly #key: PluginClassConstructor;

  /**
   * Constructor.
   *
   * @param key - key of the plugin, which could not be found
   * @param message - error message
   */
  constructor(key: PluginClassConstructor, message: string) {
    super(message);
    Object.setPrototypeOf(this, PluginNotFoundError.prototype);
    this.#key = key;
  }

  /**
   * Provides the key of the plugin, which was searched
   * for unsuccessfully.
   */
  get pluginKey(): PluginClassConstructor {
    return this.#key;
  }

  /**
   * Provides the name of the plugin, which was searched
   * for unsuccessfully.
   */
  get pluginName(): string {
    return this.pluginKey.name;
  }
}

/**
 * Error handler, if plugin could not be found.
 */
export type PluginNotFoundErrorHandler = (e: PluginNotFoundError) => void;

/**
 * Suggested alternative `catch` handler, if a plugin is not found.
 * It will trigger a debug log statement.
 *
 * @param e - error to ignore
 */
export const optionalPluginNotFound: PluginNotFoundErrorHandler = (e: PluginNotFoundError) =>
  pluginsLogger.debug(`Optional plugin '${e.pluginName}' not found.`, e);

/**
 * Provides a `catch` handler, if a recommended plugin is not found.
 * It will trigger a warning log statement and a debug log statement with more details.
 *
 * @param effectIfMissingMessage - optional effect, what will happen if the plugin is missing
 * @param logger - optional logger to use instead of default
 */
export const recommendPlugin = (
  effectIfMissingMessage = "",
  logger: Logger = pluginsLogger
): PluginNotFoundErrorHandler => {
  const messageSuffix = effectIfMissingMessage ? ` ${effectIfMissingMessage}` : "";
  return (e) => {
    const message = `Recommended plugin '${e.pluginName}' not found.${messageSuffix}`;
    logger.warn(message);
    logger.debug(`Details on: ${message}`, e);
  };
};

/**
 * Initialization Information.
 */
export interface InitInformation {
  /**
   * Which plugin is about to be initialized.
   */
  pluginName: string;
  /**
   * Timestamp when initialization started.
   */
  timestamp: number;
}

/**
 * Reports start of plugin initialization and returns the timestamp as provided
 * by `performance.now()` when the message got called.
 *
 * @param plugin - plugin about to be initialized
 * @returns some result to be used in subsequent end notice
 */
export const reportInitStart = (plugin: Plugin): InitInformation => {
  const timestamp: number = performance.now();
  // Workaround https://github.com/Microsoft/TypeScript/issues/3841
  const pluginName = (plugin.constructor as PluginConstructor).pluginName ?? "Unnamed Plugin";
  pluginsLogger.debug(`Initializing ${pluginName}...`);
  return {
    pluginName,
    timestamp,
  };
};

/**
 * Reports end of plugin initialization.
 *
 * @param information - information provided on initialization start
 */
export const reportInitEnd = (information: InitInformation): void => {
  const { pluginName, timestamp } = information;
  pluginsLogger.debug(`Initialized ${pluginName} within ${performance.now() - timestamp} ms.`);
};
