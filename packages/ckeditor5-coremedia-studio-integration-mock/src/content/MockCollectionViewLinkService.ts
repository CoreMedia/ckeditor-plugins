/* eslint no-restricted-globals: off */

import type { Editor } from "ckeditor5";
import type { CollectionViewLinkService, LinkSearchState } from "@coremedia/ckeditor5-coremedia-studio-integration";

export class MockCollectionViewLinkService implements CollectionViewLinkService {
  readonly #editor: Editor;

  constructor(editor: Editor) {
    this.#editor = editor;
  }

  async showContentInCollectionView(content: string): Promise<boolean> {
    const node: Element = document.createElement("DIV");
    node.classList.add("notification");
    const textNode: Text = document.createTextNode(`Open Content ${content} in Library`);
    node.appendChild(textNode);
    document.getElementById("notifications")?.appendChild(node);
    setTimeout(() => {
      document.getElementById("notifications")?.removeChild(node);
    }, 4000);

    return true;
  }

  async openSearchResult(searchState: LinkSearchState) {
    const node: Element = document.createElement("DIV");
    node.classList.add("notification");
    const textNode: Text = document.createTextNode(`Open Library, searchState: ${JSON.stringify(searchState)}`);
    node.appendChild(textNode);
    document.getElementById("notifications")?.appendChild(node);
    setTimeout(() => {
      document.getElementById("notifications")?.removeChild(node);
    }, 4000);

    return true;
  }

  getName(): string {
    return "collectionViewLinkService";
  }

  getEditor(): Editor {
    return this.#editor;
  }
}
