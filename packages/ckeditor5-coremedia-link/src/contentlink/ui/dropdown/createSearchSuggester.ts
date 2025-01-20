import { InputTextView, createDropdown, DropdownView, Editor, addToolbarToDropdown } from "ckeditor5";
import { createContentLinkSuggestion } from "./createContentLinkSuggestion";

/**
 *
 */
export function createSearchSuggester(editor: Editor): DropdownView {
  const locale = editor.locale;
  const inputTextView = new InputTextView(locale);

  const items = [];

  const item1 = createContentLinkSuggestion(editor);
  const item2 = createContentLinkSuggestion(editor);
  const item3 = createContentLinkSuggestion(editor);
  const item4 = createContentLinkSuggestion(editor);
  const item5 = createContentLinkSuggestion(editor);

  items.push(item1);
  items.push(item2);
  items.push(item3);
  items.push(item4);
  items.push(item5);

  //@ts-expect-error We are using this method with a textField even though it expects a buttonView.
  const dropdown = createDropdown(locale, inputTextView);

  addToolbarToDropdown(dropdown, items, { isVertical: true });
  dropdown.render();

  inputTextView.on("input", (evt, inputEvent: Event) => {
    //@ts-expect-error eventtarget has no value
    const length = (inputEvent.target.value as string).length;

    if (length >= 3) {
      dropdown.toolbarView?.items.add(createContentLinkSuggestion(editor));
      dropdown.isOpen = true;
      dropdown.focus();
    } else {
      dropdown.isOpen = false;
    }
    console.log(length, "chars");
  });

  return dropdown;
}
