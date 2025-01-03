import { completeToolbar, createTestEditor, prepareDocument } from "./helpers/TestEditor";

describe("CkEditor", () => {
  beforeEach(() => {
    prepareDocument(document);
  });

  afterEach(() => {
    // restore the original func after test
    jest.resetModules();
  });

  it("Element with id 'main' exists", () => {
    expect(document.getElementById("main")).toBeTruthy();
  });

  it("Should be an editor available, including a toolbar.", async () => {
    const editor = await createTestEditor();
    expect(editor.ui.element?.parentElement?.tagName).toEqual("BODY");
    expect(document.getElementsByTagName("button").length).toEqual(completeToolbar.length);
  });

  it("Should be possible to use the DataController.", async () => {
    const editor = await createTestEditor();
    editor.data.set("<p>test</p>");
    expect(editor.data.get()).toEqual("<p>test</p>");
  });
});
