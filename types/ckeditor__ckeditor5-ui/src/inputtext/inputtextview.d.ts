import View from "../view";

export default class InputTextView extends View {
  ariaDescribedById: string;
  readonly focusTracker: any;
  hasError: boolean;
  id: string;
  readonly isEmpty: boolean;
  readonly isFocused: boolean;
  isReadOnly: boolean;
  placeholder: string;
  value: string;

  focus(): void;
  select(): void;
}
