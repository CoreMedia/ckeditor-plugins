import MockContent from "./MockContent";
import { first } from "rxjs/operators";
import { combineLatest } from "rxjs";
import { contentUriPath } from "@coremedia/ckeditor5-coremedia-studio-integration/content/UriPath";
import { observeName, observeReadable } from "./MutableProperties";
import Delayed from "./Delayed";

/**
 * Will provide the first name as provided by MockContent. Will reject, if
 * no content name is provided before completion or when the content is
 * unreadable.
 */
class NamePromise extends Promise<string> {
  constructor(config: Delayed & Pick<MockContent, "id" | "name" | "readable">) {
    super((resolve, reject) => {
      const { id } = config;
      const uriPath = contentUriPath(id);
      const observableReadable = observeReadable(config);
      const observableName = observeName(config);

      const combinedObservable = combineLatest([observableName, observableReadable]).pipe(
        first(undefined, [undefined, undefined])
      );

      combinedObservable.subscribe(([receivedName, receivedReadable]): void => {
        if (receivedReadable === undefined) {
          return reject(`Failed accessing ${uriPath} (readable state).`);
        }
        if (receivedName === undefined) {
          return reject(`Failed accessing ${uriPath} (name).`);
        }
        // By intention also delays rejection, as the result for unreadable
        // may take some time.
        if (!receivedReadable) {
          return reject(`Content ${uriPath} is unreadable.`);
        }
        resolve(receivedName);
      });
    });
  }
}
