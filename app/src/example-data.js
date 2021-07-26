// noinspection HttpUrlsUsage
const CM_RICHTEXT = "http://www.coremedia.com/2003/richtext-1.0";
const XLINK = "http://www.w3.org/1999/xlink";
const SOME_TARGET = "somewhere";
const EXAMPLE_URL = "https://example.org/";
const LINK_TEXT = "Link";
const UNSET = "—";

function createLink(show, role, href = EXAMPLE_URL) {
  if (!show) {
    if (!role) {
      // noinspection HtmlUnknownAttribute
      return `<a xlink:href="${href}">${LINK_TEXT}</a>`
    }
    // noinspection HtmlUnknownAttribute
    return `<a xlink:href="${href}" xlink:role="${role}">${LINK_TEXT}</a>`
  }
  if (!role) {
    // noinspection HtmlUnknownAttribute
    return `<a xlink:href="${href}" xlink:show="${show}">${LINK_TEXT}</a>`
  }
  // noinspection HtmlUnknownAttribute
  return `<a xlink:href="${href}" xlink:show="${show}" xlink:role="${role}">${LINK_TEXT}</a>`
}

function renderUiTarget(uiTarget) {
  if (uiTarget === "") {
    return `<em>empty</em>`
  }
  return uiTarget || UNSET;
}

function createLinkTableHeading() {
  return `<tr class="tr--header"><td class="td--header">xlink:show</td><td class="td--header">xlink:role</td><td class="td--header">target</td><td class="td--header">UI Behavior</td><td class="td--header">UI Target</td><td class="td--header">Link</td><td class="td--header">Comment</td></tr>`;
}

function createLinkTableRow({comment, show, role, target, uiBehavior, uiTarget}) {
  return `<tr><td>${show || UNSET}</td><td>${role || UNSET}</td><td>${target || UNSET}</td><td>${uiBehavior || UNSET}</td><td>${renderUiTarget(uiTarget)}</td><td>${createLink(show, role, EXAMPLE_URL)}</td><td>${comment || ""}</td></tr>`;
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
      comment: "Folder 1",
      id: 10001,
    },
    {
      comment: "Folder 2",
      id: 11001,
    },
    {
      comment: "Document 1",
      id: 10000,
    },
    {
      comment: "Document 2",
      id: 11000,
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
      id: 11200,
    },
  ];
  const stateScenarios = [
    {
      comment: "Document 1 (checked-in)",
      id: 10010,
    },
    {
      comment: "Document 2 (checked-out)",
      id: 11000,
    },
    {
      comment: "Document (being edited; toggles checked-out/-in)",
      id: 10020,
    },
  ];
  const xssScenarios = [
    {
      comment: "Document 1",
      id: 6660000,
    },
    {
      comment: "Document 2",
      id: 6661000,
    },
    {
      comment: "Document (toggling name)",
      id: 6662000,
    },
  ];
  const scenarios = [
    createContentLinkScenario("Standard Links", standardScenarios),
    createContentLinkScenario("Name Change Scenarios", nameChangeScenarios),
    createContentLinkScenario("Unreadable Scenarios", unreadableScenarios),
    createContentLinkScenario("Content State Scenarios", stateScenarios),
    createContentLinkScenario("XSS Scenarios", xssScenarios),
  ].join("");
  // noinspection XmlUnusedNamespaceDeclaration
  return `<div xmlns="${CM_RICHTEXT}" xmlns:xlink="${XLINK}">${scenarios}</div>`;
}

function linkTargetExamples() {
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
      comment: "Only href, no target.",
      show: null,
      role: null,
      target: null,
      uiBehavior: "Open in Current Tab",
      uiTarget: null,
    },
    {
      show: "new",
      role: null,
      target: show.new,
      uiBehavior: "Open in New Tab",
      uiTarget: null,
    },
    {
      show: "replace",
      role: null,
      target: show.replace,
      uiBehavior: "Open in Current Tab",
      uiTarget: null,
    },
    {
      comment: "artificial reserved word for 'target'.",
      show: "embed",
      role: null,
      target: show.embed,
      uiBehavior: "Show Embedded",
      uiTarget: null,
    },
    {
      comment: "artificial state, as a 'role' would have been expected.",
      show: "other",
      role: null,
      target: "_other",
      uiBehavior: "Open in Frame",
      uiTarget: "",
    },
    {
      comment: "artificial reserved word for 'target' to reflect this XLink-state",
      show: "none",
      role: null,
      target: show.none,
      uiBehavior: "Open in Frame",
      uiTarget: show.none,
    },
    {
      comment: "Open in Frame; normal state for a named target.",
      show: "other",
      role: SOME_TARGET,
      target: SOME_TARGET,
      uiBehavior: "Open in Frame",
      uiTarget: "somewhere",
    },
  ];
  const artificialRichTextScenarios = [
    {
      comment: "artificial state, where a role misses an expected show attribute; repaired on save by adding xlink:show=other",
      show: null,
      role: SOME_TARGET,
      target: `_role_${SOME_TARGET}`,
      uiBehavior: "Open in Frame",
      uiTarget: SOME_TARGET,
    },
    {
      comment: "artificial state with unexpected role attribute; repaired on save by removing xlink:role",
      show: "new",
      role: SOME_TARGET,
      target: `${show.new}_${SOME_TARGET}`,
      uiBehavior: "Open in New Tab",
      uiTarget: null,
    },
    {
      comment: "artificial state with unexpected role attribute; repaired on save by removing xlink:role",
      show: "replace",
      role: SOME_TARGET,
      target: `${show.replace}_${SOME_TARGET}`,
      uiBehavior: "Open in Current Tab",
      uiTarget: null,
    },
    {
      comment: "artificial state with unexpected role attribute; repaired on save by removing xlink:role",
      show: "embed",
      role: SOME_TARGET,
      target: `${show.embed}_${SOME_TARGET}`,
      uiBehavior: "Show Embedded",
      uiTarget: null,
    },
    {
      comment: "artificial state with unexpected role attribute; will not be repaired",
      show: "none",
      role: SOME_TARGET,
      target: `${show.none}_${SOME_TARGET}`,
      uiBehavior: "Open in Frame",
      uiTarget: `${show.none}_${SOME_TARGET}`,
    },
  ];
  const reservedTargetScenarios = [
    {
      show: "replace",
      role: null,
      target: show.replace,
      uiBehavior: "Open in Current Tab",
      uiTarget: null,
    },
    {
      show: "new",
      role: null,
      target: show.new,
      uiBehavior: "Open in New Tab",
      uiTarget: null,
    },
    {
      comment: "artificial regarding xlink-attributes",
      show: "other",
      role: "_parent",
      target: "_parent",
      uiBehavior: "Open in Frame",
      uiTarget: "_parent",
    },
    {
      comment: "artificial regarding xlink-attributes",
      show: "other",
      role: "_top",
      target: "_top",
      uiBehavior: "Open in Frame",
      uiTarget: "_top",
    },
  ];
  let cornerCaseScenarios;
  cornerCaseScenarios = [
    {
      comment: "Trying to misuse reserved word _role. Repaired on save by removing xlink:role.",
      show: "other",
      role: "_role",
      target: "_role",
      uiBehavior: "Open in Frame",
      uiTarget: "",
    },
    {
      comment: "Trying to misuse reserved word _role. Repaired on save by removing xlink:role.",
      show: "other",
      role: "_role_",
      target: "_role_",
      uiBehavior: "Open in Frame",
      uiTarget: "",
    },
    {
      comment: `Trying to misuse artificial handling of ${show.new}_[role] with empty role. Repaired on save by removing xlink:role.`,
      show: "other",
      role: `${show.new}_`,
      target: `${show.new}_`,
      uiBehavior: "Open in New Tab",
      uiTarget: null,
    },
    {
      comment: `Trying to misuse artificial handling of ${show.replace}_[role] with empty role. Repaired on save by removing xlink:role.`,
      show: "other",
      role: `${show.replace}_`,
      target: `${show.replace}_`,
      uiBehavior: "Open in Current Tab",
      uiTarget: null,
    },
    {
      comment: `Trying to misuse artificial handling of ${show.embed}_[role] with empty role. Repaired on save by removing xlink:role.`,
      show: "other",
      role: `${show.embed}_`,
      target: `${show.embed}_`,
      uiBehavior: "Show Embedded",
      uiTarget: null,
    },
    {
      comment: `Trying to misuse artificial handling of ${show.none}_[role] with empty role. Not repaired on save, stored as is.`,
      show: "other",
      role: `${show.none}_`,
      target: `${show.none}_`,
      uiBehavior: "Open in Frame",
      uiTarget: `${show.none}_`,
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

const exampleData = {
  "Hello": `<div xmlns="${CM_RICHTEXT}"><p>Hello World!</p></div>`,
  "Empty": `<div xmlns="${CM_RICHTEXT}"/>`,
  "Links (Targets)": externalLinkTargetExamples(),
  "Content Links": contentLinkExamples(),
};

const setExampleData = (editor, exampleKey) => {
  editor.setData(exampleData[exampleKey]);
};

const initExamples = (editor) => {
  const examplesDiv = document.getElementById("examples");
  for (let exampleKey in exampleData) {
    const button = document.createElement("button");
    // noinspection InnerHTMLJS
    button.innerHTML = exampleKey;
    button.addEventListener("click", () => {
      setExampleData(editor, exampleKey);
    });
    examplesDiv?.appendChild(button);
  }
};

export {
  initExamples,
}
