export class ContentLinkData {
  isFirstInsertedLink: boolean;
  isLastInsertedLink: boolean;
  text: string;
  contentUri: string;
  href: string;

  constructor(
    isFirstInsertedLink: boolean,
    isLastInsertedLink: boolean,
    text: string,
    contentUri: string,
    href: string
  ) {
    this.isFirstInsertedLink = isFirstInsertedLink;
    this.isLastInsertedLink = isLastInsertedLink;
    this.text = text;
    this.contentUri = contentUri;
    this.href = href;
  }
}
