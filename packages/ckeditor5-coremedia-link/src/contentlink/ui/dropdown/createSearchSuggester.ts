import {
  addToolbarToDropdown,
  createDropdown,
  createLabeledInputText,
  Editor,
  InputTextView,
  LabeledFieldView,
  View,
} from "ckeditor5";
import { BehaviorSubject, combineLatest, from, of, switchMap } from "rxjs";
import { serviceAgent } from "@coremedia/service-agent";
import { createContentSearchServiceDescriptor } from "@coremedia/ckeditor5-coremedia-studio-integration";
import { createContentLinkSuggestion } from "./createContentLinkSuggestion";

/**
 *
 */
export function createSearchSuggester(editor: Editor) {
  const locale = editor.locale;

  const labeledFieldView = new LabeledFieldView<InputTextView>(locale, createLabeledInputText);
  labeledFieldView.label = "Link (DnD or type)";

  const filterValueObservable = new BehaviorSubject("");

  const uriPathsMap = new Map<View, string>();
  const viewsMap = new Map<string, View>();

  const onClickOnSuggestion = (uriPath: string) => {
    console.log("clicked on content", uriPath);
  };

  //@ts-expect-error We are using this method with a textField even though it expects a buttonView.
  const dropdown = createDropdown(locale, labeledFieldView);
  addToolbarToDropdown(dropdown, [], { isVertical: true });
  dropdown.render();
  dropdown.isOpen = true;
  if (dropdown.toolbarView?.element) {
    dropdown.toolbarView.element.style.maxHeight = "160px";
    dropdown.toolbarView.element.style.overflowY = "auto";
  }

  const updateItems = (uriPaths: string[]) => {
    const { toolbarView } = dropdown;
    if (toolbarView) {
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
        const view = createContentLinkSuggestion({ editor, uriPath, onClick: onClickOnSuggestion });
        toolbarView.items.add(view);
        uriPathsMap.set(view, uriPath);
        viewsMap.set(uriPath, view);
      });
    }
    dropdown.isOpen = !!uriPaths.length;
    uriPaths.length && dropdown.focus();
  };

  combineLatest([from(serviceAgent.fetchService(createContentSearchServiceDescriptor())), filterValueObservable])
    .pipe(
      switchMap(([contentSearchService, filterValue]) =>
        filterValue.length >= 3 ? contentSearchService.observe_contentSuggestions(filterValue) : of([]),
      ),
    )
    .subscribe((uriPaths) => {
      updateItems(uriPaths);
    });

  labeledFieldView.fieldView.on("input", (evt, inputEvent: { target: { value?: string } }) => {
    const value = inputEvent.target?.value;

    if (typeof value !== "string") {
      filterValueObservable.next("");
      return;
    }
    if (value.length >= 3) {
      filterValueObservable.next(value);
      dropdown.isOpen = true;
    } else {
      dropdown.isOpen = false;
    }
  });

  return dropdown;
}
