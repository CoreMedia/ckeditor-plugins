import MockContentPlugin from "@coremedia/ckeditor5-coremedia-studio-integration-mock/content/MockContentPlugin";
import { MockContentConfig } from "@coremedia/ckeditor5-coremedia-studio-integration-mock/content/MockContent";

export class MockContentPluginWrapper {
  get(): Cypress.Chainable<MockContentPlugin> {
    return cy.window().its("editor.plugins").invoke("get", "MockContent");
  }

  invoke<T>(fn: keyof MockContentPlugin, ...args: unknown[]): Cypress.Chainable<T> {
    return this.get().invoke(fn, ...args);
  }

  addContents(...contents: MockContentConfig[]): Cypress.Chainable<MockContentPlugin> {
    return this.invoke("addContents", ...contents);
  }
}
