import { dataFormatter } from "./DataFormatter";
import { initPreviewSwitch } from "./PreviewSwitch";
import { ApplicationState } from "./ApplicationState";

const previewToggleButtonId = "previewToggle";
const withPreviewClass = "with-preview";
const previewPanelId = "preview";
const previewClass = "preview";

export const initPreview = (state: ApplicationState) => {
  const previewId = previewPanelId;

  const preview = document.getElementById(previewId);
  const previewParent = preview?.parentElement;

  if (!preview) {
    throw new Error(`Cannot find preview element having ID  "${previewId}".`);
  }

  if (!previewParent) {
    throw new Error(`Preview with ID "${previewId}" misses required parent element.`);
  }

  document.body.dataset.previewId = previewId;

  const showPreview = () => {
    previewParent.classList.add(withPreviewClass);
  };

  const hidePreview = () => {
    previewParent.classList.remove(withPreviewClass);
  };

  initPreviewSwitch({
    id: previewToggleButtonId,
    default: state.previewState,
    onSwitch(previewState) {
      if (previewState === "visible") {
        showPreview();
      } else {
        hidePreview();
      }
      state.previewState = previewState;
    },
  });

  preview.classList.add(previewClass);
  preview.innerText = "No data received yet.";
};

const getPreviewPanel = (): HTMLElement => {
  const previewId = document.body.dataset.previewId;
  if (!previewId) {
    throw new Error(`Preview ID not exposed at body.`);
  }
  const preview = document.getElementById(previewId);
  if (!preview) {
    throw new Error(`Preview with ID ${previewId} as denoted by body does not exist.`);
  }
  return preview;
};

export const updatePreview = (data: string, formatter: keyof typeof dataFormatter = "xml") => {
  getPreviewPanel().innerText = dataFormatter[formatter](data, "empty");
};
