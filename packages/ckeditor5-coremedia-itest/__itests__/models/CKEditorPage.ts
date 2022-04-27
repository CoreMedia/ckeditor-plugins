import { JSHandle, Page } from "@playwright/test";
import ClassicEditor from "@ckeditor/ckeditor5-editor-classic/src/classiceditor";

interface HoldsEditor {
  editor: ClassicEditor;
}

const isHoldsEditor = (value: unknown): value is HoldsEditor => {
  if (typeof value !== "object" || !value || !("editor" in value)) {
    return false;
  }
  const raw: ClassicEditor = (value as HoldsEditor).editor;
  return typeof raw == "object";
};

export class CKEditorPage {
  #page: Page;
  #baseUrl: string;

  constructor(page: Page, baseUrl: string | undefined) {
    this.#page = page;
    this.#baseUrl = baseUrl ?? "http://localhost:3000";
  }

  async window(): Promise<JSHandle<Window>> {
    return await this.#page.evaluateHandle(() => window);
  }

  #editorHolder(): Promise<HoldsEditor> {
    return new Promise<HoldsEditor>((resolve) => {
      const currentWindow = window;
      while (true) {
        if (isHoldsEditor(currentWindow)) {
          return resolve(currentWindow);
        }
      }
    });
  }

  async editor(): Promise<JSHandle<ClassicEditor>> {
    return await this.#page.evaluateHandle(() => this.#editorHolder().then((holder) => holder.editor));
  }

  async goto(): Promise<void> {
    await this.#page.goto(this.#baseUrl);
  }

  async setData(data: string): Promise<void> {
    await this.editor().then((handle) => {
      return handle.evaluate((editor) => {
        editor.setData(data);
      });
    });
  }

  async getData(): Promise<string> {
    return await this.editor().then((handle) => {
      return handle.evaluate((editor) => {
        return editor.getData();
      });
    });
  }
}
