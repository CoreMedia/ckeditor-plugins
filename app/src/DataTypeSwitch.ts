import type { SwitchButtonConfig } from "./SwitchButton";
import { SwitchButton } from "./SwitchButton";

export const dataTypes = {
  ["richtext" as const]: "Rich Text",
  ["bbcode" as const]: "BBCode",
};

export const initDataTypeSwitch = (config: SwitchButtonConfig<keyof typeof dataTypes>): void => {
  new SwitchButton({
    id: "dataTypeSwitch",
    default: "richtext",
    states: dataTypes,
    label: "Data Type",
    ...config,
  }).init();
};
