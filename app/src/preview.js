import format from 'xml-formatter';

const WITH_PREVIEW_CLASS = "with-preview";
const getPreviewPanel = () => {
  return document.getElementById("preview");
};

const getEditor = () => {
  return document.getElementsByClassName("ck-editor")[0];
};

const setupPreview = () => {
  const preview = getPreviewPanel();
  preview.innerText = "waiting for ckeditor changes...";
};

const updatePreview = (data) => {
  const preview = getPreviewPanel();
  const formattedXml = !!data ? format(data, {
    indentation: '   ',
    collapseContent: false
  }) : "empty";
  preview.innerText = formattedXml;
};

const renderPreviewButton = () => {
  const preview = getPreviewPanel();
  const previewButton = document.querySelector("#previewButton");
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

export {
  setupPreview,
  updatePreview
}
