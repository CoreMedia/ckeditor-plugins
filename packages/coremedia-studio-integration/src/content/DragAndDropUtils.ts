import { requireContentCkeModelUri } from "./UriPath";
import { serviceAgent } from "@coremedia/studio-apps-service-agent";
import DragDropService, { CMBeanReference, CMDragData } from "./studioservices/DragDropService";

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
  const dataTransfer: DataTransfer | null = dragEvent.dataTransfer;
  if (!dataTransfer) {
    return null;
  }
  const dataAsJson: string | undefined = dataTransfer.getData("cm/uri-list");
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

const receiveUriPathFromDragData = (): string | null => {
  const dragDropService = serviceAgent.getService<DragDropService>("dragDropService");
  if (dragDropService === null) {
    console.log("drag drop service not found");
    return null;
  }
  const dragDataJson: string = dragDropService.dragData;
  const parse: CMDragData = JSON.parse(dragDataJson);
  const contents: Array<CMBeanReference> = parse.contents;
  if (contents.length !== 1) {
    return null;
  }

  return contents[0].$Ref;
};

export { extractContentCkeModelUri, extractContentUriPath, receiveUriPathFromDragData };
