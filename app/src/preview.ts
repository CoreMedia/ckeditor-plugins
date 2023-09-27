import { dataFormatter } from "./DataFormatter";
import { ApplicationToolbarConfig, requireApplicationToolbar } from "./ApplicationToolbar";

const previewToggleButtonId = "previewToggle";
const showPreviewBtnLabel = "Show Preview";
const hidePreviewBtnLabel = "Hide Preview";
const visibleState = "visible";
const hiddenState = "hidden";

const withPreviewClass = "with-preview";
const defaultPreviewPanelId = "preview";
const previewClass = "preview";

export interface PreviewConfig extends ApplicationToolbarConfig {
  /**
   * ID of the preview panel. Defaults to `preview`.
   */
  previewId?: string;
}

export const initPreview = (config?: PreviewConfig) => {
  const { previewId = defaultPreviewPanelId } = config ?? {};

  const toolbar = requireApplicationToolbar(config);
  const preview = document.getElementById(previewId);
  const previewParent = preview?.parentElement;

  if (!preview) {
    throw new Error(`Cannot find preview element having ID  "${previewId}".`);
  }

  if (!previewParent) {
    throw new Error(`Preview with ID "${previewId}" misses required parent element.`);
  }

  const button = document.createElement("button");

  button.id = previewToggleButtonId;
  button.title = `Shows preview of data as they would be stored via external service like CoreMedia CMS.`;
  button.textContent = showPreviewBtnLabel;
  button.dataset.currentState = hiddenState;

  document.body.dataset.previewId = previewId;
  preview.classList.add(previewClass);
  preview.innerText = "No data received yet.";

  toolbar.appendChild(button);

  const showPreview = () => {
    previewParent.classList.add(withPreviewClass);
    button.textContent = hidePreviewBtnLabel;
    button.dataset.currentState = visibleState;
  };

  const hidePreview = () => {
    previewParent.classList.remove(withPreviewClass);
    button.textContent = showPreviewBtnLabel;
    button.dataset.currentState = hiddenState;
  };

  const isVisible = () => button.dataset.currentState === visibleState;

  const togglePreview = () => {
    if (isVisible()) {
      hidePreview();
    } else {
      showPreview();
    }
  };

  button.addEventListener("click", togglePreview);

  // The initial state of the preview.
  hidePreview();
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
