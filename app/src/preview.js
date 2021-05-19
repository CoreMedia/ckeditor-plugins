import format from 'xml-formatter';

const getPreviewPanel = () => {
  return document.getElementById("preview");
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
      previewButton.textContent = "Show XML Preview"
    } else {
      previewButton.textContent = "Hide XML Preview"
    }
  });
};

renderPreviewButton();

export {
  setupPreview,
  updatePreview
}
