export interface ReadOnlyToggleConfig {
  /**
   * ID of toolbar button to add the read only toggle button to.
   */
  toolbarId: string;
  /**
   * Callback to trigger on read-only change.
   *
   * @param readOnly - read only state
   */
  onToggle: (readOnly: boolean) => void;
}

const readOnlyModeButtonId = "readOnlyMode";
const enableReadOnlyBtnLabel = "Enable Read-Only-Mode";
const disableReadOnlyBtnLabel = "Disable Read-Only-Mode";
const readWriteState = "read-write";
const readOnlyState = "read-only";

export const initReadOnlyToggle = (config: ReadOnlyToggleConfig): void => {
  const { toolbarId, onToggle } = config;
  const toolbar = document.getElementById(toolbarId);

  if (!toolbar) {
    throw new Error(`Cannot find toolbar element having ID  "${toolbarId}".`);
  }

  const button = document.createElement("button");

  button.id = readOnlyModeButtonId;
  button.title = "Delay Modifiers: Ctrl/Cmd: 10s, Shift: 60s, Ctrl/Cmd+Shift: 120s";
  button.textContent = enableReadOnlyBtnLabel;
  button.dataset.currentState = readWriteState;

  toolbar.appendChild(button);

  const enableReadOnly = () => {
    button.textContent = disableReadOnlyBtnLabel;
    button.dataset.currentState = readOnlyState;
    onToggle(true);
  };

  const disableReadOnly = () => {
    button.textContent = enableReadOnlyBtnLabel;
    button.dataset.currentState = readWriteState;
    onToggle(false);
  };

  // Naive check, but should be ok. We cannot ask CKEditor directly if **we**
  // are responsible for read-only state.
  const isReadOnly = () => button.dataset.currentState === readOnlyState;

  let currentToggleDelay: number;

  const toggleState = (countDownSeconds: number) => {
    if (countDownSeconds > 0) {
      if (isReadOnly()) {
        button.textContent = `R/W in ${countDownSeconds} s...`;
      } else {
        button.textContent = `R/O in ${countDownSeconds} s...`;
      }
      currentToggleDelay = window.setTimeout(toggleState, 1000, countDownSeconds - 1);
    } else {
      isReadOnly() ? disableReadOnly() : enableReadOnly();
    }
  };

  button.addEventListener("click", (evt) => {
    window.clearTimeout(currentToggleDelay);
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
