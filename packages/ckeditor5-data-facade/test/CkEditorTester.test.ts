import "./setup.mjs";
import test, { describe, beforeEach, afterEach } from "node:test";
import expect from "expect";
import { completeToolbar, createTestEditor, prepareDocument } from "./helpers/TestEditor";

void describe("CkEditor", () => {
  beforeEach(() => {
    prepareDocument(document);
  });

  void test("Element with id 'main' exists", () => {
    expect(document.getElementById("main")).toBeTruthy();
  });

  void test("Should be an editor available, including a toolbar.", async () => {
    const editor = await createTestEditor();
    expect(editor?.ui.element?.parentElement?.tagName).toEqual("BODY");
    expect(document.getElementsByTagName("button").length).toEqual(completeToolbar.length);
  });

  void test("Should be possible to use the DataController.", async () => {
    const editor = await createTestEditor();
    editor?.data?.set("<p>test</p>");
    expect(editor?.data.get()).toEqual("<p>test</p>");
  });
});
