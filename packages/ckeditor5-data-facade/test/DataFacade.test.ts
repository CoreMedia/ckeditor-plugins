import "./setup.mjs";
import test, { describe, beforeEach } from "node:test";
import expect from "expect";
import type { Editor } from "ckeditor5";
import { Autosave } from "ckeditor5";
import { DataFacade } from "../src/DataFacade";
import type { GetDataApi } from "../src/DataApi";
import type { SetDataData } from "../src/DataControllerApi";
import { allPlugins, completeToolbar, createTestEditor, prepareDocument } from "./helpers/TestEditor";

const simulateDataReformat = (data: SetDataData, editor: Editor) => {
  const previousVersion = editor.model.document.version;
  editor.data.set(data);
  editor.model.document.version = previousVersion;
};

const simulateEditorialUpdate = (data: SetDataData, editor: Editor) => {
  editor.data.set(data);
};

void describe("DataFacade", () => {
  beforeEach(() => {
    prepareDocument(document);
  });
  void test("should forward previously set data once initialized", async () => {
    const dataFixture = "<p>DATA</p>";
    const editor = await createTestEditor();
    if (!editor) {
      expect(editor).toBeDefined();
      return;
    }
    const dataFacade = editor.plugins.get(DataFacade);
    // This will also forward the data to the editor, but we will not know
    // if the editor itself does not override these afterward, e.g., when
    // reading the `initialData` property.
    dataFacade.setData(dataFixture);
    expect.assertions(2);
    // await initDelay;
    // After init is done, data should have been forwarded.
    expect(editor.data.get()).toEqual(dataFixture);

    // Caching should work.
    simulateDataReformat(dataFixture.toLowerCase(), editor);
    expect(dataFacade.getData()).toEqual(dataFixture);
  });
  void describe("Autosave integration", () => {
    const dataFixture = "<p>DATA</p>";
    let savedData = "";
    let editor: Editor;
    let autosave: Autosave;
    let dataFacade: InstanceType<typeof DataFacade>;
    beforeEach(async () => {
      prepareDocument(document);
      const newEditor = await createTestEditor("main", allPlugins, completeToolbar, {
        dataFacade: {
          save(dataApi: GetDataApi): Promise<void> {
            savedData = dataApi.getData();
            return Promise.resolve();
          },
        },
      });
      if (!newEditor) {
        throw new Error("Editor creation failed");
      }
      editor = newEditor;
      // await editor.initPlugins();
      autosave = editor.plugins.get(Autosave);
      dataFacade = editor.plugins.get(DataFacade);
    });
    void test("should hook into autosave and use custom configuration for saving cached data", async () => {
      dataFacade.setData(dataFixture);
      simulateDataReformat(dataFixture.toLowerCase(), editor);
      expect.assertions(1);

      // We do not mock auto-forwarding set data to Autosave. Thus, invoking
      // it explicitly.
      await autosave.save().then(() => {
        expect(savedData).toEqual(dataFixture);
      });
    });
    void test("should hook into autosave but prefer editorial changes on data facade's save", async () => {
      dataFacade.setData(dataFixture);
      simulateEditorialUpdate(dataFixture.toLowerCase(), editor);
      expect.assertions(1);

      // We do not mock auto-forwarding set data to Autosave. Thus, invoking
      // it explicitly.
      await autosave.save().then(() => {
        expect(savedData).toEqual(dataFixture.toLowerCase());
      });
    });
  });
});
