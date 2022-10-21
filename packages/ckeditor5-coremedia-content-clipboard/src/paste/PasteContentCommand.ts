import { Command } from "@ckeditor/ckeditor5-core";
import { serviceAgent } from "@coremedia/service-agent";
import { createClipboardServiceDescriptor } from "@coremedia/ckeditor5-coremedia-studio-integration/content/ClipboardServiceDesriptor";
import Editor from "@ckeditor/ckeditor5-core/src/editor/editor";
import ClipboardService from "@coremedia/ckeditor5-coremedia-studio-integration/content/studioservices/ClipboardService";
import LoggerProvider from "@coremedia/ckeditor5-logging/logging/LoggerProvider";
import ClipboardItemRepresentation from "@coremedia/ckeditor5-coremedia-studio-integration/content/studioservices/ClipboardItemRepresentation";
import type { Subscription } from "rxjs";
import { isUriPath } from "@coremedia/ckeditor5-coremedia-studio-integration/content/UriPath";
import { createRichtextConfigurationServiceDescriptor } from "@coremedia/ckeditor5-coremedia-studio-integration/content/RichtextConfigurationServiceDescriptor";
import { parseBeanReferences } from "@coremedia/ckeditor5-coremedia-studio-integration/content/BeanReference";
import { insertContentMarkers } from "../ContentMarkers";

/**
 * Command to insert Content from the ClipboardService into the document at the actual selection.
 *
 * The command is enabled if the ClipboardService contains Contents and all Contents
 * are insertable.
 */
export class PasteContentCommand extends Command {
  #logger = LoggerProvider.getLogger("PasteContentCommand");
  #serviceRegisteredSubscription: Subscription | null;

  constructor(editor: Editor) {
    super(editor);
    this.isEnabled = false;
    const onServiceRegisteredFunction = async (services: ClipboardService[]) => {
      if (services.length === 0) {
        // noinspection JSConstantReassignment bad types
        this.isEnabled = false;
        this.#logger.debug("No Clipboard service registered yet");
        return;
      }
      const clipboardService = services[0];
      const initialItems = await clipboardService.getItems();
      // noinspection JSConstantReassignment bad types
      this.isEnabled = await PasteContentCommand.calculateEnabledState(initialItems);

      clipboardService.observe_items().subscribe(async (itemRepresentations: ClipboardItemRepresentation[]) => {
        // noinspection JSConstantReassignment bad types
        this.isEnabled = await PasteContentCommand.calculateEnabledState(itemRepresentations);
      });
      if (this.#serviceRegisteredSubscription) {
        this.#serviceRegisteredSubscription.unsubscribe();
      }
    };

    this.#serviceRegisteredSubscription = serviceAgent
      .observeServices<ClipboardService>(createClipboardServiceDescriptor())
      .subscribe(onServiceRegisteredFunction);
  }

  // Empty implementation because the overridden implementation always sets isEnabled=true
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  override refresh(): void {}

  override execute(): void {
    serviceAgent
      .fetchService(createClipboardServiceDescriptor())
      .then((clipboardService) => {
        return clipboardService.getItems();
      })
      .then(async (items) => {
        const contentUris = await PasteContentCommand.toContentUris(items);
        const firstRange = this.editor.model.document.selection.getFirstRange();
        if (firstRange) {
          insertContentMarkers(this.editor, firstRange, contentUris);
        }
      });
  }

  static async calculateEnabledState(itemRepresentations: ClipboardItemRepresentation[]): Promise<boolean> {
    const uris = await PasteContentCommand.toContentUris(itemRepresentations);
    if (uris.length === 0) {
      return false;
    }
    const everyUriIsValid = uris.every((uri: string) => {
      return isUriPath(uri);
    });
    if (!everyUriIsValid) {
      return false;
    }

    const pastableStates = await PasteContentCommand.resolvePastableStates(uris);
    return pastableStates.every((isPastable) => {
      return isPastable;
    });
  }

  static async resolvePastableStates(uris: string[]): Promise<boolean[]> {
    const richtextConfigurationService = await serviceAgent.fetchService(
      createRichtextConfigurationServiceDescriptor()
    );
    const pastableStatePromises: Promise<boolean>[] = uris.map(async (uri): Promise<boolean> => {
      const isLinkable = await richtextConfigurationService.hasLinkableType(uri);
      const isEmbeddable = await richtextConfigurationService.isEmbeddableType(uri);

      return isLinkable || isEmbeddable;
    });
    return Promise.all(pastableStatePromises);
  }

  static async toContentUris(items: ClipboardItemRepresentation[]): Promise<string[]> {
    const beanReferencesAsStrings: string[] = await Promise.all(
      items
        .map((item) => {
          return item.data["cm/uri-list"];
        })
        .map(async (blob) => {
          return blob.text();
        })
    );
    return beanReferencesAsStrings
      .map((references) => {
        const parsedReferences = parseBeanReferences(references);
        return parsedReferences ? parsedReferences.filter((reference) => !!reference) : [];
      })
      .flat()
      .map((reference) => {
        return reference.$Ref;
      });
  }
}
