import { requireContentCkeModelUris } from "./UriPath";
import { serviceAgent } from "@coremedia/service-agent";
import DragDropService, { CMBeanReference, CMDragData } from "./studioservices/DragDropService";
import LoggerProvider from "@coremedia/ckeditor5-logging/logging/LoggerProvider";

const logger = LoggerProvider.getLogger("DragAndDropUtils");

/**
 * Extracts the content uri from the given DragEvent and converts it to the CKE Model URI.
 *
 * @param dragEvent - the DragEvent object, which has been handed in by the drop event.
 * @returns ckeModelUri the extracted CKE Model URI in the format `content:{content-id}`
 */
const extractContentCkeModelUri = (dragEvent: DragEvent): string[] | null => {
  const uriPaths = extractContentUriPaths(dragEvent);
  if (uriPaths === null) {
    return null;
  }
  return requireContentCkeModelUris(uriPaths);
};

/**
 * Extract the content uri from the json data given by a html5 drag event (dragEvent.dataTransfer.cm/uri-list).
 */
const extractContentUriPathsFromDragEventJsonData = (dataAsJson: string): string[] | null => {
  const parse: Record<string, string>[] | null = parseDataFromDragEvent(dataAsJson);
  if (!parse) {
    return null;
  }

  return parse.map((value) => {
    return value.$Ref;
  });
};

/**
 * Extracts the CoreMedia Content URI from the given DragEvent.
 *
 * @param dragEvent - the DragEvent object, which has been handed in by the drop event.
 * @returns cmContentUri the extracted CoreMedia Content URI in the format `content/{content-id}`; `null` when there were no (valid) data
 */
const extractContentUriPaths = (dragEvent: DragEvent): string[] | null => {
  const dataTransfer: DataTransfer | null = dragEvent.dataTransfer;
  if (!dataTransfer) {
    return null;
  }
  const dataAsJson: string | undefined = dataTransfer.getData("cm/uri-list");
  if (!dataAsJson) {
    return null;
  }

  return extractContentUriPathsFromDragEventJsonData(dataAsJson);
};

/**
 * If existing, receive URI paths contained in drag data provided by
 * `DragDropService`.
 *
 * @returns array of URI-paths of dragged contents, may be empty; `null` if not available.
 */
const receiveUriPathsFromDragDropService = (): string[] | null => {
  const dragDropService = serviceAgent.getService<DragDropService>("dragDropService");
  if (!dragDropService) {
    logger.debug("DragDropService unavailable. Won't provide drag data.");
    return null;
  }
  const dragDataJson: string = dragDropService.dragData;

  const dragData: CMDragData | null = parseDragDataJson(dragDataJson);
  if (!dragData) {
    return null;
  }

  const contents: CMBeanReference[] = dragData.contents;
  return contents.map((value) => {
    return value.$Ref;
  });
};

/**
 * Parse data from drag-event.
 *
 * @param dataAsJson - data to parse, expected to be JSON string
 * @returns parsed data; `null` if parsing failed
 */
const parseDataFromDragEvent = (dataAsJson: string | null | undefined): Record<string, string>[] | null => {
  if (!dataAsJson) {
    return null;
  }
  try {
    return JSON.parse(dataAsJson);
  } catch (e: unknown) {
    logger.debug("Failed parsing data from drag-event.", dataAsJson, e);
    return null;
  }
};

/**
 * Parse drag-data from drag drop service.
 *
 *  @param dataAsJson - data to parse
 * @returns parsed drag-data; `null` if drag-data could not be parsed.
 */
const parseDragDataJson = (dataAsJson: string | null | undefined): CMDragData | null => {
  if (!dataAsJson) {
    return null;
  }
  try {
    return JSON.parse(dataAsJson) as CMDragData;
  } catch (e: unknown) {
    logger.debug("Failed parsing data from drag-drop service.", dataAsJson, e);
    return null;
  }
};

export {
  extractContentCkeModelUri,
  extractContentUriPaths,
  receiveUriPathsFromDragDropService,
  parseDragDataJson,
  parseDataFromDragEvent,
  extractContentUriPathsFromDragEventJsonData,
  requireContentCkeModelUris,
};
