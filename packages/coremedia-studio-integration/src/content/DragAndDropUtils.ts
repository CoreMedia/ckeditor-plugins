import { requireContentCkeModelUris } from "./UriPath";
import { serviceAgent } from "@coremedia/studio-apps-service-agent";
import DragDropService, { CMBeanReference, CMDragData } from "./studioservices/DragDropService";

/**
 * Extracts the content uri from the given DragEvent and converts it to the CKE Model URI.
 *
 * @param dragEvent the DragEvent object which has been handed in by the drop event.
 * @return ckeModelUri the extracted CKE Model URI in the format content:{content-id}
 */
const extractContentCkeModelUri = (dragEvent: DragEvent): Array<string> | null => {
  const uriPaths = extractContentUriPath(dragEvent);
  if (uriPaths === null) {
    return null;
  }
  return requireContentCkeModelUris(uriPaths);
};

/**
 * Extract the content uri from the json data given by a html5 drag event (dragEvent.dataTransfer.cm/uri-list).
 *
 * @param dataAsJson
 */
const extractContentUriFromDragEventJsonData = (dataAsJson: string): Array<string> | null => {
  const parse: Array<Record<string, string>> | null = silentParseDataFromDragEvent(dataAsJson);
  if (parse === null) {
    return null;
  }

  return parse.map((value) => {
    return value.$Ref;
  });
};

/**
 * Extracts the CoreMedia Content URI from the given DragEvent.
 *
 * @param dragEvent the DragEvent object which has been handed in by the drop event.
 * @return cmContentUri the extracted CoreMedia Content URI in the format content/{content-id}
 */
const extractContentUriPath = (dragEvent: DragEvent): Array<string> | null => {
  const dataTransfer: DataTransfer | null = dragEvent.dataTransfer;
  if (!dataTransfer) {
    return null;
  }
  const dataAsJson: string | undefined = dataTransfer.getData("cm/uri-list");
  if (!dataAsJson) {
    return null;
  }

  return extractContentUriFromDragEventJsonData(dataAsJson);
};

const receiveUriPathFromDragData = (): Array<string> | null => {
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
  return contents.map((value) => {
    return value.$Ref;
  });
};

const silentParseDataFromDragEvent = (data: string): Array<Record<string, string>> | null => {
  try {
    return JSON.parse(data);
  } catch (e: unknown) {
    // TODO[cke] We should not completely ignore unparsable data!
    return null;
  }
};

const silentParseDataFromDragDropService = (data: string): CMDragData | null => {
  try {
    return JSON.parse(data) as CMDragData;
  } catch (e: unknown) {
    // TODO[cke] We should not completely ignore unparsable data!
    return null;
  }
};

export {
  extractContentCkeModelUri,
  extractContentUriPath,
  receiveUriPathFromDragData,
  silentParseDataFromDragDropService,
  silentParseDataFromDragEvent,
  extractContentUriFromDragEventJsonData,
  requireContentCkeModelUris,
};
