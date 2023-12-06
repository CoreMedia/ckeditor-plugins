import { ApplicationToolbarConfig, requireApplicationToolbar } from "./ApplicationToolbar";

export interface SwitchButtonConfig<T extends string = string> extends ApplicationToolbarConfig {
  id?: string;
  default?: T;
  states?: Record<T, string>;
  label?: string;
  enableDelay?: boolean;
  onSwitch: (state: T) => void;
}

const sortKeysByValue = <T extends string = string>(states: Record<T, string>): T[] =>
  Object.entries(states)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k]) => k as T);

export type StrictSwitchButtonConfig<T extends string = string> = Required<
  Omit<SwitchButtonConfig<T>, "toolbarId" | "enableDelay">
> &
  Pick<SwitchButtonConfig<T>, "enableDelay"> &
  ApplicationToolbarConfig;

const delayTitle = "Delay Modifiers: Ctrl/Cmd: 10s, Shift: 60s, Ctrl/Cmd+Shift: 120s";

export class SwitchButton<T extends string = string> {
  readonly config: StrictSwitchButtonConfig<T>;

  constructor(config: StrictSwitchButtonConfig<T>) {
    this.config = config;
  }

  init() {
    const { id, default: defaultState, states, label, onSwitch, enableDelay = false } = this.config;
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

    let switchDelayTimer: number;

    const switchState = (countDownSeconds = 0) => {
      const switchTo = (button.dataset.next ?? defaultState) as T;
      const switchNext = nextState(switchTo);
      if (countDownSeconds <= 0) {
        button.title = `Press to switch to ${states[switchNext]}.${enableDelay ? ` ${delayTitle}` : ""}`;
        button.textContent = `${label}: ${states[switchTo]}`;
        button.dataset.next = switchNext;
        onSwitch(switchTo);
      } else {
        button.textContent = `${label}: ${states[switchTo]} (in ${countDownSeconds} s)`;
        switchDelayTimer = window.setTimeout(switchState, 1000, countDownSeconds - 1);
      }
    };

    button.addEventListener("click", (evt: MouseEvent): void => {
      let countDownSeconds = 0;
      if (enableDelay) {
        window.clearTimeout(switchDelayTimer);
        const ctrlOrCommandKey = evt.ctrlKey || evt.metaKey;
        if (evt.shiftKey) {
          countDownSeconds = ctrlOrCommandKey ? 120 : 60;
        } else if (ctrlOrCommandKey) {
          countDownSeconds = 10;
        }
      }
      switchState(countDownSeconds);
    });

    // Init with default state.
    switchState();
  }
}
