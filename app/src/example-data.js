// noinspection HttpUrlsUsage
const CM_RICHTEXT = "http://www.coremedia.com/2003/richtext-1.0";
const XLINK = "http://www.w3.org/1999/xlink";
const SOME_TARGET = "somewhere";
const EVIL_TARGET = `<iframe src="javascript:alert('Boo 👻')" width="1px" height="1px">`;
const EXAMPLE_URL = "https://example.org/";
const LINK_TEXT = "Link";
const UNSET = "—";
const parser = new DOMParser();
const serializer = new XMLSerializer();
const xmlDocument = parser.parseFromString(`<div xmlns="${CM_RICHTEXT}" xmlns:xlink="${XLINK}"></div>`, "text/xml");

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

function em(str) {
  return `<em>${str}</em>`;
}

function createLinkTableHeading() {
  return `<tr class="tr--header"><td class="td--header">xlink:show</td><td class="td--header">xlink:role</td><td class="td--header">target</td><td class="td--header">Active Button</td><td class="td--header">Editor Value</td><td class="td--header">Link</td><td class="td--header">Comment</td></tr>`;
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
  const scenarioTitle = `<h1>${title}</h1>`;
  const scenarioHeader = createLinkTableHeading();
  const scenarioRows = scenarios.map(createLinkTableRow).join("");
  return `${scenarioTitle}<table>${scenarioHeader}${scenarioRows}</table>`;
}

function createContentLinkTableHeading() {
  return `<tr class="tr--header"><td class="td--header">Link</td><td class="td--header">Comment</td></tr>`;
}

function createContentLinkTableRow({comment, id}) {
  return `<tr><td>${createLink("", "", "content:" + id)}</td><td>${comment || ""}</td></tr>`;
}

function createContentLinkScenario(title, scenarios) {
  const scenarioTitle = `<h1>${title}</h1>`;
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
  return `<div xmlns="${CM_RICHTEXT}">${htmlParagraphs}</div>`;
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
  const someInlineImg = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFUlEQVR42mP8z8AARIQB46hC+ioEAGX8E/cKr6qsAAAAAElFTkSuQmCC";
  const someLanguage = "en-US";
  const someUrl = "https://example.org/";
  const introduction = () => `
    <p class="${titleHeading}">CoreMedia RichText 1.0 Examples</p>
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

const exampleData = {
  "Hello": `<div xmlns="${CM_RICHTEXT}"><p>Hello World!</p></div>`,
  "Empty": `<div xmlns="${CM_RICHTEXT}"/>`,
  "Lorem": lorem(LOREM_IPSUM_WORDS.length, 10),
  "Lorem (Huge)": lorem(LOREM_IPSUM_WORDS.length * 10, 80),
  "Links (Targets)": externalLinkTargetExamples(),
  "Content Links": contentLinkExamples(),
  "CoreMedia RichText": coreMediaRichTextPoC(),
  // TODO[cke] The following must be addressed prior to reaching MVP for CKEditor 5 Plugins for CoreMedia CMS
  "Lists Bug": `<div xmlns="${CM_RICHTEXT}" xmlns:xlink="${XLINK}">
  <p>
  The following example shows a symptom of
  <a xlink:href="https://github.com/ckeditor/ckeditor5/issues/2973">ckeditor/ckeditor5#2973</a>,
  which is, that more complex lists are not supported yet — a known issue since
  2017. If we cannot find a workaround, we will not be able editing valid
  CoreMedia RichText 1.0 (and HTML) lists within CKEditor 5.
  </p>
  <ul><li>Lorem</li><li><p>Ipsum</p></li><li>Dolor</li></ul>
  </div>`,
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
