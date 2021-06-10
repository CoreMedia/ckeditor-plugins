import InputTextView from "../inputtext/inputtextview";
import LabeledFieldView from "./labeledfieldview";
//@ts-ignore
import DropdownView from "@ckeditor/ckeditor5-ui/src/dropdown/dropdownview";

export function createLabeledDropdown(
  labeledFieldView: LabeledFieldView<DropdownView>,
  viewUid: string,
  statusUid: string,
): DropdownView;

export function createLabeledInputText(
  labeledFieldView: LabeledFieldView<InputTextView>,
  viewUid: string,
  statusUid: string,
): InputTextView;
