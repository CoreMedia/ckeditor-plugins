import { createCKEditorInstance } from "./createCKEditorInstance";
import { ApplicationState } from "./ApplicationState";
import { getHashParams } from "./HashParams";
import "ckeditor5/ckeditor5.css";

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

void createCKEditorInstance(new ApplicationState(getHashParams())).catch((error) => {
  console.error(error);
});
