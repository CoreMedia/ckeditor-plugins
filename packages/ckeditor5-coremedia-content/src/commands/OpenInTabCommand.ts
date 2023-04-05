import { Command, Editor } from "@ckeditor/ckeditor5-core";
import {
  isModelUriPath,
  isUriPath,
  requireContentUriPath,
  UriPath,
} from "@coremedia/ckeditor5-coremedia-studio-integration/content/UriPath";
import LoggerProvider from "@coremedia/ckeditor5-logging/logging/LoggerProvider";
import { canBeOpenedInTab, openEntitiesInTabs, OpenEntitiesInTabsResult } from "../OpenInTab";

// noinspection JSConstantReassignment
/**
 * A command for opening contents in a tab.
 *
 * By default, has no value and is always enabled. Provides method
 * `refreshValueAndEnabledState` to update value and enabled state
 * based on the given value. This method are meant to be invoked
 * by extending commands.
 *
 * The command itself, without further adaptations, may be used to
 * directly open commands via `execute()` method. As the value is
 * not updated by default, it is expected that URI paths to open are
 * given explicitly then.
 *
 * @augments module:core/command~Command
 */
export class OpenInTabCommand extends Command {
  static #logger = LoggerProvider.getLogger("OpenInTabCommand");

  /**
   * Constructor.
   *
   * @param editor - editor instance the command is bound to.
   */
  constructor(editor: Editor) {
    super(editor);
    // We don't modify any data.
    // @ts-expect-error - Bad typings. Setting `affectsData` is `protected`.
    this.affectsData = false;
  }

  /**
   * Updates the value and enabled state.
   *
   * Only if `valueFromModel` resolves to a content URI, the value of this
   * command is set accordingly, otherwise set to `undefined`.
   *
   * Enabled state in addition to that respects if a referenced content
   * can be opened. Due to asynchronous behavior to validate content, meanwhile,
   * a default enabled state is assumed.
   *
   * @param valueFromModel - value as retrieved from the model
   * @param defaultEnabled - default enabled state to take, until ability to
   * open a given content has been checked.
   */
  protected refreshValueAndEnabledState(valueFromModel: unknown, defaultEnabled = true): void {
    const logger = OpenInTabCommand.#logger;
    const uriPath = this.refreshValue(valueFromModel);

    // If this is not a content URI, no further checks are required if the
    // OpenInTabCommand is active or not.
    if (!uriPath) {
      this.isEnabled = false;
      logger.debug(`Disabled command, as URI Path is unavailable for: ${valueFromModel}`);
      return;
    }

    this.isEnabled = defaultEnabled;
    logger.debug(`Enabled state set to default: ${defaultEnabled}`);

    void canBeOpenedInTab(uriPath).then((canBeOpened): void => {
      logger.debug(`Updating enabled state for ${uriPath} to: ${canBeOpened}`);
      this.isEnabled = canBeOpened;
    });
  }

  /**
   * Refreshes the command value according to the provided value. Value will
   * be set to `undefined` if the given value from the model does not represent
   * a valid URI Path.
   *
   * @param valueFromModel - value found in model
   * @returns value set
   */
  protected refreshValue(valueFromModel: unknown): string | undefined {
    const logger = OpenInTabCommand.#logger;
    const uriPath = OpenInTabCommand.#toContentUri(valueFromModel);
    this.value = uriPath;
    logger.debug(`Value refreshed to: ${uriPath}`);
    return uriPath;
  }

  /**
   * Executes command, either based on URI path set as value or as URI path
   * given as parameter. Any `uriPath` set explicitly, overrides `uriPath`
   * derived from model state.
   *
   * @param uriPaths - optional URI paths; defaults to the URI path from model
   * state
   * @returns Promise, that denotes result of requested URIs to open
   */
  override async execute(...uriPaths: string[]): Promise<OpenEntitiesInTabsResult> {
    const logger = OpenInTabCommand.#logger;
    const actualUriPaths = uriPaths;
    const actualValue = this.value;

    // Prefer explicitly given uriPaths, use fallback otherwise.
    if (actualUriPaths.length === 0 && typeof actualValue === "string") {
      actualUriPaths.push(actualValue);
      logger.debug(`URI path used from model state: ${actualValue}`);
    }

    return openEntitiesInTabs(...actualUriPaths);
  }

  /**
   * Takes an attribute value and returns a plain content uri.
   *
   * Supports the following input formats:
   *  - content/\{id\}
   *  - content:\{id\}
   *  - content/\{id\}#properties.\{propertyName\}
   *  - content:\{id\}#properties.\{propertyName\}
   *
   * In case the input is of one of these formats, the output is always
   * a UriPath (content/\{id\}). Otherwise undefined is returned.
   *
   * @param contentUriToParse - the URI string to parse
   * @returns transformed UriPath or undefined if the input string is a non-supported format.
   */
  static #toContentUri(contentUriToParse: unknown): UriPath | undefined {
    if (!isUriPath(contentUriToParse) && !isModelUriPath(contentUriToParse)) {
      return undefined;
    }

    const contentUriAndPropertiesPart = contentUriToParse.split("#");
    return requireContentUriPath(contentUriAndPropertiesPart[0]);
  }
}
