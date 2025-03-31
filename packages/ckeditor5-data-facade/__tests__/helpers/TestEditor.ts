import { html } from "./index.html";
import {
  Autosave,
  Bold,
  Italic,
  Strikethrough,
  Underline,
  Essentials,
  Heading,
  Paragraph,
  SourceEditing,
  AutoLink,
  Link,
  Autoformat,
  BlockQuote,
  CodeBlock,
  List,
  ListProperties,
  PasteFromOffice,
  RemoveFormat,
  Indent,
  FontColor,
  FontSize,
  AutoImage,
  Base64UploadAdapter,
  EditorConfig,
} from "ckeditor5";
import { DataFacade } from "../../src";
import { createClassicEditorWithLicense } from "@coremedia/ckeditor5-common";

export const allPlugins = [
  AutoImage,
  AutoLink,
  Autoformat,
  Autosave,
  Base64UploadAdapter,
  BlockQuote,
  Bold,
  CodeBlock,
  DataFacade,
  List,
  ListProperties,
  Essentials,
  FontColor,
  FontSize,
  Heading,
  Indent,
  Italic,
  Link,
  Paragraph,
  PasteFromOffice,
  RemoveFormat,
  SourceEditing,
  Strikethrough,
  Underline,
];

export const completeToolbar = [
  "undo",
  "redo",
  "heading",
  "bold",
  "italic",
  "underline",
  "strikethrough",
  "fontSize",
  "fontColor",
  "removeFormat",
];

export const prepareDocument = (doc: Document) => {
  doc.body.innerHTML = html;
};
export const createTestEditor = async (
  elementId = "main",
  plugins = allPlugins,
  toolbar = completeToolbar,
  config: Omit<EditorConfig, "plugins" | "toolbar"> = {},
) => {
  const element = document.getElementById(elementId);
  if (!element) throw new Error(`Element with id '${elementId}' not found.`);
  return createClassicEditorWithLicense(element, { ...config, plugins, toolbar });
};
