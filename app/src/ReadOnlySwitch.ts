import type { SwitchButtonConfig } from "./SwitchButton";
import { SwitchButton } from "./SwitchButton";

export const readOnlyStates = {
  ["rw" as const]: "Read Write",
  ["ro" as const]: "Read Only",
};

const readOnlyModeButtonId = "readOnlyMode";

export const initReadOnlyToggle = (config: SwitchButtonConfig<keyof typeof readOnlyStates>): void => {
  new SwitchButton({
    id: readOnlyModeButtonId,
    default: "rw",
    states: readOnlyStates,
    label: "Mode",
    enableDelay: true,
    ...config,
  }).init();
};
