import { ClassicEditor, Editor, type EditorConfig } from "ckeditor5";

export const createClassicEditorWithLicense = (element: HTMLElement, config: EditorConfig): Promise<ClassicEditor> =>
  ClassicEditor.create(element, { ...config, licenseKey: "" });

export const createEditorWithLicense = (config: EditorConfig): Editor =>
  //@ts-expect-error We should rather mock ClassicEditor or similar here.
  new Editor({ ...config, licenseKey: "" });
