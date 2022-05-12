// in cypress/support/index.ts
// load type definitions that come with Cypress module
/// <reference types="cypress" />

import "cypress-wait-until";
import "@percy/cypress";
import "cypress-plugin-snapshots/commands";
import "@4tw/cypress-drag-drop";
import { getData, getEditor, setData, setDataSlow } from "./commands/getEditor";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      horst: () => Chainable<string>;
      getSessionStorage: (key: string) => Chainable<string>;
      setSessionStorage: (key: string, value: string) => Chainable<never>;
    }
  }
}

/*
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {}
}
*/

const horst = (): Cypress.Chainable<string> => cy.wrap("Horst");

Cypress.Commands.add("getEditor", getEditor);
Cypress.Commands.add("getData", getData);
Cypress.Commands.add("setData", setData);
Cypress.Commands.add("setDataSlow", setDataSlow);
Cypress.Commands.add("horst", horst);

Cypress.Commands.add("getSessionStorage", (key) => {
  cy.window().then((window) => window.sessionStorage.getItem(key));
});

Cypress.Commands.add("setSessionStorage", (key, value) => {
  cy.window().then((window) => {
    window.sessionStorage.setItem(key, value);
  });
});
export {};
