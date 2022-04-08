import { contentUriPath } from "@coremedia/ckeditor5-coremedia-studio-integration/content/UriPath";

export interface CommonAttributes {
  class?: string;
}

export interface ImageAttributes extends CommonAttributes {
  alt: string;
}

const IMAGE_ATTRIBUTES_DEFAULT: ImageAttributes = {
  alt: "",
}

export class RichTexts {
  // noinspection HttpUrlsUsage
  static readonly #divAttrs = {
    xmlns: "http://www.coremedia.com/2003/richtext-1.0",
    "xmlns:xlink": "http://www.w3.org/1999/xlink"
  };

  static #joinAttributes(attrs: Record<string, unknown>, keyFilter: (k: string) => boolean = () => true): string {
    return Object.entries(attrs)
      .filter(([k]) => {
        return keyFilter(k);
      })
      .map(([k, v]) => `${k}="${v}"`)
      .join(" ");
  }

  static richtext(...contents: string[]): string {
    const content = contents.join();
    const hasXLink = content.indexOf("xlink:") >= 0;
    const attrs = RichTexts.#joinAttributes(RichTexts.#divAttrs, (k) => k !== "xmlns:xlink" || hasXLink);
    return `<?xml version="1.0" encoding="utf-8"?><div ${attrs}>${content}</div>`;
  }

  static img(contentId: number, attrs: Partial<ImageAttributes> = {}): string {
    const uriPath = contentUriPath(contentId);
    // The actual property does not matter for mocking here.
    const href = `${uriPath}#properties.data`;
    const imageAttrs = {
      ...IMAGE_ATTRIBUTES_DEFAULT,
      ...attrs,
      "xlink:href": href,
    };
    const imgElementAttrs = RichTexts.#joinAttributes(imageAttrs);
    // noinspection HtmlRequiredAltAttribute
    return `<img ${imgElementAttrs}/>`;
  }

  static p(contents: string[], attrs: Partial<CommonAttributes> = {}): string {
    const content = contents.join();
    const elemAttrs = RichTexts.#joinAttributes(attrs);
    return `<p${elemAttrs ? ` ${elemAttrs}` : ""}>${content}</p>`
  }
}
