import "global-jsdom/register";
import { describe } from "node:test";
import type { DataProcessingTestCase } from "../DataDrivenTests";
import { allDataProcessingTests, Direction } from "../DataDrivenTests";

// noinspection HttpUrlsUsage
const ns_richtext = "http://www.coremedia.com/2003/richtext-1.0";
// noinspection HttpUrlsUsage
const ns_xdiff = "http://www.coremedia.com/2015/xdiff";
const text = "TEXT";

// noinspection XmlUnusedNamespaceDeclaration
const wrapContent = (content: string): string =>
  `<div xmlns="${ns_richtext}" xmlns:xdiff="${ns_xdiff}">${content}</div>`;

/*
 * The <xdiff:span> element (xmlns:xdiff="http://www.coremedia.com/2015/xdiff")
 * must not make it to the server. There may be scenarios (for example
 * copy & paste), where these elements become part of the richtext to store
 * on the server.
 *
 * Note, that the namespace declaration will not make it onto the server, but
 * needs to be added for testing purpose only, as there is no "namespace
 * cleanup feature".
 */
// TODO[cke] Up to now, Differencing is not implemented for CKEditor 5.
//   Thus, there is more to come and existing configuration is subject to change.
//   It is expected, for example, that the data view representation changes.
void describe("CoreMediaRichTextConfig: Differencing Tags", () => {
  const data: DataProcessingTestCase[] = [
    {
      name: "XDIFF#1: Should remove invalid <xdiff:span> tag, but keep children.",
      direction: Direction.toData,
      data: wrapContent(`<p>${text}</p>`),
      dataView: wrapContent(`<p><xdiff:span xdiff:class="diff-html-removed">${text}</xdiff:span></p>`),
    },
  ];

  allDataProcessingTests(data);
});
