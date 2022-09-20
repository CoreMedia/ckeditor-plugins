import { Command } from "@ckeditor/ckeditor5-core";
import { serviceAgent } from "@coremedia/service-agent";
import WorkAreaService from "@coremedia/ckeditor5-coremedia-studio-integration/content/studioservices/WorkAreaService";
import WorkAreaServiceDescriptor from "@coremedia/ckeditor5-coremedia-studio-integration/content/WorkAreaServiceDescriptor";
import { requireContentUriPath, UriPath } from "@coremedia/ckeditor5-coremedia-studio-integration/content/UriPath";
import Editor from "@ckeditor/ckeditor5-core/src/editor/editor";
import LoggerProvider from "@coremedia/ckeditor5-logging/logging/LoggerProvider";

/**
 * The open in tab command.
 * Uses the ServiceAgent to open a content in a CoreMedia Studio tab.
 * Currently used for images and content links.
 *
 * @extends module:core/command~Command
 */
export class OpenInTabCommand extends Command {
  static #logger = LoggerProvider.getLogger("OpenInTabCommand");
  #elementName: string | undefined;
  #attributeName: string;

  /**
   * Creates an OpenInTabCommand.
   *
   * The OpenInTabCommand triggers the WorkAreaService.openEntitiesInTab of the current
   * selected model element. if it is the element this command is registered for.
   *
   * This command only executes if the selected model element is the element
   * with the given elementName and has an attribute with the given attributeName.
   *
   * Execution is managed by the property "isEnabled" and UI may be bound to
   * the "isEnabled" property.
   *
   * If no elementName is given it defaults to undefined. This is a special case
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

    // TODO: WorkAreaService is not observable and canBeOpened might evaluate to true
    // and stays true even if it should recalculate to false.
    // To solve this either the WorkAreaService has to provide an observable or another
    // service has to be implemented.
    serviceAgent
      .fetchService<WorkAreaService>(new WorkAreaServiceDescriptor())
      .then((workAreaService: WorkAreaService): void => {
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
      .fetchService<WorkAreaService>(new WorkAreaServiceDescriptor())
      .then((workAreaService: WorkAreaService): void => {
        workAreaService.openEntitiesInTabs([uriPath]);
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

      const modelUriAttributeValue = selectedElement.getAttribute(this.#attributeName) as string;
      return requireContentUriPath(modelUriAttributeValue);
    }

    // If it is a text we have no element, so we have to go for the first position.
    const modelUriAttributeValue = selection.getFirstPosition()?.textNode?.getAttribute(this.#attributeName) as string;
    if (!modelUriAttributeValue) {
      return undefined;
    }

    return requireContentUriPath(modelUriAttributeValue);
  }
}
