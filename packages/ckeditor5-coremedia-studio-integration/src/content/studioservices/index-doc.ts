/**
 * The services inside here are copied from Studio, as there is no more general
 * package available yet. It serves as forward reference and shall be replaced
 * by a common library in the future, shared by CKEditor plugins and
 * CoreMedia Studio.
 *
 * @packageDocumentation
 * @category Virtual
 */
export * from "./ClipboardService";
export { default as ClipboardService } from "./ClipboardService";

export * from "./ClipboardItemRepresentation";
export { default as ClipboardItemRepresentation } from "./ClipboardItemRepresentation";

export * from "./DragDropService";
export { default as DragDropService } from "./DragDropService";

export * from "./WorkAreaService";
export { default as WorkAreaService } from "./WorkAreaService";
