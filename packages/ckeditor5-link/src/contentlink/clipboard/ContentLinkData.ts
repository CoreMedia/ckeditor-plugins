/**
 * Meta-data of a content dropped to CKEditor.
 */
export class ContentLinkData {
  constructor(
    /**
     * Signals, if the given content is the first in a list of dropped contents.
     */
    readonly isFirstInsertedLink: boolean,
    /**
     * Signals, if the given content is the last in a list of dropped contents.
     */
    readonly isLastInsertedLink: boolean,
    /**
     * The text to write to CKEditor (the name of the content).
     */
    readonly text: string,
    /**
     * The URI-Path of the content, e.g., `content/42`.
     */
    readonly contentUri: string,
    /**
     * The respective `linkHref` value to set in model, e.g., `content:42`.
     */
    readonly href: string
  ) {}
}
