const CM_RICHTEXT = "http://www.coremedia.com/2003/richtext-1.0";
const XLINK = "http://www.w3.org/1999/xlink";
const SOME_TARGET = "somewhere";
const EXAMPLE_URL = "https://example.org/";
const LINK_TEXT = "Link";

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

function createLinkTableHeading() {
  return `<tr><td class="td--heading">xlink:show</td><td class="td--heading">xlink:role</td><td class="td--heading">target</td><td class="td--heading">Link</td><td class="td--heading">Comment</td></tr>`;
}

function createLinkTableRow({comment, show, role, target}) {
  return `<tr><td>${show || ""}</td><td>${role || ""}</td><td>${target || ""}</td><td>${createLink(show, role)}</td><td>${comment || ""}</td></tr>`;
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
    },
    {
      comment: "Open in New Window",
      show: "new",
      role: null,
      target: "_blank",
    },
    {
      comment: "Open in Current Window",
      show: "replace",
      role: null,
      target: "_self",
    },
    {
      comment: "Show Embedded; artificial reserved word for 'target'.",
      show: "embed",
      role: null,
      target: "_embed",
    },
    {
      comment: "Open in Frame; artificial state, as a 'role' would have been expected.",
      show: "other",
      role: null,
      target: "_other",
    },
    {
      comment: "artificial reserved word for 'target' to reflect this XLink-state",
      show: "none",
      role: null,
      target: "_none",
    },
    {
      comment: "Open in Frame; normal state for a named target.",
      show: "other",
      role: SOME_TARGET,
      target: SOME_TARGET,
    },
  ];
  const artificialRichTextScenarios = [
    {
      comment: "artificial state, where a role misses an expected show attribute",
      show: null,
      role: SOME_TARGET,
      target: `_role_${SOME_TARGET}`,
    },
    {
      comment: "Open in New Window; artificial state with unexpected role attribute",
      show: "new",
      role: SOME_TARGET,
      target: `_blank_${SOME_TARGET}`,
    },
    {
      comment: "Open in Current Window; artificial state with unexpected role attribute",
      show: "replace",
      role: SOME_TARGET,
      target: `_self_${SOME_TARGET}`,
    },
    {
      comment: "Show Embedded; artificial state with unexpected role attribute",
      show: "embed",
      role: SOME_TARGET,
      target: `_embed_${SOME_TARGET}`,
    },
    {
      comment: "artificial state with unexpected role attribute",
      show: "none",
      role: SOME_TARGET,
      target: `_none_${SOME_TARGET}`,
    },
  ];
  const reservedTargetScenarios = [
    {
      comment: "Open in Current Window",
      show: "replace",
      role: null,
      target: "_self",
    },
    {
      comment: "Open in New Window",
      show: "new",
      role: null,
      target: "_blank",
    },
    {
      comment: "Open in Frame; artificial regarding xlink-attributes",
      show: "other",
      role: "_parent",
      target: "_parent",
    },
    {
      comment: "Open in Frame; artificial regarding xlink-attributes",
      show: "other",
      role: "_top",
      target: "_top",
    },
  ];
  const cornerCaseScenarios = [
    {
      comment: "Trying to misuse reserved word _role.",
      show: "other",
      role: "_role",
      target: "_role",
    },
    {
      comment: "Trying to misuse reserved word _role.",
      show: "other",
      role: "_role_",
      target: "_role_",
    },
    {
      comment: "Trying to misuse artificial handling of _blank_[role] with empty role.",
      show: "other",
      role: "_blank_",
      target: "_blank_",
    },
    {
      comment: "Trying to misuse artificial handling of _self_[role] with empty role.",
      show: "other",
      role: "_self_",
      target: "_self_",
    },
    {
      comment: "Trying to misuse artificial handling of _embed_[role] with empty role.",
      show: "other",
      role: "_embed_",
      target: `_embed_`,
    },
    {
      comment: "Trying to misuse artificial handling of _none_[role] with empty role.",
      show: "other",
      role: "_none_",
      target: "_none_",
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
