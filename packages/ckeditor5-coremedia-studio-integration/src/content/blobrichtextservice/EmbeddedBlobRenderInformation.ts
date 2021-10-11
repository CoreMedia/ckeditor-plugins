export default class EmbeddedBlobRenderInformation {
  set contentName(value: string) {
    this._contentName = value;
  }
  get url(): string {
    return this._url;
  }

  set url(value: string) {
    this._url = value;
  }

  private _url!: string;
  private _contentName!: string;
}
