import ClassicEditor from "@ckeditor/ckeditor5-editor-classic/src/classiceditor";
import EditorUI from "@ckeditor/ckeditor5-core/src/editor/editorui";

const setDataSlowInternal = (editor: ClassicEditor, value: string): Promise<void> => {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      editor.setData(value);
      resolve();
    }, 1000);
  });
};

export class ClassicEditorWrapper {
  get(): Cypress.Chainable<ClassicEditor> {
    return cy.window().its("editor");
  }

  ui(): Cypress.Chainable<EditorUI> {
    return cy.window().its("editor.ui");
  }

  invoke<T>(fn: keyof ClassicEditor, ...args: unknown[]): Cypress.Chainable<T> {
    return this.get().invoke(fn, ...args);
  }

  // TODO: Use utility types for parameter types.
  invokeUi<T>(fn: keyof EditorUI, ...args: unknown[]): Cypress.Chainable<T> {
    return this.get().invoke(fn, ...args);
  }

  getData(): Cypress.Chainable<string> {
    return this.invoke("getData");
  }

  setData(value: string): Cypress.Chainable<void> {
    return this.invoke("setData", value);
  }

  clear(): Cypress.Chainable<void> {
    return this.setData("");
  }

  setDataSlow(value: string): Cypress.Chainable<ClassicEditor> {
    return this.get().then((editor) => {
      cy.wrap({ setDataSlowInternal }).invoke("setDataSlowInternal", editor, value);
    });
  }

  focus(): Cypress.Chainable<void> {
    return this.invoke("focus");
  }

  get editableElement(): Cypress.Chainable<Element> {
    return cy.window().its("editor.ui").should("exist").invoke("getEditableElement");
  }
}
