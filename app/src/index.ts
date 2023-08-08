import { setupPreview } from "./preview";
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

const lang = initLanguage();

setupPreview();
createDefaultEditor(lang);
createBBCodeEditor(lang);
