/// <reference types="cypress" />

import ClassicEditor from "@ckeditor/ckeditor5-editor-classic/src/classiceditor";
import { ClassicEditorWrapper } from "./ClassicEditorWrapper";
import { MockContentPluginWrapper } from "./MockContentPluginWrapper";
import { MockDataTransfer } from "./MockDataTransfer";

// Getting Webpack Compilation Error for the following:
// import { contentUriPath } from "@coremedia/ckeditor5-coremedia-studio-integration/content/UriPath";
// Thus, manually adding it here.
const CONTENT_URI_PATH_PREFIX = "content/";
const contentUriPath = (contentId: number): string => {
  return `${CONTENT_URI_PATH_PREFIX}${contentId}`;
};

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

describe("CKEditor Proof-of-Concept", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.window().its("editor").as("editor");
    cy.waitUntil(() => cy.window().then(holdsClassicEditor), {
      errorMsg: "When CKEditor in Example App is ready, it should have exposed its instance as `window.editor`.",
    });
  });

  it("should render CKEditor", () => {
    cy.get(".ck-editor").first().should("be.visible").screenshot("ckeditor");
  });

  it("should expose `editor` global in example webapp", () => {
    cy.get("@editor").should("exist");
    cy.getEditor().should("exist");
  });

  it("should contain data", () => {
    cy.getData().should("contain", "http://www.coremedia.com/2003/richtext-1.0");
  });

  it("should set data", () => {
    cy.setData("");
    cy.getData().should("be.empty");
  });

  it("should set data slow", () => {
    cy.setDataSlow("");
    cy.window().its("editor.getData()").should("contain", "Horst");
  });

  it("should render CKEditor (Wrapper)", () => {
    new ClassicEditorWrapper().get().should("exist");
  });

  it("should contain data (Wrapper)", () => {
    new ClassicEditorWrapper().getData().should("contain", "http://www.coremedia.com/2003/richtext-1.0");
  });

  it("should set data (Wrapper)", () => {
    const wrapper = new ClassicEditorWrapper();
    wrapper.clear();
    wrapper.getData().should("be.empty");
  });

  it("should set data slow (Wrapper)", () => {
    const wrapper = new ClassicEditorWrapper();
    wrapper.setDataSlow("");
    wrapper.getData().should("be.empty");
  });

  it("should type (Wrapper)", () => {
    const wrapper = new ClassicEditorWrapper();
    wrapper.clear();
    wrapper.focus();
    wrapper.editableElement.type("Horst");
    wrapper.getData().should("contain", "Horst");
  });

  it("should type (Wrapper)", () => {
    const wrapper = new ClassicEditorWrapper();
    wrapper.clear();
    wrapper.focus();
    wrapper.editableElement.type("Horst");
    wrapper.getData().should("contain", "Horst");
  });

  it("should type special characters", () => {
    const wrapper = new ClassicEditorWrapper();
    wrapper.focus();
    /*
     * Fixture: [{"input": "<", "expectedData": "&lt;"}, ...]
     */
    cy.fixture("special-characters.json", "utf-8").then((fixtures) => {
      for (const fixture of fixtures) {
        const { input, expectedData } = fixture;
        const text = `B${input}E`;
        const expected = `B${expectedData}E`;
        cy.log(`Typing ${input} should be transformed in data to: "${expectedData}"`);
        wrapper.editableElement.type(`{selectAll}${text}`);
        wrapper.getData().should("not.contain", text).should("contain", expected);
      }
    });
  });

  it("should display image", () => {
    const wrapInRichText = (rawData: string): string => {
      // noinspection HttpUrlsUsage
      return `<?xml version="1.0" encoding="utf-8"?><div xmlns="http://www.coremedia.com/2003/richtext-1.0" xmlns:xlink="http://www.w3.org/1999/xlink">${rawData}</div>`;
    };
    const contentId = 42;
    const uriPath = contentUriPath(contentId);
    // noinspection HtmlUnknownAttribute
    const data = wrapInRichText(`<p><img alt="Alternative Text" xlink:href="${uriPath}#properties.data"/></p>`);
    const wrapper = new ClassicEditorWrapper();
    const mockContent = new MockContentPluginWrapper();
    cy.fixture("red-240x135.png", "base64").then((base64ImageData) => {
      const src = `data:image/png;base64,${base64ImageData}`;
      mockContent.addContents({
        id: 42,
        name: "Some Image",
        blob: src,
      });
      wrapper.setData(data);
      wrapper.editableElement.find("img").invoke("attr", "src").should("eq", src);
      wrapper.editableElement
        .find("img")
        // The following works, but has no typings.
        // @ts-ignore
        .toMatchImageSnapshot({
          name: "red-240x135-snapshot",
        });
    });
  });

  it("should display slow loading image", () => {
    const wrapInRichText = (rawData: string): string => {
      // noinspection HttpUrlsUsage
      return `<?xml version="1.0" encoding="utf-8"?><div xmlns="http://www.coremedia.com/2003/richtext-1.0" xmlns:xlink="http://www.w3.org/1999/xlink">${rawData}</div>`;
    };
    const contentId = 42;
    const uriPath = contentUriPath(contentId);
    // noinspection HtmlUnknownAttribute
    const data = wrapInRichText(`<p><img alt="Alternative Text" xlink:href="${uriPath}#properties.data"/></p>`);
    const wrapper = new ClassicEditorWrapper();
    const mockContent = new MockContentPluginWrapper();
    cy.fixture("red-240x135.png", "base64").then((base64ImageData) => {
      const src = `data:image/png;base64,${base64ImageData}`;
      mockContent.addContents({
        id: 42,
        name: "Some Image",
        blob: src,
        initialDelayMs: 2000,
      });
      wrapper.setData(data);
      wrapper.editableElement.find("img").invoke("attr", "src").should("eq", src);
      wrapper.editableElement
        .find("img")
        // Does not work, as Percy seems to require a paid solution.
        // But: Percy seems to be actively maintained in contrast to cypress-plugin-snapshots
        .percySnapshot("red-240x135-snapshot-slow");
      wrapper.editableElement
        .find("img")
        // @ts-ignore
        .toMatchImageSnapshot({
          name: "red-240x135-snapshot-slow",
        });
    });
  });

  it("should display placeholder for (very) slow loading image", () => {
    const wrapInRichText = (rawData: string): string => {
      // noinspection HttpUrlsUsage
      return `<?xml version="1.0" encoding="utf-8"?><div xmlns="http://www.coremedia.com/2003/richtext-1.0" xmlns:xlink="http://www.w3.org/1999/xlink">${rawData}</div>`;
    };
    const contentId = 42;
    const uriPath = contentUriPath(contentId);
    // noinspection HtmlUnknownAttribute
    const data = wrapInRichText(`<p><img alt="Alternative Text" xlink:href="${uriPath}#properties.data"/></p>`);
    const wrapper = new ClassicEditorWrapper();
    const mockContent = new MockContentPluginWrapper();
    cy.fixture("red-240x135.png", "base64").then((base64ImageData) => {
      const src = `data:image/png;base64,${base64ImageData}`;
      mockContent.addContents({
        id: 42,
        name: "Some Image",
        blob: src,
        initialDelayMs: 36000,
      });
      wrapper.setData(data);
      wrapper.editableElement.find("img").invoke("attr", "src").should("contain", "data:image/svg+xml;utf8");
    });
  });

  it("should be able to drag and drop image", () => {
    const wrapInRichText = (rawData: string): string => {
      // noinspection HttpUrlsUsage
      return `<?xml version="1.0" encoding="utf-8"?><div xmlns="http://www.coremedia.com/2003/richtext-1.0" xmlns:xlink="http://www.w3.org/1999/xlink">${rawData}</div>`;
    };
    const contentId = 42;
    const uriPath = contentUriPath(contentId);
    // noinspection HtmlUnknownAttribute
    const data = wrapInRichText(
      `<table><tbody><tr class="tr--header"><td class="td--header">Source</td><td class="td--header">Target</td></tr><tr><td class="source"><p class="source"><img alt="" xlink:href="${uriPath}#properties.data"/></p></td><td class="target"><p class="target"></p></td></tr></tbody></table>`
    );
    const expected = wrapInRichText(
      `<table><tbody><tr class="tr--header"><td class="td--header">Source</td><td class="td--header">Target</td></tr><tr><td class="source"><p class="source"></p></td><td class="target"><p class="target"><img alt="" xlink:href="${uriPath}#properties.data"/></p></td></tr></tbody></table>`
    );

    // Wrapper to the CKEditor Instance, and, for example its content-editable area.
    const wrapper = new ClassicEditorWrapper();
    // Wrapper to create (mock) contents on the fly.
    const mockContent = new MockContentPluginWrapper();

    // Load image to create example content with blob-data.
    cy.fixture("red-240x135.png", "base64").then((base64ImageData) => {
      const src = `data:image/png;base64,${base64ImageData}`;
      mockContent.addContents({
        id: 42,
        name: "Some Image",
        blob: src,
        // Provoke, that the 'src' points to some placeholder-image for 2 seconds.
        initialDelayMs: 2000,
      });
      wrapper.setData(data);

      // See, that the image eventually loads and contains the correct src attribute (would be the blob-URL towards Studio-Server).
      wrapper.editableElement.find("img").invoke("attr", "src").should("eq", src);

      // Now drag and drop the image within the table.
      // @ts-ignore: Typings for Cypress.ClickOptions are incomplete, missing position attributes: https://docs.cypress.io/api/commands/trigger#Arguments and https://github.com/4teamwork/cypress-drag-drop#drag
      wrapper.editableElement
        .find("img")
        .first()
        .parent()
        .click()
        .drag(".target", {
          source: { position: "center" },
        })
        // @ts-ignore: This should work according to documentation, but typings seem to be wrong
        .then((success) => {
          assert.isTrue(success);
        });

      // Validate the content-editable state.
      wrapper.editableElement.find("td.target img").should("exist");
      wrapper.editableElement.find("td.source").should("not.contain.html", "img");

      // Validate, what matters: The data written to server.
      wrapper.getData().should("eq", expected);
    });
  });

  it("should be able to drag and drop image from external", () => {
    const wrapper = new ClassicEditorWrapper();
    wrapper.clear();

    cy.get("#dragExamplesButton").click();
    // https://github.com/cypress-io/cypress/issues/649
    // We need to mock the DataTransfer object.
    const dataTransfer = new MockDataTransfer();
    cy.get("div.drag-example").contains("Image")
      .trigger("dragstart", { dataTransfer })
      .trigger("dragleave", { dataTransfer });
    wrapper.editableElement.trigger("dragenter", { dataTransfer })
      .trigger("dragover", { dataTransfer })
      .trigger("drop", { dataTransfer })
      .trigger("dragend", { dataTransfer });

    wrapper.editableElement.find("img").invoke("attr", "src").should("contain", "data:image/svg+xml;utf8");
  });
});
