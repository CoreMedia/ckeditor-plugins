import * as fs from "fs";
import { ApplicationWrapper } from "./aut/ApplicationWrapper";
import "./expect/Expectations";
import ClipboardBrowserAccessor from "./browser/ClipboardBrowserAccessor";
import ReplaceAllPasteAction from "./user-interaction/ReplaceAllPasteAction";

const CHARACTER_PLACEHOLDER = "{PLACE_HOLDER}";

describe("Font Mapper features", () => {
  let application: ApplicationWrapper;

  beforeAll(async () => {
    application = await ApplicationWrapper.start();
    await application.goto();
    await expect(application).waitForCKEditorToBeAvailable();
  });

  afterAll(async () => {
    await application?.shutdown();
  });

  beforeEach(() => {
    application.console.open();
  });

  afterEach(() => {
    expect(application.console).toHaveNoErrorsOrWarnings();
    application.console.close();
  });

  /**
   * Test for the FontMapper Plugin.
   *
   * The FontMapper Plugin replaces characters for the Symbol-Font
   * (or a configured font) to be displayable in the browser.
   *
   * For this test, a Word-document in HTML exists which contains a placeholder.
   * The placeholder is set to a location where the symbol font is applied and
   * has to be replaced with the symbol-character to test.
   * Those symbol-characters are the input for the test.
   */
  // TODO[cke] Headless testing does not work currently. Clipboard is not written as expected.
  it.skip.each([
    "test-data/font-mapper/word-template.html",
    "test-data/font-mapper/word-template-table.html",
    "test-data/font-mapper/word-template-table-inherit-font.html",
  ])(`Should render ∃ when pasted from word document %s`, async (wordDocumentTemplatePath: string) => {
    const expected = "∃";
    const input = "$";
    const wordDocumentTemplate = fs.readFileSync(wordDocumentTemplatePath).toString();
    const wordDocumentWithSymbol = wordDocumentTemplate.replace(CHARACTER_PLACEHOLDER, input);
    const { editor } = application;
    await editor.editing.view.focus();
    await ClipboardBrowserAccessor.write({ type: "text/html", content: wordDocumentWithSymbol });

    await editor.editing.view.focus();
    await ReplaceAllPasteAction.execute();

    /*
     * -----------------------------------------------------------------------
     * Validating that the symbol is replaced by the FontMapper plugin.
     * -----------------------------------------------------------------------
     */
    await expect(editor).waitForDataContaining(expected);
  });
});
