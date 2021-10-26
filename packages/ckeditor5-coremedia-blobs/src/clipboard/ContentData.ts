/**
 * Meta-data of a content dropped to CKEditor.
 */
export class ContentData {
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
     * The URI-Path of the content, e.g., `content/42`.
     */
    readonly contentUri: string,
    readonly isLinkable: boolean,
    readonly isEmbeddable: boolean,
    readonly placeholderId: string
  ) {}
}
