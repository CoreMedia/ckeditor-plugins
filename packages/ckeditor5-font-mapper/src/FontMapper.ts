import { Plugin } from "@ckeditor/ckeditor5-core";
import { ClipboardPipeline, ClipboardEventData } from "@ckeditor/ckeditor5-clipboard";
import Logger from "@coremedia/ckeditor5-logging/logging/Logger";
import LoggerProvider from "@coremedia/ckeditor5-logging/logging/LoggerProvider";
import { ViewDocumentFragment, DataTransfer as ViewDataTransfer } from "@ckeditor/ckeditor5-engine";
import { EventInfo } from "@ckeditor/ckeditor5-utils";
import { reportInitEnd, reportInitStart } from "@coremedia/ckeditor5-core-common/Plugins";
import { fontMappingRegistry } from "./FontMappingRegistry";
import { replaceFontInDocumentFragment } from "./FontReplacer";
import { Mode } from "./FontMapping";

export const COREMEDIA_FONT_MAPPER_CONFIG_KEY = "coremedia:fontMapper";
export interface FontMapperConfigEntry {
  font: string;
  mode?: Mode;
  map: Record<number, string>;
}

type FontMapperConfig = FontMapperConfigEntry[];

/**
 * This plugin maps characters of a given font-family to their alternative
 * representation. For example, for the Symbol font characters might be replaced
 * by their Unicode equivalents.
 *
 * When detecting a given font in the font-family style attribute, the
 * replacement for all characters inside the element will be performed
 * recursively &mdash; until a nested element is found that overrides the
 * font-family.
 *
 * Upon processing, font-family style settings will be removed from the element,
 * if it matches the given font-family.
 *
 * *Configuration:*
 *
 * The font-name will be a full match (i.e. not partial), ignoring the case.
 * It is also located within a set of alternative font-families &mdash;
 * and again, on match, the complete font-family setting will be removed.
 *
 * The replacement map has keys denoting the character code and contains the
 * corresponding HTML replacement to use instead. Mind that the HTML replacement
 * (typically entities) must be already encoded. The replacement will be taken
 * as is.
 *
 * In addition to this, the custom replacement map might denote how to combine
 * with the default setting by specifying an attribute `mode` which defaults to
 * add/override but might be set to `"replace"` in order to specify a completely
 * different mapping.
 *
 * Special care has been taken for the characters ampersand (`&amp;`),
 * less-than (`&lt;`) and greater-than (`&gt;`): Unless you explicitly override
 * the replacement, it is ensured that they are also encoded after the mapping
 * has been applied.
 */
export default class FontMapper extends Plugin {
  static readonly pluginName: string = "FontMapper";
  static readonly #logger: Logger = LoggerProvider.getLogger(FontMapper.pluginName);

  static readonly #supportedDataFormat: string = "text/html";
  static readonly #clipboardEventName: string = "inputTransformation";

  static readonly requires = [ClipboardPipeline];

  init(): void {
    const initInformation = reportInitStart(this);

    const editor = this.editor;
    const customFontMapperConfig: FontMapperConfig | undefined = editor.config.get(
      COREMEDIA_FONT_MAPPER_CONFIG_KEY
    ) as FontMapperConfig;
    FontMapper.#applyPluginConfig(customFontMapperConfig);

    // We need to handle the input event AFTER it has been processed by the pasteFromOffice plugin (uses "high" priority), if enabled.
    // We also need to use a priority higher than "low" to process the input in time.
    if (editor.plugins.has(ClipboardPipeline)) {
      const clipboardPipeline = editor.plugins.get(ClipboardPipeline);
      this.listenTo(
        clipboardPipeline,
        FontMapper.#clipboardEventName,
        FontMapper.#handleClipboardInputTransformationEvent,
        {
          priority: "normal",
        }
      );
    }

    reportInitEnd(initInformation);
  }

  /**
   * Registers all FontMappings from this plugin's configuration in the {@link FontMappingRegistry}.
   *
   * @param config - the configuration for this plugin
   */
  static #applyPluginConfig(config: FontMapperConfig | undefined): void {
    const logger = FontMapper.#logger;

    if (!config) {
      logger.debug("Configuration: No additional configuration found");
      return;
    }

    config.forEach((configEntry: FontMapperConfigEntry) => {
      logger.debug(`Configuration: Register Mapping for ${configEntry.font}`);
      fontMappingRegistry.registerFontMapping(configEntry);
    });
  }

  // noinspection JSUnusedLocalSymbols
  static #handleClipboardInputTransformationEvent(eventInfo: EventInfo, data: ClipboardInputEvent): void {
    FontMapper.#logger.debug("Event received with data", data);
    const pastedContent: string = data.dataTransfer.getData(FontMapper.#supportedDataFormat);
    const eventContent: ViewDocumentFragment | undefined = data.content;
    if (!pastedContent || !eventContent) {
      FontMapper.#logger.debug(`No data for supported data Format ${FontMapper.#supportedDataFormat} found.`);
      return;
    }

    FontMapper.#logger.debug("Starting to replace fonts.");
    replaceFontInDocumentFragment(eventContent);
    data.content = eventContent;
  }
}

/**
 * Event data of `clipboardInput` event in `view.Document`.
 */
declare interface ClipboardInputEvent extends ClipboardEventData {
  dataTransfer: ViewDataTransfer;
  content?: ViewDocumentFragment;
}
