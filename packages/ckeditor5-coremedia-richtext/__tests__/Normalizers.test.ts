import { normalizeEmptyParagraphs, normalizeNamespaceDeclarations, normalizeXmlDeclaration } from "../src/Normalizers";

const CR = `\u{000D}`;
const LF = `\n`;
const CRLF = `${CR}${LF}`;
const NBSP = `\u{00A0}`;
/**
 * Decision how to represent empty paragraphs.
 * This function exists, so that we may easily decide different
 * in the future.
 */
const normalizedEmptyP = (className?: string): string => {
  if (className === undefined) {
    return `<p/>`;
  }
  return `<p class="${className}"/>`;
};

describe("Normalizers", () => {
  describe("normalizeXmlDeclaration()", () => {
    test.each`
      value                                                               | normalized  | comment
      ${``}                                                               | ${``}       | ${`Don't change empty string.`}
      ${`<div/>`}                                                         | ${`<div/>`} | ${`Don't change for no XML declaration.`}
      ${`<?xml version="1.0"?><div/>`}                                    | ${`<div/>`} | ${`Remove on same line.`}
      ${`<?xml version="1.0"?>${LF}<div/>`}                               | ${`<div/>`} | ${`Remove on new line (LF).`}
      ${`<?xml version="1.0"?>${CRLF}<div/>`}                             | ${`<div/>`} | ${`Remove on new line (CRLF).`}
      ${`<?xml version="1.0" encoding="UTF-8" standalone="yes" ?><div/>`} | ${`<div/>`} | ${`Ignore any additional parameters, too.`}
    `("[$#] Should normalize '$value' to: '$normalized' ($comment)", ({ value, normalized }) => {
      const actual = normalizeXmlDeclaration(value);
      expect(actual).toStrictEqual(normalized);
    });
  });

  describe("normalizeNamespaceDeclarations()", () => {
    // noinspection XmlUnusedNamespaceDeclaration,HtmlUnknownAttribute
    test.each`
      value                                                                                      | normalized                  | comment
      ${``}                                                                                      | ${``}                       | ${`Don't change empty string.`}
      ${`<div/>`}                                                                                | ${`<div/>`}                 | ${`Don't change for no namespaces defined.`}
      ${`<div />`}                                                                               | ${`<div/>`}                 | ${`Cleanup Side Effect: Should replace duplicate spaces.`}
      ${`<div  />`}                                                                              | ${`<div/>`}                 | ${`Cleanup Side Effect: Should replace duplicate spaces.`}
      ${`<div ></div>`}                                                                          | ${`<div></div>`}            | ${`Cleanup Side Effect: Should replace duplicate spaces.`}
      ${`<div  ></div>`}                                                                         | ${`<div></div>`}            | ${`Cleanup Side Effect: Should replace duplicate spaces.`}
      ${`<div xmlns="https://example.org"/>`}                                                    | ${`<div/>`}                 | ${`Remove default namespace.`}
      ${`<div xmlns="https://example.org"></div>`}                                               | ${`<div></div>`}            | ${`Remove default namespace.`}
      ${`<div xmlns:xmp="https://example.org"/>`}                                                | ${`<div/>`}                 | ${`Remove namespace.`}
      ${`<div xmlns:xmp="https://example.org"></div>`}                                           | ${`<div></div>`}            | ${`Remove namespace.`}
      ${`<div xmlns:xmp="https://example.org" class="xmp"/>`}                                    | ${`<div class="xmp"/>`}     | ${`Remove namespace, keep default namespace attributes.`}
      ${`<div xmlns:xmp="https://example.org" xmp:class="xmp"/>`}                                | ${`<div xmp:class="xmp"/>`} | ${`Remove namespace, keep namespaced attributes.`}
      ${`<div xmlns:xmp1="https://example.org/1" xmlns:xmp2="https://example.org/2"/>`}          | ${`<div/>`}                 | ${`Remove multiple namespaces.`}
      ${`<div xmlns:xmp1="https://example.org/1"><p xmlns:xmp2="https://example.org/2"/></div>`} | ${`<div><p/></div>`}        | ${`Remove namespaces on several levels.`}
    `("[$#] Should normalize '$value' to: '$normalized' ($comment)", ({ value, normalized }) => {
      const actual = normalizeNamespaceDeclarations(value);
      expect(actual).toStrictEqual(normalized);
    });
  });

  describe("normalizeEmptyParagraphs()", () => {
    // noinspection XmlUnusedNamespaceDeclaration,HtmlUnknownAttribute
    test.each`
      value                                      | normalized                                                 | comment
      ${``}                                      | ${``}                                                      | ${`Don't change empty string.`}
      ${`<div/>`}                                | ${`<div/>`}                                                | ${`Don't change for no empty paragraphs`}
      ${`<div>${normalizedEmptyP()}</div>`}      | ${`<div>${normalizedEmptyP()}</div>`}                      | ${`Don't change already normalized.`}
      ${`<div>${normalizedEmptyP("xmp")}</div>`} | ${`<div>${normalizedEmptyP("xmp")}</div>`}                 | ${`Don't change already normalized.`}
      ${`<div><p/></div>`}                       | ${`<div>${normalizedEmptyP()}</div>`}                      | ${``}
      ${`<div><p></p></div>`}                    | ${`<div>${normalizedEmptyP()}</div>`}                      | ${``}
      ${`<div><p class="xmp"/></div>`}           | ${`<div>${normalizedEmptyP("xmp")}</div>`}                 | ${``}
      ${`<div><p class="xmp"></p></div>`}        | ${`<div>${normalizedEmptyP("xmp")}</div>`}                 | ${``}
      ${`<div><p>&nbsp;</p></div>`}              | ${`<div>${normalizedEmptyP()}</div>`}                      | ${``}
      ${`<div><p class="xmp">&nbsp;</p></div>`}  | ${`<div>${normalizedEmptyP("xmp")}</div>`}                 | ${``}
      ${`<div><p>${NBSP}</p></div>`}             | ${`<div>${normalizedEmptyP()}</div>`}                      | ${``}
      ${`<div><p class="xmp">${NBSP}</p></div>`} | ${`<div>${normalizedEmptyP("xmp")}</div>`}                 | ${``}
      ${`<div><p><br/></p></div>`}               | ${`<div>${normalizedEmptyP()}</div>`}                      | ${``}
      ${`<div><p><br /></p></div>`}              | ${`<div>${normalizedEmptyP()}</div>`}                      | ${``}
      ${`<div><p><br/></p><p><br/></p></div>`}   | ${`<div>${normalizedEmptyP()}${normalizedEmptyP()}</div>`} | ${`Should normalize multiple times.`}
    `("[$#] Should normalize '$value' to: '$normalized' ($comment)", ({ value, normalized }) => {
      const actual = normalizeEmptyParagraphs(value);
      expect(actual).toStrictEqual(normalized);
    });
  });
});
