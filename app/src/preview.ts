import { dataFormatter } from "./DataFormatter";

const WITH_PREVIEW_CLASS = "with-preview";
const getPreviewPanel = (): HTMLElement | null => document.getElementById("preview");

const getEditor = () => document.getElementsByClassName("ck-editor")[0];

const setupPreview = () => {
  const preview = getPreviewPanel();
  if (!preview) {
    throw new Error("No Preview Panel found.");
  }
  preview.innerText = "waiting for ckeditor changes...";
};

const updatePreview = (data: string, formatter: keyof typeof dataFormatter = "xml") => {
  const preview = getPreviewPanel();
  if (!preview) {
    return;
  }
  preview.innerText = dataFormatter[formatter](data, "empty");
};

const renderPreviewButton = () => {
  const preview = getPreviewPanel();
  if (!preview) {
    return;
  }
  const previewButton = document.querySelector("#previewButton");
  if (!previewButton) {
    return;
  }
  previewButton.addEventListener("click", () => {
    preview.hidden = !preview.hidden;
    if (preview.hidden) {
      // remove preview-mode
      getEditor().classList.remove(WITH_PREVIEW_CLASS);
      previewButton.textContent = "Show XML Preview";
      preview.classList.add("hidden");
    } else {
      // set preview-mode
      getEditor().classList.add(WITH_PREVIEW_CLASS);
      previewButton.textContent = "Hide XML Preview";
      preview.classList.remove("hidden");
    }
  });
};

renderPreviewButton();

export { setupPreview, updatePreview };
