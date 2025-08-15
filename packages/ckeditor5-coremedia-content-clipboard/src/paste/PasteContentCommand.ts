import { Command, Editor } from "ckeditor5";
import { serviceAgent } from "@coremedia/service-agent";
import {
  ClipboardItemRepresentation,
  ClipboardService,
  createClipboardServiceDescriptor,
  createRichtextConfigurationServiceDescriptor,
  isUriPath,
  toContentUris,
} from "@coremedia/ckeditor5-coremedia-studio-integration";
import { LoggerProvider } from "@coremedia/ckeditor5-logging";
import type { Subscription } from "rxjs";
import { insertContentMarkers } from "../ContentMarkers";

/**
 * Command to insert Content from the ClipboardService into the document at the actual selection.
 *
 * The command is enabled if the ClipboardService contains Contents and all Contents
 * are insertable.
 */
export class PasteContentCommand extends Command {
  readonly #logger = LoggerProvider.getLogger("PasteContentCommand");
  readonly #serviceRegisteredSubscription: Pick<Subscription, "unsubscribe"> | null;

  constructor(editor: Editor) {
    super(editor);
    this.isEnabled = false;
    const onServiceRegisteredFunction = (services: ClipboardService[]): void => {
      if (services.length === 0) {
        // noinspection JSConstantReassignment bad types
        this.isEnabled = false;
        this.#logger.debug("No Clipboard service registered yet");
        return;
      }
      const clipboardService = services[0];
      this.#initializeWithClipboardService(clipboardService)
        .then(() => {
          this.#logger.debug("Successfully initialized paste content command with a clipboard service.");
        })
        .catch((reason) => {
          this.#logger.warn("Initialization of PasteContentCommand failed. ", reason);
        });
    };
    this.#serviceRegisteredSubscription = serviceAgent
      .observeServices<ClipboardService>(createClipboardServiceDescriptor())
      .subscribe(onServiceRegisteredFunction);
  }

  async #initializeWithClipboardService(clipboardService: ClipboardService): Promise<void> {
    const initialItems = await clipboardService.getItems();
    // noinspection JSConstantReassignment bad types
    this.isEnabled = await PasteContentCommand.calculateEnabledState(initialItems);
    clipboardService.observe_items().subscribe((itemRepresentations: ClipboardItemRepresentation[]) => {
      // noinspection JSConstantReassignment bad types
      PasteContentCommand.calculateEnabledState(itemRepresentations)
        .then((isEnabled) => (this.isEnabled = isEnabled))
        .catch((reason) => {
          this.#logger.warn("Error while receiving enabled state", reason);
        });
    });
    if (this.#serviceRegisteredSubscription) {
      this.#serviceRegisteredSubscription.unsubscribe();
    }
  }

  // Empty implementation because the overridden implementation always sets isEnabled=true

  override refresh(): void {}

  override execute(): void {
    serviceAgent
      .fetchService(createClipboardServiceDescriptor())
      .then((clipboardService: ClipboardService) => clipboardService.getItems())
      .then(async (items: ClipboardItemRepresentation[]) => {
        const contentUris: string[] = await toContentUris(items);
        const firstRange = this.editor.model.document.selection.getFirstRange();
        if (firstRange) {
          insertContentMarkers(this.editor, firstRange, contentUris);
        }
      })
      .catch((reason) => {
        this.#logger.warn("Error occurred during insertion of markers for contents", reason);
      });
  }

  static async calculateEnabledState(itemRepresentations: ClipboardItemRepresentation[]): Promise<boolean> {
    const uris: string[] = await toContentUris(itemRepresentations);
    if (uris.length === 0) {
      return false;
    }
    const everyUriIsValid = uris.every((uri: string) => isUriPath(uri));
    if (!everyUriIsValid) {
      return false;
    }
    const pastableStates = await PasteContentCommand.resolvePastableStates(uris);
    return pastableStates.every((isPastable) => isPastable);
  }

  static async resolvePastableStates(uris: string[]): Promise<boolean[]> {
    const richtextConfigurationService = await serviceAgent.fetchService(
      createRichtextConfigurationServiceDescriptor(),
    );
    const pastableStatePromises: Promise<boolean>[] = uris.map(async (uri): Promise<boolean> => {
      const isLinkable = await richtextConfigurationService.hasLinkableType(uri);
      const isEmbeddable = await richtextConfigurationService.isEmbeddableType(uri);
      return isLinkable || isEmbeddable;
    });
    return Promise.all(pastableStatePromises);
  }
}
