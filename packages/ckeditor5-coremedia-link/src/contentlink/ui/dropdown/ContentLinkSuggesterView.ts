import {
  addToolbarToDropdown,
  ButtonView,
  createDropdown,
  createLabeledInputText,
  DropdownView,
  Editor,
  InputTextView,
  LabeledFieldView,
  View,
  ViewCollection,
} from "ckeditor5";
import LibraryButtonView from "../LibraryButtonView";
import { serviceAgent } from "@coremedia/service-agent";
import { createContentSearchServiceDescriptor } from "@coremedia/ckeditor5-coremedia-studio-integration";
import { createContentLinkSuggestion } from "./createContentLinkSuggestion";
import { BehaviorSubject, combineLatest, debounce, from, interval, of, switchMap } from "rxjs";

interface ContentLinkSuggesterViewProps {
  editor: Editor;
  parent: View;
  onChangeInputValue: (value: string) => void;
  onClickOnLink: (uriPath: string) => void;
  onOpenLibrary: () => void;
  setupDnD: (field: LabeledFieldView) => void;
  options?: { debounceInterval?: number; minFilterValueLength?: number };
}

export class ContentLinkSuggesterView extends ViewCollection {
  readonly #parent: View;
  readonly #minFilterValueLength: number;
  readonly #debounceInterval: number;

  readonly #labeledFieldView: LabeledFieldView<InputTextView>;
  readonly #openLibraryButton: ButtonView;
  readonly #dropdown: DropdownView;
  readonly #filterValueSubject: BehaviorSubject<string>;

  constructor({
    editor,
    parent,
    onChangeInputValue,
    onClickOnLink,
    onOpenLibrary,
    setupDnD,
    options,
  }: ContentLinkSuggesterViewProps) {
    super([]);

    this.#parent = parent;
    this.#minFilterValueLength = options?.minFilterValueLength ?? 3;
    this.#debounceInterval = options?.debounceInterval ?? 500;

    const { locale } = editor;

    this.#filterValueSubject = new BehaviorSubject("");

    this.#labeledFieldView = new LabeledFieldView<InputTextView>(locale, createLabeledInputText);
    this.#labeledFieldView.label = locale.t("Link");
    this.#labeledFieldView.fieldView.set({
      placeholder: locale.t("Type to search content, enter url or drag and drop content onto this area."),
    });

    this.#openLibraryButton = new LibraryButtonView(onOpenLibrary, editor.locale.t("Open Library"), editor.locale);

    this.#filterValueSubject.subscribe((value) => onChangeInputValue(value));

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
      const { toolbarView } = this.#dropdown;
      if (toolbarView) {
        if (!uriPaths.length) {
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
          toRemove.forEach((view) => toolbarView.items.remove(view));
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

    combineLatest([
      from(serviceAgent.fetchService(createContentSearchServiceDescriptor())),
      this.#filterValueSubject.pipe(
        debounce((filterValue) =>
          interval(filterValue.length >= this.#minFilterValueLength ? this.#debounceInterval : 0),
        ),
      ),
    ])
      .pipe(
        switchMap(([contentSearchService, filterValue]) =>
          combineLatest([
            of(filterValue),
            filterValue.length >= this.#minFilterValueLength
              ? contentSearchService.observe_contentSuggestions(filterValue)
              : of([]),
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
      if (typeof value !== "string") {
        this.#filterValueSubject.next("");
        return;
      }
      this.#filterValueSubject.next(value);
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

  setupPositionInParent(beforeElement: Node | null) {
    this.#parent.registerChild(this.#dropdown);
    this.#dropdown.element && this.#parent.element?.insertBefore(this.#dropdown.element, beforeElement);
    this.#openLibraryButton.element &&
      this.#parent.element?.insertBefore(this.#openLibraryButton.element, beforeElement);
  }

  setupFocusHandling(setupFocus: (views: View[]) => void): void {
    this.#labeledFieldView && this.#openLibraryButton && setupFocus([this.#labeledFieldView, this.#openLibraryButton]);
  }

  resetInputValue(): void {
    this.#labeledFieldView.fieldView.value = "";
  }

  resetFilterValue(): void {
    this.#filterValueSubject.next("");
  }

  focus(): void {
    this.#labeledFieldView.focus();
  }

  isVisible(): boolean {
    return this.#dropdown.element?.style.display !== "none";
  }

  setVisible(visible: boolean) {
    this.#dropdown.element && (this.#dropdown.element.style.display = visible ? "" : "none");
    this.#openLibraryButton.element && (this.#openLibraryButton.element.style.display = visible ? "" : "none");
  }
}
