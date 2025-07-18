export interface LinkSearchState {
  /**
   * The search text that is used for the collection view.
   *
   * Defaults to the empty string.
   */
  searchText?: string;
}

/**
 * Studio App service to open a collection view in a specific state.
 *
 * Use {@link createCollectionViewLinkServiceDescriptor} to create a service descriptor for registering
 * and retrieving services of this type with the `ServiceAgent`.
 *
 * @public
 */
export interface CollectionViewLinkService {
  /**
   * Shows a content in the collection view.
   *
   * The content must be given via a valid Studio Rest content URI and thus must
   * comply to:
   *
   * ```ts
   * ContentImpl#REST_RESOURCE_URI_TEMPLATE
   * ```
   *
   * Additional options can be passed to determine how the content should be shown.
   *
   * @param content The content to show in the collection view, given as a valid Studio Rest content URI.
   * @param options Additional options.
   * @param options.additionalOptions Additional but undetermined options that a service implementation might support
   * @param options.focus Whether the app that opens the form should be focused / brought into the foreground.
   *
   * @returns A promise that resolves to `true` if the content form was shown successfully, or `false` otherwise.
   */
  showContentInCollectionView(
    content: string,
    options?: {
      /**
       * Whether the app that opens the form should be focused / brought into the foreground.
       */
      focus?: boolean;

      /**
       * Additional but undetermined options that a service implementation might support but is not
       * obliged to (for example, one implementation might support a 'view' option to open
       * the content in one specific view or another but other implementations might not).
       */
      additionalOptions?: Record<string, unknown>;
    },
  ): Promise<boolean>;

  /**
   * Open a search result in the collection view, given an unknown/unused searchState
   *
   * @param searchState the search state.
   * @param options Additional options.
   * @param options.additionalOptions Additional but undetermined options that a service implementation might support
   * @param options.focus Whether the app that opens the form should be focused / brought into the foreground.
   *
   * @returns A promise indicating success or failure opening the search result.
   */
  openSearchResult(
    searchState: LinkSearchState,
    options?: {
      /**
       * Whether the app that opens the form should be focused / brought into the foreground.
       */
      focus?: boolean;

      /**
       * Additional but undetermined options that a service implementation might support but is not
       * obliged to (for example, one implementation might support a 'view' option to open
       * the content in one specific view or another but other implementations might not).
       */
      additionalOptions?: Record<string, unknown>;
    },
  ): Promise<boolean>;
}
