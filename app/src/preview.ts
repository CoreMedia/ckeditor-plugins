import format = require("xml-formatter");

const WITH_PREVIEW_CLASS = "with-preview";
const getPreviewPanel = (): HTMLElement | null => {
  return document.getElementById("preview");
};

const getEditor = () => {
  return document.getElementsByClassName("ck-editor")[0];
};

const setupPreview = () => {
  const preview = getPreviewPanel();
  if (!preview) {
    throw new Error("No Preview Panel found.");
  }
  preview.innerText = "waiting for ckeditor changes...";
};

const updatePreview = (data: string) => {
  const preview = getPreviewPanel();
  if (!preview) {
    return;
  }
  preview.innerText = !!data
    ? format(data, {
        indentation: "   ",
        collapseContent: false,
      })
    : "empty";
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
