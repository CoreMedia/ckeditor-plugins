import { Editor } from "@ckeditor/ckeditor5-core";

const READ_ONLY_MODE_BTN_ID = "readOnlyMode";
const READ_ONY_MODE_ID = "exampleApplicationReadOnlyMode";
const ENABLE_BTN_LABEL = "Enable Read-Only-Mode";
const DISABLE_BTN_LABEL = "Disable Read-Only-Mode";

const initReadOnlyMode = (editor: Editor) => {
  const toggleButton = document.querySelector(`#${READ_ONLY_MODE_BTN_ID}`) as HTMLElement;

  if (!toggleButton) {
    console.error("Failed initializing read-only mode toggle, as required button is not available.");
    return;
  }

  toggleButton.dataset.currentState = "read-write";

  const setLabel = (label: string) => (toggleButton.textContent = label);

  const enableReadOnly = () => {
    toggleButton.dataset.currentState = "read-only";
    //@ts-expect-error difference between Type and API. Method should be part of editor:https://ckeditor.com/docs/ckeditor5/latest/api/module_core_editor_editor-Editor.html#function-enableReadOnlyMode
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    editor.enableReadOnlyMode(READ_ONY_MODE_ID);
    setLabel(DISABLE_BTN_LABEL);
  };

  const disableReadOnly = () => {
    toggleButton.dataset.currentState = "read-write";
    //@ts-expect-error difference between Type and API. Method should be part of editor:https://ckeditor.com/docs/ckeditor5/latest/api/module_core_editor_editor-Editor.html#function-disableReadOnlyMode
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    editor.disableReadOnlyMode(READ_ONY_MODE_ID);
    setLabel(ENABLE_BTN_LABEL);
  };

  // Naive check, but should be ok. We cannot ask CKEditor directly, if WE
  // are responsible for read-only state.
  const isReadOnly = () => toggleButton.dataset.currentState === "read-only";

  setLabel(ENABLE_BTN_LABEL);

  let currentToggleDelay: number;

  const toggleState = (countDownSeconds: number) => {
    if (countDownSeconds > 0) {
      setLabel(`Toggling Read-Only-Mode in ${countDownSeconds} s...`);
      // eslint-disable-next-line no-restricted-globals
      currentToggleDelay = setTimeout(toggleState, 1000, countDownSeconds - 1);
    } else {
      isReadOnly() ? disableReadOnly() : enableReadOnly();
    }
  };

  toggleButton.addEventListener("click", (evt) => {
    // eslint-disable-next-line no-restricted-globals
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

export { initReadOnlyMode };
