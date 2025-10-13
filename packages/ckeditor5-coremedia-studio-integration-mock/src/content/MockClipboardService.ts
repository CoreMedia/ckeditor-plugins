import type { ClipboardItemRepresentation, ClipboardService } from "@coremedia/ckeditor5-coremedia-studio-integration";
import { createClipboardServiceDescriptor } from "@coremedia/ckeditor5-coremedia-studio-integration";
import type { Subscriber, TeardownLogic } from "rxjs";
import { Observable, Subject } from "rxjs";
import type { Logger } from "@coremedia/ckeditor5-logging";
import { LoggerProvider } from "@coremedia/ckeditor5-logging";

export default class MockClipboardService implements ClipboardService {
  static readonly #logger: Logger = LoggerProvider.getLogger("MockClipboardService");

  #items: ClipboardItemRepresentation[];
  readonly #subject: Subject<ClipboardItemRepresentation[]>;
  readonly #timestamp: number;

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
        subscriber.next(items),
      );

      return (): void => subscription.unsubscribe();
    });
  }
}
