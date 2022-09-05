/* eslint no-null/no-null: off */

import { serviceAgent } from "@coremedia/service-agent";
import DragDropService, { CMBeanReference, CMDragData } from "./studioservices/DragDropService";
import LoggerProvider from "@coremedia/ckeditor5-logging/logging/LoggerProvider";

const logger = LoggerProvider.getLogger("DragAndDropUtils");

/**
 * If existing, receive URI-paths contained in drag data provided by
 * `DragDropService`.
 *
 * @returns array of URI-paths of dragged contents, may be empty; `null` if
 * either the service is unavailable, or the drag data contains no URI-path
 * data, which again signals, that the drag data do not refer to contents.
 */
export const receiveUriPathsFromDragDropService = (): string[] | null => {
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
 * Parse drag-data from drag drop service.
 *
 * @param dataAsJson - data to parse
 * @returns parsed drag-data; `null` if drag-data could not be parsed.
 */
export const parseDragDataJson = (dataAsJson: string | null | undefined): CMDragData | null => {
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
