/* eslint-disable @typescript-eslint/require-await */
/* eslint no-restricted-globals: off */

import { Editor } from "ckeditor5";
import { CollectionViewService } from "@coremedia/ckeditor5-coremedia-studio-integration";

export class MockCollectionViewService implements CollectionViewService {
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

  getName(): string {
    return "collectionViewService";
  }
}
