// noinspection HttpUrlsUsage
const CM_RICHTEXT = "http://www.coremedia.com/2003/richtext-1.0";
const XLINK = "http://www.w3.org/1999/xlink";
const SOME_TARGET = "somewhere";
const EVIL_TARGET = `<iframe src="javascript:alert('Boo 👻')" width="1px" height="1px">`;
const EXAMPLE_URL = "https://example.org/";
/**
 * This represents a Blob-URL as it would be provided from CMS Studio Server.
 * It will be stored in CKEditor Data View as `data-xlink-href` while the
 * `src` attribute will be updated to refer the Blob URL, so that the image
 * can be displayed.
 * @type {string}
 */
const INLINE_IMG = "content/42#properties.data";
const LINK_TEXT = "Link";
const UNSET = "—";
const parser = new DOMParser();
const serializer = new XMLSerializer();
const xmlDocument = parser.parseFromString(`<div xmlns="${CM_RICHTEXT}" xmlns:xlink="${XLINK}"></div>`, "text/xml");
const tableHeader = (...headers) => `<tr class="tr--header">${headers.map((h) => `<td class="td--header">${h}</td>`).join("")}</tr>`;
const htmlCode = (code) => `<pre><span class="language-html code">${code}</span></pre>`;
const richText = (plain) => {
  if (!plain) {
    return `<div xmlns="${CM_RICHTEXT}"/>`
  }
  const hasXLink = plain.indexOf("xlink:") >= 0;
  return `<div xmlns="${CM_RICHTEXT}"${hasXLink ? ` xmlns:xlink="${XLINK}"`: ""}>${plain}</div>`
};
const h = (level, text) => `<p class="p--heading-${level}">${text}</p>`;
const h1 = (text) => h(1, text);
const h2 = (text) => h(2, text);
const em = (str) => `<em>${str}</em>`;


function createLink(show, role, href = EXAMPLE_URL) {
  const a = xmlDocument.createElement("a");
  a.textContent = LINK_TEXT;
  a.setAttribute("xlink:href", href);
  show && a.setAttribute("xlink:show", show);
  role && a.setAttribute("xlink:role", role);
  return serializer.serializeToString(a);
}

/**
 * Escapes the given string for display in HTML.
 * @param str
 * @returns {string}
 */
function escape(str) {
  if (!str) {
    return str;
  }

  const el = xmlDocument.createElement("span");
  el.textContent = str;
  // noinspection InnerHTMLJS
  return el.innerHTML;
}

function decode(str) {
  if (!str) {
    return str;
  }

  // We need to parse HTML entities here, thus using HTML document.
  let el = document.createElement("span");
  // noinspection InnerHTMLJS
  el.innerHTML = str;
  return el.textContent;
}

function truncate(str, maxLength) {
  if (!!str && str.length > maxLength) {
    return `${str.substring(0, maxLength)}${decode("&hellip;")}`;
  }
  return str;
}

function renderUiEditorValue(uiEditorValue) {
  if (uiEditorValue === "") {
    return `${em("empty")}`;
  }
  return uiEditorValue || UNSET;
}

function createLinkTableHeading() {
  return tableHeader("xlink:show", "xlink:role", "target", "Active Button", "Editor Value", "Link", "Comment");
}

function createLinkTableRow({comment, show, role, target, uiActiveButton, uiEditorValue}) {
  const shorten = (str) => escape(truncate(str, 15));
  return `<tr>
    <td>${shorten(show) || UNSET}</td>
    <td>${shorten(role) || UNSET}</td>
    <td>${shorten(target) || UNSET}</td>
    <td>${uiActiveButton || UNSET}</td>
    <td>${renderUiEditorValue(shorten(uiEditorValue))}</td>
    <td>${createLink(show, role, EXAMPLE_URL)}</td>
    <td>${comment || ""}</td>
  </tr>`;
}

function createLinkScenario(title, scenarios) {
  const scenarioTitle = h1(title);
  const scenarioHeader = createLinkTableHeading();
  const scenarioRows = scenarios.map(createLinkTableRow).join("");
  return `${scenarioTitle}<table>${scenarioHeader}${scenarioRows}</table>`;
}

function createContentLinkTableHeading() {
  return tableHeader("Link", "Comment");
}

function createContentLinkTableRow({comment, id}) {
  return `<tr><td>${createLink("", "", "content:" + id)}</td><td>${comment || ""}</td></tr>`;
}

function createContentLinkScenario(title, scenarios) {
  const scenarioTitle = h1(title);
  const scenarioHeader = createContentLinkTableHeading();
  const scenarioRows = scenarios.map(createContentLinkTableRow).join("");
  return `${scenarioTitle}<table>${scenarioHeader}${scenarioRows}</table>`;
}

function externalLinkTargetExamples() {
  return linkTargetExamples();
}

function contentLinkExamples() {
  const standardScenarios = [
    {
      comment: "Root Folder",
      id: 1,
    },
    {
      comment: "Folder 1",
      id: 10001,
    },
    {
      comment: "Folder 2",
      id: 11003,
    },
    {
      comment: "Document 1",
      id: 10000,
    },
    {
      comment: "Document 2",
      id: 11002,
    },
  ];
  const nameChangeScenarios = [
    {
      comment: "Folder (changing names)",
      id: 12001,
    },
    {
      comment: "Document (changing names)",
      id: 12000,
    },
  ];
  const unreadableScenarios = [
    {
      comment: "Folder 1 (unreadable)",
      id: 10101,
    },
    {
      comment: "Folder 2 (unreadable/readable toggle)",
      id: 11201,
    },
    {
      comment: "Document 1 (unreadable)",
      id: 10100,
    },
    {
      comment: "Document 2 (unreadable/readable toggle)",
      id: 11202,
    },
  ];
  const stateScenarios = [
    {
      comment: "Document 1 (checked-in)",
      id: 10010,
    },
    {
      comment: "Document 2 (checked-out)",
      id: 11002,
    },
    {
      comment: "Document (being edited; toggles checked-out/-in)",
      id: 10026,
    },
  ];
  const xssScenarios = [
    {
      comment: "Document 1",
      id: 6660000,
    },
    {
      comment: "Document 2",
      id: 6661002,
    },
    {
      comment: "Document (toggling name)",
      id: 6662006,
    },
  ];
  const slowScenarios = [
    {
      comment: "Slow Document 1",
      id: 4080000,
    },
    {
      comment: "Slow Document 2",
      id: 4081002,
    },
  ];
  const scenarios = [
    createContentLinkScenario("Standard Links", standardScenarios),
    createContentLinkScenario("Name Change Scenarios", nameChangeScenarios),
    createContentLinkScenario("Unreadable Scenarios", unreadableScenarios),
    createContentLinkScenario("Content State Scenarios", stateScenarios),
    createContentLinkScenario("XSS Scenarios", xssScenarios),
    createContentLinkScenario("Slow Loading Scenarios", slowScenarios),
  ].join("");
  // noinspection XmlUnusedNamespaceDeclaration
  return `<div xmlns="${CM_RICHTEXT}" xmlns:xlink="${XLINK}">${scenarios}</div>`;
}

function linkTargetExamples() {
  const LONG_TARGET = lorem(100);

  /**
   * The mapping we agreed upon for `xlink:show` to some target value.
   * `other` is skipped here, as it is used for special meaning, which is,
   * that the `xlink:show` is ignored but `xlink:role` will take over representing
   * the `target` attribute.
   */
  const show = {
    /**
     * Open in new tab. Nothing to argue about.
     */
    new: "_blank",
    /**
     * May be either `_top` or `_self`. In CoreMedia CAE context we decided to
     * map `replace` to `_self` as this is, what is documented for example
     * at MDN.
     */
    replace: "_self",
    /**
     * Artificial mapping, we require, as there is no such `target` to represent
     * embedding links.
     */
    embed: "_embed",
    /**
     * Artificial mapping, we require, as there is no such `target` to represent
     * explicitly unspecified link behavior.
     */
    none: "_none",
  };
  const standardScenarios = [
    {
      comment: `default for having no target set; if triggered, will change target value to _self`,
      show: null,
      role: null,
      target: null,
      uiActiveButton: "Open in Current Tab",
      uiEditorValue: null,
    },
    {
      show: "new",
      role: null,
      target: show.new,
      uiActiveButton: "Open in New Tab",
      uiEditorValue: null,
    },
    {
      show: "replace",
      role: null,
      target: show.replace,
      uiActiveButton: "Open in Current Tab",
      uiEditorValue: null,
    },
    {
      comment: "artificial reserved word for 'target'.",
      show: "embed",
      role: null,
      target: show.embed,
      uiActiveButton: "Show Embedded",
      uiEditorValue: null,
    },
    {
      comment: `artificial state, as a 'role' would have been expected; on ${em("Save")} the empty editor value will trigger the deletion of target attribute value`,
      show: "other",
      role: null,
      target: "_other",
      uiActiveButton: "Open in Frame",
      uiEditorValue: "",
    },
    {
      comment: "artificial reserved word for 'target' to reflect this XLink-state",
      show: "none",
      role: null,
      target: show.none,
      uiActiveButton: "Open in Frame",
      uiEditorValue: show.none,
    },
    {
      comment: "Open in Frame; normal state for a named target.",
      show: "other",
      role: SOME_TARGET,
      target: SOME_TARGET,
      uiActiveButton: "Open in Frame",
      uiEditorValue: SOME_TARGET,
    },
    {
      comment: "Open in Frame; UI challenge with long target value",
      show: "other",
      role: LONG_TARGET,
      target: LONG_TARGET,
      uiActiveButton: "Open in Frame",
      uiEditorValue: LONG_TARGET,
    },
    {
      comment: "Open in Frame; UI cross-site-scripting challenge",
      show: "other",
      role: EVIL_TARGET,
      target: EVIL_TARGET,
      uiActiveButton: "Open in Frame",
      uiEditorValue: EVIL_TARGET,
    },
  ];
  const artificialRichTextScenarios = [
    {
      comment: "artificial state, where a role misses an expected show attribute",
      show: null,
      role: SOME_TARGET,
      target: `_role_${SOME_TARGET}`,
      uiActiveButton: "Open in Frame",
      uiEditorValue: `_role_${SOME_TARGET}`,
    },
    {
      comment: "artificial state with unexpected role attribute",
      show: "new",
      role: SOME_TARGET,
      target: `${show.new}_${SOME_TARGET}`,
      uiActiveButton: "Open in Frame",
      uiEditorValue: `${show.new}_${SOME_TARGET}`,
    },
    {
      comment: "artificial state with unexpected role attribute",
      show: "replace",
      role: SOME_TARGET,
      target: `${show.replace}_${SOME_TARGET}`,
      uiActiveButton: "Open in Frame",
      uiEditorValue: `${show.replace}_${SOME_TARGET}`,
    },
    {
      comment: "artificial state with unexpected role attribute",
      show: "embed",
      role: SOME_TARGET,
      target: `${show.embed}_${SOME_TARGET}`,
      uiActiveButton: "Open in Frame",
      uiEditorValue: `${show.embed}_${SOME_TARGET}`,
    },
    {
      comment: "artificial state with unexpected role attribute",
      show: "none",
      role: SOME_TARGET,
      target: `${show.none}_${SOME_TARGET}`,
      uiActiveButton: "Open in Frame",
      uiEditorValue: `${show.none}_${SOME_TARGET}`,
    },
  ];
  const reservedTargetScenarios = [
    {
      show: "replace",
      role: null,
      target: show.replace,
      uiActiveButton: "Open in Current Tab",
      uiEditorValue: null,
    },
    {
      show: "new",
      role: null,
      target: show.new,
      uiActiveButton: "Open in New Tab",
      uiEditorValue: null,
    },
    {
      comment: "artificial regarding xlink-attributes",
      show: "other",
      role: "_parent",
      target: "_parent",
      uiActiveButton: "Open in Frame",
      uiEditorValue: "_parent",
    },
    {
      comment: "artificial regarding xlink-attributes",
      show: "other",
      role: "_top",
      target: "_top",
      uiActiveButton: "Open in Frame",
      uiEditorValue: "_top",
    },
  ];
  let cornerCaseScenarios;
  cornerCaseScenarios = [
    {
      comment: "trying to misuse reserved word _role; handled as any custom target",
      show: "other",
      role: "_role",
      target: "_role",
      uiActiveButton: "Open in Frame",
      uiEditorValue: "_role",
    },
    {
      comment: "trying to misuse reserved word _role; handled as any custom target",
      show: "other",
      role: "_role_",
      target: "_role_",
      uiActiveButton: "Open in Frame",
      uiEditorValue: "_role_",
    },
    {
      comment: `trying to misuse artificial handling of ${show.new}_[role] with empty role; handled as any custom target`,
      show: "other",
      role: `${show.new}_`,
      target: `${show.new}_`,
      uiActiveButton: "Open in Frame",
      uiEditorValue: `${show.new}_`,
    },
    {
      comment: `trying to misuse artificial handling of ${show.replace}_[role] with empty role; handled as any custom target`,
      show: "other",
      role: `${show.replace}_`,
      target: `${show.replace}_`,
      uiActiveButton: "Open in Frame",
      uiEditorValue: `${show.replace}_`,
    },
    {
      comment: `trying to misuse artificial handling of ${show.embed}_[role] with empty role; handled as any custom target`,
      show: "other",
      role: `${show.embed}_`,
      target: `${show.embed}_`,
      uiActiveButton: "Open in Frame",
      uiEditorValue: `${show.embed}_`,
    },
    {
      comment: `trying to misuse artificial handling of ${show.none}_[role] with empty role; handled as any custom target`,
      show: "other",
      role: `${show.none}_`,
      target: `${show.none}_`,
      uiActiveButton: "Open in Frame",
      uiEditorValue: `${show.none}_`,
    },
  ];
  const scenarios = [
    createLinkScenario("Standard Links", standardScenarios),
    createLinkScenario("Artificial Richtext Scenarios", artificialRichTextScenarios),
    createLinkScenario("Reserved Target Scenarios", reservedTargetScenarios),
    createLinkScenario("Corner Case Scenarios", cornerCaseScenarios),
  ].join("");
  // noinspection XmlUnusedNamespaceDeclaration
  return `<div xmlns="${CM_RICHTEXT}" xmlns:xlink="${XLINK}">${scenarios}</div>`;
}

// Source: https://loremipsum.de/
const LOREM_IPSUM_RAW = `
Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore
magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd
gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.
Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore
magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd
gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.
Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore
magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd
gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Duis autem vel eum iriure dolor in hendrerit in
vulputate velit esse molestie consequat, vel illum dolore eu feugiat nulla facilisis at vero eros et accumsan et iusto
odio dignissim qui blandit praesent luptatum zzril delenit augue duis dolore te feugait nulla facilisi.
Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore
magna aliquam erat volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl
ut aliquip ex ea commodo consequat. Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie
consequat, vel illum dolore eu feugiat nulla facilisis at vero eros et accumsan et iusto odio dignissim qui blandit
praesent luptatum zzril delenit augue duis dolore te feugait nulla facilisi. Nam liber tempor cum soluta nobis eleifend
option congue nihil imperdiet doming id quod mazim placerat facer possim assum.
Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore
magna aliquam erat volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl
ut aliquip ex ea commodo consequat. Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie
consequat, vel illum dolore eu feugiat nulla facilisis. At vero eos et accusam et justo duo dolores et ea rebum. Stet
clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.
Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore
magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd
gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.
Lorem ipsum dolor sit amet, consetetur sadipscing elitr, At accusam aliquyam diam diam dolore dolores duo eirmod eos
erat, et nonumy sed tempor et et invidunt justo labore Stet clita ea et gubergren, kasd magna no rebum. sanctus sea sed
takimata ut vero voluptua. est Lorem ipsum dolor sit amet.
Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore
magna aliquyam erat. Consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna
aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no
sea takimata sanctus est Lorem ipsum dolor sit amet.
Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore
magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd
gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.
Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore
magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd
gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.`;
const LOREM_IPSUM_WORDS = LOREM_IPSUM_RAW.trim().split(/\s+/);
const chunks = (arr, chunkSize) => {
  let result = [];
  for (let i = 0; i < arr.length; i += chunkSize) {
    result.push(arr.slice(i, i + chunkSize));
  }
  return result;
};
const lorem = (words, paragraphs) => {
  let allWords = [];
  while (allWords.length < words) {
    const missingWords = words - allWords.length;
    allWords = allWords.concat(LOREM_IPSUM_WORDS.slice(0, missingWords));
  }
  if (!paragraphs) {
    // No paragraph, just plain text. Replace possible punctuation at the end with a dot.
    return allWords.join(" ").replace(/\W$/, ".");
  }
  const wordsPerParagraph = Math.ceil(words / paragraphs);
  const asParagraphs = chunks(allWords, wordsPerParagraph);
  const paragraph = (w) => {
    const paragraphText = w.join(" ")
      .trim()
      // Start each paragraph with upper case.
      .replace(/^\w/, c => c.toUpperCase())
      // End each paragraph with a dot, possibly replacing any non-alphabetic character.
      .replace(/\W?$/, ".")
    ;
    return `<p>${paragraphText}</p>`;
  };
  const htmlParagraphs = `${asParagraphs.map((w) => paragraph(w)).join("")}`;
  return richText(htmlParagraphs);
};

/**
 * Provides several examples of valid CoreMedia RichText which should be able
 * to be represented within CKEditor View, as well as it should be stored without
 * changes back to data.
 */
const coreMediaRichTextPoC = () => {
  const titleHeading = "p--heading-1";
  const mainSectionHeading = "p--heading-2";
  const subSectionHeading = "p--heading-3";
  const someAlt = "alternative text";
  const someClass = "class--some";
  const someContent = lorem(8);
  const someDir = "rtl";
  const someInlineImg = INLINE_IMG;
  const someLanguage = "en-US";
  const someUrl = EXAMPLE_URL;
  const introduction = () => `
    ${h1("CoreMedia RichText 1.0 Examples")}
    <p>
      CKEditor 5 must provide support for all valid elements, attributes and nested structures,
      which represent valid CoreMedia RichText 1.0.
    </p><p>
      The following examples provide an overview and test-fixture for valid
      CoreMedia RichText 1.0 structures, which must be supported.
    </p>
    <p>
      <strong>Note on Images:</strong>
      The data-images used in this example will not work within CoreMedia CMS.
      Thus, for testing the generated RichText within CoreMedia CMS, we recommend
      removing the image-based test-data first.
    </p>
  `;
  const inlineWithAttrs = (el) => {
    const nestedEl = (nested) => `<p><strong>Nested Element ${nested}:</strong> Before<${el}>Lorem<${nested}>ipsum</${nested}>dolor</${el}>After</p>`;
    return `
    <p class="${mainSectionHeading}">Element: ${el}</p>
    <p class="${subSectionHeading}">Attributes</p>
    <p><strong>No Attributes:</strong> Before<${el}>Within</${el}>After</p>
    <p><strong>Attribute xml:lang:</strong> Before<${el} xml:lang="${someLanguage}">Within</${el}>After</p>
    <p><strong>Attribute lang:</strong> Before<${el} lang="${someLanguage}">Within</${el}>After</p>
    <p><strong>Attribute dir:</strong> Before<${el} dir="${someDir}">Within</${el}>After</p>
    <p><strong>Attribute class:</strong> Before<${el} class="${someClass}">Within</${el}>After</p>
    <p class="${subSectionHeading}">Nesting</p>
    <p><strong>Only Text:</strong> Before<${el}>${el}</${el}>After</p>
    <p><strong>Nested Element a:</strong> Before<${el}><a xlink:href="${someUrl}">${el}</a></${el}>After</p>
    <p><strong>Nested Element br:</strong> Before<${el}>Lorem<br/>ipsum<br/>dolor</${el}>After</p>
    <p><strong>Nested Element span:</strong> Before<${el}>Lorem<span class="${someClass}">ipsum</span>dolor</${el}>After</p>
    <p><strong>Nested Element img:</strong> Before<${el}>Lorem<img xlink:href="${someInlineImg}" alt="${someAlt}"/>dolor</${el}>After</p>
    ${["em", "strong", "sub", "sup"].map(nestedEl).join("")}
    `;
  };
  const br = () => {
    const el = "br";
    return `
      <p class="${mainSectionHeading}">Element: ${el}</p>
      <p class="${subSectionHeading}">Attributes</p>
      <p><strong>No Attributes:</strong> Lorem<${el}/>ipsum<${el}/>dolor</p>
      <p><strong>Attribute class:</strong> Lorem<${el} class="${someClass}"/>ipsum<${el} class="${someClass}"/>dolor</p>
    `;
  };
  const span = () => {
    const el = "span";
    const nestedEl = (nested) => `<p><strong>Nested Element ${nested}:</strong> Before<${el} class="${someClass}">Lorem<${nested}>ipsum</${nested}>dolor</${el}>After</p>`;
    return `
    <p class="${mainSectionHeading}">Element: ${el}</p>
    <p class="${subSectionHeading}">Attributes</p>
    <p><strong>No Attributes:</strong> Before<${el}>Within</${el}>After<br/>Note, that a ${el} without attributes is considered pointless and thus, may be ignored during processing.</p>
    <p><strong>Attribute xml:lang:</strong> Before<${el} xml:lang="${someLanguage}" class="${someClass}">Within</${el}>After</p>
    <p><strong>Attribute lang:</strong> Before<${el} lang="${someLanguage}" class="${someClass}">Within</${el}>After</p>
    <p><strong>Attribute dir:</strong> Before<${el} dir="${someDir}" class="${someClass}">Within</${el}>After</p>
    <p><strong>Attribute class:</strong> Before<${el} class="${someClass}">Within</${el}>After</p>
    <p class="${subSectionHeading}">Nesting</p>
    <p><strong>Only Text:</strong> Before<${el} class="${someClass}">${el}</${el}>After</p>
    <p><strong>Nested Element a:</strong> Before<${el} class="${someClass}"><a xlink:href="${someUrl}">${el}</a></${el}>After</p>
    <p><strong>Nested Element br:</strong> Before<${el} class="${someClass}">Lorem<br/>ipsum<br/>dolor</${el}>After</p>
    <p><strong>Nested Element span:</strong> Before<${el} class="${someClass}">Lorem<span class="nested">ipsum</span>dolor</${el}>After</p>
    <p><strong>Nested Element img:</strong> Before<${el} class="${someClass}">Lorem<img xlink:href="${someInlineImg}" alt="${someAlt}"/>dolor</${el}>After</p>
    ${["em", "strong", "sub", "sup"].map(nestedEl).join("")}
    `;
  };
  const a = () => {
    const el = "a";
    const nestedEl = (nested) => `<p><strong>Nested Element ${nested}:</strong> Before<${el} xlink:href="${someUrl}">Lorem<${nested}>ipsum</${nested}>dolor</${el}>After</p>`;
    return `
    <p class="${mainSectionHeading}">Element: ${el}</p>
    <p class="${subSectionHeading}">Attributes</p>
    <p><strong>No Attributes:</strong> Before<${el} xlink:href="${someUrl}">Within</${el}>After</p>
    <p><strong>Attribute xml:lang:</strong> Before<${el} xlink:href="${someUrl}" xml:lang="${someLanguage}">Within</${el}>After</p>
    <p><strong>Attribute lang:</strong> Before<${el} xlink:href="${someUrl}" lang="${someLanguage}">Within</${el}>After</p>
    <p><strong>Attribute dir:</strong> Before<${el} xlink:href="${someUrl}" dir="${someDir}">Within</${el}>After</p>
    <p><strong>Attribute class:</strong> Before<${el} xlink:href="${someUrl}" class="${someClass}">Within</${el}>After</p>
    <p><strong>Attribute xlink:type:</strong> Before<${el} xlink:href="${someUrl}" xlink:type="simple">Within</${el}>After<br/>xlink:type is a fixed attribute and may be removed during processing.</p>
    <p><strong>Attribute xlink:role:</strong> Before<${el} xlink:href="${someUrl}" xlink:role="someRole">Within</${el}>After</p>
    <p><strong>Attribute xlink:title:</strong> Before<${el} xlink:href="${someUrl}" xlink:title="Some Title">Within</${el}>After</p>
    <p><strong>Attribute xlink:show:</strong> Before<${el} xlink:href="${someUrl}" xlink:show="new">Within</${el}>After</p>
    <p><strong>Attribute xlink:actuate:</strong> Before<${el} xlink:href="${someUrl}" xlink:actuate="onLoad">Within</${el}>After</p>
    <p class="${subSectionHeading}">Nesting</p>
    <p><strong>Only Text:</strong> Before<${el} xlink:href="${someUrl}">${el}</${el}>After</p>
    <p><strong>Nested Element br:</strong> Before<${el} xlink:href="${someUrl}">Lorem<br/>ipsum<br/>dolor</${el}>After</p>
    <p><strong>Nested Element span:</strong> Before<${el} xlink:href="${someUrl}">Lorem<span class="${someClass}">ipsum</span>dolor</${el}>After</p>
    <p><strong>Nested Element img:</strong> Before<${el} xlink:href="${someUrl}"><img xlink:href="${someInlineImg}" alt="${someAlt}"/></${el}>After</p>
    ${["em", "strong", "sub", "sup"].map(nestedEl).join("")}
    `;
  };
  const pre = () => {
    const el = "pre";
    const nestedEl = (nested) => `<p><strong>Nested Element ${nested}:</strong></p><${el}>Lorem<${nested}>ipsum</${nested}>ipsum</${el}><br/>`;
    return `
    <p class="${mainSectionHeading}">Element: ${el}</p>
    <p class="${subSectionHeading}">Attributes</p>
    <p><strong>No Attributes:</strong></p><${el}>${someContent}</${el}><br/>
    <p><strong>Attribute xml:lang:</strong></p><${el} xml:lang="${someLanguage}">${someContent}</${el}><br/>
    <p><strong>Attribute lang:</strong></p><${el} lang="${someLanguage}">${someContent}</${el}><br/>
    <p><strong>Attribute dir:</strong></p><${el} dir="${someDir}">${someContent}</${el}><br/>
    <p><strong>Attribute class:</strong></p><${el} class="${someClass}">${someContent}</${el}><br/>
    <p><strong>Attribute xml:space</strong></p><${el} xml:space="preserve">${someContent}</${el}><p>xlink:preserve is a fixed attribute and may be removed during processing.</p><br/>
    <p class="${subSectionHeading}">Nesting</p>
    <p><strong>Only Text:</strong></p><${el}>${someContent}</${el}><br/>
    <p><strong>Nested Element br:</strong></p><${el}>Lorem<br/>ipsum<br/>dolor</${el}><br/>
    <p><strong>Nested Element a:</strong></p><${el}>Lorem<a xlink:href="${someUrl}">ipsum</a>dolor</${el}><br/>
    <p><strong>Nested Element span:</strong></p><${el}>Lorem<span class="${someClass}">ipsum</span>dolor</${el}><br/>
    ${["em", "strong", "sub", "sup"].map(nestedEl).join("")}
    `;
  };
  const lists = () => {
    const list = (el) => {
      const nestedInline = (nested) => `<p><strong>Nested Element ${nested}:</strong></p><${el}><li>Lorem<${nested}>ipsum</${nested}>ipsum</li><li><${nested}>Plain ${nested}</${nested}></li></${el}><br/>`;
      return `
        <p class="${mainSectionHeading}">Element: ${el}</p>
        <p class="${subSectionHeading}">Attributes</p>
        <p><strong>No Attributes:</strong></p><${el}><li>${someContent}</li></${el}><br/>
        <p><strong>Attribute xml:lang:</strong></p><${el} xml:lang="${someLanguage}"><li>${someContent}</li></${el}><br/>
        <p><strong>Attribute lang:</strong></p><${el} lang="${someLanguage}"><li>${someContent}</li></${el}><br/>
        <p><strong>Attribute dir:</strong></p><${el} dir="${someDir}"><li>${someContent}</li></${el}><br/>
        <p><strong>Attribute class:</strong></p><${el} class="${someClass}"><li>${someContent}</li></${el}><br/>
        <p class="${subSectionHeading}">Nested LI Attributes</p>
        <p><strong>No Attributes:</strong></p><${el}><li>${someContent}</li></${el}><br/>
        <p><strong>Attribute xml:lang:</strong></p><${el}><li xml:lang="${someLanguage}">${someContent}</li></${el}><br/>
        <p><strong>Attribute lang:</strong></p><${el}><li lang="${someLanguage}">${someContent}</li></${el}><br/>
        <p><strong>Attribute dir:</strong></p><${el}><li dir="${someDir}">${someContent}</li></${el}><br/>
        <p><strong>Attribute class:</strong></p><${el}><li class="${someClass}">${someContent}</li></${el}><br/>
        <p class="${subSectionHeading}">Nested LI Elements</p>
        <p><strong>Only Text:</strong></p><${el}><li>${someContent}</li></${el}><br/>
        <p><strong>Nested Element br:</strong></p><${el}><li>Lorem<br/>ipsum<br/>dolor</li></${el}><br/>
        <p><strong>Nested Element a:</strong></p><${el}><li>Lorem<a xlink:href="${someUrl}">ipsum</a>dolor</li></${el}><br/>
        <p><strong>Nested Element span:</strong></p><${el}><li>Lorem<span class="${someClass}">ipsum</span>dolor</li></${el}><br/>
        ${["em", "strong", "sub", "sup"].map(nestedInline).join("")}
        <p><strong>Nested Element p:</strong></p><${el}><li>Lorem<p>ipsum</p>dolor</li><li><p>${someContent}</p></li></${el}><br/>
        <p><strong>Nested Element ul:</strong></p><${el}><li>Nested inline: Lorem<ul><li>ipsum</li></ul>dolor</li><li><p>Nested Blocks:</p><ul><li>${someContent}</li></ul></li></${el}><br/>
        <p><strong>Nested Element ol:</strong></p><${el}><li>Nested inline: Lorem<ol><li>ipsum</li></ol>dolor</li><li><p>Nested Blocks:</p><ol><li>${someContent}</li></ol></li></${el}><br/>
        <p><strong>Nested Element pre:</strong></p><${el}><li>Lorem<pre>ipsum</pre>dolor</li><li><pre>${someContent}</pre></li></${el}><br/>
        <p><strong>Nested Element blockquote:</strong></p><${el}><li>Lorem<blockquote>ipsum</blockquote>dolor</li><li><blockquote>${someContent}</blockquote></li></${el}><br/>
        <p><strong>Nested Element table:</strong></p><${el}><li>Lorem<table><tr><td>ipsum</td></tr></table>dolor</li><li><table><tr><td>${someContent}</td></tr></table></li></${el}><br/>
    `;
    };
    return ["ul", "ol"].map(list).join("");
  };
  const blockquote = () => {
    const el = "blockquote";
    return `
    <p class="${mainSectionHeading}">Element: ${el}</p>
    <p class="${subSectionHeading}">Attributes</p>
    <p><strong>No Attributes:</strong></p><${el}><p>${someContent}</p></${el}><br/>
    <p><strong>Attribute xml:lang:</strong></p><${el} xml:lang="${someLanguage}"><p>${someContent}</p></${el}><br/>
    <p><strong>Attribute lang:</strong></p><${el} lang="${someLanguage}"><p>${someContent}</p></${el}><br/>
    <p><strong>Attribute dir:</strong></p><${el} dir="${someDir}"><p>${someContent}</p></${el}><br/>
    <p><strong>Attribute class:</strong></p><${el} class="${someClass}"><p>${someContent}</p></${el}><br/>
    <p><strong>Attribute cite:</strong></p><${el} cite="https://example.org/"><p>${someContent}</p></${el}><br/>
    <p class="${subSectionHeading}">Nesting</p>
    <p><strong>Nested Element p:</strong></p><${el}><p>${someContent}</p></${el}><br/>
    <p><strong>Nested Element ul:</strong></p><${el}><ul><li>${someContent}</li></ul></${el}><br/>
    <p><strong>Nested Element ol:</strong></p><${el}><ol><li>${someContent}</li></ol></${el}><br/>
    <p><strong>Nested Element pre:</strong></p><${el}><pre>${someContent}</pre></${el}><br/>
    <p><strong>Nested Element blockquote:</strong></p><${el}><p>Before</p><blockquote>${someContent}</blockquote><p>After</p></${el}><br/>
    <p><strong>Nested Element table:</strong></p><${el}><p>Before</p><table><tr><td>${someContent}</td></tr></table><p>After</p></${el}><br/>
    `;
  };
  const scenarios = [
    ...["p", "em", "strong", "sub", "sup"].map(inlineWithAttrs),
    span(),
    br(),
    a(),
    pre(),
    blockquote(),
    lists(),
    // TODO[cke] Tables
    // TODO[cke] Images
  ].join("").split("\n").map((l) => l.trim()).join("");
  return `<div xmlns="${CM_RICHTEXT}" xmlns:xlink="${XLINK}">${introduction()}${scenarios}</div>`;
};

const grsExampleData = () => {
  const grsName = "General RichText Support";
  const langNote = "'xml:lang' is always mapped to 'lang'. If both are set, 'lang' takes precedence.";
  const alignedNote = "Alignment must be represented by classes. As such, it must not collide with other classes.";
  const plainText = "Plain";
  const allAttributesText = "All Attributes";
  const langText = "Lang Precedence";
  const alignedText = "Aligned";
  const grsHeading = (title) => h1(`${grsName}: ${title}`);
  const examplesHeading = h2("Examples");
  const listSeparator = `<p>Separator: CKEditor merges lists directly following each other. Thus, separate.</p>`;

  /**
   * Example data for General RichText Support (based on CKEditor's General
   * HTML Support). Only the existence of elements and attributes is important
   * for these scenarios, not the structure, as this is not covered by GHS/GRS.
   */
  return {
    // <a> – Anchor
    "GRS Anchor": `<div xmlns="${CM_RICHTEXT}" xmlns:xlink="${XLINK}">
  ${grsHeading("Anchor")}
  <p>&lt;a&gt; element: plain and with all supported attributes.</p>
  <p>${langNote}</p>
  ${examplesHeading}
  <p>Lorem<a xlink:href="${EXAMPLE_URL}">${plainText}</a>Ipsum</p>
  <p>Lorem<a xlink:href="${EXAMPLE_URL}" xml:lang="en" dir="ltr" xlink:show="other" xlink:role="some_target" xlink:title="Some Title" xlink:actuate="onLoad" xlink:type="simple" class="grs xmp">${allAttributesText}</a>Ipsum</p>
  <p>Lorem<a xlink:href="${EXAMPLE_URL}" xml:lang="de" lang="en">${langText}</a>Ipsum</p>
  </div>`,
    // <blockquote> – Blockquote
    "GRS Blockquote": `<div xmlns="${CM_RICHTEXT}">
  ${grsHeading("Blockquote")}
  <p>&lt;blockquote&gt; element: plain and with all supported attributes.</p>
  <p>${langNote}</p>
  ${examplesHeading}
  <blockquote>${plainText}</blockquote>
  <blockquote xml:lang="en" cite="${EXAMPLE_URL}" dir="ltr" class="grs xmp">${allAttributesText}</blockquote>
  <blockquote xml:lang="de" lang="en">${langText}</blockquote>
  </div>`,
    // <span> – Content Span
    "GRS Content Span": `<div xmlns="${CM_RICHTEXT}">
  ${grsHeading("Content Span")}
  <p>&lt;span&gt; element: plain and with all supported attributes.</p>
  <p>${langNote}</p>
  ${examplesHeading}
  <p>Lorem<span>${plainText}</span>Ipsum</p>
  <p>Lorem<span xml:lang="en" dir="ltr" class="grs xmp">${allAttributesText}</span>Ipsum</p>
  <p>Lorem<span xml:lang="de" lang="en">${langText}</span>Ipsum</p>
  </div>`,
    // <em> – Emphasis
    "GRS Emphasis": `<div xmlns="${CM_RICHTEXT}">
  ${grsHeading("Emphasis")}
  <p>&lt;em&gt; element: plain and with all supported attributes.</p>
  <p>${langNote}</p>
  ${examplesHeading}
  <p>Lorem<em>${plainText}</em>Ipsum</p>
  <p>Lorem<em xml:lang="en" dir="ltr" class="grs xmp">${allAttributesText}</em>Ipsum</p>
  <p>Lorem<em xml:lang="de" lang="en">${langText}</em>Ipsum</p>
  </div>`,
    // <h1> – Heading
    "GRS Heading": `<div xmlns="${CM_RICHTEXT}">
  ${grsHeading("Heading")}
  <p>&lt;h1&gt; to &lt;h6&gt; elemens: plain and with all supported attributes.</p>
  <p>&lt;h1&gt; is represented in CoreMedia RichText as &lt;p class="p--heading-1"&gt; and thus, shares the same attributes as &lt;p&gt;.</p>
  <p>${langNote}</p>
  <p>${alignedNote}</p>
  ${examplesHeading}
  <p class="p--heading-3">${plainText}</p>
  <p xml:lang="en" dir="ltr" class="p--heading-3 grs xmp">${allAttributesText}</p>
  <p xml:lang="de" lang="en" class="p--heading-3">${langText}</p>
  <p class="p--heading-3 grs xmp align--center">${alignedText}</p>
  </div>`,
    // <img> – Image
    "GRS Image": `<div xmlns="${CM_RICHTEXT}" xmlns:xlink="${XLINK}">
  ${grsHeading("Image")}
  <p>&lt;img&gt; element: plain and with all supported attributes.</p>
  <p>${langNote}</p>
  ${examplesHeading}
  <p><img alt="Some Alternative" xlink:href="${INLINE_IMG}" xlink:title="${plainText}"/></p>
  <p><img alt="Some Alternative" xlink:href="${INLINE_IMG}" xml:lang="en" height="48" width="48" dir="ltr" xlink:show="embed" xlink:title="${allAttributesText}" xlink:actuate="onLoad" xlink:type="simple" class="grs xmp" xlink:role="${EXAMPLE_URL}"/></p>
  <p><img alt="Some Alternative" xlink:href="${INLINE_IMG}" xlink:title="${langText}" xml:lang="de" lang="en"/></p>
  </div>`,
    // <code> – Inline Code
    "GRS Inline Code": `<div xmlns="${CM_RICHTEXT}">
  ${grsHeading("Inline Code")}
  <p>&lt;code&gt; element: plain and with all supported attributes.</p>
  <p>&lt;code&gt; is represented in CoreMedia RichText as &lt;span class="code"&gt; and thus, shares the same attributes as &lt;span&gt;.</p>
  <p>${langNote}</p>
  ${examplesHeading}
  <p>Lorem<span class="code">${plainText}</span>Ipsum</p>
  <p>Lorem<span xml:lang="en" dir="ltr" class="grs xmp code">${allAttributesText}</span>Ipsum</p>
  <p>Lorem<span class="code" xml:lang="de" lang="en">${langText}</span>Ipsum</p>
  </div>`,
    // <li> – List Item
    "GRS List Item": `<div xmlns="${CM_RICHTEXT}">
  ${grsHeading("List Item")}
  <p>&lt;li&gt; element: plain and with all supported attributes.</p>
  <p>${langNote}</p>
  ${examplesHeading}
  <ul>
  <li>${plainText}</li>
  <li xml:lang="en" dir="ltr" class="grs xmp">${allAttributesText}</li>
  <li xml:lang="de" lang="en">${langText}</li>
  </ul>
  </div>`,
    // <ul> – Ordered List
    "GRS Ordered List": `<div xmlns="${CM_RICHTEXT}" xmlns:xlink="${XLINK}">
  ${grsHeading("Ordered List")}
  <p>&lt;ol&gt; element: plain and with all supported attributes.</p>
  <p>${langNote}</p>
  ${examplesHeading}
  <ol><li>${plainText}</li></ol>
  ${listSeparator}
  <ol xml:lang="en" dir="ltr" class="grs xmp"><li>${allAttributesText}</li><li>Second Entry</li></ol>
  ${listSeparator}
  <ol xml:lang="de" lang="en"><li>${langText}</li><li>Second Entry</li></ol>
  ${listSeparator}
  <ol xml:lang="en" dir="ltr" class="grs xmp"><li xml:lang="de" dir="rtl" class="grs xmp1">Colliding ol/li attributes</li><li xml:lang="de" dir="rtl" class="grs xmp1">Second Entry</li></ol>
  <p class="p--heading-2">Known Issue</p>
  <p>Problems with list-handling is a known issue: <a xlink:href="https://github.com/ckeditor/ckeditor5/issues/9917">ckeditor/ckeditor5#9917</a>.</p>
  </div>`,
    // <p> – Paragraph
    "GRS Paragraph": `<div xmlns="${CM_RICHTEXT}">
  ${grsHeading("Paragraph")}
  <p>&lt;p&gt; element: plain and with all supported attributes.</p>
  <p>${langNote}</p>
  <p>${alignedNote}</p>
  ${examplesHeading}
  <p>${plainText}</p>
  <p xml:lang="en" dir="ltr" class="grs xmp">${allAttributesText}</p>
  <p xml:lang="de" lang="en">${langText}</p>
  <p class="grs xmp align--center">${alignedText}</p>
  </div>`,
    // <pre> – Preformatted Text
    "GRS Preformatted Text": `<div xmlns="${CM_RICHTEXT}">
  ${grsHeading("Preformatted Text")}
  <p>&lt;pre&gt; element: plain and with all supported attributes.</p>
  <p>${langNote}</p>
  ${examplesHeading}
  <pre><span class="language-plaintext code">${plainText}</span></pre>
  <pre xml:lang="en" xml:space="preserve" dir="ltr" class="grs xmp"><span class="language-plaintext code">${allAttributesText}</span></pre>
  <pre xml:lang="de" lang="en"><span class="language-plaintext code">${langText}</span></pre>
  </div>`,
    // <br> – Soft Break
    "GRS Soft Break": `<div xmlns="${CM_RICHTEXT}">
  ${grsHeading("Soft Break")}
  <p>&lt;br&gt; element: plain and with all supported attributes.</p>
  ${examplesHeading}
  <p>Lorem Ipsum<br/>${plainText}</p>
  <p>Lorem Ipsum<br class="grs xmp"/>${allAttributesText}</p>
  </div>`,
    // <s> – Strikethrough
    "GRS Strikethrough": `<div xmlns="${CM_RICHTEXT}">
  ${grsHeading("Strikethrough")}
  <p>&lt;s&gt; element: plain and with all supported attributes.</p>
  <p>&lt;s&gt; is represented in CoreMedia RichText as &lt;span class="strike"&gt; and thus, shares the same attributes as &lt;span&gt;.</p>
  <p>${langNote}</p>
  ${examplesHeading}
  <p>Lorem<span class="strike">${plainText}</span>Ipsum</p>
  <p>Lorem<span xml:lang="en" dir="ltr" class="grs xmp strike">${allAttributesText}</span>Ipsum</p>
  <p>Lorem<span class="strike" xml:lang="de" lang="en">${langText}</span>Ipsum</p>
  </div>`,
    // <strong> – Strong
    "GRS Strong": `<div xmlns="${CM_RICHTEXT}">
  ${grsHeading("Subscript")}
  <p>&lt;strong&gt; element: plain and with all supported attributes.</p>
  <p>${langNote}</p>
  ${examplesHeading}
  <p>Lorem<strong>${plainText}</strong>Ipsum</p>
  <p>Lorem<strong xml:lang="en" dir="ltr" class="grs xmp">${allAttributesText}</strong>Ipsum</p>
  <p>Lorem<strong xml:lang="de" lang="en">${langText}</strong>Ipsum</p>
  </div>`,
    // <sub> – Subscript
    "GRS Subscript": `<div xmlns="${CM_RICHTEXT}">
  ${grsHeading("Subscript")}
  <p>&lt;sub&gt; element: plain and with all supported attributes.</p>
  <p>${langNote}</p>
  ${examplesHeading}
  <p>Lorem<sub>${plainText}</sub>Ipsum</p>
  <p>Lorem<sub xml:lang="en" dir="ltr" class="grs xmp">${allAttributesText}</sub>Ipsum</p>
  <p>Lorem<sub xml:lang="de" lang="en">${langText}</sub>Ipsum</p>
  </div>`,
    // <sup> – Superscript
    "GRS Superscript": `<div xmlns="${CM_RICHTEXT}">
  ${grsHeading("Superscript")}
  <p>&lt;sup&gt; element: plain and with all supported attributes.</p>
  <p>${langNote}</p>
  ${examplesHeading}
  <p>Lorem<sup>${plainText}</sup>Ipsum</p>
  <p>Lorem<sup xml:lang="en" dir="ltr" class="grs xmp">${allAttributesText}</sup>Ipsum</p>
  <p>Lorem<sup xml:lang="de" lang="en">${langText}</sup>Ipsum</p>
  </div>`,
    // <table> – Table
    "GRS Table": `<div xmlns="${CM_RICHTEXT}">
  ${grsHeading("Table")}
  <p>&lt;table&gt; element: plain and with all supported attributes.</p>
  <p>${langNote}</p>
  ${examplesHeading}
  <table><tr><td>${plainText}</td></tr></table>
  <table xml:lang="en" dir="ltr" class="grs xmp" summary="Some Summary"><tr><td>${allAttributesText}</td></tr></table>
  <table xml:lang="de" lang="en"><tr><td>${langText}</td></tr></table>
  </div>`,
    // <tbody> – Table Body
    "GRS Table Body": `<div xmlns="${CM_RICHTEXT}">
  ${grsHeading("Table Body")}
  <p>&lt;tbody&gt; element: plain and with all supported attributes.</p>
  <p>${langNote}</p>
  ${examplesHeading}
  <table><tbody><tr><td>${plainText}</td></tr></tbody></table>
  <table><tbody xml:lang="en" dir="ltr" align="right" valign="bottom" class="grs xmp"><tr><td>${allAttributesText}</td></tr></tbody></table>
  <table><tbody xml:lang="de" lang="en"><tr><td>${langText}</td></tr></tbody></table>
  </div>`,
    // <td> – Table Data
    "GRS Table Data": `<div xmlns="${CM_RICHTEXT}">
  ${grsHeading("Table Data")}
  <p>&lt;td&gt; element: plain and with all supported attributes.</p>
  <p>${langNote}</p>
  ${examplesHeading}
  <table><tr><td>${plainText}</td></tr></table>
  <table><tr><td abbr="Some Abbreviation" xml:lang="en" dir="ltr" align="right" valign="bottom" class="grs xmp">${allAttributesText} (no col/rowspan)</td></tr></table>
  <table><tr><td xml:lang="de" lang="en">${langText}</td></tr></table>
  <table><tr><td>Lorem</td><td>Ipsum</td></tr><tr><td colspan="2">colspan=2</td></tr></table>
  <table><tr><td>Lorem</td><td rowspan="2">rowspan=2</td></tr><tr><td>Ipsum</td></tr></table>
  </div>`,
    // <thead> – Table Head
    "GRS Table Head": `<div xmlns="${CM_RICHTEXT}">
  ${grsHeading("Table Head")}
  <p>&lt;thead&gt; element: plain and with all supported attributes.</p>
  <p>&lt;thead&gt; is represented in CoreMedia RichText as &lt;tr class="tr--header"&gt; and thus, shares the same attributes as &lt;tr&gt;.</p>
  <p>${langNote}</p>
  ${examplesHeading}
  <table><tr class="tr--header"><td class="td--header">${plainText}</td></tr></table>
  <table><tr xml:lang="en" dir="ltr" align="right" valign="bottom" class="grs xmp tr--header"><td class="td--header">${allAttributesText}</td></tr></table>
  <table><tr class="tr--header" xml:lang="de" lang="en"><td class="td--header">${langText}</td></tr></table>
  </div>`,
    // <th> – Table Header
    "GRS Table Header": `<div xmlns="${CM_RICHTEXT}">
  ${grsHeading("Table Header")}
  <p>&lt;th&gt; element: plain and with all supported attributes.</p>
  <p>&lt;th&gt; is represented in CoreMedia RichText as &lt;td class="td--header"&gt; and thus, shares the same attributes as &lt;td&gt;.</p>
  <p>${langNote}</p>
  ${examplesHeading}
  <table><tr class="tr--header"><td class="td--header">${plainText}</td></tr></table>
  <table><tr class="tr--header"><td abbr="Some Abbreviation" xml:lang="en" dir="ltr" align="right" valign="bottom" class="grs xmp td--header">${allAttributesText} (no col/rowspan)</td></tr></table>
  <table><tr class="tr--header"><td class="td--header" xml:lang="de" lang="en">${langText}</td></tr></table>
  <table><tr class="tr--header"><td class="td--header" colspan="2">colspan=2</td></tr><tr><td>Lorem</td><td>Ipsum</td></tr></table>
  <table><tr class="tr--header"><td class="td--header">Lorem</td><td class="td--header" rowspan="2">rowspan=2</td></tr><tr><td>Ipsum</td></tr></table>
  </div>`,
    // <tr> – Table Row
    "GRS Table Row": `<div xmlns="${CM_RICHTEXT}">
  ${grsHeading("Table Row")}
  <p>&lt;tr&gt; element: plain and with all supported attributes.</p>
  <p>${langNote}</p>
  ${examplesHeading}
  <table><tr><td>${plainText}</td></tr></table>
  <table><tr xml:lang="en" dir="ltr" align="right" valign="bottom" class="grs xmp"><td>${allAttributesText}</td></tr></table>
  <table><tr xml:lang="de" lang="en"><td>${langText}</td></tr></table>
  </div>`,
    // <u> – Underline
    "GRS Underline": `<div xmlns="${CM_RICHTEXT}">
  ${grsHeading("Underline")}
  <p>&lt;u&gt; element: plain and with all supported attributes.</p>
  <p>&lt;u&gt; is represented in CoreMedia RichText as &lt;span class="underline"&gt; and thus, shares the same attributes as &lt;span&gt;.</p>
  <p>${langNote}</p>
  ${examplesHeading}
  <p>Lorem<span class="underline">${plainText}</span>Ipsum</p>
  <p>Lorem<span xml:lang="en" dir="ltr" class="grs xmp underline">${allAttributesText}</span>Ipsum</p>
  <p>Lorem<span class="underline" xml:lang="de" lang="en">${langText}</span>Ipsum</p>
  </div>`,
    // <ul> – Unordered List
    "GRS Unordered List": `<div xmlns="${CM_RICHTEXT}" xmlns:xlink="${XLINK}">
  ${grsHeading("Unordered List")}
  <p>&lt;ul&gt; element: plain and with all supported attributes.</p>
  <p>${langNote}</p>
  ${examplesHeading}
  <ul><li>${plainText}</li></ul>
  ${listSeparator}
  <ul xml:lang="en" dir="ltr" class="grs xmp"><li>${allAttributesText}</li><li>Second Entry</li></ul>
  ${listSeparator}
  <ul xml:lang="de" lang="en"><li>${langText}</li><li>Second Entry</li></ul>
  ${listSeparator}
  <ul xml:lang="en" dir="ltr" class="grs xmp"><li xml:lang="de" dir="rtl" class="grs xmp1">Colliding ol/li attributes</li><li xml:lang="de" dir="rtl" class="grs xmp1">Second Entry</li></ul>
  <p class="p--heading-2">Known Issue</p>
  <p>Problems with list-handling is a known issue: <a xlink:href="https://github.com/ckeditor/ckeditor5/issues/9917">ckeditor/ckeditor5#9917</a>.</p>
  </div>`,
  };
};

/**
 * These are all CoreMedia RichText Entities known to CoreMedia RichText 1.0
 * DTD.
 * @type {string[]}
 */
const coreMediaRichTextEntities = [
  "&AElig;",
  "&Aacute;",
  "&Acirc;",
  "&Agrave;",
  "&Alpha;",
  "&Aring;",
  "&Atilde;",
  "&Auml;",
  "&Beta;",
  "&Ccedil;",
  "&Chi;",
  "&Dagger;",
  "&Delta;",
  "&ETH;",
  "&Eacute;",
  "&Ecirc;",
  "&Egrave;",
  "&Epsilon;",
  "&Eta;",
  "&Euml;",
  "&Gamma;",
  "&Iacute;",
  "&Icirc;",
  "&Igrave;",
  "&Iota;",
  "&Iuml;",
  "&Kappa;",
  "&Lambda;",
  "&Mu;",
  "&Ntilde;",
  "&Nu;",
  "&OElig;",
  "&Oacute;",
  "&Ocirc;",
  "&Ograve;",
  "&Omega;",
  "&Omicron;",
  "&Oslash;",
  "&Otilde;",
  "&Ouml;",
  "&Phi;",
  "&Pi;",
  "&Prime;",
  "&Psi;",
  "&Rho;",
  "&Scaron;",
  "&Sigma;",
  "&THORN;",
  "&Tau;",
  "&Theta;",
  "&Uacute;",
  "&Ucirc;",
  "&Ugrave;",
  "&Upsilon;",
  "&Uuml;",
  "&Xi;",
  "&Yacute;",
  "&Yuml;",
  "&Zeta;",
  "&aacute;",
  "&acirc;",
  "&acute;",
  "&aelig;",
  "&agrave;",
  "&alefsym;",
  "&alpha;",
  "&amp;",
  "&and;",
  "&ang;",
  "&apos;",
  "&aring;",
  "&asymp;",
  "&atilde;",
  "&auml;",
  "&bdquo;",
  "&beta;",
  "&brvbar;",
  "&bull;",
  "&cap;",
  "&ccedil;",
  "&cedil;",
  "&cent;",
  "&chi;",
  "&circ;",
  "&clubs;",
  "&cong;",
  "&copy;",
  "&crarr;",
  "&cup;",
  "&curren;",
  "&dArr;",
  "&dagger;",
  "&darr;",
  "&deg;",
  "&delta;",
  "&diams;",
  "&divide;",
  "&eacute;",
  "&ecirc;",
  "&egrave;",
  "&empty;",
  "&emsp;",
  "&ensp;",
  "&epsilon;",
  "&equiv;",
  "&eta;",
  "&eth;",
  "&euml;",
  "&euro;",
  "&exist;",
  "&fnof;",
  "&forall;",
  "&frac12;",
  "&frac14;",
  "&frac34;",
  "&frasl;",
  "&gamma;",
  "&ge;",
  "&gt;",
  "&hArr;",
  "&harr;",
  "&hearts;",
  "&hellip;",
  "&iacute;",
  "&icirc;",
  "&iexcl;",
  "&igrave;",
  "&image;",
  "&infin;",
  "&int;",
  "&iota;",
  "&iquest;",
  "&isin;",
  "&iuml;",
  "&kappa;",
  "&lArr;",
  "&lambda;",
  "&lang;",
  "&laquo;",
  "&larr;",
  "&lceil;",
  "&ldquo;",
  "&le;",
  "&lfloor;",
  "&lowast;",
  "&loz;",
  "&lrm;",
  "&lsaquo;",
  "&lsquo;",
  "&lt;",
  "&macr;",
  "&mdash;",
  "&micro;",
  "&middot;",
  "&minus;",
  "&mu;",
  "&nabla;",
  "&nbsp;",
  "&ndash;",
  "&ne;",
  "&ni;",
  "&not;",
  "&notin;",
  "&nsub;",
  "&ntilde;",
  "&nu;",
  "&oacute;",
  "&ocirc;",
  "&oelig;",
  "&ograve;",
  "&oline;",
  "&omega;",
  "&omicron;",
  "&oplus;",
  "&or;",
  "&ordf;",
  "&ordm;",
  "&oslash;",
  "&otilde;",
  "&otimes;",
  "&ouml;",
  "&para;",
  "&part;",
  "&permil;",
  "&perp;",
  "&phi;",
  "&pi;",
  "&piv;",
  "&plusmn;",
  "&pound;",
  "&prime;",
  "&prod;",
  "&prop;",
  "&psi;",
  "&quot;",
  "&rArr;",
  "&radic;",
  "&rang;",
  "&raquo;",
  "&rarr;",
  "&rceil;",
  "&rdquo;",
  "&real;",
  "&reg;",
  "&rfloor;",
  "&rho;",
  "&rlm;",
  "&rsaquo;",
  "&rsquo;",
  "&sbquo;",
  "&scaron;",
  "&sdot;",
  "&sect;",
  "&shy;",
  "&sigma;",
  "&sigmaf;",
  "&sim;",
  "&spades;",
  "&sub;",
  "&sube;",
  "&sum;",
  "&sup1;",
  "&sup2;",
  "&sup3;",
  "&sup;",
  "&supe;",
  "&szlig;",
  "&tau;",
  "&there4;",
  "&theta;",
  "&thetasym;",
  "&thinsp;",
  "&thorn;",
  "&tilde;",
  "&times;",
  "&trade;",
  "&uArr;",
  "&uacute;",
  "&uarr;",
  "&ucirc;",
  "&ugrave;",
  "&uml;",
  "&upsih;",
  "&upsilon;",
  "&uuml;",
  "&weierp;",
  "&xi;",
  "&yacute;",
  "&yen;",
  "&yuml;",
  "&zeta;",
  "&zwj;",
  "&zwnj;",
];
const entitiesTableRow = (entity) => `<tr><td>${htmlCode(entity.replace("&", "&amp;"))}</td><td>${entity}</td></tr>`;
/**
 * These are the default entities, allowed or required in XML.
 * These entities were affected by CoreMedia/ckeditor-plugins#39.
 * @type {string[]}
 */
const xmlEntities = ["&amp;", "&lt;", "&gt;", "&quot;", "&apos;"].sort();
const xmlEntityRows = xmlEntities.map(entitiesTableRow).join("");
const richTextEntityRows = coreMediaRichTextEntities.map(entitiesTableRow).join("");
const entitiesDescription = `<p>
  The following entities must be supported when they are part of a
  CoreMedia RichText&nbsp;1.0 document. While <em>XML Entities</em> lists
  the default entities, which come with XML (and where not all of them must be
  resolved to their characters in processing), <em>CoreMedia RichText&nbsp;1.0 Entities</em>
  are those, which are declared by CoreMedia RichText&nbsp;1.0 DTD.
</p><p>
  The behavior for all entities, despite some XML entities like
  <span class="code">&amp;lt;</span>, is, that when written back to server, these
  entities are resolved to their corresponding UTF-8 characters.
</p>`;
const entitiesExample = richText(`${h1("Entities")}${entitiesDescription}${h2("XML Entities")}<table>${tableHeader("Entity", "Character")}${xmlEntityRows}</table>${h2("CoreMedia RichText&nbsp;1.0 Entities")}<table>${tableHeader("Entity", "Character")}${richTextEntityRows}</table>`);

const exampleData = {
  "Content Links": contentLinkExamples(),
  "CoreMedia RichText": coreMediaRichTextPoC(),
  "Empty": richText(),
  "Entities": entitiesExample,
  ...grsExampleData(),
  "Hello": richText(`<p>Hello World!</p>`),
  "Links (Targets)": externalLinkTargetExamples(),
  "Lorem": lorem(LOREM_IPSUM_WORDS.length, 10),
  "Lorem (Huge)": lorem(LOREM_IPSUM_WORDS.length * 10, 80),
  // TODO[cke] The following must be addressed prior to reaching MVP for CKEditor 5 Plugins for CoreMedia CMS
  "Lists Bug": richText(`<p>
  The following example shows a symptom of
  <a xlink:href="https://github.com/ckeditor/ckeditor5/issues/2973">ckeditor/ckeditor5#2973</a>,
  which is, that more complex lists are not supported yet — a known issue since
  2017. If we cannot find a workaround, we will not be able editing valid
  CoreMedia RichText 1.0 (and HTML) lists within CKEditor 5.
  </p>
  <ul><li>Lorem</li><li><p>Ipsum</p></li><li>Dolor</li></ul>`),
};

const setExampleData = (editor, exampleKey) => {
  try {
    // noinspection InnerHTMLJS
    editor.editing.view.once("render", (event) => console.log("CKEditor's Editing-Controller rendered data.", {
      source: event.source,
      innerHtml: event.source.getDomRoot().innerHTML,
    }), {
      priority: "lowest",
    });
    editor.data.once("set", (event, details) => console.log("CKEditor's Data-Controller received data via 'set'.", {
      event: event,
      data: details[0],
    }), {
      priority: "lowest",
    });

    const data = exampleData[exampleKey];
    console.log("Setting Example Data.", {data: data});
    editor.setData(data);
  } catch (e) {
    console.error(`Failed setting data for ${exampleKey}.`, e);
  }
};

const initExamples = (editor) => {
  const xmpInput = document.getElementById("xmp-input");
  const xmpData = document.getElementById("xmp-data");
  const reloadBtn = document.getElementById("xmp-reload");

  if (!(xmpInput && xmpData && reloadBtn)) {
    throw new Error("Required components for Example-Data Loading missing.");
  }

  // Clear input on focus (otherwise, only matched option is shown)
  xmpInput.addEventListener("focus", () => {
    xmpInput.value = "";
  });
  // On change, set the data - or show an error, if data are unknown.
  xmpInput.addEventListener("change", () => {
    const newValue = xmpInput.value;
    if (exampleData.hasOwnProperty(newValue)) {
      xmpInput.classList.remove("error");
      setExampleData(editor, newValue);
      xmpInput.blur();
    } else {
      xmpInput.classList.add("error");
      xmpInput.select();
    }
  });
  // Init the reload-button, to also listen to the value of example input field.
  reloadBtn.addEventListener("click", () => {
    const newValue = xmpInput.value;
    if (exampleData.hasOwnProperty(newValue)) {
      xmpInput.classList.remove("error");
      setExampleData(editor, newValue);
      xmpInput.blur();
    }
  });

  // Now add all examples
  for (let exampleKey in exampleData) {
    const option = document.createElement("option");
    // noinspection InnerHTMLJS
    option.innerHTML = exampleKey;
    option.value = exampleKey;
    xmpData?.appendChild(option);
  }
};

export {
  initExamples,
}
