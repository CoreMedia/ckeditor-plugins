import "jest-xml-matcher";
import RichTextSchema, { Strictness } from "../src/RichTextSchema";
import { MutableElement } from "@coremedia/ckeditor5-dataprocessor-support/src/dataprocessor";

describe("RichTextSchema.adjustAttributes", () => {
  type TestData = {
    // Just some option to provide a comment to the test case.
    comment?: string,
    /**
     * To which strictness modes the test applies to.
     */
    strictness: Strictness[];
    /**
     * XPath to element handed over.
     */
    xpath: string;
    /**
     * Input.
     */
    from: string;
    /**
     * Expected result.
     */
    to: string;
  };

  /**
   * Test-Fixture. The name only serves for output. It is recommend adding some
   * ID to this string, as it may be used for conditional breakpoints then.
   */
  type TestFixture = [string, TestData];

  const testFixtures: TestFixture[] = [
    // ------------------------------------------------------------------[ DIV ]
    [
      "ROOT#1: Should not change anything, if all required attributes are given and valid.",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        xpath: "/div",
        from: `<div xmlns="http://www.coremedia.com/2003/richtext-1.0" xmlns:xlink="http://www.w3.org/1999/xlink"/>`,
        to: `<div xmlns="http://www.coremedia.com/2003/richtext-1.0" xmlns:xlink="http://www.w3.org/1999/xlink"/>`,
      },
    ],
    [
      "ROOT#2: Should add missing namespace attributes to root-div.",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        xpath: "/div",
        from: `<div/>`,
        to: `<div xmlns="http://www.coremedia.com/2003/richtext-1.0" xmlns:xlink="http://www.w3.org/1999/xlink"/>`,
      },
    ],
    [
      "ROOT#3: Should replace invalid attribute values.",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        xpath: "/div",
        from: `<div xmlns="http://example.org/" xmlns:xlink="http://example.org/"/>`,
        to: `<div xmlns="http://www.coremedia.com/2003/richtext-1.0" xmlns:xlink="http://www.w3.org/1999/xlink"/>`,
      },
    ],
    [
      "ROOT#4: Should remove invalid attributes.",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        xpath: "/div",
        from: `<div xmlns="http://www.coremedia.com/2003/richtext-1.0" xmlns:xlink="http://www.w3.org/1999/xlink" class="someClass" lang="en-US" xml:lang="en-US" dir="ltr"/>`,
        to: `<div xmlns="http://www.coremedia.com/2003/richtext-1.0" xmlns:xlink="http://www.w3.org/1999/xlink"/>`,
      },
    ],
    // --------------------------------------------------------------------[ P ]
    [
      "P#1: <p> - Should keep valid attributes as is.",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        xpath: "/p",
        from: `<p class="someClass" lang="en-US" xml:lang="en-US" dir="ltr"/>`,
        to: `<p class="someClass" lang="en-US" xml:lang="en-US" dir="ltr"/>`,
      },
    ],
    [
      "P#2: <p> - Should not add any attributes, if all are unset and optional.",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        xpath: "/p",
        from: `<p/>`,
        to: `<p/>`,
      },
    ],
    [
      "P#3: <p> - Should remove invalid attributes.",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        xpath: "/p",
        from: `<p unknownAttr="value"/>`,
        to: `<p/>`,
      },
    ],
    [
      "P#4: <p>, Strict Mode: Should remove attributes with invalid values as they are meant to be.",
      {
        strictness: [Strictness.STRICT],
        xpath: "/p",
        from: `<p class="someClass" lang="en_US" xml:lang="en_US" dir="invalidDirection"/>`,
        to: `<p class="someClass"/>`,
      },
    ],
    [
      "P#5: <p>, Loose Mode: Should only remove attributes with invalid values regarding DTD.",
      {
        strictness: [Strictness.LOOSE],
        xpath: "/p",
        from: `<p class="someClass" lang="en_US" xml:lang="en_US" dir="invalidDirection"/>`,
        to: `<p class="someClass" lang="en_US" xml:lang="en_US"/>`,
      },
    ],
    [
      "P#6: <p>, Legacy Mode: Should not remove any invalid values, just as we did in CKEditor 4 integration.",
      {
        strictness: [Strictness.LEGACY],
        xpath: "/p",
        from: `<p class="someClass" lang="en_US" xml:lang="en_US" dir="invalidDirection"/>`,
        to: `<p class="someClass" lang="en_US" xml:lang="en_US" dir="invalidDirection"/>`,
      },
    ],
    // -------------------------------------------------------------------[ UL ]
    [
      "UL#1: <ul> - Should keep valid attributes as is.",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        xpath: "/ul",
        from: `<ul class="someClass" lang="en-US" xml:lang="en-US" dir="ltr"/>`,
        to: `<ul class="someClass" lang="en-US" xml:lang="en-US" dir="ltr"/>`,
      },
    ],
    [
      "UL#2: <ul> - Should not add any attributes, if all are unset and optional.",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        xpath: "/ul",
        from: `<ul/>`,
        to: `<ul/>`,
      },
    ],
    [
      "UL#3: <ul> - Should remove invalid attributes.",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        xpath: "/ul",
        from: `<ul unknownAttr="value"/>`,
        to: `<ul/>`,
      },
    ],
    // -------------------------------------------------------------------[ OL ]
    [
      "OL#1: <ol> - Should keep valid attributes as is.",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        xpath: "/ol",
        from: `<ol class="someClass" lang="en-US" xml:lang="en-US" dir="ltr"/>`,
        to: `<ol class="someClass" lang="en-US" xml:lang="en-US" dir="ltr"/>`,
      },
    ],
    [
      "OL#2: <ol> - Should not add any attributes, if all are unset and optional.",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        xpath: "/ol",
        from: `<ol/>`,
        to: `<ol/>`,
      },
    ],
    [
      "OL#3: <ol> - Should remove invalid attributes.",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        xpath: "/ol",
        from: `<ol unknownAttr="value"/>`,
        to: `<ol/>`,
      },
    ],
    // -------------------------------------------------------------------[ LI ]
    [
      "LI#1: <li> - Should keep valid attributes as is.",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        xpath: "/li",
        from: `<li class="someClass" lang="en-US" xml:lang="en-US" dir="ltr"/>`,
        to: `<li class="someClass" lang="en-US" xml:lang="en-US" dir="ltr"/>`,
      },
    ],
    [
      "LI#2: <li> - Should not add any attributes, if all are unset and optional.",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        xpath: "/li",
        from: `<li/>`,
        to: `<li/>`,
      },
    ],
    [
      "LI#3: <li> - Should remove invalid attributes.",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        xpath: "/li",
        from: `<li unknownAttr="value"/>`,
        to: `<li/>`,
      },
    ],
    // ------------------------------------------------------------------[ PRE ]
    [
      "PRE#1: <pre> - Should keep valid attributes as is.",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        xpath: "/pre",
        from: `<pre class="someClass" lang="en-US" xml:lang="en-US" dir="ltr" xml:space="preserve"/>`,
        to: `<pre class="someClass" lang="en-US" xml:lang="en-US" dir="ltr" xml:space="preserve"/>`,
      },
    ],
    [
      "PRE#2: <pre> - Should not add any attributes, if all are unset and optional.",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        xpath: "/pre",
        from: `<pre/>`,
        to: `<pre/>`,
      },
    ],
    [
      "PRE#3: <pre> - Should remove invalid attributes.",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        xpath: "/pre",
        from: `<pre unknownAttr="value"/>`,
        to: `<pre/>`,
      },
    ],
    [
      "PRE#4: <pre> - Should remove xml:space having invalid value (only strict and loose mode).",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE],
        xpath: "/pre",
        from: `<pre xml:space="invalid"/>`,
        to: `<pre/>`,
      },
    ],
    [
      "PRE#5: <pre> - Should keep xml:space having invalid value (only legacy mode).",
      {
        strictness: [Strictness.LEGACY],
        xpath: "/pre",
        from: `<pre xml:space="invalid"/>`,
        to: `<pre xml:space="invalid"/>`,
      },
    ],
    // -----------------------------------------------------------[ BLOCKQUOTE ]
    [
      "BLOCKQUOTE#1: <blockquote> - Should keep valid attributes as is.",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        xpath: "/blockquote",
        from: `<blockquote class="someClass" lang="en-US" xml:lang="en-US" dir="ltr" cite="https://example.org/"/>`,
        to: `<blockquote class="someClass" lang="en-US" xml:lang="en-US" dir="ltr" cite="https://example.org/"/>`,
      },
    ],
    [
      "BLOCKQUOTE#2: <blockquote> - Should not add any attributes, if all are unset and optional.",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        xpath: "/blockquote",
        from: `<blockquote/>`,
        to: `<blockquote/>`,
      },
    ],
    [
      "BLOCKQUOTE#3: <blockquote> - Should remove invalid attributes.",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        xpath: "/blockquote",
        from: `<blockquote unknownAttr="value"/>`,
        to: `<blockquote/>`,
      },
    ],
    [
      "BLOCKQUOTE#4: <blockquote> - Should remove cite having invalid value (only strict mode).",
      {
        strictness: [Strictness.STRICT],
        xpath: "/blockquote",
        from: `<blockquote cite="thisIsNoUri"/>`,
        to: `<blockquote/>`,
      },
    ],
    [
      "BLOCKQUOTE#5: <blockquote> - Should keep cite having invalid value (only loose and legacy mode).",
      {
        strictness: [Strictness.LOOSE, Strictness.LEGACY],
        xpath: "/blockquote",
        from: `<blockquote cite="thisIsNoUri"/>`,
        to: `<blockquote cite="thisIsNoUri"/>`,
      },
    ],
    // --------------------------------------------------------------------[ A ]
    [
      "A#1: <a> - Should keep valid attributes as is.",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        xpath: "//a",
        from: `<div xmlns="http://www.coremedia.com/2003/richtext-1.0" xmlns:xlink="http://www.w3.org/1999/xlink"><a class="someClass" lang="en-US" xml:lang="en-US" dir="ltr" xlink:type="simple" xlink:href="https://example.org/" xlink:role="https://example.org/" xlink:title="Some Title" xlink:show="new" xlink:actuate="onRequest"/></div>`,
        to: `<div xmlns="http://www.coremedia.com/2003/richtext-1.0" xmlns:xlink="http://www.w3.org/1999/xlink"><a class="someClass" lang="en-US" xml:lang="en-US" dir="ltr" xlink:type="simple" xlink:href="https://example.org/" xlink:role="https://example.org/" xlink:title="Some Title" xlink:show="new" xlink:actuate="onRequest"/></div>`,
      },
    ],
    [
      "A#2: <a> - Should only add required attributes, if all are unset and optional.",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        xpath: "//a",
        from: `<div xmlns="http://www.coremedia.com/2003/richtext-1.0" xmlns:xlink="http://www.w3.org/1999/xlink"><a/></div>`,
        to: `<div xmlns="http://www.coremedia.com/2003/richtext-1.0" xmlns:xlink="http://www.w3.org/1999/xlink"><a xlink:href=""/></div>`,
      },
    ],
    [
      "A#3: <a> - Should remove invalid attributes.",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        xpath: "//a",
        from: `<div xmlns="http://www.coremedia.com/2003/richtext-1.0" xmlns:xlink="http://www.w3.org/1999/xlink"><a unknownAttr="value"/></div>`,
        to: `<div xmlns="http://www.coremedia.com/2003/richtext-1.0" xmlns:xlink="http://www.w3.org/1999/xlink"><a xlink:href=""/></div>`,
      },
    ],
    [
      "A#4: <a> - Should remove attributes having invalid value, and replace if required (only strict mode).",
      {
        strictness: [Strictness.STRICT],
        xpath: "//a",
        from: `<div xmlns="http://www.coremedia.com/2003/richtext-1.0" xmlns:xlink="http://www.w3.org/1999/xlink"><a xlink:type="invalid" xlink:href="noUri" xlink:show="invalid" xlink:actuate="invalid"/></div>`,
        to: `<div xmlns="http://www.coremedia.com/2003/richtext-1.0" xmlns:xlink="http://www.w3.org/1999/xlink"><a xlink:href=""/></div>`,
      },
    ],
    [
      "A#5: <a> - Should keep most attributes having invalid value (only loose mode).",
      {
        strictness: [Strictness.LOOSE],
        xpath: "//a",
        from: `<div xmlns="http://www.coremedia.com/2003/richtext-1.0" xmlns:xlink="http://www.w3.org/1999/xlink"><a xlink:type="invalid" xlink:href="noUri" xlink:show="invalid" xlink:actuate="invalid"/></div>`,
        to: `<div xmlns="http://www.coremedia.com/2003/richtext-1.0" xmlns:xlink="http://www.w3.org/1999/xlink"><a xlink:href="noUri"/></div>`,
      },
    ],
    [
      "A#6: <a> - Should keep attributes having invalid value (only legacy mode).",
      {
        strictness: [Strictness.LEGACY],
        xpath: "//a",
        from: `<div xmlns="http://www.coremedia.com/2003/richtext-1.0" xmlns:xlink="http://www.w3.org/1999/xlink"><a xlink:type="invalid" xlink:href="noUri" xlink:show="invalid" xlink:actuate="invalid"/></div>`,
        to: `<div xmlns="http://www.coremedia.com/2003/richtext-1.0" xmlns:xlink="http://www.w3.org/1999/xlink"><a xlink:type="invalid" xlink:href="noUri" xlink:show="invalid" xlink:actuate="invalid"/></div>`,
      },
    ],
    // -----------------------------------------------------------------[ SPAN ]
    [
      "SPAN#1: <span> - Should keep valid attributes as is.",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        xpath: "/span",
        from: `<span class="someClass" lang="en-US" xml:lang="en-US" dir="ltr"/>`,
        to: `<span class="someClass" lang="en-US" xml:lang="en-US" dir="ltr"/>`,
      },
    ],
    [
      "SPAN#2: <span> - Should not add any attributes, if all are unset and optional.",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        xpath: "/span",
        from: `<span/>`,
        to: `<span/>`,
      },
    ],
    [
      "SPAN#3: <span> - Should remove invalid attributes.",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        xpath: "/span",
        from: `<span unknownAttr="value"/>`,
        to: `<span/>`,
      },
    ],
    // -------------------------------------------------------------------[ BR ]
    [
      "BR#1: <br> - Should keep valid attributes as is.",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        xpath: "/br",
        from: `<br class="someClass"/>`,
        to: `<br class="someClass"/>`,
      },
    ],
    [
      "BR#2: <br> - Should not add any attributes, if all are unset and optional.",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        xpath: "/br",
        from: `<br/>`,
        to: `<br/>`,
      },
    ],
    [
      "BR#3: <br> - Should remove invalid attributes.",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        xpath: "/br",
        from: `<br unknownAttr="value" lang="en-US" xml:lang="en-US" dir="ltr"/>`,
        to: `<br/>`,
      },
    ],
    // -------------------------------------------------------------------[ EM ]
    [
      "EM#1: <em> - Should keep valid attributes as is.",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        xpath: "/em",
        from: `<em class="someClass" lang="en-US" xml:lang="en-US" dir="ltr"/>`,
        to: `<em class="someClass" lang="en-US" xml:lang="en-US" dir="ltr"/>`,
      },
    ],
    [
      "EM#2: <em> - Should not add any attributes, if all are unset and optional.",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        xpath: "/em",
        from: `<em/>`,
        to: `<em/>`,
      },
    ],
    [
      "EM#3: <em> - Should remove invalid attributes.",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        xpath: "/em",
        from: `<em unknownAttr="value"/>`,
        to: `<em/>`,
      },
    ],
    // ---------------------------------------------------------------[ STRONG ]
    [
      "STRONG#1: <strong> - Should keep valid attributes as is.",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        xpath: "/strong",
        from: `<strong class="someClass" lang="en-US" xml:lang="en-US" dir="ltr"/>`,
        to: `<strong class="someClass" lang="en-US" xml:lang="en-US" dir="ltr"/>`,
      },
    ],
    [
      "STRONG#2: <strong> - Should not add any attributes, if all are unset and optional.",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        xpath: "/strong",
        from: `<strong/>`,
        to: `<strong/>`,
      },
    ],
    [
      "STRONG#3: <strong> - Should remove invalid attributes.",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        xpath: "/strong",
        from: `<strong unknownAttr="value"/>`,
        to: `<strong/>`,
      },
    ],
    // ------------------------------------------------------------------[ SUB ]
    [
      "SUB#1: <sub> - Should keep valid attributes as is.",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        xpath: "/sub",
        from: `<sub class="someClass" lang="en-US" xml:lang="en-US" dir="ltr"/>`,
        to: `<sub class="someClass" lang="en-US" xml:lang="en-US" dir="ltr"/>`,
      },
    ],
    [
      "SUB#2: <sub> - Should not add any attributes, if all are unset and optional.",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        xpath: "/sub",
        from: `<sub/>`,
        to: `<sub/>`,
      },
    ],
    [
      "SUB#3: <sub> - Should remove invalid attributes.",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        xpath: "/sub",
        from: `<sub unknownAttr="value"/>`,
        to: `<sub/>`,
      },
    ],
    // ------------------------------------------------------------------[ SUP ]
    [
      "SUP#1: <sup> - Should keep valid attributes as is.",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        xpath: "/sup",
        from: `<sup class="someClass" lang="en-US" xml:lang="en-US" dir="ltr"/>`,
        to: `<sup class="someClass" lang="en-US" xml:lang="en-US" dir="ltr"/>`,
      },
    ],
    [
      "SUP#2: <sup> - Should not add any attributes, if all are unset and optional.",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        xpath: "/sup",
        from: `<sup/>`,
        to: `<sup/>`,
      },
    ],
    [
      "SUP#3: <sup> - Should remove invalid attributes.",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        xpath: "/sup",
        from: `<sup unknownAttr="value"/>`,
        to: `<sup/>`,
      },
    ],
    // ------------------------------------------------------------------[ IMG ]
    [
      "IMG#1: <img> - Should keep valid attributes as is.",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        xpath: "//img",
        from: `<div xmlns="http://www.coremedia.com/2003/richtext-1.0" xmlns:xlink="http://www.w3.org/1999/xlink"><img class="someClass" lang="en-US" xml:lang="en-US" dir="ltr" alt="Some Alt" height="4" width="2" xlink:type="simple" xlink:href="https://example.org/" xlink:role="https://example.org/" xlink:title="Some Title" xlink:show="embed" xlink:actuate="onLoad"/></div>`,
        to: `<div xmlns="http://www.coremedia.com/2003/richtext-1.0" xmlns:xlink="http://www.w3.org/1999/xlink"><img class="someClass" lang="en-US" xml:lang="en-US" dir="ltr" alt="Some Alt" height="4" width="2" xlink:type="simple" xlink:href="https://example.org/" xlink:role="https://example.org/" xlink:title="Some Title" xlink:show="embed" xlink:actuate="onLoad"/></div>`,
      },
    ],
    [
      "IMG#2: <img> - Should only add required attributes, if all are unset and optional.",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        xpath: "//img",
        from: `<div xmlns="http://www.coremedia.com/2003/richtext-1.0" xmlns:xlink="http://www.w3.org/1999/xlink"><img/></div>`,
        to: `<div xmlns="http://www.coremedia.com/2003/richtext-1.0" xmlns:xlink="http://www.w3.org/1999/xlink"><img alt="" xlink:href=""/></div>`,
      },
    ],
    [
      "IMG#3: <img> - Should remove invalid attributes.",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        xpath: "//img",
        from: `<div xmlns="http://www.coremedia.com/2003/richtext-1.0" xmlns:xlink="http://www.w3.org/1999/xlink"><img unknownAttr="value"/></div>`,
        to: `<div xmlns="http://www.coremedia.com/2003/richtext-1.0" xmlns:xlink="http://www.w3.org/1999/xlink"><img alt="" xlink:href=""/></div>`,
      },
    ],
    [
      "IMG#4: <img> - Should remove attributes having invalid value, and replace if required (only strict mode).",
      {
        strictness: [Strictness.STRICT],
        xpath: "//img",
        from: `<div xmlns="http://www.coremedia.com/2003/richtext-1.0" xmlns:xlink="http://www.w3.org/1999/xlink"><img lang="en_US" xml:lang="en_US" dir="invalid" height="invalid" width="invalid" xlink:type="invalid" xlink:show="new" xlink:actuate="onRequest"/></div>`,
        to: `<div xmlns="http://www.coremedia.com/2003/richtext-1.0" xmlns:xlink="http://www.w3.org/1999/xlink"><img alt="" xlink:href=""/></div>`,
      },
    ],
    [
      "IMG#5: <img> - Should keep most attributes having invalid value (only loose mode).",
      {
        strictness: [Strictness.LOOSE],
        xpath: "//img",
        from: `<div xmlns="http://www.coremedia.com/2003/richtext-1.0" xmlns:xlink="http://www.w3.org/1999/xlink"><img xlink:href="" alt="" lang="en_US" xml:lang="en_US" dir="invalid" height="invalid" width="invalid" xlink:type="invalid" xlink:show="new" xlink:actuate="onRequest"/></div>`,
        to: `<div xmlns="http://www.coremedia.com/2003/richtext-1.0" xmlns:xlink="http://www.w3.org/1999/xlink"><img xlink:href="" alt="" lang="en_US" xml:lang="en_US" height="invalid" width="invalid"/></div>`,
      },
    ],
    [
      "IMG#6: <img> - Should keep attributes having invalid value (only legacy mode).",
      {
        strictness: [Strictness.LEGACY],
        xpath: "//img",
        from: `<div xmlns="http://www.coremedia.com/2003/richtext-1.0" xmlns:xlink="http://www.w3.org/1999/xlink"><img xlink:href="" alt="" lang="en_US" xml:lang="en_US" dir="invalid" height="invalid" width="invalid" xlink:type="invalid" xlink:show="new" xlink:actuate="onRequest"/></div>`,
        to: `<div xmlns="http://www.coremedia.com/2003/richtext-1.0" xmlns:xlink="http://www.w3.org/1999/xlink"><img xlink:href="" alt="" lang="en_US" xml:lang="en_US" dir="invalid" height="invalid" width="invalid" xlink:type="invalid" xlink:show="new" xlink:actuate="onRequest"/></div>`,
      },
    ],
    // ----------------------------------------------------------------[ TABLE ]
    [
      "TABLE#1: <table> - Should keep valid attributes as is.",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        xpath: "/table",
        from: `<table class="someClass" lang="en-US" xml:lang="en-US" dir="ltr" summary="Some Summary"/>`,
        to: `<table class="someClass" lang="en-US" xml:lang="en-US" dir="ltr" summary="Some Summary"/>`,
      },
    ],
    [
      "TABLE#2: <table> - Should not add any attributes, if all are unset and optional.",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        xpath: "/table",
        from: `<table/>`,
        to: `<table/>`,
      },
    ],
    [
      "TABLE#3: <table> - Should remove invalid attributes.",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        xpath: "/table",
        from: `<table unknownAttr="value"/>`,
        to: `<table/>`,
      },
    ],
    // ----------------------------------------------------------------[ TBODY ]
    [
      "TBODY#1: <tbody> - Should keep valid attributes as is.",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        xpath: "/tbody",
        from: `<tbody class="someClass" lang="en-US" xml:lang="en-US" dir="ltr" align="left" valign="baseline"/>`,
        to: `<tbody class="someClass" lang="en-US" xml:lang="en-US" dir="ltr" align="left" valign="baseline"/>`,
      },
    ],
    [
      "TBODY#2: <tbody> - Should not add any attributes, if all are unset and optional.",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        xpath: "/tbody",
        from: `<tbody/>`,
        to: `<tbody/>`,
      },
    ],
    [
      "TBODY#3: <tbody> - Should remove invalid attributes.",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        xpath: "/tbody",
        from: `<tbody unknownAttr="value"/>`,
        to: `<tbody/>`,
      },
    ],
    [
      "TBODY#4: <tbody> - Should remove attributes having invalid value (only strict and loose mode).",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE],
        xpath: "/tbody",
        from: `<tbody dir="invalid" align="invalid" valign="invalid"/>`,
        to: `<tbody/>`,
      },
    ],
    [
      "TBODY#5: <tbody> - Should keep attributes having invalid value (only legacy mode).",
      {
        strictness: [Strictness.LEGACY],
        xpath: "/tbody",
        from: `<tbody dir="invalid" align="invalid" valign="invalid"/>`,
        to: `<tbody dir="invalid" align="invalid" valign="invalid"/>`,
      },
    ],
    // -------------------------------------------------------------------[ TR ]
    [
      "TR#1: <tr> - Should keep valid attributes as is.",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        xpath: "/tr",
        from: `<tr class="someClass" lang="en-US" xml:lang="en-US" dir="ltr" align="left" valign="baseline"/>`,
        to: `<tr class="someClass" lang="en-US" xml:lang="en-US" dir="ltr" align="left" valign="baseline"/>`,
      },
    ],
    [
      "TR#2: <tr> - Should not add any attributes, if all are unset and optional.",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        xpath: "/tr",
        from: `<tr/>`,
        to: `<tr/>`,
      },
    ],
    [
      "TR#3: <tr> - Should remove invalid attributes.",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        xpath: "/tr",
        from: `<tr unknownAttr="value"/>`,
        to: `<tr/>`,
      },
    ],
    [
      "TR#4: <tr> - Should remove attributes having invalid value (only strict and loose mode).",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE],
        xpath: "/tr",
        from: `<tr dir="invalid" align="invalid" valign="invalid"/>`,
        to: `<tr/>`,
      },
    ],
    [
      "TR#5: <tr> - Should keep attributes having invalid value (only legacy mode).",
      {
        strictness: [Strictness.LEGACY],
        xpath: "/tr",
        from: `<tr dir="invalid" align="invalid" valign="invalid"/>`,
        to: `<tr dir="invalid" align="invalid" valign="invalid"/>`,
      },
    ],
    // -------------------------------------------------------------------[ TD ]
    [
      "TD#1: <td> - Should keep valid attributes as is.",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        xpath: "/td",
        from: `<td class="someClass" lang="en-US" xml:lang="en-US" dir="ltr" align="left" valign="baseline" abbr="Some Abbreviation" rowspan="42" colspan="24"/>`,
        to: `<td class="someClass" lang="en-US" xml:lang="en-US" dir="ltr" align="left" valign="baseline" abbr="Some Abbreviation" rowspan="42" colspan="24"/>`,
      },
    ],
    [
      "TD#2: <td> - Should not add any attributes, if all are unset and optional.",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        xpath: "/td",
        from: `<td/>`,
        to: `<td/>`,
      },
    ],
    [
      "TD#3: <td> - Should remove invalid attributes.",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        xpath: "/td",
        from: `<td unknownAttr="value"/>`,
        to: `<td/>`,
      },
    ],
    [
      "TD#4: <td> - Should remove attributes having invalid value (only strict mode).",
      {
        strictness: [Strictness.STRICT],
        xpath: "/td",
        from: `<td dir="invalid" align="invalid" valign="invalid" rowspan="invalid" colspan="invalid"/>`,
        to: `<td/>`,
      },
    ],
    [
      "TD#5: <td> - Should keep some attributes having invalid value (only loose mode).",
      {
        strictness: [Strictness.LOOSE],
        xpath: "/td",
        from: `<td dir="invalid" align="invalid" valign="invalid" rowspan="invalid" colspan="invalid"/>`,
        to: `<td rowspan="invalid" colspan="invalid"/>`,
      },
    ],
    [
      "TD#5: <td> - Should keep attributes having invalid value (only legacy mode).",
      {
        strictness: [Strictness.LEGACY],
        xpath: "/td",
        from: `<td dir="invalid" align="invalid" valign="invalid" rowspan="invalid" colspan="invalid"/>`,
        to: `<td dir="invalid" align="invalid" valign="invalid" rowspan="invalid" colspan="invalid"/>`,
      },
    ],
  ];

  test.each<TestFixture>(testFixtures)("(%#) %s", (name: string, testData: TestData) => {
    const serializer = new XMLSerializer();
    for (const strictness of testData.strictness) {
      const parser = new DOMParser();
      const xmlDocument: Document = parser.parseFromString(testData.from.trim(), "text/xml");
      const xPathResult = xmlDocument.evaluate(testData.xpath, xmlDocument, null, XPathResult.FIRST_ORDERED_NODE_TYPE);
      const element: Element = <Element>xPathResult.singleNodeValue;
      const mutableElement = new MutableElement(element);
      const schema = new RichTextSchema(strictness);

      if (element === null) {
        throw new Error(
          `Unexpected state: Element located by ${testData.xpath} does not exist in: ${serializer.serializeToString(
            xmlDocument.documentElement
          )}`
        );
      }

      schema.adjustAttributes(mutableElement);

      mutableElement.persist();

      // Cannot use outerHtml here, as it will/may cause a DOMException for JSDom.
      const actualXml = serializer.serializeToString(xmlDocument.documentElement);
      expect(actualXml).toEqualXML(testData.to);
    }
  });
});

// TODO[cke] Valid-Parent-Tests
