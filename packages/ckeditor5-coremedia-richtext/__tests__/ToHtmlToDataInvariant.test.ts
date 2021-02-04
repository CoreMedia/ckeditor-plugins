import "jest-xml-matcher";
import UpcastWriter from "@ckeditor/ckeditor5-engine/src/view/upcastwriter";
import ViewDocumentFragment from "@ckeditor/ckeditor5-engine/src/view/documentfragment";
import RichTextDataProcessor from "../src/RichTextDataProcessor";

/*
 * This is a special set of tests which tests for invariant mapping of CoreMedia
 * RichText 1.0 to HTML and back. It is required, that any valid CoreMedia
 * RichText read from server has a consistent structure when being processed
 * via toData → toHtml.
 *
 * If during this mapping, the structure changes in any way, it will cause the
 * document to be automatically checked out just when opening in CoreMedia
 * Studio for example. The task is to prevent this.
 *
 * This test is meant to be extended on any support case, where such behavior
 * has been observed.
 */

type TestData = { content: string };
type TestFixture = [string, TestData];

const testFixtures: TestFixture[] = [
  [
    "empty richtext; state after deleting all content in richtext property field",
    {
      content: `<div xmlns="http://www.coremedia.com/2003/richtext-1.0" xmlns:xlink="http://www.w3.org/1999/xlink"><p><br/></p></div>`,
    },
  ],
];

describe("toData > toHtml: Invariant Contract Tests", () => {
  test.each<TestFixture>(testFixtures)("(%#) %s", (name: string, testData: TestData) => {
    const upcastWriter = new UpcastWriter(document);
    const documentFragment: ViewDocumentFragment = upcastWriter.createDocumentFragment();
    const dataProcessor = new RichTextDataProcessor(document);

    // TODO[cke]: Extend Typings, see if we can/should use CKEditor API here, or instead extract some
    //   methods which directly work on DOM. Risk of the latter approach: The others may
    //   perform changes, we don't expect to happen.
  });
});
