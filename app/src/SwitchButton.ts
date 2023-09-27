import { ApplicationToolbarConfig, requireApplicationToolbar } from "./ApplicationToolbar";

export interface SwitchButtonConfig<T extends string = string> extends ApplicationToolbarConfig {
  id?: string;
  default?: T;
  states?: Record<T, string>;
  label?: string;
  onSwitch: (state: T) => void;
}

const sortKeysByValue = <T extends string = string>(states: Record<T, string>): T[] =>
  Object.entries(states)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k]) => k as T);

export type StrictSwitchButtonConfig<T extends string = string> = Required<Omit<SwitchButtonConfig<T>, "toolbarId">> &
  ApplicationToolbarConfig;

export class SwitchButton<T extends string = string> {
  readonly config: StrictSwitchButtonConfig<T>;

  constructor(config: StrictSwitchButtonConfig<T>) {
    this.config = config;
  }

  init() {
    const { id, default: defaultState, states, label, onSwitch } = this.config;
    const toolbar = requireApplicationToolbar(this.config);
    const button = document.createElement("button");
    const keys = sortKeysByValue(states);

    button.id = id;
    toolbar.appendChild(button);

    const nextState = (current: T): T => {
      const nextIdx = keys.indexOf(current) + 1;
      if (nextIdx >= keys.length) {
        return keys[0];
      }
      return keys[nextIdx];
    };

    const switchState = () => {
      const switchTo = (button.dataset.next ?? defaultState) as T;
      const switchNext = nextState(switchTo);
      button.title = `Press to switch to ${states[switchNext]}.`;
      button.textContent = `${label}: ${states[switchTo]}`;
      button.dataset.next = switchNext;
      onSwitch(switchTo);
    };

    button.addEventListener("click", () => switchState());

    // Init with default state.
    switchState();
  }
}
