/* eslint no-null/no-null: off */

import "jest-xml-matcher";
import RichTextSchema from "../src/legacy/v11/RichTextSchema";
import ElementProxy from "@coremedia/ckeditor5-dataprocessor-support/ElementProxy";
import { Strictness } from "../src/Strictness";

interface CommentableTestData {
  /**
   * Some comment, which may help to understand the test case better.
   */
  comment?: string;
}

interface DisableableTestCase {
  // TODO[cke] Remove here, as unused, replace by test.skip instead if it is disabled.
  /**
   * If set to `true` or non-empty string this test will be ignored.
   * A string will be printed as message.
   */
  disabled?: boolean | string;
}

interface StrictnessAwareTestData {
  /**
   * To which strictness modes the test applies to.
   */
  strictness: Strictness[];
}

interface XmlInputTestData {
  /**
   * XPath to element handed over.
   */
  xpath: string;
  /**
   * Input.
   */
  input: string;
}

interface ExpectTransformationTestData {
  expected: string;
}

interface ExpectValidationTestData {
  expected: boolean;
}

const parser = new DOMParser();
const serializer = new XMLSerializer();

/*
 * =============================================================================
 *
 *                                               RichTextSchema.adjustAttributes
 *
 * =============================================================================
 */

describe("RichTextSchema.adjustAttributes", () => {
  type TransformAttributesTestData = CommentableTestData &
    DisableableTestCase &
    XmlInputTestData &
    StrictnessAwareTestData &
    ExpectTransformationTestData;

  type TransformAttributesTestFixture = [string, TransformAttributesTestData];

  const testFixtures: TransformAttributesTestFixture[] = [
    // ------------------------------------------------------------------[ DIV ]
    [
      "ROOT#1: Should not change anything, if all required attributes are given and valid.",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        xpath: "/div",
        input: `<div xmlns="http://www.coremedia.com/2003/richtext-1.0" xmlns:xlink="http://www.w3.org/1999/xlink"/>`,
        expected: `<div xmlns="http://www.coremedia.com/2003/richtext-1.0" xmlns:xlink="http://www.w3.org/1999/xlink"/>`,
      },
    ],
    [
      "ROOT#2: Should add missing namespace attributes to root-div.",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        xpath: "/div",
        input: `<div/>`,
        expected: `<div xmlns="http://www.coremedia.com/2003/richtext-1.0" xmlns:xlink="http://www.w3.org/1999/xlink"/>`,
      },
    ],
    [
      "ROOT#3: Should replace invalid attribute values.",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        xpath: "/div",
        input: `<div xmlns="http://example.org/" xmlns:xlink="http://example.org/"/>`,
        expected: `<div xmlns="http://www.coremedia.com/2003/richtext-1.0" xmlns:xlink="http://www.w3.org/1999/xlink"/>`,
      },
    ],
    [
      "ROOT#4: Should remove invalid attributes.",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        xpath: "/div",
        input: `<div xmlns="http://www.coremedia.com/2003/richtext-1.0" xmlns:xlink="http://www.w3.org/1999/xlink" class="someClass" lang="en-US" xml:lang="en-US" dir="ltr"/>`,
        expected: `<div xmlns="http://www.coremedia.com/2003/richtext-1.0" xmlns:xlink="http://www.w3.org/1999/xlink"/>`,
      },
    ],
    // --------------------------------------------------------------------[ P ]
    [
      "P#1: <p> - Should keep valid attributes as is.",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        xpath: "/p",
        input: `<p class="someClass" lang="en-US" xml:lang="en-US" dir="ltr"/>`,
        expected: `<p class="someClass" lang="en-US" xml:lang="en-US" dir="ltr"/>`,
      },
    ],
    [
      "P#2: <p> - Should not add any attributes, if all are unset and optional.",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        xpath: "/p",
        input: `<p/>`,
        expected: `<p/>`,
      },
    ],
    [
      "P#3: <p> - Should remove invalid attributes.",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        xpath: "/p",
        input: `<p unknownAttr="value"/>`,
        expected: `<p/>`,
      },
    ],
    [
      "P#4: <p> - Should remove attributes with invalid values as they are meant to be.",
      {
        strictness: [Strictness.STRICT],
        xpath: "/p",
        input: `<p class="someClass" lang="en_US" xml:lang="en_US" dir="invalidDirection"/>`,
        expected: `<p class="someClass"/>`,
      },
    ],
    [
      "P#5: <p> - Should only remove attributes with invalid values regarding DTD.",
      {
        strictness: [Strictness.LOOSE],
        xpath: "/p",
        input: `<p class="someClass" lang="en_US" xml:lang="en_US" dir="invalidDirection"/>`,
        expected: `<p class="someClass" lang="en_US" xml:lang="en_US"/>`,
      },
    ],
    [
      "P#6: <p> - Should not remove any invalid values, just as we did in CKEditor 4 integration.",
      {
        strictness: [Strictness.LEGACY],
        xpath: "/p",
        input: `<p class="someClass" lang="en_US" xml:lang="en_US" dir="invalidDirection"/>`,
        expected: `<p class="someClass" lang="en_US" xml:lang="en_US" dir="invalidDirection"/>`,
      },
    ],
    // -------------------------------------------------------------------[ UL ]
    [
      "UL#1: <ul> - Should keep valid attributes as is.",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        xpath: "/ul",
        input: `<ul class="someClass" lang="en-US" xml:lang="en-US" dir="ltr"/>`,
        expected: `<ul class="someClass" lang="en-US" xml:lang="en-US" dir="ltr"/>`,
      },
    ],
    [
      "UL#2: <ul> - Should not add any attributes, if all are unset and optional.",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        xpath: "/ul",
        input: `<ul/>`,
        expected: `<ul/>`,
      },
    ],
    [
      "UL#3: <ul> - Should remove invalid attributes.",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        xpath: "/ul",
        input: `<ul unknownAttr="value"/>`,
        expected: `<ul/>`,
      },
    ],
    // -------------------------------------------------------------------[ OL ]
    [
      "OL#1: <ol> - Should keep valid attributes as is.",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        xpath: "/ol",
        input: `<ol class="someClass" lang="en-US" xml:lang="en-US" dir="ltr"/>`,
        expected: `<ol class="someClass" lang="en-US" xml:lang="en-US" dir="ltr"/>`,
      },
    ],
    [
      "OL#2: <ol> - Should not add any attributes, if all are unset and optional.",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        xpath: "/ol",
        input: `<ol/>`,
        expected: `<ol/>`,
      },
    ],
    [
      "OL#3: <ol> - Should remove invalid attributes.",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        xpath: "/ol",
        input: `<ol unknownAttr="value"/>`,
        expected: `<ol/>`,
      },
    ],
    // -------------------------------------------------------------------[ LI ]
    [
      "LI#1: <li> - Should keep valid attributes as is.",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        xpath: "/li",
        input: `<li class="someClass" lang="en-US" xml:lang="en-US" dir="ltr"/>`,
        expected: `<li class="someClass" lang="en-US" xml:lang="en-US" dir="ltr"/>`,
      },
    ],
    [
      "LI#2: <li> - Should not add any attributes, if all are unset and optional.",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        xpath: "/li",
        input: `<li/>`,
        expected: `<li/>`,
      },
    ],
    [
      "LI#3: <li> - Should remove invalid attributes.",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        xpath: "/li",
        input: `<li unknownAttr="value"/>`,
        expected: `<li/>`,
      },
    ],
    // ------------------------------------------------------------------[ PRE ]
    [
      "PRE#1: <pre> - Should keep valid attributes as is.",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        xpath: "/pre",
        input: `<pre class="someClass" lang="en-US" xml:lang="en-US" dir="ltr" xml:space="preserve"/>`,
        expected: `<pre class="someClass" lang="en-US" xml:lang="en-US" dir="ltr" xml:space="preserve"/>`,
      },
    ],
    [
      "PRE#2: <pre> - Should not add any attributes, if all are unset and optional.",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        xpath: "/pre",
        input: `<pre/>`,
        expected: `<pre/>`,
      },
    ],
    [
      "PRE#3: <pre> - Should remove invalid attributes.",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        xpath: "/pre",
        input: `<pre unknownAttr="value"/>`,
        expected: `<pre/>`,
      },
    ],
    [
      "PRE#4: <pre> - Should remove xml:space having invalid value.",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE],
        xpath: "/pre",
        input: `<pre xml:space="invalid"/>`,
        expected: `<pre/>`,
      },
    ],
    [
      "PRE#5: <pre> - Should keep xml:space having invalid value.",
      {
        strictness: [Strictness.LEGACY],
        xpath: "/pre",
        input: `<pre xml:space="invalid"/>`,
        expected: `<pre xml:space="invalid"/>`,
      },
    ],
    // -----------------------------------------------------------[ BLOCKQUOTE ]
    [
      "BLOCKQUOTE#1: <blockquote> - Should keep valid attributes as is.",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        xpath: "/blockquote",
        input: `<blockquote class="someClass" lang="en-US" xml:lang="en-US" dir="ltr" cite="https://example.org/"/>`,
        expected: `<blockquote class="someClass" lang="en-US" xml:lang="en-US" dir="ltr" cite="https://example.org/"/>`,
      },
    ],
    [
      "BLOCKQUOTE#2: <blockquote> - Should not add any attributes, if all are unset and optional.",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        xpath: "/blockquote",
        input: `<blockquote/>`,
        expected: `<blockquote/>`,
      },
    ],
    [
      "BLOCKQUOTE#3: <blockquote> - Should remove invalid attributes.",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        xpath: "/blockquote",
        input: `<blockquote unknownAttr="value"/>`,
        expected: `<blockquote/>`,
      },
    ],
    [
      "BLOCKQUOTE#4: <blockquote> - Should keep cite, although it is no valid URI.",
      {
        comment:
          "We had to be less strict, as CKEditor doesn't do strict URI checks. If we agree on this eventually, could be merged with BLOCKQUOTE#5 test.",
        strictness: [Strictness.STRICT],
        xpath: "/blockquote",
        input: `<blockquote cite="thisIsNoUri"/>`,
        expected: `<blockquote cite="thisIsNoUri"/>`,
      },
    ],
    [
      "BLOCKQUOTE#5: <blockquote> - Should keep cite having invalid value.",
      {
        strictness: [Strictness.LOOSE, Strictness.LEGACY],
        xpath: "/blockquote",
        input: `<blockquote cite="thisIsNoUri"/>`,
        expected: `<blockquote cite="thisIsNoUri"/>`,
      },
    ],
    // --------------------------------------------------------------------[ A ]
    [
      "A#1: <a> - Should keep valid attributes as is.",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        xpath: "//a",
        input: `<div xmlns="http://www.coremedia.com/2003/richtext-1.0" xmlns:xlink="http://www.w3.org/1999/xlink"><a class="someClass" lang="en-US" xml:lang="en-US" dir="ltr" xlink:type="simple" xlink:href="https://example.org/" xlink:role="https://example.org/" xlink:title="Some Title" xlink:show="new" xlink:actuate="onRequest"/></div>`,
        expected: `<div xmlns="http://www.coremedia.com/2003/richtext-1.0" xmlns:xlink="http://www.w3.org/1999/xlink"><a class="someClass" lang="en-US" xml:lang="en-US" dir="ltr" xlink:type="simple" xlink:href="https://example.org/" xlink:role="https://example.org/" xlink:title="Some Title" xlink:show="new" xlink:actuate="onRequest"/></div>`,
      },
    ],
    [
      "A#2: <a> - Should only add required attributes, if all are unset and optional.",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        xpath: "//a",
        input: `<div xmlns="http://www.coremedia.com/2003/richtext-1.0" xmlns:xlink="http://www.w3.org/1999/xlink"><a/></div>`,
        expected: `<div xmlns="http://www.coremedia.com/2003/richtext-1.0" xmlns:xlink="http://www.w3.org/1999/xlink"><a xlink:href=""/></div>`,
      },
    ],
    [
      "A#3: <a> - Should remove invalid attributes.",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        xpath: "//a",
        input: `<div xmlns="http://www.coremedia.com/2003/richtext-1.0" xmlns:xlink="http://www.w3.org/1999/xlink"><a unknownAttr="value"/></div>`,
        expected: `<div xmlns="http://www.coremedia.com/2003/richtext-1.0" xmlns:xlink="http://www.w3.org/1999/xlink"><a xlink:href=""/></div>`,
      },
    ],
    [
      "A#4: <a> - Should remove attributes having invalid value, and replace if required; should keep href although no URI",
      {
        comment:
          "We had to be less strict, as CKEditor doesn't do strict input checks. If we agree on this eventually, could be merged with A#5 test.",
        strictness: [Strictness.STRICT],
        xpath: "//a",
        input: `<div xmlns="http://www.coremedia.com/2003/richtext-1.0" xmlns:xlink="http://www.w3.org/1999/xlink"><a xlink:type="invalid" xlink:href="noUri" xlink:show="invalid" xlink:actuate="invalid"/></div>`,
        expected: `<div xmlns="http://www.coremedia.com/2003/richtext-1.0" xmlns:xlink="http://www.w3.org/1999/xlink"><a xlink:href="noUri"/></div>`,
      },
    ],
    [
      "A#5: <a> - Should keep most attributes having invalid value.",
      {
        strictness: [Strictness.LOOSE],
        xpath: "//a",
        input: `<div xmlns="http://www.coremedia.com/2003/richtext-1.0" xmlns:xlink="http://www.w3.org/1999/xlink"><a xlink:type="invalid" xlink:href="noUri" xlink:show="invalid" xlink:actuate="invalid"/></div>`,
        expected: `<div xmlns="http://www.coremedia.com/2003/richtext-1.0" xmlns:xlink="http://www.w3.org/1999/xlink"><a xlink:href="noUri"/></div>`,
      },
    ],
    [
      "A#6: <a> - Should keep attributes having invalid value.",
      {
        strictness: [Strictness.LEGACY],
        xpath: "//a",
        input: `<div xmlns="http://www.coremedia.com/2003/richtext-1.0" xmlns:xlink="http://www.w3.org/1999/xlink"><a xlink:type="invalid" xlink:href="noUri" xlink:show="invalid" xlink:actuate="invalid"/></div>`,
        expected: `<div xmlns="http://www.coremedia.com/2003/richtext-1.0" xmlns:xlink="http://www.w3.org/1999/xlink"><a xlink:type="invalid" xlink:href="noUri" xlink:show="invalid" xlink:actuate="invalid"/></div>`,
      },
    ],
    // -----------------------------------------------------------------[ SPAN ]
    [
      "SPAN#1: <span> - Should keep valid attributes as is.",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        xpath: "/span",
        input: `<span class="someClass" lang="en-US" xml:lang="en-US" dir="ltr"/>`,
        expected: `<span class="someClass" lang="en-US" xml:lang="en-US" dir="ltr"/>`,
      },
    ],
    [
      "SPAN#2: <span> - Should not add any attributes, if all are unset and optional.",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        xpath: "/span",
        input: `<span/>`,
        expected: `<span/>`,
      },
    ],
    [
      "SPAN#3: <span> - Should remove invalid attributes.",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        xpath: "/span",
        input: `<span unknownAttr="value"/>`,
        expected: `<span/>`,
      },
    ],
    // -------------------------------------------------------------------[ BR ]
    [
      "BR#1: <br> - Should keep valid attributes as is.",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        xpath: "/br",
        input: `<br class="someClass"/>`,
        expected: `<br class="someClass"/>`,
      },
    ],
    [
      "BR#2: <br> - Should not add any attributes, if all are unset and optional.",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        xpath: "/br",
        input: `<br/>`,
        expected: `<br/>`,
      },
    ],
    [
      "BR#3: <br> - Should remove invalid attributes.",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        xpath: "/br",
        input: `<br unknownAttr="value" lang="en-US" xml:lang="en-US" dir="ltr"/>`,
        expected: `<br/>`,
      },
    ],
    // -------------------------------------------------------------------[ EM ]
    [
      "EM#1: <em> - Should keep valid attributes as is.",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        xpath: "/em",
        input: `<em class="someClass" lang="en-US" xml:lang="en-US" dir="ltr"/>`,
        expected: `<em class="someClass" lang="en-US" xml:lang="en-US" dir="ltr"/>`,
      },
    ],
    [
      "EM#2: <em> - Should not add any attributes, if all are unset and optional.",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        xpath: "/em",
        input: `<em/>`,
        expected: `<em/>`,
      },
    ],
    [
      "EM#3: <em> - Should remove invalid attributes.",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        xpath: "/em",
        input: `<em unknownAttr="value"/>`,
        expected: `<em/>`,
      },
    ],
    // ---------------------------------------------------------------[ STRONG ]
    [
      "STRONG#1: <strong> - Should keep valid attributes as is.",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        xpath: "/strong",
        input: `<strong class="someClass" lang="en-US" xml:lang="en-US" dir="ltr"/>`,
        expected: `<strong class="someClass" lang="en-US" xml:lang="en-US" dir="ltr"/>`,
      },
    ],
    [
      "STRONG#2: <strong> - Should not add any attributes, if all are unset and optional.",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        xpath: "/strong",
        input: `<strong/>`,
        expected: `<strong/>`,
      },
    ],
    [
      "STRONG#3: <strong> - Should remove invalid attributes.",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        xpath: "/strong",
        input: `<strong unknownAttr="value"/>`,
        expected: `<strong/>`,
      },
    ],
    // ------------------------------------------------------------------[ SUB ]
    [
      "SUB#1: <sub> - Should keep valid attributes as is.",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        xpath: "/sub",
        input: `<sub class="someClass" lang="en-US" xml:lang="en-US" dir="ltr"/>`,
        expected: `<sub class="someClass" lang="en-US" xml:lang="en-US" dir="ltr"/>`,
      },
    ],
    [
      "SUB#2: <sub> - Should not add any attributes, if all are unset and optional.",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        xpath: "/sub",
        input: `<sub/>`,
        expected: `<sub/>`,
      },
    ],
    [
      "SUB#3: <sub> - Should remove invalid attributes.",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        xpath: "/sub",
        input: `<sub unknownAttr="value"/>`,
        expected: `<sub/>`,
      },
    ],
    // ------------------------------------------------------------------[ SUP ]
    [
      "SUP#1: <sup> - Should keep valid attributes as is.",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        xpath: "/sup",
        input: `<sup class="someClass" lang="en-US" xml:lang="en-US" dir="ltr"/>`,
        expected: `<sup class="someClass" lang="en-US" xml:lang="en-US" dir="ltr"/>`,
      },
    ],
    [
      "SUP#2: <sup> - Should not add any attributes, if all are unset and optional.",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        xpath: "/sup",
        input: `<sup/>`,
        expected: `<sup/>`,
      },
    ],
    [
      "SUP#3: <sup> - Should remove invalid attributes.",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        xpath: "/sup",
        input: `<sup unknownAttr="value"/>`,
        expected: `<sup/>`,
      },
    ],
    // ------------------------------------------------------------------[ IMG ]
    [
      "IMG#1: <img> - Should keep valid attributes as is.",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        xpath: "//img",
        input: `<div xmlns="http://www.coremedia.com/2003/richtext-1.0" xmlns:xlink="http://www.w3.org/1999/xlink"><img class="someClass" lang="en-US" xml:lang="en-US" dir="ltr" alt="Some Alt" height="4" width="2" xlink:type="simple" xlink:href="https://example.org/" xlink:role="https://example.org/" xlink:title="Some Title" xlink:show="embed" xlink:actuate="onLoad"/></div>`,
        expected: `<div xmlns="http://www.coremedia.com/2003/richtext-1.0" xmlns:xlink="http://www.w3.org/1999/xlink"><img class="someClass" lang="en-US" xml:lang="en-US" dir="ltr" alt="Some Alt" height="4" width="2" xlink:type="simple" xlink:href="https://example.org/" xlink:role="https://example.org/" xlink:title="Some Title" xlink:show="embed" xlink:actuate="onLoad"/></div>`,
      },
    ],
    [
      "IMG#2: <img> - Should only add required attributes, if all are unset and optional.",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        xpath: "//img",
        input: `<div xmlns="http://www.coremedia.com/2003/richtext-1.0" xmlns:xlink="http://www.w3.org/1999/xlink"><img/></div>`,
        expected: `<div xmlns="http://www.coremedia.com/2003/richtext-1.0" xmlns:xlink="http://www.w3.org/1999/xlink"><img alt="" xlink:href=""/></div>`,
      },
    ],
    [
      "IMG#3: <img> - Should remove invalid attributes.",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        xpath: "//img",
        input: `<div xmlns="http://www.coremedia.com/2003/richtext-1.0" xmlns:xlink="http://www.w3.org/1999/xlink"><img unknownAttr="value"/></div>`,
        expected: `<div xmlns="http://www.coremedia.com/2003/richtext-1.0" xmlns:xlink="http://www.w3.org/1999/xlink"><img alt="" xlink:href=""/></div>`,
      },
    ],
    [
      "IMG#4: <img> - Should remove attributes having invalid value, and replace if required.",
      {
        strictness: [Strictness.STRICT],
        xpath: "//img",
        input: `<div xmlns="http://www.coremedia.com/2003/richtext-1.0" xmlns:xlink="http://www.w3.org/1999/xlink"><img lang="en_US" xml:lang="en_US" dir="invalid" height="invalid" width="invalid" xlink:type="invalid" xlink:show="new" xlink:actuate="onRequest"/></div>`,
        expected: `<div xmlns="http://www.coremedia.com/2003/richtext-1.0" xmlns:xlink="http://www.w3.org/1999/xlink"><img alt="" xlink:href=""/></div>`,
      },
    ],
    [
      "IMG#5: <img> - Should keep most attributes having invalid value.",
      {
        strictness: [Strictness.LOOSE],
        xpath: "//img",
        input: `<div xmlns="http://www.coremedia.com/2003/richtext-1.0" xmlns:xlink="http://www.w3.org/1999/xlink"><img xlink:href="" alt="" lang="en_US" xml:lang="en_US" dir="invalid" height="invalid" width="invalid" xlink:type="invalid" xlink:show="new" xlink:actuate="onRequest"/></div>`,
        expected: `<div xmlns="http://www.coremedia.com/2003/richtext-1.0" xmlns:xlink="http://www.w3.org/1999/xlink"><img xlink:href="" alt="" lang="en_US" xml:lang="en_US" height="invalid" width="invalid"/></div>`,
      },
    ],
    [
      "IMG#6: <img> - Should keep attributes having invalid value.",
      {
        strictness: [Strictness.LEGACY],
        xpath: "//img",
        input: `<div xmlns="http://www.coremedia.com/2003/richtext-1.0" xmlns:xlink="http://www.w3.org/1999/xlink"><img xlink:href="" alt="" lang="en_US" xml:lang="en_US" dir="invalid" height="invalid" width="invalid" xlink:type="invalid" xlink:show="new" xlink:actuate="onRequest"/></div>`,
        expected: `<div xmlns="http://www.coremedia.com/2003/richtext-1.0" xmlns:xlink="http://www.w3.org/1999/xlink"><img xlink:href="" alt="" lang="en_US" xml:lang="en_US" dir="invalid" height="invalid" width="invalid" xlink:type="invalid" xlink:show="new" xlink:actuate="onRequest"/></div>`,
      },
    ],
    // ----------------------------------------------------------------[ TABLE ]
    [
      "TABLE#1: <table> - Should keep valid attributes as is.",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        xpath: "/table",
        input: `<table class="someClass" lang="en-US" xml:lang="en-US" dir="ltr" summary="Some Summary"/>`,
        expected: `<table class="someClass" lang="en-US" xml:lang="en-US" dir="ltr" summary="Some Summary"/>`,
      },
    ],
    [
      "TABLE#2: <table> - Should not add any attributes, if all are unset and optional.",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        xpath: "/table",
        input: `<table/>`,
        expected: `<table/>`,
      },
    ],
    [
      "TABLE#3: <table> - Should remove invalid attributes.",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        xpath: "/table",
        input: `<table unknownAttr="value"/>`,
        expected: `<table/>`,
      },
    ],
    // ----------------------------------------------------------------[ TBODY ]
    [
      "TBODY#1: <tbody> - Should keep valid attributes as is.",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        xpath: "/tbody",
        input: `<tbody class="someClass" lang="en-US" xml:lang="en-US" dir="ltr" align="left" valign="baseline"/>`,
        expected: `<tbody class="someClass" lang="en-US" xml:lang="en-US" dir="ltr" align="left" valign="baseline"/>`,
      },
    ],
    [
      "TBODY#2: <tbody> - Should not add any attributes, if all are unset and optional.",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        xpath: "/tbody",
        input: `<tbody/>`,
        expected: `<tbody/>`,
      },
    ],
    [
      "TBODY#3: <tbody> - Should remove invalid attributes.",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        xpath: "/tbody",
        input: `<tbody unknownAttr="value"/>`,
        expected: `<tbody/>`,
      },
    ],
    [
      "TBODY#4: <tbody> - Should remove attributes having invalid value.",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE],
        xpath: "/tbody",
        input: `<tbody dir="invalid" align="invalid" valign="invalid"/>`,
        expected: `<tbody/>`,
      },
    ],
    [
      "TBODY#5: <tbody> - Should keep attributes having invalid value.",
      {
        strictness: [Strictness.LEGACY],
        xpath: "/tbody",
        input: `<tbody dir="invalid" align="invalid" valign="invalid"/>`,
        expected: `<tbody dir="invalid" align="invalid" valign="invalid"/>`,
      },
    ],
    // -------------------------------------------------------------------[ TR ]
    [
      "TR#1: <tr> - Should keep valid attributes as is.",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        xpath: "/tr",
        input: `<tr class="someClass" lang="en-US" xml:lang="en-US" dir="ltr" align="left" valign="baseline"/>`,
        expected: `<tr class="someClass" lang="en-US" xml:lang="en-US" dir="ltr" align="left" valign="baseline"/>`,
      },
    ],
    [
      "TR#2: <tr> - Should not add any attributes, if all are unset and optional.",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        xpath: "/tr",
        input: `<tr/>`,
        expected: `<tr/>`,
      },
    ],
    [
      "TR#3: <tr> - Should remove invalid attributes.",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        xpath: "/tr",
        input: `<tr unknownAttr="value"/>`,
        expected: `<tr/>`,
      },
    ],
    [
      "TR#4: <tr> - Should remove attributes having invalid value.",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE],
        xpath: "/tr",
        input: `<tr dir="invalid" align="invalid" valign="invalid"/>`,
        expected: `<tr/>`,
      },
    ],
    [
      "TR#5: <tr> - Should keep attributes having invalid value.",
      {
        strictness: [Strictness.LEGACY],
        xpath: "/tr",
        input: `<tr dir="invalid" align="invalid" valign="invalid"/>`,
        expected: `<tr dir="invalid" align="invalid" valign="invalid"/>`,
      },
    ],
    // -------------------------------------------------------------------[ TD ]
    [
      "TD#1: <td> - Should keep valid attributes as is.",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        xpath: "/td",
        input: `<td class="someClass" lang="en-US" xml:lang="en-US" dir="ltr" align="left" valign="baseline" abbr="Some Abbreviation" rowspan="42" colspan="24"/>`,
        expected: `<td class="someClass" lang="en-US" xml:lang="en-US" dir="ltr" align="left" valign="baseline" abbr="Some Abbreviation" rowspan="42" colspan="24"/>`,
      },
    ],
    [
      "TD#2: <td> - Should not add any attributes, if all are unset and optional.",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        xpath: "/td",
        input: `<td/>`,
        expected: `<td/>`,
      },
    ],
    [
      "TD#3: <td> - Should remove invalid attributes.",
      {
        strictness: [Strictness.STRICT, Strictness.LOOSE, Strictness.LEGACY],
        xpath: "/td",
        input: `<td unknownAttr="value"/>`,
        expected: `<td/>`,
      },
    ],
    [
      "TD#4: <td> - Should remove attributes having invalid value.",
      {
        strictness: [Strictness.STRICT],
        xpath: "/td",
        input: `<td dir="invalid" align="invalid" valign="invalid" rowspan="invalid" colspan="invalid"/>`,
        expected: `<td/>`,
      },
    ],
    [
      "TD#5: <td> - Should keep some attributes having invalid value.",
      {
        strictness: [Strictness.LOOSE],
        xpath: "/td",
        input: `<td dir="invalid" align="invalid" valign="invalid" rowspan="invalid" colspan="invalid"/>`,
        expected: `<td rowspan="invalid" colspan="invalid"/>`,
      },
    ],
    [
      "TD#5: <td> - Should keep attributes having invalid value.",
      {
        strictness: [Strictness.LEGACY],
        xpath: "/td",
        input: `<td dir="invalid" align="invalid" valign="invalid" rowspan="invalid" colspan="invalid"/>`,
        expected: `<td dir="invalid" align="invalid" valign="invalid" rowspan="invalid" colspan="invalid"/>`,
      },
    ],
  ];

  const strictnessKeys = Object.keys(Strictness).filter((x) => !(parseInt(x) >= 0));

  describe.each<TransformAttributesTestFixture>(testFixtures)(
    "(%#) %s",
    (name: string, testData: TransformAttributesTestData) => {
      for (const strictness of testData.strictness) {
        const schema = new RichTextSchema(strictness);

        test(`${name} (mode: ${strictnessKeys[strictness]})`, () => {
          const xmlDocument: Document = parser.parseFromString(testData.input.trim(), "text/xml");
          const xPathResult = xmlDocument.evaluate(
            testData.xpath,
            xmlDocument,
            null,
            XPathResult.FIRST_ORDERED_NODE_TYPE
          );
          const element: Element = xPathResult.singleNodeValue as Element;
          const mutableElement = ElementProxy.instantiateForTest(element);

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
          expect(actualXml).toEqualXML(testData.expected);
        });
      }
    }
  );
});

/*
 * =============================================================================
 *
 *                                              RichTextSchema.isAllowedAtParent
 *
 * =============================================================================
 */

describe("RichTextSchema.isAllowedAtParent", () => {
  type ValidateParentData = CommentableTestData & DisableableTestCase & XmlInputTestData & ExpectValidationTestData;

  /**
   * Test-Fixture for validation tests. The name only serves for output.
   * It is recommended adding some ID to this string, as it may be used for
   * conditional breakpoints then.
   */
  type ValidateTestFixture = [string, ValidateParentData];

  const allDtdElements = [
    "a",
    "blockquote",
    "br",
    "em",
    "img",
    "li",
    "ol",
    "p",
    "pre",
    "span",
    "strong",
    "sub",
    "sup",
    "table",
    "tbody",
    "td",
    "tr",
    "ul",
  ];

  const allDtdElementsAndUnknown = [...allDtdElements, "unknown"];

  function allAllowed(self: string, ...allowed: string[]): string {
    return `<root>${allowed.map((e) => `<${e}><${self}/></${e}>`).join()}</root>`;
  }

  function allForbidden(self: string, ...allowed: string[]): string {
    return `<root>${allDtdElementsAndUnknown
      .filter((e) => ![self, ...allowed].includes(e))
      .map((e) => `<${e}><${self}/></${e}>`)
      .join()}</root>`;
  }

  const testFixtures: ValidateTestFixture[] = [
    // ------------------------------------------------------------------[ DIV ]
    [
      "DIV#1: <div> should be allowed (and meant) to be at root.",
      {
        xpath: "/div",
        input: `<div/>`,
        expected: true,
      },
    ],
    [
      "DIV#2: <div> is not allowed as child of any other element.",
      {
        xpath: "//div",
        input: allForbidden("div"),
        expected: false,
      },
    ],
    [
      "DIV#3: <div> - Is not allowed as child of itself.",
      {
        xpath: "//div[@id='validated']",
        input: `<div><div id="validated"/></div>`,
        expected: false,
      },
    ],
    // --------------------------------------------------------------------[ P ]
    [
      "P#1: <p> - Must not be root element",
      {
        xpath: "/p",
        input: `<p/>`,
        expected: false,
      },
    ],
    [
      "P#2: <p> - Allowed as Child of...",
      {
        xpath: "//p",
        input: allAllowed("p", "div", "li", "blockquote", "td"),
        expected: true,
      },
    ],
    [
      "P#3: <p> - Forbidden as Child of...",
      {
        xpath: "//p",
        input: allForbidden("p", "div", "li", "blockquote", "td"),
        expected: false,
      },
    ],
    [
      "P#4: <p> - Is not allowed as child of itself.",
      {
        xpath: "//p[@id='validated']",
        input: `<p><p id="validated"/></p>`,
        expected: false,
      },
    ],
    // -------------------------------------------------------------------[ UL ]
    [
      "UL#1: <ul> - Must not be root element",
      {
        xpath: "/ul",
        input: `<ul/>`,
        expected: false,
      },
    ],
    [
      "UL#2: <ul> - Allowed as Child of...",
      {
        xpath: "//ul",
        input: allAllowed("ul", "div", "li", "blockquote", "td"),
        expected: true,
      },
    ],
    [
      "UL#3: <ul> - Forbidden as Child of...",
      {
        xpath: "//ul",
        input: allForbidden("ul", "div", "li", "blockquote", "td"),
        expected: false,
      },
    ],
    [
      "UL#4: <ul> - Is not allowed as child of itself.",
      {
        xpath: "//ul[@id='validated']",
        input: `<ul><ul id="validated"/></ul>`,
        expected: false,
      },
    ],
    // -------------------------------------------------------------------[ OL ]
    [
      "OL#1: <ol> - Must not be root element",
      {
        xpath: "/ol",
        input: `<ol/>`,
        expected: false,
      },
    ],
    [
      "OL#2: <ol> - Allowed as Child of...",
      {
        xpath: "//ol",
        input: allAllowed("ol", "div", "li", "blockquote", "td"),
        expected: true,
      },
    ],
    [
      "OL#3: <ol> - Forbidden as Child of...",
      {
        xpath: "//ol",
        input: allForbidden("ol", "div", "li", "blockquote", "td"),
        expected: false,
      },
    ],
    [
      "OL#4: <ol> - Is not allowed as child of itself.",
      {
        xpath: "//ol[@id='validated']",
        input: `<ol><ol id="validated"/></ol>`,
        expected: false,
      },
    ],
    // -------------------------------------------------------------------[ LI ]
    [
      "LI#1: <li> - Must not be root element",
      {
        xpath: "/li",
        input: `<li/>`,
        expected: false,
      },
    ],
    [
      "LI#2: <li> - Allowed as Child of...",
      {
        xpath: "//li",
        input: allAllowed("li", "ol", "ul"),
        expected: true,
      },
    ],
    [
      "LI#3: <li> - Forbidden as Child of...",
      {
        xpath: "//li",
        input: allForbidden("li", "ol", "ul"),
        expected: false,
      },
    ],
    [
      "LI#4: <li> - Is not allowed as child of itself.",
      {
        xpath: "//li[@id='validated']",
        input: `<li><li id="validated"/></li>`,
        expected: false,
      },
    ],
    // ------------------------------------------------------------------[ PRE ]
    [
      "PRE#1: <pre> - Must not be root element",
      {
        xpath: "/pre",
        input: `<pre/>`,
        expected: false,
      },
    ],
    [
      "PRE#2: <pre> - Allowed as Child of...",
      {
        xpath: "//pre",
        input: allAllowed("pre", "div", "li", "blockquote", "td"),
        expected: true,
      },
    ],
    [
      "PRE#3: <pre> - Forbidden as Child of...",
      {
        xpath: "//pre",
        input: allForbidden("pre", "div", "li", "blockquote", "td"),
        expected: false,
      },
    ],
    [
      "PRE#4: <pre> - Is not allowed as child of itself.",
      {
        xpath: "//pre[@id='validated']",
        input: `<pre><pre id="validated"/></pre>`,
        expected: false,
      },
    ],
    // -----------------------------------------------------------[ BLOCKQUOTE ]
    [
      "BLOCKQUOTE#1: <blockquote> - Must not be root element",
      {
        xpath: "/blockquote",
        input: `<blockquote/>`,
        expected: false,
      },
    ],
    [
      "BLOCKQUOTE#2: <blockquote> - Allowed as Child of...",
      {
        xpath: "//blockquote",
        input: allAllowed("blockquote", "div", "li", "td"),
        expected: true,
      },
    ],
    [
      "BLOCKQUOTE#3: <blockquote> - Forbidden as Child of...",
      {
        xpath: "//blockquote",
        input: allForbidden("blockquote", "div", "li", "td"),
        expected: false,
      },
    ],
    [
      "BLOCKQUOTE#4: <blockquote> - Is allowed as child of itself.",
      {
        xpath: "//blockquote[@id='validated']",
        input: `<blockquote><blockquote id="validated"/></blockquote>`,
        expected: true,
      },
    ],
    // --------------------------------------------------------------------[ A ]
    [
      "A#1: <a> - Must not be root element",
      {
        xpath: "/a",
        input: `<a/>`,
        expected: false,
      },
    ],
    [
      "A#2: <a> - Allowed as Child of...",
      {
        xpath: "//a",
        input: allAllowed("a", "em", "li", "p", "pre", "span", "strong", "sub", "sup", "td"),
        expected: true,
      },
    ],
    [
      "A#3: <a> - Forbidden as Child of...",
      {
        xpath: "//a",
        input: allForbidden("a", "em", "li", "p", "pre", "span", "strong", "sub", "sup", "td"),
        expected: false,
      },
    ],
    [
      "A#4: <a> - Is not allowed as child of itself.",
      {
        xpath: "//a[@id='validated']",
        input: `<a><a id="validated"/></a>`,
        expected: false,
      },
    ],
    // -----------------------------------------------------------------[ SPAN ]
    [
      "SPAN#1: <span> - Must not be root element",
      {
        xpath: "/span",
        input: `<span/>`,
        expected: false,
      },
    ],
    [
      "SPAN#2: <span> - Allowed as Child of...",
      {
        xpath: "//span",
        input: allAllowed("span", "a", "em", "li", "p", "pre", "strong", "sub", "sup", "td"),
        expected: true,
      },
    ],
    [
      "SPAN#3: <span> - Forbidden as Child of...",
      {
        xpath: "//span",
        input: allForbidden("span", "a", "em", "li", "p", "pre", "strong", "sub", "sup", "td"),
        expected: false,
      },
    ],
    [
      "SPAN#4: <span> - Is allowed as child of itself.",
      {
        xpath: "//span[@id='validated']",
        input: `<span><span id="validated"/></span>`,
        expected: true,
      },
    ],
    // -------------------------------------------------------------------[ BR ]
    [
      "BR#1: <br> - Must not be root element",
      {
        xpath: "/br",
        input: `<br/>`,
        expected: false,
      },
    ],
    [
      "BR#2: <br> - Allowed as Child of...",
      {
        xpath: "//br",
        input: allAllowed("br", "a", "em", "li", "p", "pre", "span", "strong", "sub", "sup", "td"),
        expected: true,
      },
    ],
    [
      "BR#3: <br> - Forbidden as Child of...",
      {
        xpath: "//br",
        input: allForbidden("br", "a", "em", "li", "p", "pre", "span", "strong", "sub", "sup", "td"),
        expected: false,
      },
    ],
    [
      "BR#4: <br> - Is not allowed as child of itself.",
      {
        xpath: "//br[@id='validated']",
        input: `<br><br id="validated"/></br>`,
        expected: false,
      },
    ],
    // -------------------------------------------------------------------[ EM ]
    [
      "EM#1: <em> - Must not be root element",
      {
        xpath: "/em",
        input: `<em/>`,
        expected: false,
      },
    ],
    [
      "EM#2: <em> - Allowed as Child of...",
      {
        xpath: "//em",
        input: allAllowed("em", "a", "span", "li", "p", "pre", "strong", "sub", "sup", "td"),
        expected: true,
      },
    ],
    [
      "EM#3: <em> - Forbidden as Child of...",
      {
        xpath: "//em",
        input: allForbidden("em", "a", "span", "li", "p", "pre", "strong", "sub", "sup", "td"),
        expected: false,
      },
    ],
    [
      "EM#4: <em> - Is not allowed as child of itself.",
      {
        xpath: "//em[@id='validated']",
        input: `<em><em id="validated"/></em>`,
        expected: true,
      },
    ],
    // -----------------------------------------------------------------[ STRONG ]
    [
      "STRONG#1: <strong> - Must not be root element",
      {
        xpath: "/strong",
        input: `<strong/>`,
        expected: false,
      },
    ],
    [
      "STRONG#2: <strong> - Allowed as Child of...",
      {
        xpath: "//strong",
        input: allAllowed("strong", "a", "em", "li", "p", "pre", "span", "sub", "sup", "td"),
        expected: true,
      },
    ],
    [
      "STRONG#3: <strong> - Forbidden as Child of...",
      {
        xpath: "//strong",
        input: allForbidden("strong", "a", "em", "li", "p", "pre", "span", "sub", "sup", "td"),
        expected: false,
      },
    ],
    [
      "STRONG#4: <strong> - Is not allowed as child of itself.",
      {
        xpath: "//strong[@id='validated']",
        input: `<strong><strong id="validated"/></strong>`,
        expected: true,
      },
    ],
    // ------------------------------------------------------------------[ SUB ]
    [
      "SUB#1: <sub> - Must not be root element",
      {
        xpath: "/sub",
        input: `<sub/>`,
        expected: false,
      },
    ],
    [
      "SUB#2: <sub> - Allowed as Child of...",
      {
        xpath: "//sub",
        input: allAllowed("sub", "a", "em", "li", "p", "pre", "strong", "span", "sup", "td"),
        expected: true,
      },
    ],
    [
      "SUB#3: <sub> - Forbidden as Child of...",
      {
        xpath: "//sub",
        input: allForbidden("sub", "a", "em", "li", "p", "pre", "strong", "span", "sup", "td"),
        expected: false,
      },
    ],
    [
      "SUB#4: <sub> - Is allowed as child of itself.",
      {
        xpath: "//sub[@id='validated']",
        input: `<sub><sub id="validated"/></sub>`,
        expected: true,
      },
    ],
    // ------------------------------------------------------------------[ SUP ]
    [
      "SUP#1: <sup> - Must not be root element",
      {
        xpath: "/sup",
        input: `<sup/>`,
        expected: false,
      },
    ],
    [
      "SUP#2: <sup> - Allowed as Child of...",
      {
        xpath: "//sup",
        input: allAllowed("sup", "a", "em", "li", "p", "pre", "strong", "sub", "span", "td"),
        expected: true,
      },
    ],
    [
      "SUP#3: <sup> - Forbidden as Child of...",
      {
        xpath: "//sup",
        input: allForbidden("sup", "a", "em", "li", "p", "pre", "strong", "sub", "span", "td"),
        expected: false,
      },
    ],
    [
      "SUP#4: <sup> - Is allowed as child of itself.",
      {
        xpath: "//sup[@id='validated']",
        input: `<sup><sup id="validated"/></sup>`,
        expected: true,
      },
    ],
    // ------------------------------------------------------------------[ IMG ]
    [
      "IMG#1: <img> - Must not be root element",
      {
        xpath: "/img",
        input: `<img/>`,
        expected: false,
      },
    ],
    [
      "IMG#2: <img> - Allowed as Child of...",
      {
        xpath: "//img",
        input: allAllowed("img", "a", "em", "li", "p", "span", "strong", "sub", "sup", "td"),
        expected: true,
      },
    ],
    [
      "IMG#3: <img> - Forbidden as Child of...",
      {
        xpath: "//img",
        input: allForbidden("img", "a", "em", "li", "p", "span", "strong", "sub", "sup", "td"),
        expected: false,
      },
    ],
    [
      "IMG#4: <img> - Is not allowed as child of itself.",
      {
        xpath: "//img[@id='validated']",
        input: `<img><img id="validated"/></img>`,
        expected: false,
      },
    ],
    // ----------------------------------------------------------------[ TABLE ]
    [
      "TABLE#1: <table> - Must not be root element",
      {
        xpath: "/table",
        input: `<table/>`,
        expected: false,
      },
    ],
    [
      "TABLE#2: <table> - Allowed as Child of...",
      {
        xpath: "//table",
        input: allAllowed("table", "blockquote", "li", "td"),
        expected: true,
      },
    ],
    [
      "TABLE#3: <table> - Forbidden as Child of...",
      {
        xpath: "//table",
        input: allForbidden("table", "blockquote", "li", "td"),
        expected: false,
      },
    ],
    [
      "TABLE#4: <table> - Is not allowed as child of itself.",
      {
        xpath: "//table[@id='validated']",
        input: `<table><table id="validated"/></table>`,
        expected: false,
      },
    ],
    // ----------------------------------------------------------------[ TBODY ]
    [
      "TBODY#1: <tbody> - Must not be root element",
      {
        xpath: "/tbody",
        input: `<tbody/>`,
        expected: false,
      },
    ],
    [
      "TBODY#2: <tbody> - Allowed as Child of...",
      {
        xpath: "//tbody",
        input: allAllowed("tbody", "table"),
        expected: true,
      },
    ],
    [
      "TBODY#3: <tbody> - Forbidden as Child of...",
      {
        xpath: "//tbody",
        input: allForbidden("tbody", "table"),
        expected: false,
      },
    ],
    [
      "TBODY#4: <tbody> - Is not allowed as child of itself.",
      {
        xpath: "//tbody[@id='validated']",
        input: `<tbody><tbody id="validated"/></tbody>`,
        expected: false,
      },
    ],
    // -------------------------------------------------------------------[ TR ]
    [
      "TR#1: <tr> - Must not be root element",
      {
        xpath: "/tr",
        input: `<tr/>`,
        expected: false,
      },
    ],
    [
      "TR#2: <tr> - Allowed as Child of...",
      {
        xpath: "//tr",
        input: allAllowed("tr", "table", "tbody"),
        expected: true,
      },
    ],
    [
      "TR#3: <tr> - Forbidden as Child of...",
      {
        xpath: "//tr",
        input: allForbidden("tr", "table", "tbody"),
        expected: false,
      },
    ],
    [
      "TR#4: <tr> - Is not allowed as child of itself.",
      {
        xpath: "//tr[@id='validated']",
        input: `<tr><tr id="validated"/></tr>`,
        expected: false,
      },
    ],
    // -------------------------------------------------------------------[ TD ]
    [
      "TD#1: <td> - Must not be root element",
      {
        xpath: "/td",
        input: `<td/>`,
        expected: false,
      },
    ],
    [
      "TD#2: <td> - Allowed as Child of...",
      {
        xpath: "//td",
        input: allAllowed("td", "tr"),
        expected: true,
      },
    ],
    [
      "TD#3: <td> - Forbidden as Child of...",
      {
        xpath: "//td",
        input: allForbidden("td", "tr"),
        expected: false,
      },
    ],
    [
      "TD#4: <td> - Is not allowed as child of itself.",
      {
        xpath: "//td[@id='validated']",
        input: `<td><td id="validated"/></td>`,
        expected: false,
      },
    ],
  ];

  describe.each<ValidateTestFixture>(testFixtures)("(%#) %s", (name: string, testData: ValidateParentData) => {
    const xmlDocument: Document = parser.parseFromString(testData.input.trim(), "text/xml");
    const xPathResult = xmlDocument.evaluate(testData.xpath, xmlDocument, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE);
    const schema = new RichTextSchema(Strictness.STRICT);

    let validatedAtLeastOnce = false;
    let element: Element | null;
    while ((element = xPathResult.iterateNext() as Element | null)) {
      validatedAtLeastOnce = true;
      const mutableElement = ElementProxy.instantiateForTest(element);
      test(`<${element?.parentElement?.tagName ?? "#document"}>, ${
        testData.expected ? "allowed" : "forbidden"
      }: Validating <${element?.tagName}> if allowed as child of <${
        element?.parentElement?.tagName ?? "#document"
      }>, expected response: ${testData.expected}.`, () => {
        expect(schema.isElementAllowedAtParent(mutableElement)).toStrictEqual(testData.expected);
      });
    }

    if (!validatedAtLeastOnce) {
      throw new Error(`No elements tested, XPath may be wrong. xpath: ${testData.xpath}, input: ${testData.input}`);
    }
  });
});
