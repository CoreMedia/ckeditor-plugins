import { allDataProcessingTests, DataProcessingTestCase, Direction } from "../DataDrivenTests";

// noinspection HttpUrlsUsage
const ns_richtext = "http://www.coremedia.com/2003/richtext-1.0";
const ns_xlink = "http://www.w3.org/1999/xlink";
const text = "TEXT";
// Represents a typical representation of an embedded image in CoreMedia Studio.
// It references the content-ID and a certain property to read the blob data from.
const imageHref = "content/0#properties.data";
// Represents a typical representation of an embedded image in CoreMedia
// RichText in its normal (non-Studio) UAPI form.
// As editors may enter this during source editing (they may be more used to
// it, or they just copy and paste it from another source), we should respect
// this in `toView` transformation.
const imageUapiUri = "coremedia:///cap/blob/content/0#data";

// noinspection XmlUnusedNamespaceDeclaration
const wrapImg = (img: string): string => `<div xmlns="${ns_richtext}" xmlns:xlink="${ns_xlink}"><p>${img}</p></div>`;

/**
 * CoreMedia RichText 1.0 Element Definition Reference for Tested Elements:
 *
 * ```
 * <!ELEMENT img EMPTY >
 * <!ATTLIST img
 *   height        CDATA     #IMPLIED
 *   xml:lang      NMTOKEN   #IMPLIED
 *   width         CDATA     #IMPLIED
 *   dir           (ltr|rtl) #IMPLIED
 *   xlink:show    (embed)   #FIXED 'embed'
 *   xlink:title   CDATA     #IMPLIED
 *   xlink:actuate (onLoad)  #FIXED 'onLoad'
 *   alt           CDATA     #REQUIRED
 *   xlink:href    CDATA     #REQUIRED
 *   xlink:type    (simple)  #FIXED 'simple'
 *   lang          NMTOKEN   #IMPLIED
 *   class         CDATA     #IMPLIED
 *   xlink:role    CDATA     #IMPLIED >
 * ```
 */
describe("CoreMediaRichTextConfig: Images", () => {
  // noinspection HtmlUnknownAttribute,RequiredAttributes
  const data: DataProcessingTestCase[] = [
    {
      name: "IMAGE#1: Just an embedded image without additional attributes.",
      data: wrapImg(`<img alt="" xlink:href="${imageHref}"/>`),
      dataView: wrapImg(`<img alt="" data-xlink-href="${imageHref}"/>`),
    },
    {
      name: "IMAGE#2: Preserve alt text.",
      data: wrapImg(`<img alt="ALT" xlink:href="${imageHref}"/>`),
      dataView: wrapImg(`<img alt="ALT" data-xlink-href="${imageHref}"/>`),
    },
    {
      name: "IMAGE#2: Preserve value of xlink:actuate.",
      data: wrapImg(`<img alt="" xlink:actuate="onLoad" xlink:href="${imageHref}"/>`),
      dataView: wrapImg(`<img alt="" data-xlink-actuate="onLoad" data-xlink-href="${imageHref}"/>`),
    },
    {
      name: "IMAGE#3: Preserve value of xlink:role.",
      data: wrapImg(`<img alt="" xlink:href="${imageHref}" xlink:role="ROLE"/>`),
      dataView: wrapImg(`<img alt="" data-xlink-href="${imageHref}" data-xlink-role="ROLE"/>`),
    },
    {
      name: "IMAGE#4: Preserve value of xlink:show.",
      data: wrapImg(`<img alt="" xlink:href="${imageHref}" xlink:show="embed"/>`),
      dataView: wrapImg(`<img alt="" data-xlink-href="${imageHref}" data-xlink-show="embed"/>`),
    },
    {
      name: "IMAGE#5: Preserve value of xlink:title.",
      data: wrapImg(`<img alt="" xlink:href="${imageHref}" xlink:title="TITLE"/>`),
      dataView: wrapImg(`<img alt="" data-xlink-href="${imageHref}" title="TITLE"/>`),
    },
    {
      name: "IMAGE#6: Preserve value of xlink:type.",
      data: wrapImg(`<img alt="" xlink:href="${imageHref}" xlink:type="simple"/>`),
      dataView: wrapImg(`<img alt="" data-xlink-href="${imageHref}" data-xlink-type="simple"/>`),
    },
    {
      name: "IMAGE#7: Preserve value of xml:lang.",
      data: wrapImg(`<img alt="" xlink:href="${imageHref}" xml:lang="en"/>`),
      dataView: wrapImg(`<img alt="" data-xlink-href="${imageHref}" lang="en"/>`),
    },
    {
      name: "IMAGE#8: Preserve value of lang.",
      comment: "Only applicable for toView, as on toData we will always create xml:lang instead.",
      direction: Direction.toDataView,
      data: wrapImg(`<img alt="" lang="en" xlink:href="${imageHref}"/>`),
      dataView: wrapImg(`<img alt="" lang="en" data-xlink-href="${imageHref}"/>`),
    },
    {
      name: "IMAGE#9: Prefer xml:lang over lang when processing Data → Data View.",
      direction: Direction.toDataView,
      data: wrapImg(`<img alt="" xml:lang="de" lang="en" xlink:href="${imageHref}"/>`),
      dataView: wrapImg(`<img alt="" lang="de" data-xlink-href="${imageHref}"/>`),
    },
    {
      name: "IMAGE#10: Remove Image without data-xlink-href.",
      comment:
        "We only support images always having data-xlink-href set, yet. Strictly speaking, only supporting images with reference to CMS Contents.",
      direction: Direction.toData,
      data: wrapImg(`${text}`),
      dataView: wrapImg(`${text}<img alt=""/>`),
    },
    {
      name: "IMAGE#11: Source Editing Convenience: Respect Content Blob Links in UAPI Form.",
      direction: Direction.toDataView,
      data: wrapImg(`<img alt="" xlink:href="${imageUapiUri}"/>`),
      dataView: wrapImg(`<img alt="" data-xlink-href="${imageHref}"/>`),
    },
    {
      name: "IMAGE#12: Preserve height attribute.",
      data: wrapImg(`<img height="42" alt="" xlink:href="${imageHref}"/>`),
      dataView: wrapImg(`<img height="42" alt="" data-xlink-href="${imageHref}"/>`),
    },
    {
      name: "IMAGE#13: Preserve width attribute.",
      data: wrapImg(`<img width="42" alt="" xlink:href="${imageHref}"/>`),
      dataView: wrapImg(`<img width="42" alt="" data-xlink-href="${imageHref}"/>`),
    },
    {
      name: "IMAGE#14: Preserve dir attribute.",
      data: wrapImg(`<img dir="rtl" alt="" xlink:href="${imageHref}"/>`),
      dataView: wrapImg(`<img dir="rtl" alt="" data-xlink-href="${imageHref}"/>`),
    },
  ];

  allDataProcessingTests(data);
});
