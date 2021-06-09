import Editor from "@ckeditor/ckeditor5-core/src/editor/editor";

// TODO[typing]
interface DataApi {
}

// TODO[typing]
interface EditorWithUI {
}

// TODO[typing]
interface ElementApi {
}

// TODO[typing]
type ClassicEditorUI = any;
// TODO[typing]
type EditorConfig = any;

export default class ClassicEditor extends Editor implements DataApi, EditorWithUI, ElementApi {
  ui: ClassicEditorUI;

  static create(sourceElementOrData: HTMLElement | string, config?: EditorConfig): Promise<ClassicEditor>;

  setData(data: string): void;

  getData(options?: { rootName?: string; trim?: "empty" | "none" }): string;

  sourceElement?: HTMLElement;

  updateSourceElement(): void;
}
