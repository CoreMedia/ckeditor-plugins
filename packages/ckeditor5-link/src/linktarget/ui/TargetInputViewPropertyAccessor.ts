import LabeledFieldView from "@ckeditor/ckeditor5-ui/src/labeledfield/labeledfieldview";
import DropdownView from "@ckeditor/ckeditor5-ui/src/dropdown/dropdownview";

/**
 * An interface to cast the targetInputView of LinkFormViewExtension to, to access the properties in a typed way
 * without issues of eslint.
 */
export default interface TargetInputViewPropertyAccessor extends LabeledFieldView<DropdownView> {
  hiddenTarget: string;
}
