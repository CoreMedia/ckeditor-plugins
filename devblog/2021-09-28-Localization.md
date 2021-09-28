About providing localized texts
====
Even if CKEditor 5 supports `po`-files we have to use `*.ts` files to define the dictionaries.
`po`-files are preprocessed and variables are not supported. This means something like `t(config.mytitle)` is not resolved to a localized string.
The dictionaries defined in `*.ts` files are loaded dynamically and enables us to localize variables.

An example `*.ts` file with localizations looks like this

````typescript
import { add } from "@ckeditor/ckeditor5-utils/src/translation-service";

add("de", {
  Link: "Verknüpfung",
  "Enter url or drag and drop content onto this area.": "URL angeben oder Inhalt hierher ziehen",
});
````

Providing localized texts - Decisions
====
*Decision*: Localization in plugins must be provided as `*.ts` files.

*Decision*: Localization `*.ts`-files are stored in the folder `src/lang` of each plugin package.

*Decision*: Each feature has its own localization file (e.g. `contentlinks.ts` and `linktarget.ts`).

*Decision*: As recommended in CKEditor 5 documentation we use english text as key for localization.

About passing localized texts to components
===
As documented in CKEditor 5 documentation we simply use the `t()`-function of CKEditor.

Example:
````typescript
 contentLinkView.set({
    label: t("Link")
 });
````


