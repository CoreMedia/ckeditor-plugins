import { ExampleData } from "../ExampleData";
import {
  a,
  blockquote,
  br,
  code,
  CoreAttributes,
  DefaultBlock,
  DefaultInline,
  em,
  h1,
  h2,
  h3,
  h4,
  h5,
  h6,
  img,
  InternationalizationAttributions,
  li,
  List,
  ol,
  p,
  pre,
  richtext,
  span,
  strong,
  sub,
  sup,
  table,
  TableDataAttributes,
  tbody,
  td,
  tr,
  ul,
} from "../RichText";

const exampleUrl = "https://example.org/";

/**
 * This represents a Blob-URL as it would be provided from CMS Studio Server.
 * It will be stored in CKEditor Data View as `data-xlink-href` while the
 * `src` attribute will be updated to refer the Blob URL, so that the image
 * can be displayed.
 */
const INLINE_IMG = "content/900#properties.data";

const grs = "General RichText Support";

const title = (topic: string): string => h1(`${grs}: ${topic}`);

const introduction = `${p(`\
${grs} (GRS) ensures that any CoreMedia RichText 1.0 Data loaded from server \
are kept unmodified, even if required plugins such as inline styling, images, \
etc. have not been installed. This is one of the examples for any data being \
retained.\
`)}\
${p(`\
${strong("Note, that GRS examples are twofold:")} \
If features are covered by installed plugins, it shows, that these plugins \
work as expected. If features are not covered by corresponding plugins, it \
shows, that GRS works. For a fully-fledged GRS test you need to disable all \
but the essential CoreMedia Plugins.\
`)}
`;

const examplesTitle = (elementName: string): string => h2(`Examples for Element ${code(`&lt;${elementName}&gt;`)}`);

const grsIntro = (topic: string, elementName: string): string =>
  `${title(topic)}${introduction}${examplesTitle(elementName)}`;

const lang = {
  intro: `${h3("Lang Precedence")}${p(
    "'xml:lang' is always mapped to 'lang'. If both are set, 'xml:lang' takes precedence."
  )}`,
  text: "Lang Precedence",
  attr: { "xml:lang": "en" },
  conflicting: { "xml:lang": "de", "lang": "en" },
};

const allCoreAttributes: CoreAttributes = {
  class: "some--class",
};

const internationalizationAttributes: InternationalizationAttributions = {
  ...lang.attr,
  dir: "ltr",
};

const allAttributes = {
  ...allCoreAttributes,
  ...internationalizationAttributes,
};

const plainText = "Plain";
const allAttributesText = "All Attributes";

const anchors: ExampleData = {
  "GRS Anchors": richtext(`${grsIntro("Anchors", "a")}\
  ${p(`Lorem ${a(plainText, { "xlink:href": exampleUrl })} ipsum`)}\
  ${p(
    `Lorem ${a(allAttributesText, {
      "xlink:href": exampleUrl,
      "xlink:actuate": "onLoad",
      "xlink:show": "other",
      "xlink:role": "someTarget",
      "xlink:title": "Some Title",
      "xlink:type": "simple",
      ...allAttributes,
    })} ipsum`
  )}\
  ${lang.intro}\
  ${p(`Lorem ${a(lang.text, { "xlink:href": exampleUrl, ...lang.conflicting })} ipsum`)}\
`),
};

const blockquotes: ExampleData = {
  "GRS Blockquotes": richtext(`${grsIntro("Blockquotes", "blockquote")}\
  ${blockquote(plainText)}\
  ${blockquote(allAttributesText, { ...allAttributes, cite: "https://example.org/cite" })} \
  ${lang.intro}\
  ${blockquote(lang.text, lang.conflicting)}\
`),
};

const defaultInline = (topic: string, elementName: string, inline: DefaultInline): ExampleData => {
  const key = `GRS ${topic}`;
  const text = richtext(`${grsIntro(topic, elementName)}\
  ${p(`Lorem ${inline(plainText)} ipsum`)}\
  ${p(`Lorem ${inline(allAttributesText, allAttributes)} ipsum`)}\
  ${lang.intro}
  ${p(`Lorem ${inline(lang.text, lang.conflicting)} ipsum`)}\
  `);
  return {
    [key]: text,
  };
};

const defaultInlines: ExampleData = {
  ...defaultInline("Spans", "span", span),
  ...defaultInline("Emphasis", "em", em),
  ...defaultInline("Strong", "strong", strong),
  ...defaultInline("Subset", "sub", sub),
  ...defaultInline("Superset", "sup", sup),
};

const defaultBlock = (topic: string, elementName: string, block: DefaultBlock): ExampleData => {
  const key = `GRS ${topic}`;
  const text = richtext(`${grsIntro(topic, elementName)}\
  ${block(plainText)}\
  ${block(allAttributesText, allAttributes)}\
  ${lang.intro}
  ${block(lang.text, lang.conflicting)}\
  `);
  return {
    [key]: text,
  };
};

const defaultBlocks: ExampleData = {
  ...defaultBlock("Paragraph", "p", p),
  ...defaultBlock("Heading 1", "h1", h1),
  ...defaultBlock("Heading 2", "h2", h2),
  ...defaultBlock("Heading 3", "h3", h3),
  ...defaultBlock("Heading 4", "h4", h4),
  ...defaultBlock("Heading 5", "h5", h5),
  ...defaultBlock("Heading 6", "h6", h6),
};

const listBlock = (topic: string, elementName: string, list: List): ExampleData => {
  const key = `GRS ${topic}`;
  const text = richtext(`${grsIntro(topic, elementName)}\
  ${list(li(plainText))}\
  ${p(
    `${strong("Separator")} CKEditor's List feature requires to \
    separate independent lists. They are merged, otherwise.`
  )}
  ${list(li(allAttributesText), allAttributes)}\
  ${lang.intro}
  ${list(li(lang.text), lang.conflicting)}\
  `);
  return {
    [key]: text,
  };
};

const listBlocks: ExampleData = {
  ...listBlock("Ordered List", "ol", ol),
  ...listBlock("Unordered List", "ul", ul),
};

const listItems: ExampleData = {
  "GRS List Items": richtext(`${grsIntro("List Items", "li")}\
  ${ul(`${li("Lorem")}${li(plainText)}${li("ipsum")}`)}\
  ${ol(`${li("Lorem")}${li(allAttributesText, allAttributes)}${li("ipsum")}`)}\
  ${lang.intro}
  ${ul(`${li("Lorem")}${li(lang.text, lang.conflicting)}${li("ipsum")}`)}\
  `),
};

const preItems: ExampleData = {
  "GRS Preformatted": richtext(`${grsIntro("Preformatted", "pre")}\
  ${pre(plainText)}\
  ${pre(allAttributesText, { ...allAttributes, "xml:space": "preserve" })}\
  ${lang.intro}
  ${pre(lang.text, lang.conflicting)}\
  `),
};

const brItem: ExampleData = {
  "GRS Soft-Break": richtext(`${grsIntro("Soft-Break", "br")}\
  ${p(`Lorem${br()}${plainText}${br()}ipsum`)}\
  ${p(`Lorem${br(allCoreAttributes)}${allAttributesText}${br(allCoreAttributes)}ipsum`)}\
  `),
};

const imgItem: ExampleData = {
  "GRS Images": richtext(`${grsIntro("Images", "img")}\
  ${p(
    img({
      "xlink:href": INLINE_IMG,
      "alt": plainText,
    })
  )}\
  ${p(
    img({
      "xlink:href": INLINE_IMG,
      "alt": allAttributesText,
      ...allAttributes,
      "xlink:actuate": "onLoad",
      "xlink:role": "ROLE",
      "xlink:show": "embed",
      "xlink:title": allAttributesText,
      "xlink:type": "simple",
      "height": 48,
      "width": 48,
    })
  )}\
  ${lang.intro}\
  ${p(
    img({
      "xlink:href": INLINE_IMG,
      "alt": lang.text,
      ...lang.conflicting,
    })
  )}\
  `),
};

const tableItem: ExampleData = {
  "GRS Tables": richtext(`${grsIntro("Tables", "table")}\
  ${table(
    tbody(
      `\
    ${tr(`${td(plainText)}${td(plainText)}`)}\
    ${tr(`${td(plainText)}${td(plainText)}`)}\
    `
    )
  )}\
  ${table(
    tbody(
      `\
    ${tr(`${td(allAttributesText)}${td(allAttributesText)}`)}\
    ${tr(`${td(allAttributesText)}${td(allAttributesText)}`)}\
    `
    ),
    allAttributes
  )}\
  ${lang.intro}\
  ${table(
    tbody(
      `\
    ${tr(`${td(lang.text)}${td(lang.text)}`)}\
    ${tr(`${td(lang.text)}${td(lang.text)}`)}\
    `
    ),
    lang.conflicting
  )}\
  `),
};

const tbodyItem: ExampleData = {
  "GRS Table Bodies": richtext(`${grsIntro("Table Bodies", "tbody")}\
  ${table(
    tbody(
      `\
    ${tr(`${td(plainText)}${td(plainText)}`)}\
    ${tr(`${td(plainText)}${td(plainText)}`)}\
    `
    )
  )}\
  ${table(
    tbody(
      `\
    ${tr(`${td(allAttributesText)}${td(allAttributesText)}`)}\
    ${tr(`${td(allAttributesText)}${td(allAttributesText)}`)}\
    `,
      {
        ...allAttributes,
        align: "center",
        valign: "middle",
      }
    )
  )}\
  ${lang.intro}\
  ${table(
    tbody(
      `\
    ${tr(`${td(lang.text)}${td(lang.text)}`)}\
    ${tr(`${td(lang.text)}${td(lang.text)}`)}\
    `,
      lang.conflicting
    )
  )}\
  `),
};

const trItem: ExampleData = {
  "GRS Table Rows": richtext(`${grsIntro("Table Rows", "tr")}\
  ${table(
    tbody(
      `\
    ${tr(`${td(plainText)}${td(plainText)}`)}\
    ${tr(`${td(plainText)}${td(plainText)}`)}\
    ${tr(`${td(plainText)}${td(plainText)}`)}\
    `
    )
  )}\
  ${table(
    tbody(
      `\
    ${tr(`${td("Lorem")}${td("ipsum")}`)}\
    ${tr(`${td(allAttributesText)}${td(allAttributesText)}`, {
      ...allAttributes,
      valign: "middle",
      align: "center",
    })}\
    ${tr(`${td("dolor")}${td("sit")}`)}\
    `
    )
  )}\
  ${lang.intro}\
  ${table(
    tbody(
      `\
    ${tr(`${td("Lorem")}${td("ipsum")}`)}\
    ${tr(`${td(lang.text)}${td(lang.text)}`, lang.conflicting)}\
    ${tr(`${td("dolor")}${td("sit")}`)}\
    `
    )
  )}\
  `),
};

const tdAllAttributes: TableDataAttributes = {
  ...allAttributes,
  abbr: "ABBR",
};

const tdItem: ExampleData = {
  "GRS Table Data": richtext(`${grsIntro("Table Data", "td")}\
  ${table(
    tbody(
      `\
    ${tr(`${td(plainText)}${td(plainText)}`)}\
    ${tr(`${td(plainText)}${td(plainText)}`)}\
    ${tr(`${td(plainText)}${td(plainText)}`)}\
    `
    )
  )}\
  ${table(
    tbody(
      `\
    ${tr(`${td("Lorem")}${td(allAttributesText, { ...tdAllAttributes, rowspan: 2 })}`)}\
    ${tr(td("ipsum"))}\
    ${tr(td(allAttributesText, { ...tdAllAttributes, colspan: 2 }))}\
    `
    )
  )}\
  ${lang.intro}\
  ${table(
    tbody(
      `\
    ${tr(`${td("Lorem")}${td("ipsum")}`)}\
    ${tr(`${td(lang.text, lang.conflicting)}${td("dolor")}`)}\
    ${tr(`${td("sit")}${td("amet")}`)}\
    `
    )
  )}\
  `),
};

// noinspection JSUnusedGlobalSymbols Used in example data.
/**
 * Represents example data for general richtext support. All element and
 * attribute combinations supported by CoreMedia RichText 1.0 should be
 * forwarded to editing view.
 */
export const grsData: ExampleData = {
  ...anchors,
  ...blockquotes,
  ...defaultInlines,
  ...defaultBlocks,
  ...listBlocks,
  ...listItems,
  ...preItems,
  ...brItem,
  ...imgItem,
  ...tableItem,
  ...tbodyItem,
  ...trItem,
  ...tdItem,
};
