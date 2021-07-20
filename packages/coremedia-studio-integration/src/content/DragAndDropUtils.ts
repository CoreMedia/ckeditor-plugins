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

  const parse: Array<Record<string, string>> | null = silentParseDataFromDragEvent(dataAsJson);
  if (parse === null) {
    return null;
  }

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

  const dragData: CMDragData | null = silentParseDataFromDragDropService(dragDataJson);
  if (!dragData) {
    return null;
  }

  const contents: Array<CMBeanReference> = dragData.contents;
  if (contents.length !== 1) {
    return null;
  }

  return contents[0].$Ref;
};

const silentParseDataFromDragEvent = (data: string): Array<Record<string, string>> | null => {
  try {
    return JSON.parse(data);
  } catch (e: unknown) {
    return null;
  }
};

const silentParseDataFromDragDropService = (data: string): CMDragData | null => {
  try {
    return JSON.parse(data) as CMDragData;
  } catch (e: unknown) {
    return null;
  }
};

export {
  extractContentCkeModelUri,
  extractContentUriPath,
  receiveUriPathFromDragData,
  silentParseDataFromDragDropService,
  silentParseDataFromDragEvent,
};
