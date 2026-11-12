# Testing SymbolOnPasteMapper

While the core functions are covered by unit tests, there is no integration test
with CKEditor. Thus, to ensure, everything still works as expected you should run
a manual test upon release.

## Manual Test: Paste Test Fixture

There is a test-fixture, which you have to open in native Microsoft Word application.
Select all text and paste it to the example application. The document will tell
you about the expected results.

* [SymbolFontCopyPaste-TestFixture.docx](__test_data__/SymbolFontCopyPaste-TestFixture.docx)
