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

  toggleButton.dataset.currentState = "read-write";

  const setLabel = (label) => toggleButton.textContent = label;

  const enableReadOnly = () => {
    toggleButton.dataset.currentState = "read-only";
    editor.enableReadOnlyMode(READ_ONY_MODE_ID);
    setLabel(DISABLE_BTN_LABEL);
  };

  const disableReadOnly = () => {
    toggleButton.dataset.currentState = "read-write";
    editor.disableReadOnlyMode(READ_ONY_MODE_ID);
    setLabel(ENABLE_BTN_LABEL);
  };

  // Naive check, but should be ok. We cannot ask CKEditor directly, if WE
  // are responsible for read-only state.
  const isReadOnly = () => toggleButton.dataset.currentState === "read-only";

  setLabel(ENABLE_BTN_LABEL);

  let currentToggleDelay = undefined;

  const toggleState = (countDownSeconds) => {
    if (countDownSeconds > 0) {
      setLabel(`Toggling Read-Only-Mode in ${countDownSeconds} s...`);
      currentToggleDelay = setTimeout(toggleState, 1000, countDownSeconds - 1);
    } else {
      isReadOnly() ? disableReadOnly() : enableReadOnly();
    }
  };

  toggleButton.addEventListener("click", (evt) => {
    clearTimeout(currentToggleDelay);
    let countDownSeconds = 0;
    const ctrlOrCommandKey = evt.ctrlKey || evt.metaKey;
    if (evt.shiftKey) {
      countDownSeconds = ctrlOrCommandKey ? 120 : 60;
    } else if (ctrlOrCommandKey) {
      countDownSeconds = 10;
    }
    toggleState(countDownSeconds);
  });
};

export {
  initReadOnlyMode
}
