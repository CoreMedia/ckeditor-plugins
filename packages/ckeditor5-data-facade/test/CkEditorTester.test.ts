/* eslint-disable @typescript-eslint/no-floating-promises */
import "global-jsdom/register";
import test, { describe, beforeEach, afterEach } from "node:test";
import expect from "expect";
import { completeToolbar, createTestEditor, prepareDocument } from "./helpers/TestEditor";

describe("CkEditor", () => {
  beforeEach(() => {
    // TODO[ntr] we'll need to prepare a little more here, see jest.setup.cjs;
    prepareDocument(document);
  });

  afterEach(() => {
    // restore the original func after test
    // TODO[ntr] jest.resetModules();
  });

  test("Element with id 'main' exists", () => {
    expect(document.getElementById("main")).toBeTruthy();
  });

  test("Should be an editor available, including a toolbar.", async () => {
    const editor = await createTestEditor();
    expect(editor.ui.element?.parentElement?.tagName).toEqual("BODY");
    expect(document.getElementsByTagName("button").length).toEqual(completeToolbar.length);
  });

  test("Should be possible to use the DataController.", async () => {
    const editor = await createTestEditor();
    editor.data.set("<p>test</p>");
    expect(editor.data.get()).toEqual("<p>test</p>");
  });
});
