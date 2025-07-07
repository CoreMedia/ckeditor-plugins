/* async: Methods require to be asynchronous in a production scenario. */
/* eslint-disable @typescript-eslint/require-await */
/* eslint no-restricted-globals: off */

import { ContentFormService } from "@coremedia/ckeditor5-coremedia-studio-integration";
import { Editor } from "ckeditor5";
import MockContentPlugin from "./MockContentPlugin";
import { LoggerProvider } from "@coremedia/ckeditor5-logging";
import { Observable, Subject } from "rxjs";

class MockContentFormService implements ContentFormService {
  static readonly #LOGGER = LoggerProvider.getLogger("ContentFormService");
  readonly #editor: Editor;
  /**
   * The entities that were triggered to open latest.
   * Used for testing purposes to verify if the openEntitiesInTab has been triggered.
   */
  lastOpenedEntities: unknown[] = [];
  readonly #activeEntitySubject: Subject<unknown>;

  constructor(editor: Editor) {
    this.#editor = editor;
    this.#activeEntitySubject = new Subject<unknown>();
  }

  async openContentForm(contentUriPath: string): Promise<{
    accepted: string[];
    rejected: string[];
  }> {
    const accepted: string[] = [];
    //entities.filter(isString).forEach((entity: string): void => {
    accepted.push(contentUriPath);
    const node: Element = document.createElement("DIV");
    node.classList.add("notification");
    const textNode: Text = document.createTextNode(`Open Content ${contentUriPath} in Studio Tab`);
    node.appendChild(textNode);
    document.getElementById("notifications")?.appendChild(node);
    this.#activeEntitySubject.next([contentUriPath]);
    setTimeout(() => {
      document.getElementById("notifications")?.removeChild(node);
    }, 4000);
    //});
    this.lastOpenedEntities = [contentUriPath];
    return {
      accepted,
      rejected: [],
    };
  }

  getLastOpenedEntities(): unknown[] {
    return this.lastOpenedEntities;
  }

  async canBeOpened(contentUriPath: string): Promise<boolean> {
    const mockContentPlugin = this.#editor.plugins.get(MockContentPlugin.pluginName) as MockContentPlugin;
    const mockContent = mockContentPlugin.getContent(contentUriPath);
    const allReadable = mockContent.readable.every((isReadable) => isReadable);
    if (!allReadable) {
      MockContentFormService.#LOGGER.debug(
        `Content ${mockContent.id} is considered ${allReadable ? "" : "un"}readable.`,
      );
    }
    return allReadable;
  }

  getName(): string {
    return "contentFormService";
  }

  observe_activeContent(): Observable<unknown> {
    return this.#activeEntitySubject;
  }
}

export default MockContentFormService;
