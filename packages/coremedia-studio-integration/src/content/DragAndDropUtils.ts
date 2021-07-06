import { requireContentCkeModelUri } from "./UriPath";

/**
 * Extracts the content uri from the given DragEvent and converts it to the CKE Model URI.
 *
 * @param dragEvent the DragEvent object which has been handed in by the drop event.
 * @return ckeModelUri the extracted CKE Model URI in the format content:{content-id}
 */
const extractContentCkeModelUri = (dragEvent: DragEvent): string | null => {
  const uriPath = extractContentUriPath(dragEvent);
  if (uriPath === null) {
    return null;
  }
  return requireContentCkeModelUri(uriPath);
};

/**
 * Extracts the CoreMedia Content URI from the given DragEvent.
 *
 * @param dragEvent the DragEvent object which has been handed in by the drop event.
 * @return cmContentUri the extracted CoreMedia Content URI in the format content/{content-id}
 */
const extractContentUriPath = (dragEvent: DragEvent): string | null => {
  const dataAsJson: string | undefined = dragEvent.dataTransfer?.getData("cm/uri-list");
  if (!dataAsJson) {
    return null;
  }
  const parse: Array<Record<string, string>> = JSON.parse(dataAsJson);
  if (parse.length !== 1) {
    return null;
  }
  const refObject: Record<string, string> = parse[0];
  return refObject.$Ref;
};

export { extractContentCkeModelUri };
