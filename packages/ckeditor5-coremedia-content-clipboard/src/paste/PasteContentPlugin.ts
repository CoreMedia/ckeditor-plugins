import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import { EditorWithUI } from "@ckeditor/ckeditor5-core/src/editor/editorwithui";
import ButtonView from "@ckeditor/ckeditor5-ui/src/button/buttonview";
import { insertContentMarkers } from "../ContentMarkers";
import { serviceAgent } from "@coremedia/service-agent";
import { createClipboardServiceDescriptor } from "@coremedia/ckeditor5-coremedia-studio-integration/content/ClipboardServiceDesriptor";
import ClipboardItemRepresentation from "@coremedia/ckeditor5-coremedia-studio-integration/content/studioservices/ClipboardItemRepresentation";
import { parseBeanReferences } from "@coremedia/ckeditor5-coremedia-studio-integration/content/BeanReference";
import { isUriPath } from "@coremedia/ckeditor5-coremedia-studio-integration/content/UriPath";
import { createRichtextConfigurationServiceDescriptor } from "@coremedia/ckeditor5-coremedia-studio-integration/content/RichtextConfigurationServiceDescriptor";

export default class PasteContentPlugin extends Plugin {
  init() {
    const editor = this.editor as EditorWithUI;

    editor.ui.componentFactory.add("paste-content", () => {
      const button = new ButtonView();
      button.on("execute", () => {
        serviceAgent
          .fetchService(createClipboardServiceDescriptor())
          .then((clipboardService) => {
            return clipboardService.getItems();
          })
          .then(async (items) => {
            const contentUris = await PasteContentPlugin.toContentUris(items);
            const firstRange = editor.model.document.selection.getFirstRange();
            if (firstRange) {
              insertContentMarkers(editor, firstRange, contentUris);
            }
          });
      });
      serviceAgent.fetchService(createClipboardServiceDescriptor()).then(async (clipboardService) => {
        const initialItems = await clipboardService.getItems();
        button.isEnabled = await PasteContentPlugin.calculateEnabledState(initialItems);

        clipboardService.observe_items().subscribe(async (itemRepresentations) => {
          button.isEnabled = await PasteContentPlugin.calculateEnabledState(itemRepresentations);
        });
      });

      return button;
    });
  }

  static async calculateEnabledState(itemRepresentations: ClipboardItemRepresentation[]): Promise<boolean> {
    const uris = await PasteContentPlugin.toContentUris(itemRepresentations);
    if (uris.length === 0) {
      return false;
    }
    const everyUriIsValid = uris.every((uri) => {
      return isUriPath(uri);
    });
    if (!everyUriIsValid) {
      return false;
    }

    const pastableStates = await PasteContentPlugin.resolvePastableStates(uris);
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
