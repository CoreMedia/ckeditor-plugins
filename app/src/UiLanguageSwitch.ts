import { SwitchButton, SwitchButtonConfig } from "./SwitchButton";

const uiLanguages = {
  ["en" as const]: "English",
  ["de" as const]: "German",
};

export const initUiLanguageSwitch = (config: SwitchButtonConfig<keyof typeof uiLanguages>): void => {
  new SwitchButton({
    id: "uiLanguageSwitch",
    default: "en",
    states: uiLanguages,
    label: "UI Language",
    ...config,
  }).init();
};
