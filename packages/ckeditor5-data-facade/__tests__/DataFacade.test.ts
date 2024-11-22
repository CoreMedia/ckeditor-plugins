import { Autosave, Editor } from "ckeditor5";
import { DataFacade, GetDataApi, SetDataData } from "../src";
import { allPlugins, completeToolbar, createTestEditor, prepareDocument } from "./helpers/TestEditor";

const simulateDataReformat = (data: SetDataData, editor: Editor) => {
  const previousVersion = editor.model.document.version;
  editor.data.set(data);
  editor.model.document.version = previousVersion;
};

const simulateEditorialUpdate = (data: SetDataData, editor: Editor) => {
  editor.data.set(data);
};

describe("DataFacade", () => {
  beforeEach(() => {
    prepareDocument(document);
  });
  it("should forward previously set data once initialized", async () => {
    const dataFixture = "<p>DATA</p>";
    const editor = await createTestEditor();
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
  describe("Autosave integration", () => {
    const dataFixture = "<p>DATA</p>";
    let savedData = "";
    let editor: Editor;
    let autosave: Autosave;
    let dataFacade: InstanceType<typeof DataFacade>;
    beforeEach(async () => {
      prepareDocument(document);
      editor = await createTestEditor("main", allPlugins, completeToolbar, {
        dataFacade: {
          save(dataApi: GetDataApi): Promise<void> {
            savedData = dataApi.getData();
            return Promise.resolve();
          },
        },
      });
      // await editor.initPlugins();
      autosave = editor.plugins.get(Autosave);
      dataFacade = editor.plugins.get(DataFacade);
    });
    it("should hook into autosave and use custom configuration for saving cached data", async () => {
      dataFacade.setData(dataFixture);
      simulateDataReformat(dataFixture.toLowerCase(), editor);
      expect.assertions(1);

      // We do not mock auto-forwarding set data to Autosave. Thus, invoking
      // it explicitly.
      await autosave.save().then(() => {
        expect(savedData).toEqual(dataFixture);
      });
    });
    it("should hook into autosave but prefer editorial changes on data facade's save", async () => {
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
