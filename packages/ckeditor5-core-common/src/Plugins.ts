import { type Logger, LoggerProvider } from "@coremedia/ckeditor5-logging";
import { Editor, Plugin, PluginConstructor, PluginsMap } from "ckeditor5";

const pluginsLogger: Logger = LoggerProvider.getLogger("Plugins");

/**
 * Handler that is invoked if an optional plugin is not available. May be used
 * to file a warning or info on possible effects, for example.
 *
 * The callback will get the plugin name as a parameter that you may use for
 * reporting.
 */
export type OnMissingPlugin = (pluginName: string) => void;

type PluginClassConstructor = typeof Plugin;

export function getOptionalPlugin<TConstructor extends PluginClassConstructor, TContext extends Editor = Editor>(
  editor: TContext,
  key: TConstructor,
  onMissing?: OnMissingPlugin,
): InstanceType<TConstructor> | undefined;

export function getOptionalPlugin<TName extends string, TContext extends Editor = Editor>(
  editor: TContext,
  key: TName,
  onMissing?: OnMissingPlugin,
): PluginsMap[TName] | undefined;
/**
 * Tries to get the recommended plugin (invokes `has` prior to getting it) and
 * returns it, if available.
 *
 * If missing, `undefined` is returned and prior to that optional `onMissing`
 * gets invoked. `onMissing` may be used, to log relevant effects.
 *
 * @param editor - the editor instance to get the plugin from
 * @param key - identifier for the plugin (by name or constructor)
 * @param onMissing - optional callback invoked with plugin name, if plugin
 * is missing. Defaults to some generic message on not found plugin at debug
 * level.
 */
export function getOptionalPlugin(
  editor: Editor,
  key: PluginConstructor<Editor> | string,
  onMissing?: OnMissingPlugin,
) {
  const { plugins } = editor;
  if (plugins.has(key)) {
    if (typeof key === "string") {
      return plugins.get(key);
    } else {
      // @ts-expect-error maybe we should change the type of key to string only
      return plugins.get(key);
    }
  }
  let pluginName: string;
  if (typeof key === "string") {
    pluginName = key;
  } else {
    pluginName = key.pluginName ?? key.name;
  }
  if (onMissing) {
    onMissing(pluginName);
  } else {
    pluginsLogger.debug(`getOptionalPlugin: Queried plugin ${pluginName} is unavailable.`);
  }
  return undefined;
}

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
