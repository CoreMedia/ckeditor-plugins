/* async: Methods require to be asynchronous in a production scenario. */
/* eslint-disable @typescript-eslint/require-await */
/* eslint no-restricted-globals: off */

import WorkAreaService from "@coremedia/ckeditor5-coremedia-studio-integration/src/content/studioservices/WorkAreaService";
import { Editor } from "ckeditor5";
import MockContentPlugin from "./MockContentPlugin";
import MockContent from "./MockContent";
import LoggerProvider from "@coremedia/ckeditor5-logging/src/logging/LoggerProvider";
import { Observable, Subject } from "rxjs";
const isString = (value: unknown): value is string => typeof value === "string";
class MockWorkAreaService implements WorkAreaService {
  static readonly #LOGGER = LoggerProvider.getLogger("WorkAreaService");
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
  async openEntitiesInTabs(entities: unknown[]): Promise<{
    accepted: string[];
    rejected: string[];
  }> {
    const accepted: string[] = [];
    entities.filter(isString).forEach((entity: string): void => {
      accepted.push(entity);
      const node: Element = document.createElement("DIV");
      node.classList.add("notification");
      const textNode: Text = document.createTextNode(`Open Content ${entity} in Studio Tab`);
      node.appendChild(textNode);
      document.getElementById("notifications")?.appendChild(node);
      this.#activeEntitySubject.next([entity]);
      setTimeout(() => {
        document.getElementById("notifications")?.removeChild(node);
      }, 4000);
    });
    this.lastOpenedEntities = entities;
    return {
      accepted,
      rejected: [],
    };
  }
  getLastOpenedEntities(): unknown[] {
    return this.lastOpenedEntities;
  }
  async canBeOpenedInTab(entityUris: unknown[]): Promise<boolean> {
    const mockContentPlugin = this.#editor.plugins.get(MockContentPlugin.pluginName) as MockContentPlugin;
    const uris = entityUris as string[];
    return uris
      .map((uri) => mockContentPlugin.getContent(uri))
      .every((mockContent: MockContent): boolean => {
        const allReadable = mockContent.readable.every((isReadable) => isReadable);
        MockWorkAreaService.#LOGGER.debug(
          `Content ${mockContent.id} is considered ${allReadable ? "" : "un"}readable.`,
        );
        return allReadable;
      });
  }
  getName(): string {
    return "workAreaService";
  }
  observe_activeEntity(): Observable<unknown> {
    return this.#activeEntitySubject;
  }
}
export default MockWorkAreaService;
