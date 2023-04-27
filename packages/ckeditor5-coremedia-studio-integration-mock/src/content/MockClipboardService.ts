import ClipboardService from "@coremedia/ckeditor5-coremedia-studio-integration/src/content/studioservices/ClipboardService";
import ClipboardItemRepresentation from "@coremedia/ckeditor5-coremedia-studio-integration/src/content/studioservices/ClipboardItemRepresentation";
import { Observable, Subject, Subscriber, TeardownLogic } from "rxjs";
import { createClipboardServiceDescriptor } from "@coremedia/ckeditor5-coremedia-studio-integration/src/content/ClipboardServiceDesriptor";
import Logger from "@coremedia/ckeditor5-logging/src/logging/Logger";
import LoggerProvider from "@coremedia/ckeditor5-logging/src/logging/LoggerProvider";

export default class MockClipboardService implements ClipboardService {
  static readonly #logger: Logger = LoggerProvider.getLogger("MockClipboardService");

  #items: ClipboardItemRepresentation[];
  #subject: Subject<ClipboardItemRepresentation[]>;
  #timestamp: number;

  constructor() {
    this.#items = [];
    this.#subject = new Subject();
    this.#timestamp = 0;
  }

  getName(): string {
    return createClipboardServiceDescriptor().name;
  }

  setItems(items: ClipboardItemRepresentation[], timestamp: number): Promise<void> {
    MockClipboardService.#logger.debug("New Clipboard items set triggered", items);
    if (new Date(timestamp) <= new Date(this.#timestamp)) {
      return Promise.resolve();
    }
    this.#items = items;
    this.#subject.next(items);
    return Promise.resolve();
  }

  getItems(): Promise<ClipboardItemRepresentation[]> {
    return Promise.resolve(this.#items);
  }

  observe_items(): Observable<ClipboardItemRepresentation[]> {
    return new Observable((subscriber: Subscriber<ClipboardItemRepresentation[]>): TeardownLogic => {
      const subscription = this.#subject.subscribe((items: ClipboardItemRepresentation[]): void =>
        subscriber.next(items)
      );

      return (): void => subscription.unsubscribe();
    });
  }
}
