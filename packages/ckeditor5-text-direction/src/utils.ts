import type { Locale } from "ckeditor5";

export type TextDirectionOption = "ltr" | "rtl";

export const textDirectionOptions: TextDirectionOption[] = ["ltr", "rtl"];

export const textDirectionAttributeName = "dir";

export function isDefault(dirValue: TextDirectionOption, locale: Locale) {
  // Right now only LTR is supported so the 'left' value is always the default one.

  if (locale.contentLanguageDirection == "rtl") {
    return dirValue === "rtl";
  } else {
    return dirValue === "ltr";
  }
}
