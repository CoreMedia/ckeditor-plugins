import { ExampleData } from "../ExampleData";
import { richTextDocument } from "../RichTextDOM";
import { h1 } from "../RichTextConvenience";

const EXAMPLE_URL = "https://example.org/";
const LINK_TEXT = "Link";
const CM_RICHTEXT = "http://www.coremedia.com/2003/richtext-1.0";
const XLINK = "http://www.w3.org/1999/xlink";
const serializer = () => new XMLSerializer();

const tableHeader = (...headers: string[]) =>
  `<tr class="tr--header">${headers.map((h) => `<td class="td--header">${h}</td>`).join("")}</tr>`;

const createContentLinkTableHeading = () => tableHeader("Link", "Comment");

// TODO: Should use `RichText.a` in the end, as soon as proper escaping is
//   supported. See also: `LinkTargetData.createLink` which is currently a
//   duplicate.
const createLink = (show: string, role: string, href = EXAMPLE_URL) => {
  const a = richTextDocument().createElement("a");
  a.textContent = LINK_TEXT;
  a.setAttribute("xlink:href", href);
  show && a.setAttribute("xlink:show", show);
  role && a.setAttribute("xlink:role", role);
  return serializer().serializeToString(a);
};

const createContentLinkTableRow = ({ comment, id }: { comment: string; id: number }) =>
  `<tr><td>${createLink("", "", `content:${id}`)}</td><td>${comment || ""}</td></tr>`;

const createContentLinkScenario = (title: string, scenarios: { comment: string; id: number }[]) => {
  const scenarioTitle = h1(title);
  const scenarioHeader = createContentLinkTableHeading();
  const scenarioRows = scenarios.map(createContentLinkTableRow).join("");
  return `${scenarioTitle}<table>${scenarioHeader}${scenarioRows}</table>`;
};

const contentLinkExamples = () => {
  const standardScenarios: { comment: string; id: number }[] = [
    {
      comment: "Root Folder",
      id: 1,
    },
    {
      comment: "Folder 1",
      id: 11,
    },
    {
      comment: "Folder 2",
      id: 13,
    },
    {
      comment: "Document 1",
      id: 10,
    },
    {
      comment: "Document 2",
      id: 12,
    },
  ];
  const nameChangeScenarios = [
    {
      comment: "Folder (changing names)",
      id: 103,
    },
    {
      comment: "Document (changing names)",
      id: 102,
    },
  ];
  const unreadableScenarios = [
    {
      comment: "Folder 1 (unreadable)",
      id: 105,
    },
    {
      comment: "Folder 2 (unreadable/readable toggle)",
      id: 107,
    },
    {
      comment: "Document 1 (unreadable)",
      id: 104,
    },
    {
      comment: "Document 2 (unreadable/readable toggle)",
      id: 106,
    },
  ];
  const stateScenarios = [
    {
      comment: "Document 1 (checked-in)",
      id: 100,
    },
    {
      comment: "Document 2 (checked-out)",
      id: 108,
    },
    {
      comment: "Document (being edited; toggles checked-out/-in)",
      id: 110,
    },
  ];
  const xssScenarios = [
    {
      comment: "Document 1",
      id: 606,
    },
  ];
  const slowScenarios = [
    {
      comment: "Slow Document",
      id: 800,
    },
    {
      comment: "Very Slow Document",
      id: 802,
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
};

export const contentLinkData: () => ExampleData = () => ({
  "Content Links": contentLinkExamples(),
});
