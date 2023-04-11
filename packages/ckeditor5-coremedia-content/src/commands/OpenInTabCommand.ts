import { Command, Editor } from "@ckeditor/ckeditor5-core";
import { serviceAgent } from "@coremedia/service-agent";
import { createWorkAreaServiceDescriptor } from "@coremedia/ckeditor5-coremedia-studio-integration/content/WorkAreaServiceDescriptor";
import {
  CONTENT_CKE_MODEL_URI_REGEXP,
  CONTENT_URI_PATH_REGEXP,
  requireContentUriPath,
  UriPath,
} from "@coremedia/ckeditor5-coremedia-studio-integration/content/UriPath";
import LoggerProvider from "@coremedia/ckeditor5-logging/logging/LoggerProvider";

// noinspection JSConstantReassignment
/**
 * The open in tab command.
 * Uses the ServiceAgent to open a content in a CoreMedia Studio tab.
 * Currently used for images and content links.
 *
 * @augments module:core/command~Command
 */
export class OpenInTabCommand extends Command {
  static #logger = LoggerProvider.getLogger("OpenInTabCommand");
  #elementName: string | undefined;
  #attributeName: string;

  /**
   * Creates an OpenInTabCommand.
   *
   * The OpenInTabCommand triggers the WorkAreaService.openEntitiesInTab of the current
   * selected model element, if it is the element this command is registered for.
   *
   * This command only executes if the selected model element has the given
   * elementName and an attribute with the given attributeName.
   *
   * The "isEnabled" property can be used to update the state of any
   * bound ui element and restrict its execution.
   *
   * If no elementName is given, it defaults to undefined. This is a special case
   * for textNodes as textNodes are not represented as elements.
   *
   * @param editor - the ckeditor instance
   * @param attributeName - the name of the attribute which contains the ModelUri.
   * @param elementName - name of the element in the selection containing the Uri-Path attribute. Defaults to undefined.
   */
  constructor(editor: Editor, attributeName: string, elementName: string | undefined = undefined) {
    super(editor);
    this.#elementName = elementName;
    this.#attributeName = attributeName;
  }

  override refresh(): void {
    const logger = OpenInTabCommand.#logger;
    const uriPath = this.#resolveUriPath();
    if (!uriPath) {
      this.isEnabled = false;
      return;
    }

    // Please note: WorkAreaService is not observable and therefore, this command
    // might not update correctly once displayed. You will have to trigger #refresh
    // manually in order to display the correct content state
    // (e.g. of a suddenly unreadable content).
    void serviceAgent.fetchService(createWorkAreaServiceDescriptor()).then((workAreaService): void => {
      workAreaService
        .canBeOpenedInTab([uriPath])
        .then((canBeOpened: unknown) => {
          logger.debug("May be opened in tab: ", canBeOpened);
          this.isEnabled = canBeOpened as boolean;
        })
        .catch((error): void => {
          logger.warn(error);
          this.isEnabled = false;
        });
    });
  }

  override execute(): void {
    const uriPath = this.#resolveUriPath();
    serviceAgent
      .fetchService(createWorkAreaServiceDescriptor())
      .then(async (workAreaService): Promise<void> => {
        await workAreaService.openEntitiesInTabs([uriPath]);
      })
      .catch((): void => {
        console.warn("WorkArea Service not available");
      });
  }

  #resolveUriPath(): UriPath | undefined {
    const selection = this.editor.model.document.selection;
    if (this.#elementName) {
      const selectedElement = selection.getSelectedElement();
      if (!selectedElement) {
        return undefined;
      }

      const name = selectedElement.name;
      if (name !== this.#elementName) {
        return undefined;
      }

      const modelUriAttributeValue: string = selectedElement.getAttribute(this.#attributeName) as string;
      return OpenInTabCommand.#toContentUri(modelUriAttributeValue);
    }

    // If it is a text we have no element, so we have to go for the first position.
    const modelUriAttributeValue = selection.getFirstPosition()?.textNode?.getAttribute(this.#attributeName) as string;
    if (!modelUriAttributeValue) {
      return undefined;
    }
    return OpenInTabCommand.#toContentUri(modelUriAttributeValue);
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
   * @param contentUriToParse - the uri string to parse
   * @returns transformed UriPath or undefined if the input string is a non-supported format.
   */
  static #toContentUri(contentUriToParse: string): UriPath | undefined {
    if (!CONTENT_URI_PATH_REGEXP.test(contentUriToParse) && !CONTENT_CKE_MODEL_URI_REGEXP.test(contentUriToParse)) {
      return undefined;
    }

    const contentUriAndPropertiesPart = contentUriToParse.split("#");
    return requireContentUriPath(contentUriAndPropertiesPart[0]);
  }
}
