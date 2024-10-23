import { SetDataData } from "../src/DataControllerApi";
import { EditorUI, Autosave, Editor } from "ckeditor5";
import { jest } from "@jest/globals";
import { DataFacade } from "../src";

jest.useFakeTimers();

class DummyEditor extends Editor {
  readonly ui: EditorUI = {} as EditorUI;

  /**
   * Simulates an internal change to the data (like reordering attributes).
   * Similar to setting data, but skipping version update.
   * @param data - data to set to be _equal_ to the original set data
   */
  simulateDataReformat(data: SetDataData): void {
    const previousVersion = this.model.document.version;
    this.data.set(data);
    this.model.document.version = previousVersion;
  }

  /**
   * Make test more verbose (we could have invoked data controller directly).
   *
   * @param data - data that are the result of editorial changes
   */
  simulateEditorialUpdate(data: SetDataData): void {
    this.data.set(data);
  }
}

describe("DataFacade", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("should forward previously set data once initialized", async () => {
    const dataFixture = "DATA";
    const initDelay = new Promise<void>((resolve) => window.setTimeout(resolve, 1));
    const editor = new DummyEditor({
      plugins: [DataFacade, Autosave],
      // @ts-expect-error – Just some mock configuration.
      mock: {
        initDelay,
      },
    });
    const dataFacade = editor.plugins.get(DataFacade);
    // This will also forward the data to the editor, but we will not know
    // if the editor itself does not override these afterward, e.g., when
    // reading the `initialData` property.
    dataFacade.setData(dataFixture);
    editor.data.set("mocking data set from initialData");
    expect.assertions(2);
    await initDelay.then(() => {
      // After init is done, data should have been forwarded.
      expect(editor.data.get()).toEqual(dataFixture);

      // Caching should work.
      editor.simulateDataReformat(dataFixture.toLowerCase());
      expect(dataFacade.getData()).toEqual(dataFixture);
    });
  });
  describe("Autosave integration", () => {
    const dataFixture = "DATA";
    let savedData = "";
    let editor: DummyEditor;
    let autosave: InstanceType<typeof Autosave>;
    let dataFacade: InstanceType<typeof DataFacade>;
    beforeEach(() => {
      editor = new DummyEditor({
        plugins: [DataFacade, Autosave],
        dataFacade: {
          save(dataApi): Promise<void> {
            savedData = dataApi.getData();
            return Promise.resolve();
          },
        },
      });
      autosave = editor.plugins.get(Autosave);
      dataFacade = editor.plugins.get(DataFacade);
    });
    it("should hook into autosave and use custom configuration for saving cached data", async () => {
      dataFacade.setData(dataFixture);
      editor.simulateDataReformat(dataFixture.toLowerCase());
      expect.assertions(1);

      // We do not mock auto-forwarding set data to Autosave. Thus, invoking
      // it explicitly.
      await autosave.save().then(() => {
        expect(savedData).toEqual(dataFixture);
      });
    });
    it("should hook into autosave but prefer editorial changes on data facade's save", async () => {
      dataFacade.setData(dataFixture);
      editor.simulateEditorialUpdate(dataFixture.toLowerCase());
      expect.assertions(1);

      // We do not mock auto-forwarding set data to Autosave. Thus, invoking
      // it explicitly.
      await autosave.save().then(() => {
        expect(savedData).toEqual(dataFixture.toLowerCase());
      });
    });
  });
});
