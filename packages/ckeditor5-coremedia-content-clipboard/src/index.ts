/**
 * @module ckeditor5-coremedia-content-clipboard
 */

export { default as ContentClipboard } from "./ContentClipboard";
export { default as ContentClipboardEditing } from "./ContentClipboardEditing";
export { UndoSupport } from "./integrations/Undo";
export { default as PasteContentEditing } from "./paste/PasteContentEditing";
export { default as PasteContentPlugin } from "./paste/PasteContentPlugin";
export { default as PasteContentUI } from "./paste/PasteContentUI";
export { PasteContentCommand } from "./paste/PasteContentCommand";
export { CreateModelFunction, CreateModelFunctionCreator } from "./ContentToModelRegistry";

import "./augmentation";
