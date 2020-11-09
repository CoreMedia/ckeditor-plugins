// Type definitions for @ckeditor/ckeditor5-paste-from-office
// Project: https://github.com/ckeditor/ckeditor5
// TypeScript Version: 2.3

import * as core from "@ckeditor/ckeditor5-core";
import * as clipboard from "@ckeditor/ckeditor5-clipboard";

/**
 * @see <a href="https://ckeditor.com/docs/ckeditor5/latest/api/module_paste-from-office_pastefromoffice-PasteFromOffice.html">Class PasteFromOffice (paste-from-office/pastefromoffice~PasteFromOffice) - CKEditor 5 API docs</a>
 */
// @ts-ignore: Failed fixing 'requires'. TODO[cke]
export class PasteFromOffice extends core.Plugin {
  static readonly pluginName: "PasteFromOffice";

  static readonly requires: [
    clipboard.Clipboard
  ];
}

/**
 * Augments data by an attribute, which signals, if it has been processed
 * by paste-from-office.
 */
export class PasteFromOfficeClipboardEventData extends clipboard.ClipboardEventData {
  isTransformedWithPasteFromOffice: boolean;
}
