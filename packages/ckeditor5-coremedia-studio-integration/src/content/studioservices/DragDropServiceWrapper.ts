import { serviceAgent } from "@coremedia/service-agent";
import DragDropService from "./DragDropService";

export const receiveDraggedItemsFromService = (): string[] | undefined => {
  const dragDropService = serviceAgent.getService<DragDropService>("dragDropService");
  if (!dragDropService) {
    return undefined;
  }
  const dataTransferItemsJson = dragDropService.dataTransferItems;
  if (!dataTransferItemsJson) {
    return undefined;
  }
  const dataTransferItems = JSON.parse(dataTransferItemsJson) as Record<string, string>;
  return extractUris(dataTransferItems);
};

export const receiveDraggedItemsFromDataTransfer = (dataTransfer: DataTransfer): string[] | undefined => {
  const urisJson = dataTransfer.getData("cm-studio-rest/uri-list");
  if (!urisJson) {
    return undefined;
  }

  return JSON.parse(urisJson) as string[];
};

const extractUris = (dataTransferItems: Record<string, string>): string[] | undefined => {
  const dataTransferItem = dataTransferItems["cm-studio-rest/uri-list"];
  if (!dataTransferItem) {
    return undefined;
  }
  return JSON.parse(dataTransferItem) as string[];
};
