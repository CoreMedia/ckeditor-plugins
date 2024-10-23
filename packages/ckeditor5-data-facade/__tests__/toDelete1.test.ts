import { DataFacade } from "../src";

const { ClassicEditor } = await import("ckeditor5");

it("is just a simple test", async () => {
  const editor = await ClassicEditor.create("<div></div>", { plugins: [DataFacade] });

  expect(editor.plugins.has("DataFacade")).toBeTruthy();
});

export {};
