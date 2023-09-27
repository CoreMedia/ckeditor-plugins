import { initPreview } from "./preview";
import { createCKEditorInstance } from "./createCKEditorInstance";
import { ApplicationState } from "./ApplicationState";
import { getHashParams } from "./HashParams";

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

initPreview();

void createCKEditorInstance(new ApplicationState(getHashParams())).catch((error) => {
  console.error(error);
});
