import { allDataProcessingTests, DataProcessingTestCase, Direction } from "../DataDrivenTests";
import { flatten } from "../Utils";

// noinspection HttpUrlsUsage
const ns_richtext = "http://www.coremedia.com/2003/richtext-1.0";
const whitespace = " \t\n";
const text = "TEXT";
const emptyRichText = `<div xmlns="${ns_richtext}"/>`;

// noinspection XmlUnusedNamespaceDeclaration
const wrapContent = (content: string): string => `<div xmlns="${ns_richtext}">${content}</div>`;

/**
 * CoreMedia RichText 1.0 Element Definition Reference for Tested Elements:
 *
 * ```
 * <!ELEMENT li (#PCDATA|p|ul|ol|pre|blockquote|table|a|br|span|img|em|strong|sub|sup)* >
 * <!ATTLIST li
 *   xml:lang NMTOKEN   #IMPLIED
 *   dir      (ltr|rtl) #IMPLIED
 *   lang     NMTOKEN   #IMPLIED
 *   class    CDATA     #IMPLIED >
 *
 * <!ELEMENT ol (li)+ >
 * <!ATTLIST ol
 *   xml:lang NMTOKEN   #IMPLIED
 *   dir      (ltr|rtl) #IMPLIED
 *   lang     NMTOKEN   #IMPLIED
 *   class    CDATA     #IMPLIED >
 *
 * <!ELEMENT ul (li)+ >
 * <!ATTLIST ul
 *   xml:lang NMTOKEN   #IMPLIED
 *   dir      (ltr|rtl) #IMPLIED
 *   lang     NMTOKEN   #IMPLIED
 *   class    CDATA     #IMPLIED >
 * ```
 */
describe("CoreMediaRichTextConfig: Lists", () => {
  const data: DataProcessingTestCase[] = flatten(
    ["ul", "ol"].map((el): DataProcessingTestCase[] => {
      const key = el.toUpperCase();
      return [
        {
          name: `${key}#1: Should remove if empty, as empty <${el}> not allowed by DTD.`,
          direction: Direction.toData,
          data: emptyRichText,
          dataView: wrapContent(`<${el}>${whitespace}</${el}>`),
        },
        {
          name: `${key}#2: Should keep if valid.`,
          data: wrapContent(`<${el}><li>${text}</li></${el}>`),
          dataView: wrapContent(`<${el}><li>${text}</li></${el}>`),
        },
        {
          name: `${key}#3: Should keep class attribute.`,
          data: wrapContent(`<${el} class="CLASS"><li>${text}</li></${el}>`),
          dataView: wrapContent(`<${el} class="CLASS"><li>${text}</li></${el}>`),
        },
        {
          name: `${key}#4: Keep dir attribute.`,
          data: wrapContent(`<${el} dir="rtl"><li>${text}</li></${el}>`),
          dataView: wrapContent(`<${el} dir="rtl"><li>${text}</li></${el}>`),
        },
        {
          name: `${key}#5: Keep lang/xml:lang attribute.`,
          data: wrapContent(`<${el} xml:lang="en"><li>${text}</li></${el}>`),
          dataView: wrapContent(`<${el} lang="en"><li>${text}</li></${el}>`),
        },
        {
          name: `${key}#6: Should transform lang (data) to lang attribute (data view).`,
          direction: Direction.toDataView,
          data: wrapContent(`<${el} lang="en"><li>${text}</li></${el}>`),
          dataView: wrapContent(`<${el} lang="en"><li>${text}</li></${el}>`),
        },
        {
          name: `${key}#7: Should prefer xml:lang over lang in data.`,
          direction: Direction.toDataView,
          data: wrapContent(`<${el} lang="en" xml:lang="de"><li>${text}</li></${el}>`),
          dataView: wrapContent(`<${el} lang="de"><li>${text}</li></${el}>`),
        },
        {
          name: `${key}/LI#1: Should keep class attribute.`,
          data: wrapContent(`<${el}><li class="CLASS">${text}</li></${el}>`),
          dataView: wrapContent(`<${el}><li class="CLASS">${text}</li></${el}>`),
        },
        {
          name: `${key}/LI#2: Keep dir attribute.`,
          data: wrapContent(`<${el}><li dir="rtl">${text}</li></${el}>`),
          dataView: wrapContent(`<${el}><li dir="rtl">${text}</li></${el}>`),
        },
        {
          name: `${key}/LI#3: Keep lang/xml:lang attribute.`,
          data: wrapContent(`<${el}><li xml:lang="en">${text}</li></${el}>`),
          dataView: wrapContent(`<${el}><li lang="en">${text}</li></${el}>`),
        },
        {
          name: `${key}/LI#4: Should transform lang (data) to lang attribute (data view).`,
          direction: Direction.toDataView,
          data: wrapContent(`<${el}><li lang="en">${text}</li></${el}>`),
          dataView: wrapContent(`<${el}><li lang="en">${text}</li></${el}>`),
        },
        {
          name: `${key}/LI#5: Should prefer xml:lang over lang in data.`,
          direction: Direction.toDataView,
          data: wrapContent(`<${el}><li lang="en" xml:lang="de">${text}</li></${el}>`),
          dataView: wrapContent(`<${el}><li lang="de">${text}</li></${el}>`),
        },
        {
          name: `${key}/LI#6: Work around ck-list-bogus-paragraph`,
          direction: Direction.toData,
          comment: "Workaround for ckeditor/ckeditor5#11786",
          data: wrapContent(`<${el}><li>${text}</li></${el}>`),
          dataView: wrapContent(`<${el}><li><span class="ck-list-bogus-paragraph">${text}</span></li></${el}>`),
        },
      ];
    })
  );

  allDataProcessingTests(data);
});
