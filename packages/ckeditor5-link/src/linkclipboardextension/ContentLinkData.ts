export class ContentLinkData {
  constructor(
    readonly isFirstInsertedLink: boolean,
    readonly isLastInsertedLink: boolean,
    readonly text: string,
    readonly contentUri: string,
    readonly href: string
  ) {}
}
