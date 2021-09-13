import Editor from "@ckeditor/ckeditor5-core/src/editor/editor";
import {EditorWithUI} from "@ckeditor/ckeditor5-core/src/editor/editorwithui";
import EditorUI from "@ckeditor/ckeditor5-core/src/editor/editorui";

// TODO[typing]
interface DataApi {
}

// TODO[typing]
interface ElementApi {
}

// TODO[typing]
type EditorConfig = any;

export default class ClassicEditor extends Editor implements DataApi, EditorWithUI, ElementApi {

  static create(sourceElementOrData: HTMLElement | string, config?: EditorConfig): Promise<ClassicEditor>;

  setData(data: string): void;

  getData(options?: { rootName?: string; trim?: "empty" | "none" }): string;

  sourceElement?: HTMLElement;

  updateSourceElement(): void;

  readonly ui: EditorUI;
}
