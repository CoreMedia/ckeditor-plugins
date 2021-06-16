const CM_RICHTEXT = "http://www.coremedia.com/2003/richtext-1.0";
const XLINK = "http://www.w3.org/1999/xlink";
const SOME_TARGET = "somewhere";
const EXAMPLE_URL = "https://example.org/";
const LINK_TEXT = "Link";
const UNSET = "—";

function createLink(show, role) {
  if (!show) {
    if (!role) {
      // noinspection HtmlUnknownAttribute
      return `<a xlink:href="${EXAMPLE_URL}">${LINK_TEXT}</a>`
    }
    // noinspection HtmlUnknownAttribute
    return `<a xlink:href="${EXAMPLE_URL}" xlink:role="${role}">${LINK_TEXT}</a>`
  }
  if (!role) {
    // noinspection HtmlUnknownAttribute
    return `<a xlink:href="${EXAMPLE_URL}" xlink:show="${show}">${LINK_TEXT}</a>`
  }
  // noinspection HtmlUnknownAttribute
  return `<a xlink:href="${EXAMPLE_URL}" xlink:show="${show}" xlink:role="${role}">${LINK_TEXT}</a>`
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
  return `<tr><td>${show || UNSET}</td><td>${role || UNSET}</td><td>${target || UNSET}</td><td>${uiBehavior || UNSET}</td><td>${renderUiTarget(uiTarget)}</td><td>${createLink(show, role)}</td><td>${comment || ""}</td></tr>`;
}

function createLinkScenario(title, scenarios) {
  const scenarioTitle = `<h1>${title}</h1>`;
  const scenarioHeader = createLinkTableHeading();
  const scenarioRows = scenarios.map(createLinkTableRow).join("");
  return `${scenarioTitle}<table>${scenarioHeader}${scenarioRows}</table>`;
}

function externalLinkTargetExamples() {
  const standardScenarios = [
    {
      comment: "Only href, no target.",
      show: null,
      role: null,
      target: null,
      uiBehavior: "Unspecified",
      uiTarget: null,
    },
    {
      show: "new",
      role: null,
      target: "_blank",
      uiBehavior: "Open in New Tab",
      uiTarget: null,
    },
    {
      show: "replace",
      role: null,
      target: "_top",
      uiBehavior: "Open in Current Tab",
      uiTarget: null,
    },
    {
      comment: "artificial reserved word for 'target'.",
      show: "embed",
      role: null,
      target: "_embed",
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
      target: "_none",
      uiBehavior: "Open in Frame",
      uiTarget: "_none",
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
      target: `_blank_${SOME_TARGET}`,
      uiBehavior: "Open in New Tab",
      uiTarget: null,
    },
    {
      comment: "artificial state with unexpected role attribute; repaired on save by removing xlink:role",
      show: "replace",
      role: SOME_TARGET,
      target: `_top_${SOME_TARGET}`,
      uiBehavior: "Open in Current Tab",
      uiTarget: null,
    },
    {
      comment: "artificial state with unexpected role attribute; repaired on save by removing xlink:role",
      show: "embed",
      role: SOME_TARGET,
      target: `_embed_${SOME_TARGET}`,
      uiBehavior: "Show Embedded",
      uiTarget: null,
    },
    {
      comment: "artificial state with unexpected role attribute; will not be repaired",
      show: "none",
      role: SOME_TARGET,
      target: `_none_${SOME_TARGET}`,
      uiBehavior: "Open in Frame",
      uiTarget: `_none_${SOME_TARGET}`,
    },
  ];
  const reservedTargetScenarios = [
    {
      show: "replace",
      role: null,
      target: "_top",
      uiBehavior: "Open in Current Tab",
      uiTarget: null,
    },
    {
      show: "new",
      role: null,
      target: "_blank",
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
      role: "_self",
      target: "_self",
      uiBehavior: "Open in Frame",
      uiTarget: "_self",
    },
  ];
  const cornerCaseScenarios = [
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
      comment: "Trying to misuse artificial handling of _blank_[role] with empty role. Repaired on save by removing xlink:role.",
      show: "other",
      role: "_blank_",
      target: "_blank_",
      uiBehavior: "Open in New Tab",
      uiTarget: null,
    },
    {
      comment: "Trying to misuse artificial handling of _top_[role] with empty role. Repaired on save by removing xlink:role.",
      show: "other",
      role: "_top_",
      target: "_top_",
      uiBehavior: "Open in Current Tab",
      uiTarget: null,
    },
    {
      comment: "Trying to misuse artificial handling of _embed_[role] with empty role. Repaired on save by removing xlink:role.",
      show: "other",
      role: "_embed_",
      target: `_embed_`,
      uiBehavior: "Show Embedded",
      uiTarget: null,
    },
    {
      comment: "Trying to misuse artificial handling of _none_[role] with empty role. Not repaired on save, stored as is.",
      show: "other",
      role: "_none_",
      target: "_none_",
      uiBehavior: "Open in Frame",
      uiTarget: "_none_",
    },
  ];
  const scenarios = [
    createLinkScenario("Standard Links", standardScenarios),
    createLinkScenario("Artificial Richtext Scenarios", artificialRichTextScenarios),
    createLinkScenario("Reserved Target Scenarios", reservedTargetScenarios),
    createLinkScenario("Corner Case Scenarios", cornerCaseScenarios),
  ].join("");
  return `<div xmlns="${CM_RICHTEXT}" xmlns:xlink="${XLINK}">${scenarios}</div>`;
}

const exampleData = {
  "Hello": `<div xmlns="${CM_RICHTEXT}"><p>Hello World!</p></div>`,
  "Empty": `<div xmlns="${CM_RICHTEXT}"/>`,
  "Links (Targets)": externalLinkTargetExamples(),
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
