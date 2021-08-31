import LabeledFieldView from "@ckeditor/ckeditor5-ui/src/labeledfield/labeledfieldview";
import DropdownView from "@ckeditor/ckeditor5-ui/src/dropdown/dropdownview";

/**
 * An interface to cast the linkBehaviorView of LinkFormViewExtension to, to access the properties in a typed way
 * without issues of eslint.
 */
export default interface LinkBehaviorViewPropertyAccessor extends LabeledFieldView<DropdownView> {
  linkBehavior: string;
}
