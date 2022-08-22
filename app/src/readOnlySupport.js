const READ_ONLY_MODE_BTN_ID = "readOnlyMode";
const READ_ONY_MODE_ID = "exampleApplicationReadOnlyMode";
const ENABLE_BTN_LABEL = "Enable Read-Only-Mode";
const DISABLE_BTN_LABEL = "Disable Read-Only-Mode";

const initReadOnlyMode = (editor) => {
  const toggleButton = document.querySelector(`#${READ_ONLY_MODE_BTN_ID}`);

  if (!toggleButton) {
    console.error("Failed initializing read-only mode toggle, as required button is not available.");
    return;
  }

  const setLabel = (label) => toggleButton.textContent = label;

  const enableReadOnly = () => {
    editor.enableReadOnlyMode(READ_ONY_MODE_ID);
    setLabel(DISABLE_BTN_LABEL);
  };

  const disableReadOnly = () => {
    editor.disableReadOnlyMode(READ_ONY_MODE_ID);
    setLabel(ENABLE_BTN_LABEL);
  };

  // Naive check, but should be ok. We cannot ask CKEditor directly, if WE
  // are responsible for read-only state.
  const isReadOnly = () => toggleButton.textContent === DISABLE_BTN_LABEL;

  setLabel(ENABLE_BTN_LABEL);

  toggleButton.addEventListener("click", () => isReadOnly() ? disableReadOnly() : enableReadOnly());
};

export {
  initReadOnlyMode
}
