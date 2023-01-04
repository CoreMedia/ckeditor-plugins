import { serviceAgent } from "@coremedia/service-agent";
import DragDropService, { CMBeanReference, CMDragData } from "./DragDropService";
import LoggerProvider from "@coremedia/ckeditor5-logging/logging/LoggerProvider";

const logger = LoggerProvider.getLogger("DragDropServiceWrapper");

export const receiveDraggedItems = (): string | undefined => {
  const dragDropService = serviceAgent.getService<DragDropService>("dragDropService");
  if (!dragDropService) {
    return undefined;
  }
  const dragData = dragDropService.dragData;
  return unifyDragDropInput(dragData);
};

const unifyDragDropInput = (dragDropServiceDataInput: string): string | undefined => {
  const dragData: CMDragData | undefined = parseDragDataJson(dragDropServiceDataInput);
  if (!dragData) {
    return undefined;
  }

  const contents: CMBeanReference[] = dragData.contents;
  return JSON.stringify(contents);
};

/**
 * Parse drag-data from drag drop service.
 *
 * @param dataAsJson - data to parse
 * @returns parsed drag-data; `undefined` if drag-data could not be parsed.
 */
const parseDragDataJson = (dataAsJson: string | null | undefined): CMDragData | undefined => {
  if (!dataAsJson) {
    return undefined;
  }
  try {
    return JSON.parse(dataAsJson) as CMDragData;
  } catch (e: unknown) {
    logger.debug("Failed parsing data from drag-drop service.", dataAsJson, e);
    return undefined;
  }
};
