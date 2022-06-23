import { ApplicationWrapper } from "./aut/ApplicationWrapper";
import "./expect/ElementHandleExpectations";
import ClipboardBrowserAccessor from "./browser/ClipboardBrowserAccessor";
import * as fs from "fs";
import ReplaceAllPasteAction from "./actions/ReplaceAllPasteAction";

const WORD_DOCUMENT_TEMPLATE_PATH = "test-data/font-mapper/word-document-template.html";
const WORD_DOCUMENT_TEMPLATE = fs.readFileSync(WORD_DOCUMENT_TEMPLATE_PATH).toString();
const CHARACTER_PLACEHOLDER = "{PLACE_HOLDER}";

describe("Symbol on paste mapper features", () => {
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
   * <p>
   *   Test for the FontMapper Plugin.
   * </p>
   * <p>
   *   The FontMapper Plugin replaces characters for the Symbol-Font
   *   (or a configured font) to be displayable in the browser.
   * </p>
   * <p>
   *   For this test a word-document in html exists which contains a placeholder.
   *   The placeholder is set to a location where the symbol font is applied and
   *   has to be replaced with the symbol-character to test.
   *   Those symbol-characters are the input for the test.
   * </p>
   */
  it.each([
    ["∃", ""],
    ["∀", ""],
  ])(`Should render %s when %s pasted from a word document`, async (expected, input) => {
    const { editor } = application;
    await editor.editing.view.focus();
    const wordDocumentWithSymbol = WORD_DOCUMENT_TEMPLATE.replace(CHARACTER_PLACEHOLDER, input);
    await ClipboardBrowserAccessor.write({ type: "text/html", content: wordDocumentWithSymbol });

    await editor.editing.view.focus();
    await ReplaceAllPasteAction.execute();

    /*
     * -----------------------------------------------------------------------
     * Validating that the symbol is replaced the FontMapper plugin.
     * -----------------------------------------------------------------------
     */
    expect(editor).waitForDataContaining(expected);
  });
});
