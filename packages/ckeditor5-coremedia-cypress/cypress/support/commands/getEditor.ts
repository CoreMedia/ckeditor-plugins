// noinspection JSUnusedGlobalSymbols

import "cypress-wait-until";
import ClassicEditor from "@ckeditor/ckeditor5-editor-classic/src/classiceditor";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      getEditor: typeof getEditor;
      getData: typeof getData;
      setData: typeof setData;
      setDataSlow: typeof setDataSlow;
    }
  }
}

interface HoldsEditor {
  editor: unknown;
}

interface HoldsClassicEditor extends HoldsEditor {
  editor: ClassicEditor;
}

const holdsEditor = (obj: unknown): obj is HoldsEditor => {
  return typeof obj === "object" && obj !== null && obj.hasOwnProperty("editor");
};

const holdsClassicEditor = (obj: unknown): obj is HoldsClassicEditor => {
  return holdsEditor(obj) && typeof obj.editor === "object" && obj.editor !== null;
};

export const getEditor = () => {
  return cy.window().then((win) => (holdsClassicEditor(win) ? win.editor : undefined));
};

export const getData = () => {
  return cy.window().then((win) => (holdsClassicEditor(win) ? win.editor.getData() : undefined));
};

export const setData = (val: string) => {
  return cy.window().then((win) => holdsClassicEditor(win) && win.editor.setData(val));
};

export const setDataSlow = (val: string) => {
  return cy.window().then((win) => holdsClassicEditor(win) && setTimeout(() => win.editor.setData(val), 1000));
};

export const editor = () => {
  cy.waitUntil(() => cy.window().its("editor").as("editor"));
};
