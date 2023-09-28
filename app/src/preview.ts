import { dataFormatter } from "./DataFormatter";
import { ApplicationToolbarConfig } from "./ApplicationToolbar";
import { initPreviewSwitch } from "./PreviewSwitch";

const previewToggleButtonId = "previewToggle";
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
    default: "hidden",
    onSwitch(state) {
      if (state === "visible") {
        showPreview();
      } else {
        hidePreview();
      }
    },
    toolbarId: config?.toolbarId,
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
