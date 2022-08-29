// noinspection HttpUrlsUsage
import {
  PREDEFINED_MOCK_BLOB_DATA,
  PREDEFINED_MOCK_LINK_DATA,
} from "@coremedia/ckeditor5-coremedia-studio-integration-mock/content/PredefinedMockContents";
import {setData} from "./dataFacade";
import {welcomeTextData} from "@coremedia-internal/ckeditor5-coremedia-example-data/data/WelcomeTextData";
import {differencingData} from "@coremedia-internal/ckeditor5-coremedia-example-data/data/DifferencingData";
import {grsData} from "@coremedia-internal/ckeditor5-coremedia-example-data/data/GrsData";
import {loremIpsumData} from "@coremedia-internal/ckeditor5-coremedia-example-data/data/LoremIpsumData";
import {linkTargetData} from "@coremedia-internal/ckeditor5-coremedia-example-data/data/LinkTargetData";
import {richTextDocument} from "@coremedia-internal/ckeditor5-coremedia-example-data/RichText";

const CM_RICHTEXT = "http://www.coremedia.com/2003/richtext-1.0";
const XLINK = "http://www.w3.org/1999/xlink";
const EXAMPLE_URL = "https://example.org/";
const LINK_TEXT = "Link";
const serializer = new XMLSerializer();
const tableHeader = (...headers) => `<tr class="tr--header">${headers.map((h) => `<td class="td--header">${h}</td>`).join("")}</tr>`;
const htmlCode = (code) => `<pre><span class="language-html code">${code}</span></pre>`;
const richText = (plain) => {
  if (!plain) {
    return `<div xmlns="${CM_RICHTEXT}"/>`
  }
  const hasXLink = plain.indexOf("xlink:") >= 0;
  return `<div xmlns="${CM_RICHTEXT}"${hasXLink ? ` xmlns:xlink="${XLINK}"` : ""}>${plain}</div>`
};
const h = (level, text) => `<p class="p--heading-${level}">${text}</p>`;
const h1 = (text) => h(1, text);
const h2 = (text) => h(2, text);

// TODO: Should use `RichText.a` in the end, as soon as proper escaping is
//   supported. See also: `LinkTargetData.createLink` which is currently a
//   duplicate.
function createLink(show, role, href = EXAMPLE_URL) {
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

function createContentLinkTableRow({comment, id}) {
  return `<tr><td>${createLink("", "", "content:" + id)}</td><td>${comment || ""}</td></tr>`;
}

function createContentLinkScenario(title, scenarios) {
  const scenarioTitle = h1(title);
  const scenarioHeader = createContentLinkTableHeading();
  const scenarioRows = scenarios.map(createContentLinkTableRow).join("");
  return `${scenarioTitle}<table>${scenarioHeader}${scenarioRows}</table>`;
}

function contentLinkExamples() {
  const standardScenarios = [
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
const entitiesTableRow = (entity) => `<tr><td>${htmlCode(entity.replace("&", "&amp;"))}</td><td>${entity}</td></tr>`; // lgtm[js/incomplete-sanitization]
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

// noinspection HtmlUnknownAttribute
const exampleData = {
  ...differencingData,
  ...linkTargetData,
  ...loremIpsumData,
  ...grsData,
  ...welcomeTextData,
  "Content Links": contentLinkExamples(),
  "Various Links": PREDEFINED_MOCK_LINK_DATA,
  "Various Images": PREDEFINED_MOCK_BLOB_DATA,
  "Empty": "",
  "Entities": entitiesExample,
  "Hello": richText(`<p>Hello World!</p>`),
  "Invalid RichText": richText(`${h1("Invalid RichText")}<p>Parsing cannot succeed below, because xlink-namespace declaration is missing.</p><p>LINK</p>`)
          .replace("LINK", `<a xlink:href="https://example.org/">Link</a>`),
};

export const setExampleData = (editor, exampleKey) => {
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
    console.log("Setting Example Data.", {[exampleKey]: data});
    setData(editor, data);

    const xmpInput = document.getElementById("xmp-input");
    xmpInput.value = exampleKey;
  } catch (e) {
    console.error(`Failed setting data for ${exampleKey}.`, e);
  }
};

export const initExamples = (editor) => {
  const xmpInput = document.getElementById("xmp-input");
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

  clearBtn.addEventListener("click", () => {
    xmpInput.blur();
    setData(editor, "");
  });

  // Now add all examples
  for (let exampleKey of Object.keys(exampleData).sort()) {
    const option = document.createElement("option");
    // noinspection InnerHTMLJS
    option.innerHTML = exampleKey;
    option.value = exampleKey;
    xmpData?.appendChild(option);
  }
};
