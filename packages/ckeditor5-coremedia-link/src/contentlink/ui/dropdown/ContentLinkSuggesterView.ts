import {
  addToolbarToDropdown,
  ButtonView,
  createDropdown,
  createLabeledInputText,
  DropdownView,
  Editor,
  InputTextView,
  LabeledFieldView,
  LinkFormView,
  View,
  ViewCollection,
} from "ckeditor5";
import LibraryButtonView from "../LibraryButtonView";
import { createContentLinkSuggestion } from "./createContentLinkSuggestion";
import { BehaviorSubject, combineLatest, debounce, interval, Observable, of, switchMap } from "rxjs";

interface ContentLinkSuggesterViewProps {
  editor: Editor;
  parent: LinkFormView;
  onChangeInputValue: (value: string) => void;
  onClickOnLink: (uriPath: string) => void;
  onOpenLibrary: () => void;
  setupDnD: (field: LabeledFieldView) => void;
  observeContentSuggestions: (filterValue: string) => Observable<string[]>;
  options?: {
    debounceInterval?: number;
    minFilterValueLength?: number;
    inputAriaLabel?: string;
  };
}

export class ContentLinkSuggesterView extends ViewCollection {
  readonly #parent: LinkFormView;
  readonly #minFilterValueLength: number;
  readonly #debounceInterval: number;

  readonly #labeledFieldView: LabeledFieldView<InputTextView>;
  readonly #openLibraryButton: ButtonView;
  readonly #dropdown: DropdownView;
  #isVisible = false;
  readonly #filterValueSubject: BehaviorSubject<string>;
  readonly #onChangeInputValue: (value: string) => void;

  constructor({
    editor,
    parent,
    onChangeInputValue,
    onClickOnLink,
    onOpenLibrary,
    setupDnD,
    observeContentSuggestions,
    options,
  }: ContentLinkSuggesterViewProps) {
    super([]);

    this.#parent = parent;
    this.#minFilterValueLength = options?.minFilterValueLength ?? 3;
    this.#debounceInterval = options?.debounceInterval ?? 500;
    this.#onChangeInputValue = onChangeInputValue;

    const { locale } = editor;

    this.#filterValueSubject = new BehaviorSubject("");

    this.#labeledFieldView = new LabeledFieldView<InputTextView>(locale, createLabeledInputText);
    this.#labeledFieldView.label = locale.t("Link");
    this.#labeledFieldView.fieldView.set({
      placeholder: locale.t("Type to search content, enter url or drag and drop content onto this area."),
      ariaLabel: options?.inputAriaLabel ?? locale.t("Edit link"),
    });

    this.#openLibraryButton = new LibraryButtonView(onOpenLibrary, editor.locale.t("Open Library"), editor.locale);

    const uriPathsMap = new Map<View, string>();
    const viewsMap = new Map<string, View>();

    //@ts-expect-error We are using this method with a textField even though it expects a buttonView.
    this.#dropdown = createDropdown(locale, this.#labeledFieldView);
    addToolbarToDropdown(this.#dropdown, [], { isVertical: true });

    this.add(this.#dropdown);
    this.add(this.#openLibraryButton);

    setupDnD(this.#labeledFieldView);

    this.#dropdown.isOpen = true;
    if (this.#dropdown.toolbarView?.element) {
      this.#dropdown.toolbarView.element.style.maxHeight = "160px";
      this.#dropdown.toolbarView.element.style.overflowY = "auto";
      this.#dropdown.toolbarView.element.style.alignItems = "flex-start";
    }
    this.#dropdown.isOpen = false;

    const updateItems = (filterValue: string, uriPaths: string[]) => {
      if (!this.#isVisible) {
        return;
      }
      const { toolbarView } = this.#dropdown;
      if (toolbarView) {
        if (!uriPaths.length) {
          toolbarView.items.forEach((view) => view.destroy());
          toolbarView.items.clear();
          if (filterValue.length >= this.#minFilterValueLength) {
            const view = new ButtonView(locale);
            view.set("label", locale.t("No results found"));
            view.withText = true;
            view.set("isEnabled", false);
            toolbarView.items.add(view);
          } else if (filterValue.length) {
            const view = new ButtonView(locale);
            view.set("label", locale.t("Enter at least 3 characters to search"));
            view.withText = true;
            view.set("isEnabled", false);
            toolbarView.items.add(view);
          }
        } else {
          const toRemove = toolbarView.items.filter((item) => {
            const uriPath = uriPathsMap.get(item);
            return !uriPath || !uriPaths.includes(uriPath);
          });
          const toAdd = uriPaths.filter((uriPath) => {
            const view = viewsMap.get(uriPath);
            return !view || !toolbarView.items.find((item) => item === view);
          });
          toRemove.forEach((view) => {
            toolbarView.items.remove(view);
            view.destroy();
            const uriPath = uriPathsMap.get(view);
            uriPathsMap.delete(view);
            uriPath && viewsMap.delete(uriPath);
          });
          toAdd.forEach((uriPath) => {
            const view = createContentLinkSuggestion({ editor, uriPath, onClick: onClickOnLink });
            toolbarView.items.add(view);
            uriPathsMap.set(view, uriPath);
            viewsMap.set(uriPath, view);
          });
        }
      }
      uriPaths.length && this.#dropdown.focus();
    };

    this.#filterValueSubject
      .pipe(
        debounce((filterValue) =>
          interval(filterValue.length >= this.#minFilterValueLength ? this.#debounceInterval : 0),
        ),
        switchMap((filterValue) =>
          combineLatest([
            of(filterValue),
            filterValue.length >= this.#minFilterValueLength ? observeContentSuggestions(filterValue) : of([]),
          ]),
        ),
      )
      .subscribe(([filterValue, uriPaths]) => updateItems(filterValue, uriPaths));

    this.#labeledFieldView.fieldView.on("input", (evt, inputEvent: { target: { value?: string } }) => {
      const value = inputEvent.target?.value;
      if (!this.#dropdown.isOpen) {
        this.#dropdown.isOpen = true;
        this.#labeledFieldView.fieldView.focus();
      }
      this.#onFieldValueChange(value ?? "");
    });

    parent.element && this.setParent(parent.element);

    this.#labeledFieldView.element?.addEventListener("focusin", () => {
      if (!this.#dropdown.isOpen) {
        this.#dropdown.isOpen = true;
        this.#labeledFieldView.fieldView.focus();
        this.#filterValueSubject.next(this.#filterValueSubject.getValue());
      }
    });
  }

  #onFieldValueChange(value: string): void {
    this.#filterValueSubject.next(value);
    this.#onChangeInputValue(value);
  }

  setupPositionInParent(beforeElement: Node | null) {
    this.#parent.registerChild(this.#dropdown);
    if (this.#dropdown.element && this.#parent.element) {
      this.#parent.children.get(2)?.element?.insertBefore(this.#dropdown.element, beforeElement);
    }

    if (this.#dropdown.element) {
      this.#dropdown.element.classList.add("cm-ck-content-link-suggester");
    }

    if (this.#openLibraryButton.element && this.#parent.element) {
      this.#parent.children.get(2)?.element?.insertBefore(this.#openLibraryButton.element, beforeElement);
    }

  }

  setupFocusHandling(setupFocus: (views: View[]) => void): void {
    this.#labeledFieldView && this.#openLibraryButton && setupFocus([this.#labeledFieldView, this.#openLibraryButton]);
  }

  setValue(value: string): void {
    this.#labeledFieldView.fieldView.set({ value });
    this.#labeledFieldView.fieldView.element && (this.#labeledFieldView.fieldView.element.value = value);
    this.#filterValueSubject.next(value);
  }

  resetInputValue(): void {
    this.#labeledFieldView.fieldView.set({ value: "" });
    this.#labeledFieldView.fieldView.element && (this.#labeledFieldView.fieldView.element.value = "");
  }

  resetFilterValue(): void {
    this.#filterValueSubject.next("");
  }

  focus(): void {
    this.#labeledFieldView.focus();
  }

  isVisible(): boolean {
    return this.#isVisible;
  }

  setVisible(visible: boolean) {
    this.#isVisible = visible;
    this.#dropdown.element && (this.#dropdown.element.style.display = visible ? "" : "none");
    this.#openLibraryButton.element && (this.#openLibraryButton.element.style.display = visible ? "" : "none");
    if (!visible) {
      this.#dropdown.toolbarView?.items.forEach((view) => view.destroy());
      this.#dropdown.toolbarView?.items.clear();
    }
  }
}
