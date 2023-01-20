import { replaceElementByElementAndClass } from "./ReplaceElementByElementAndClass";
import { mergeTableSectionsToTableBody } from "./MergeTableSectionsToTableBody";
import { RuleConfig } from "@coremedia/ckeditor5-dom-converter/Rule";

export const tableHeaderElements = replaceElementByElementAndClass({
  viewLocalName: "th",
  dataLocalName: "td",
  dataReservedClass: "td--header",
});

export const tableSectionsSupport = mergeTableSectionsToTableBody();

export const tableElements: RuleConfig[] = [tableHeaderElements, tableSectionsSupport];
