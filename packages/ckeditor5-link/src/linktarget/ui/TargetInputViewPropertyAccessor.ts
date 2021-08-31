/**
 * An interface to cast the targetInputView of LinkFormViewExtension to, to access the properties in a typed way
 * without issues of eslint.
 */
export default interface TargetInputViewPropertyAccessor {
  hiddenTarget: string;
}
