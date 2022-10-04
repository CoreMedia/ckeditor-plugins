// noinspection HttpUrlsUsage
import {
  PREDEFINED_MOCK_BLOB_DATA,
  PREDEFINED_MOCK_LINK_DATA,
} from "@coremedia/ckeditor5-coremedia-studio-integration-mock/content/PredefinedMockContents";
import { setData } from "./dataFacade";
import { welcomeTextData } from "@coremedia-internal/ckeditor5-coremedia-example-data/data/WelcomeTextData";
import { differencingData } from "@coremedia-internal/ckeditor5-coremedia-example-data/data/DifferencingData";
import { grsData } from "@coremedia-internal/ckeditor5-coremedia-example-data/data/GrsData";
import { loremIpsumData } from "@coremedia-internal/ckeditor5-coremedia-example-data/data/LoremIpsumData";
import { linkTargetData } from "@coremedia-internal/ckeditor5-coremedia-example-data/data/LinkTargetData";
import { h1, richtext } from "@coremedia-internal/ckeditor5-coremedia-example-data/RichText";
import { richTextDocument } from "@coremedia-internal/ckeditor5-coremedia-example-data/RichTextDOM";
import { entitiesData } from "@coremedia-internal/ckeditor5-coremedia-example-data/data/EntitiesData";
import ClassicEditor from "@ckeditor/ckeditor5-editor-classic/src/classiceditor";

const CM_RICHTEXT = "http://www.coremedia.com/2003/richtext-1.0";
const XLINK = "http://www.w3.org/1999/xlink";
const EXAMPLE_URL = "https://example.org/";
const LINK_TEXT = "Link";
const serializer = new XMLSerializer();
const tableHeader = (...headers: string[]) =>
  `<tr class="tr--header">${headers.map((h) => `<td class="td--header">${h}</td>`).join("")}</tr>`;
// TODO: Should use `RichText.a` in the end, as soon as proper escaping is
//   supported. See also: `LinkTargetData.createLink` which is currently a
//   duplicate.
function createLink(show: string, role: string, href = EXAMPLE_URL) {
  const a = richTextDocument.createElement("a");
  a.textContent = LINK_TEXT;
  a.setAttribute("xlink:href", href);
  show && a.setAttribute("xlink:show", show);
  role && a.setAttribute("xlink:role", role);
  return serializer.serializeToString(a);
}

function createContentLinkTableHeading() {
  return tableHeader("Link", "Comment");
}

function createContentLinkTableRow({ comment, id }: { comment: string; id: number }) {
  return `<tr><td>${createLink("", "", "content:" + id)}</td><td>${comment || ""}</td></tr>`;
}

function createContentLinkScenario(title: string, scenarios: { comment: string; id: number }[]) {
  const scenarioTitle = h1(title);
  const scenarioHeader = createContentLinkTableHeading();
  const scenarioRows = scenarios.map(createContentLinkTableRow).join("");
  return `${scenarioTitle}<table>${scenarioHeader}${scenarioRows}</table>`;
}

function contentLinkExamples() {
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
}

// noinspection HtmlUnknownAttribute
const exampleData = {
  ...differencingData,
  ...entitiesData,
  ...linkTargetData,
  ...loremIpsumData,
  ...grsData,
  ...welcomeTextData,
  "Content Links": contentLinkExamples(),
  "Various Links": PREDEFINED_MOCK_LINK_DATA,
  "Various Images": PREDEFINED_MOCK_BLOB_DATA,
  "Empty": "",
  "Hello": richtext(`<p>Hello World!</p>`),
  "Invalid RichText": richtext(
    `${h1(
      "Invalid RichText"
    )}<p>Parsing cannot succeed below, because xlink-namespace declaration is missing.</p><p>LINK</p>`
  ).replace("LINK", `<a xlink:href="https://example.org/">Link</a>`),
};

export const setExampleData = (editor: ClassicEditor, exampleKey: string) => {
  try {
    // noinspection InnerHTMLJS
    editor.editing.view.once(
      "render",
      (event) =>
        console.log("CKEditor's Editing-Controller rendered data.", {
          source: event.source,
          innerHtml: (event.source.getDomRoot() as unknown as HTMLDivElement).innerHTML,
        }),
      {
        priority: "lowest",
      }
    );
    editor.data.once(
      "set",
      (event, details) =>
        console.log("CKEditor's Data-Controller received data via 'set'.", {
          event,
          data: details[0],
        }),
      {
        priority: "lowest",
      }
    );

    //@ts-expect-error TODO Types
    const data = exampleData[exampleKey];
    console.log("Setting Example Data.", { [exampleKey]: data });
    setData(editor, data);

    const xmpInput = document.getElementById("xmp-input") as HTMLInputElement;
    if (xmpInput) {
      xmpInput.value = exampleKey;
    }
  } catch (e) {
    console.error(`Failed setting data for ${exampleKey}.`, e);
  }
};

export const initExamples = (editor: ClassicEditor) => {
  const xmpInput = document.getElementById("xmp-input") as HTMLInputElement;
  const xmpData = document.getElementById("xmp-data");
  const reloadBtn = document.getElementById("xmp-reload");
  const clearBtn = document.getElementById("xmp-clear");

  if (!(xmpInput && xmpData && reloadBtn)) {
    throw new Error("Required components for Example-Data Loading missing.");
  }

  // Clear input on focus (otherwise, only matched option is shown)
  xmpInput.addEventListener("focus", () => {
    xmpInput.value = "";
  });
  // On change, set the data – or show an error, if data are unknown.
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

  clearBtn?.addEventListener("click", () => {
    xmpInput.blur();
    setData(editor, "");
  });

  // Now add all examples
  for (const exampleKey of Object.keys(exampleData).sort()) {
    const option = document.createElement("option");
    // noinspection InnerHTMLJS
    option.innerHTML = exampleKey;
    option.value = exampleKey;
    xmpData?.appendChild(option);
  }
};
