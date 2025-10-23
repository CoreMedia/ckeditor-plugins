import type { SwitchButtonConfig } from "./SwitchButton";
import { SwitchButton } from "./SwitchButton";

export const previewStates = {
  ["hidden" as const]: "Hidden",
  ["visible" as const]: "Visible",
};

const previewSwitchBtnId = "previewSwitch";

export const initPreviewSwitch = (config: SwitchButtonConfig<keyof typeof previewStates>): void => {
  new SwitchButton({
    id: previewSwitchBtnId,
    default: "hidden",
    states: previewStates,
    label: "Preview",
    ...config,
  }).init();
};
