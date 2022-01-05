import { allDataProcessingTests, DataProcessingTestCase, Direction } from "../DataDrivenTests";
// noinspection HttpUrlsUsage
const ns_richtext = "http://www.coremedia.com/2003/richtext-1.0";
const text = "TEXT";
const emptyRichText = `<div xmlns="${ns_richtext}"/>`;

// noinspection XmlUnusedNamespaceDeclaration
const wrapContent = (content: string): string => `<div xmlns="${ns_richtext}">${content}</div>`;

describe("CoreMediaRichTextConfig: Table", () => {
  const data: DataProcessingTestCase[] = [
    {
      name: "TABLE#01: Empty table should be removed, as it is invalid.",
      direction: Direction.toData,
      data: emptyRichText,
      dataView: wrapContent(`<table/>`),
    },
    {
      name: "TABLE#02: tbody should be added if missing.",
      direction: Direction.toData,
      comment:
        "This is a design decision which eases data-processing implementation. If this is unexpected, it may be changed.",
      data: wrapContent(`<table><tbody><tr><td>${text}</td></tr></tbody></table>`),
      dataView: wrapContent(`<table><tr><td>${text}</td></tr></table>`),
    },
    {
      name: "TABLE#03: thead should be transformed as being part of tbody.",
      comment:
        "ckeditor/ckeditor5#9360: We must try at best effort to keep information about rows which are meant to be part of thead.",
      data: wrapContent(
        `<table><tbody><tr class="tr--header"><td class="td--header">${text}</td></tr></tbody></table>`
      ),
      dataView: wrapContent(`<table><thead><tr><th>${text}</th></tr></thead></table>`),
    },
    {
      name: "TABLE#04: tbody should be kept as is.",
      data: wrapContent(`<table><tbody><tr><td>${text}</td></tr></tbody></table>`),
      dataView: wrapContent(`<table><tbody><tr><td>${text}</td></tr></tbody></table>`),
    },
    {
      name: "TABLE#05: thead should merge into tbody",
      comment:
        "One contract is, that thead merges into existing tbody, so that e.g. class attributes at tbody are kept.",
      data: wrapContent(
        `<table><tbody class="CLASS"><tr class="tr--header"><td>Head</td></tr><tr><td>Body</td></tr></tbody></table>`
      ),
      dataView: wrapContent(
        `<table><thead><tr><td>Head</td></tr></thead><tbody class="CLASS"><tr><td>Body</td></tr></tbody></table>`
      ),
    },
    {
      name: "TABLE#06: th should be transformed to td with class.",
      data: wrapContent(`<table><tbody><tr><td class="td--header">Head</td></tr></tbody></table>`),
      dataView: wrapContent(`<table><tbody><tr><th>Head</th></tr></tbody></table>`),
    },
    {
      name: "TABLE#07: Should remove figure around table. By default CKEditor 5 adds a figure around table.",
      direction: Direction.toData,
      data: wrapContent(`<table><tbody><tr><td>Body</td></tr></tbody></table>`),
      dataView: wrapContent(`<figure><table><tbody><tr><td>Body</td></tr></tbody></table></figure>`),
    },
    {
      name: "TABLE#08: Should remove empty tbody, and thus empty table.",
      direction: Direction.toData,
      data: emptyRichText,
      dataView: wrapContent(`<table><tbody/></table>`),
    },
    {
      name: "TABLE#09: Should remove empty tr, and thus empty tbody, and thus empty table.",
      direction: Direction.toData,
      data: emptyRichText,
      dataView: wrapContent(`<table><tbody><tr/></tbody></table>`),
    },
    {
      name: "TABLE#10: Should keep empty td.",
      data: wrapContent(`<table><tbody><tr><td/></tr></tbody></table>`),
      dataView: wrapContent(`<table><tbody><tr><td/></tr></tbody></table>`),
    },
    {
      name: "TABLE#11: Should keep td with several children.",
      data: wrapContent(`<table><tbody><tr><td><p>${text}</p><p>${text}</p></td></tr></tbody></table>`),
      dataView: wrapContent(`<table><tbody><tr><td><p>${text}</p><p>${text}</p></td></tr></tbody></table>`),
    },
    {
      name: "TABLE#12: Should remove singleton br in td.",
      direction: Direction.toData,
      comment: "This is the behavior of CoreMedia RichText with CKEditor 4.",
      data: wrapContent(`<table><tbody><tr><td/></tr></tbody></table>`),
      dataView: wrapContent(`<table><tbody><tr><td><br/></td></tr></tbody></table>`),
    },
    {
      name: "TABLE#13: Should remove singleton p in td.",
      direction: Direction.toData,
      comment: "This is the behavior of CoreMedia RichText with CKEditor 4.",
      data: wrapContent(`<table><tbody><tr><td/></tr></tbody></table>`),
      dataView: wrapContent(`<table><tbody><tr><td><p/></td></tr></tbody></table>`),
    },
    {
      name: "TABLE#14: Should remove singleton p in td if it only contains br.",
      direction: Direction.toData,
      comment: "This is the behavior of CoreMedia RichText with CKEditor 4.",
      data: wrapContent(`<table><tbody><tr><td/></tr></tbody></table>`),
      dataView: wrapContent(`<table><tbody><tr><td><p><br/></p></td></tr></tbody></table>`),
    },
    {
      name: "TABLE#15: Should not remove singleton p in td if it contains text.",
      data: wrapContent(`<table><tbody><tr><td><p>${text}</p></td></tr></tbody></table>`),
      dataView: wrapContent(`<table><tbody><tr><td><p>${text}</p></td></tr></tbody></table>`),
    },
    {
      name: "TABLE#16: th should be transformed to td with class and continue with normal tds.",
      data: wrapContent(
        `<table><tbody><tr><td class="td--header">Head</td></tr><tr><td>Data</td></tr></tbody></table>`
      ),
      dataView: wrapContent(`<table><tbody><tr><th>Head</th></tr><tr><td>Data</td></tr></tbody></table>`),
    },
    {
      name: "TABLE#17: tfoot should be transformed and merged to tbody.",
      comment: "tfoot in CKEditor 5 24.x is not supported in view and will be merged to tbody.",
      data: wrapContent(`<table><tbody><tr class="tr--footer"><td class="td--header">Foot</td></tr></tbody></table>`),
      dataView: wrapContent(`<table><tfoot><tr><th>Foot</th></tr></tfoot></table>`),
    },
    {
      name: "TABLE#18: Multiple tbodies should be merged into first.",
      direction: Direction.toData,
      comment:
        "HTML may provide multiple tbodies, CoreMedia RichText may only have one. Design decision: Only keep attributes of first tbody.",
      data: wrapContent(`<table><tbody class="body1"><tr><td>Body 1</td></tr><tr><td>Body 2</td></tr></tbody></table>`),
      dataView: wrapContent(
        `<table><tbody class="body1"><tr><td>Body 1</td></tr></tbody><tbody class="body2"><tr><td>Body 2</td></tr></tbody></table>`
      ),
    },
  ];

  allDataProcessingTests(data);
});
