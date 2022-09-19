/* eslint no-restricted-globals: off */

import WorkAreaService from "@coremedia/ckeditor5-coremedia-studio-integration/content/studioservices/WorkAreaService";
import { Editor } from "@ckeditor/ckeditor5-core";
import MockContentPlugin from "./MockContentPlugin";
import MockContent from "./MockContent";
import { BlobType } from "./MutableProperties";
import LoggerProvider from "@coremedia/ckeditor5-logging/logging/LoggerProvider";

class MockWorkAreaService implements WorkAreaService {
  static #LOGGER = LoggerProvider.getLogger("WorkAreaService");
  private editor: Editor;

  constructor(editor: Editor) {
    this.editor = editor;
  }

  async openEntitiesInTabs(entities: unknown[]): Promise<unknown> {
    entities.forEach((entity: unknown): void => {
      const node: Element = document.createElement("DIV");
      node.classList.add("notification");
      const textnode: Text = document.createTextNode(`Open Content ${entity} in Studio Tab`);
      node.appendChild(textnode);
      document.getElementById("notifications")?.appendChild(node);
      setTimeout(() => {
        document.getElementById("notifications")?.removeChild(node);
      }, 4000);
    });

    return { success: true };
  }

  async canBeOpenedInTab(entityUris: unknown[]): Promise<unknown> {
    const mockContentPlugin = this.editor.plugins.get(MockContentPlugin.pluginName) as MockContentPlugin;
    const uris = entityUris as string[];
    return uris
      .map((uri) => {
        return mockContentPlugin.getContent(uri);
      })
      .every((mockContent: MockContent): boolean => {
        const allReadable = mockContent.readable.every((isReadable) => {
          return isReadable;
        });
        if (!mockContent.embeddable) {
          MockWorkAreaService.#LOGGER.debug("Content is not embeddable and readable is " + allReadable);
          return allReadable;
        }
        const dataIsSet = mockContent.blob.every((blobData: BlobType) => {
          return blobData?.value;
        });
        MockWorkAreaService.#LOGGER.debug("Content is embeddable and readable is " + allReadable);
        return allReadable && dataIsSet;
      });
  }

  getName(): string {
    return "workAreaService";
  }
}

export default MockWorkAreaService;
