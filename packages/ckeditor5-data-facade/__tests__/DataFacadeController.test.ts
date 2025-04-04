import { ContextMismatchError, DataFacade, DataFacadeController, SetDataData } from "../src";
import { CKEditorError, Editor } from "ckeditor5";
import { jest } from "@jest/globals";
import { createTestEditor, prepareDocument } from "./helpers/TestEditor";

/**
 * Simulates an internal change to the data (like reordering attributes).
 * Similar to setting data, but skipping version update.
 * @param data - data to set to be _equal_ to the original set data
 * @param editor - the editor to change the data for
 */
const simulateDataReformat = (data: SetDataData, editor: Editor) => {
  const previousVersion = editor.model.document.version;
  editor.data.set(data);
  editor.model.document.version = previousVersion;
};

/**
 * Make test more verbose (we could have invoked data controller directly).
 * @param data - data that are the result of editorial changes
 * @param editor - the editor to change the data for
 */
const simulateEditorialUpdate = (data: SetDataData, editor: Editor) => {
  editor.data.set(data);
};

describe("DataFacadeController", () => {
  beforeEach(() => {
    prepareDocument(document);
  });

  // ========================================================[ Delegating Mode ]

  describe("Delegating Mode", () => {
    it("should retrieve data from delegate controller when in delegating mode", async () => {
      const dataFixture = "<p>DATA</p>";
      const controller = new DataFacadeController();
      const editor = await createTestEditor();
      const dataFacade = editor.plugins.get(DataFacade);
      controller.init(editor);
      expect(controller).toHaveProperty("delegating", true);
      dataFacade.setData(dataFixture);
      simulateDataReformat(dataFixture.toLowerCase(), editor);

      // Theoretically, without delegating enabled, the subsequent get should
      // directly forward to editor (no data yet cached in the original
      // controller).
      //
      // Thus, because we now get the cached data, we know that it is from
      // the data-controller we delegate to.
      expect(controller.getData()).toEqual(dataFixture);
    });
    it("should propagate data to delegate and editor subsequently when delegation gets initialized", async () => {
      const dataFixture = "<p>DATA</p>";
      const controller = new DataFacadeController();
      const editor = await createTestEditor();
      const dataFacade = editor.plugins.get(DataFacade);
      controller.setData(dataFixture);
      editor.data.set = jest.fn();
      controller.init(editor);
      expect(controller).toHaveProperty("delegating", true);

      // Should have propagated on init to delegate data-facade-controller and
      // to editor subsequently.
      expect(dataFacade.getData()).toEqual(dataFixture);
      expect(editor.data.set).toHaveBeenCalledWith(dataFixture, {});

      // Some additional check, that delegation also respects caching now.
      simulateDataReformat(dataFixture.toLowerCase(), editor);
      expect(dataFacade.getData()).toEqual(dataFixture);
    });
    it("should forward data set to delegate directly", async () => {
      const dataFixture = "<p>DATA</p>";
      const controller = new DataFacadeController();
      const editor = await createTestEditor();
      const dataFacade = editor.plugins.get(DataFacade);
      controller.init(editor);
      expect(controller).toHaveProperty("delegating", true);

      // Should be forwarded to delegate.
      controller.setData(dataFixture);

      // Should have propagated to delegate data-facade-controller and
      // to editor subsequently.
      expect(dataFacade.getData()).toEqual(dataFixture);
      expect(editor.data.get()).toEqual(dataFixture);
    });
  });

  // ========================================================[ Standalone Mode ]

  describe("Standalone Mode", () => {
    // ----------------------------------------------------------[ Constructor ]

    describe("constructor", () => {
      it("should be possible creating an instance without editor reference", () => {
        const controller = new DataFacadeController();
        expect(controller).toHaveProperty("editor", undefined);
      });
    });

    // -----------------------------------------------------------------[ Init ]

    describe("init", () => {
      it("should be possible to bind to editor even without DataFacade plugin installed", async () => {
        const controller = new DataFacadeController();
        const editor = await createTestEditor();
        controller.init(editor);
        expect(controller).toHaveProperty("editor", editor);
      });
      it("should propagate any already set data", async () => {
        const dataFixture = "<p>DATA</p>";
        const controller = new DataFacadeController();
        const editor = await createTestEditor();
        controller.setData(dataFixture);
        editor.data.set = jest.fn();
        controller.init(editor);
        expect(editor.data.set).toHaveBeenCalledWith(dataFixture, {});
      });
    });

    // ------------------------------------------------------[ getData/setData ]

    describe("getData/setData", () => {
      describe("General Use Cases", () => {
        it("should cache data if not bound to editor instance already", () => {
          const dataFixture = "<p>DATA</p>";
          const controller = new DataFacadeController();
          controller.setData(dataFixture);
          expect(controller.getData()).toEqual(dataFixture);
        });
        it("should propagate data set if bound to editor instance", async () => {
          const dataFixture = "<p>DATA</p>";
          const editor = await createTestEditor();
          const controller = new DataFacadeController(editor);
          editor.data.set = jest.fn();
          controller.setData(dataFixture);
          expect(controller.getData()).toEqual(dataFixture);
          expect(editor.data.set).toHaveBeenCalledWith(dataFixture, {});
        });
        it("should read data directly, if none cached", async () => {
          const dataFixture = "<p>Some text.</p>";
          const editor = await createTestEditor();
          const controller = new DataFacadeController(editor);
          // Similar to: There was some other way, that provided the initial data.
          simulateEditorialUpdate(dataFixture, editor);
          expect(controller.getData()).toEqual(dataFixture);
          expect(editor.data.get()).toEqual(dataFixture);
        });
        describe("Options on get support", () => {
          it.each`
            trim       | data        | expected
            ${"empty"} | ${" DATA "} | ${" DATA "}
            ${"none"}  | ${" DATA "} | ${" DATA "}
          `(
            "[$#] should ignore options in bound mode but without editorial actions applied (trim = $trim)",
            async ({ trim, data, expected }: { trim: "empty" | "none"; data: string; expected: string }) => {
              const editor = await createTestEditor();
              const controller = new DataFacadeController(editor);
              controller.setData(data);
              expect(
                controller.getData({
                  trim,
                }),
              ).toEqual(expected);
            },
          );
          it.each`
            trim       | data               | expected
            ${"empty"} | ${" <p>DATA</p> "} | ${"<p>DATA</p>"}
            ${"empty"} | ${"<p>&nbsp;</p>"} | ${""}
            ${"none"}  | ${"<p>&nbsp;</p>"} | ${"<p>&nbsp;</p>"}
          `(
            "[$#] should forward options in bound mode when editorial changes got applied (trim = $trim)",
            async ({ trim, data, expected }: { trim: "empty" | "none"; data: string; expected: string }) => {
              const dataSet = "originalData";
              const editor = await createTestEditor();
              const controller = new DataFacadeController(editor);
              controller.setData(dataSet);
              simulateEditorialUpdate(data, editor);
              expect(
                controller.getData({
                  trim,
                }),
              ).toEqual(expected);
            },
          );
        });
        describe("Multi-Root Support", () => {
          it("should respect available rootName in unbound mode", () => {
            const dataFixture = "<p>DATA</p>";
            const rootName = "ROOT";
            const controller = new DataFacadeController();
            controller.setData({
              [rootName]: dataFixture,
            });
            expect(
              controller.getData({
                rootName,
              }),
            ).toEqual(dataFixture);
          });

          /**
           * Here is some design space: Is it ok, to simulate the failure "early"
           * here, although we cannot know yet for sure, if a given root is
           * unavailable?
           *
           * In the example below, where no data has been cached yet, we took
           * the offensive approach, by possibly triggering a failure late
           * on initialization (binding to editor), only. We decided this way,
           * as in that case, we do not have any hints available on existing
           * root names.
           *
           * Here, when we already have some data cached, we may provide a
           * rough guess if a `rootName` is available later. That is why
           * we decided to follow a fail-early approach.
           *
           * This decision may/should be revisited once we actively use
           * multi-root-editing.
           */
          it("should simulate data retrieval failure on unavailable rootName in cache", () => {
            const dataFixture = "<p>DATA</p>";
            const rootName = "ROOT";
            const controller = new DataFacadeController();
            const callToFail = () =>
              controller.getData({
                rootName,
              });

            // Will set data for rootName = main.
            controller.setData(dataFixture);
            expect(callToFail).toThrow(CKEditorError);
          });

          /**
           * Here is some design space: What to do, when no data have been set
           * yet and no editor bound yet, when trying to get data for some
           * yet unknown `rootName`?
           *
           * We could simulate a failure. But as we do not know if the
           * editor would know such a `rootName`, we may as well decide not
           * to fail early – which again would mean that we may have a
           * failure later on initialization.
           *
           * We decided for the latter, mostly because the code path is easier
           * to follow and can skip some nested if-statements.
           *
           * This decision may/should be revisited once we actively use
           * multi-root-editing.
           */
          it("should not fail on unavailable rootName but empty cache", () => {
            const rootName = "ROOT";
            const controller = new DataFacadeController();
            const callToFail = () =>
              controller.getData({
                rootName,
              });
            expect(callToFail).not.toThrow(CKEditorError);
          });
        });
      });
      describe("Main Use Cases", () => {
        it("should prefer original data on no editorial change (main use case)", async () => {
          const dataFixture = "<p>DATA</p>";
          const internallyNormalizedData = dataFixture.toLowerCase();
          const editor = await createTestEditor();
          const controller = new DataFacadeController(editor);
          controller.setData(dataFixture);
          simulateDataReformat(internallyNormalizedData, editor);

          // Precondition check that our simulated change works.
          expect(editor.data.get()).toEqual(internallyNormalizedData);

          // No version change? Provide the original data.
          expect(controller.getData()).toEqual(dataFixture);
        });
        it("should prefer data as result from editing (main use case)", async () => {
          const dataFixture = "<p>DATA</p>";
          const editorialData = dataFixture.toLowerCase();
          const editor = await createTestEditor();
          const controller = new DataFacadeController(editor);
          controller.setData(dataFixture);
          simulateEditorialUpdate(editorialData, editor);

          // Precondition check that our simulated change works.
          expect(editor.data.get()).toEqual(editorialData);

          // Version change? Must not provide data originally set via data facade
          // controller.
          expect(controller.getData()).toEqual(editorialData);
        });
      });
      describe("Feature: Context Awareness", () => {
        describe.each`
          editorBinding
          ${"unbound"}
          ${"bound"}
        `("[$#] Editor Binding: $editorBinding", ({ editorBinding }: { editorBinding: "unbound" | "bound" }) => {
          let editor: Editor | undefined;
          beforeEach(async () => {
            if (editorBinding === "bound") {
              editor = await createTestEditor();
            }
          });
          it("should provide data on context match", () => {
            const dataFixture = "<p>DATA</p>";
            const contextOnSet = "document/1";
            const contextOnGet = contextOnSet;
            const controller = new DataFacadeController(editor);
            controller.setData(dataFixture, {
              context: contextOnSet,
            });
            expect(
              controller.getData({
                context: contextOnGet,
              }),
            ).toEqual(dataFixture);
          });
          it("should fail providing data if not specified when setting data", () => {
            const dataFixture = "<p>DATA</p>";
            const contextOnGet = "document/1";
            const controller = new DataFacadeController(editor);
            controller.setData(dataFixture);
            expect(() =>
              controller.getData({
                context: contextOnGet,
              }),
            ).toThrow(ContextMismatchError);
          });
          it("should fail providing data if not specified when getting data", () => {
            const dataFixture = "<p>DATA</p>";
            const contextOnSet = "document/1";
            const controller = new DataFacadeController(editor);
            controller.setData(dataFixture, {
              context: contextOnSet,
            });
            expect(() => controller.getData()).toThrow(ContextMismatchError);
          });
          it("should fail providing data if contexts on set and get do not match", () => {
            const dataFixture = "<p>DATA</p>";
            const contextOnSet = "document/1";
            const contextOnGet = "document/2";
            const controller = new DataFacadeController(editor);
            controller.setData(dataFixture, {
              context: contextOnSet,
            });
            expect(() =>
              controller.getData({
                context: contextOnGet,
              }),
            ).toThrow(ContextMismatchError);
          });
          (editorBinding === "bound" ? describe : describe.skip)("Bound Mode", () => {
            it("should respect context also when getting data as result of editorial changes (same context scenario)", () => {
              const dataFixture = "<p>DATA</p>";
              const editedDataFixture = dataFixture.toLowerCase();
              const contextOnSet = "document/1";
              const contextOnGet = contextOnSet;
              const controller = new DataFacadeController(editor);
              controller.setData(dataFixture, {
                context: contextOnSet,
              });
              editor && simulateEditorialUpdate(editedDataFixture, editor);
              expect(
                controller.getData({
                  context: contextOnGet,
                }),
              ).toEqual(editedDataFixture);
            });
            it("should respect context also when getting data as result of editorial changes (expected failure due to different context)", () => {
              const dataFixture = "<p>DATA</p>";
              const editedDataFixture = dataFixture.toLowerCase();
              const contextOnSet = "document/1";
              const contextOnGet = "document/2";
              const controller = new DataFacadeController(editor);
              controller.setData(dataFixture, {
                context: contextOnSet,
              });
              editor && simulateEditorialUpdate(editedDataFixture, editor);
              expect(() =>
                controller.getData({
                  context: contextOnGet,
                }),
              ).toThrow(ContextMismatchError);
            });
          });
        });
      });
    });
  });
});
