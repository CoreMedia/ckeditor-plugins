import { initPreview } from "./preview";
import { createDefaultEditor } from "./editors/default";
import { createBBCodeEditor } from "./editors/bbCode";

// setup input example content IFrame
const showHideExampleContentButton = document.querySelector("#inputExampleContentButton");
const inputExampleContentFrame = document.querySelector("#inputExampleContentDiv") as HTMLDivElement;
if (showHideExampleContentButton && inputExampleContentFrame) {
  showHideExampleContentButton.addEventListener("click", () => {
    inputExampleContentFrame.hidden = !inputExampleContentFrame.hidden;
    showHideExampleContentButton.textContent = `${
      inputExampleContentFrame.hidden ? "Show" : "Hide"
    } input example contents`;
  });
}

const initLanguage = () => {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const languageFlag = "lang";
  const language = urlParams.get(languageFlag)?.toLowerCase() ?? "en";
  const languageToggle = document.getElementById(languageFlag);
  if (!languageToggle) {
    throw Error("No language toggle element found.");
  }
  let label, hrefLang;
  if (language === "de") {
    label = "EN | <strong>DE</strong>";
    hrefLang = "en";
  } else {
    label = "<strong>EN</strong> | DE";
    hrefLang = "de";
  }
  languageToggle.setAttribute("href", `.?lang=${hrefLang}`);
  languageToggle.innerHTML = label;
  return language;
};

const initToggleEditorTabs = () => {
  const hideAllEditorRows = () => {
    const rows = document.getElementsByClassName("editor-row");
    Array.from(rows).forEach((rowEl) => {
      const divElement = rowEl as HTMLDivElement;
      if (divElement) {
        divElement.style.display = "none";
      }
    });

    const tabs = document.getElementsByClassName("editor-tab");
    Array.from(tabs).forEach((tabsEl) => {
      const divElement = tabsEl as HTMLDivElement;
      if (divElement) {
        divElement.classList.remove("active");
      }
    });
  };

  const initToggleEditorTab = (buttonSelector: string, editorRowSelector: string) => {
    const editorTab = document.querySelector(buttonSelector) as HTMLButtonElement;
    editorTab.addEventListener("click", () => {
      const editorRow = document.querySelector(editorRowSelector) as HTMLDivElement;
      hideAllEditorRows();
      editorTab.classList.add("active");
      editorRow.style.display = "block";
    });
  };

  initToggleEditorTab("#defaultEditorTab", "#defaultEditorRow");
  initToggleEditorTab("#bbcodeEditorTab", "#bbcodeEditorRow");

  hideAllEditorRows();
  const defaultEditorRow = document.querySelector("#defaultEditorRow") as HTMLDivElement;
  const defaultEditorTab = document.querySelector("#defaultEditorTab") as HTMLButtonElement;
  defaultEditorTab.classList.add("active");
  defaultEditorRow.style.display = "block";
};

initToggleEditorTabs();

const lang = initLanguage();

initPreview();
createDefaultEditor(lang);
createBBCodeEditor(lang);
