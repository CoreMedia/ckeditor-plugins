import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import Editor from "@ckeditor/ckeditor5-core/src/editor/editor";
import {
  extractContentUriFromDragEventJsonData,
  receiveUriPathFromDragData,
} from "@coremedia/coremedia-studio-integration/content/DragAndDropUtils";
import { serviceAgent } from "@coremedia/studio-apps-service-agent";
import ContentDisplayService from "@coremedia/coremedia-studio-integration/content/ContentDisplayService";
import ContentDisplayServiceDescriptor from "@coremedia/coremedia-studio-integration/content/ContentDisplayServiceDescriptor";
import { Subscription } from "rxjs";
import EventInfo from "@ckeditor/ckeditor5-utils/src/eventinfo";
import DragDropAsyncSupport from "@coremedia/coremedia-studio-integration/content/DragDropAsyncSupport";
import { requireContentCkeModelUri } from "@coremedia/coremedia-studio-integration/content/UriPath";
import Writer from "@ckeditor/ckeditor5-engine/src/model/writer";
import Position from "@ckeditor/ckeditor5-engine/src/model/position";
import { ROOT_NAME } from "../contentlink/Constants";

export default class ContentLinkClipboard extends Plugin {
  private _contentSubscription: Subscription | undefined = undefined;

  static get pluginName(): string {
    return "ContentLinkClipboard";
  }

  static get requires(): Array<new (editor: Editor) => Plugin> {
    return [];
  }

  init(): Promise<void> | null {
    this.#defineClipboardInputOutput();
    return null;
  }

  #defineClipboardInputOutput(): void {
    const view = this.editor.editing.view;
    const viewDocument = view.document;

    const editor = this.editor;
    // Processing pasted or dropped content.
    this.listenTo(viewDocument, "clipboardInput", (evt, data) => {
      // The clipboard content was already processed by the listener on the higher priority
      // (for example while pasting into the code block).
      if (data.content) {
        return;
      }

      const linkContents: Array<LinkContent> | null = ContentLinkClipboard.#evaluateLinkContent(data);
      if (!linkContents || linkContents.length === 0) {
        return;
      }

      //If it is a content link we have to handle the event asynchronously to fetch data like the content name from a remote service.
      //Therefore we have to stop the event, otherwise we would have to treat the event synchronously.
      evt.stop();
      ContentLinkClipboard.#setInitialSelection(editor, data);
      const dropCondition: DropCondition = ContentLinkClipboard.#createDropCondition(editor, linkContents);
      if (ContentLinkClipboard.#hasOnlyContentLinks(linkContents)) {
        serviceAgent
          .fetchService<ContentDisplayService>(new ContentDisplayServiceDescriptor())
          .then((contentDisplayService: ContentDisplayService): void => {
            for (const index in linkContents) {
              if (!linkContents.hasOwnProperty(index)) {
                continue;
              }
              const isLast = linkContents.length - 1 === Number(index);
              const contentLink = linkContents[index];
              contentDisplayService.name(contentLink.href).then((contentName) => {
                ContentLinkClipboard.#handleContentNameResponse(
                  editor,
                  contentLink.href,
                  contentName,
                  dropCondition,
                  isLast
                );
              });
            }
          });
      } else {
        for (const index in linkContents) {
          if (!linkContents.hasOwnProperty(index)) {
            continue;
          }
          const isLast = linkContents.length - 1 === Number(index);
          const link = linkContents[index];
          ContentLinkClipboard.#writeLink(editor, link.href, link.href, dropCondition, isLast);
        }
      }
    });

    this.listenTo(viewDocument, "dragover", (evt: EventInfo, data) => {
      // The clipboard content was already processed by the listener on the higher priority
      // (for example while pasting into the code block).
      if (data.content) {
        return;
      }

      const linkContent: Array<LinkContent> | null = ContentLinkClipboard.#evaluateLinkContentOnDragover();
      if (!linkContent) {
        return;
      }
      if (ContentLinkClipboard.#hasOnlyContentLinks(linkContent)) {
        const containOnlyLinkables = DragDropAsyncSupport.containsOnlyLinkables(
          linkContent.map<string>((value) => value.href)
        );
        if (containOnlyLinkables) {
          data.dataTransfer.dropEffect = "copy";
        } else {
          data.dataTransfer.dropEffect = "none";
          evt.stop();
        }
      }
    });
  }

  static #handleContentNameResponse(
    editor: Editor,
    uriPath: string,
    contentName: string,
    dropCondition: DropCondition,
    isLast: boolean
  ): void {
    const isLinkableContent = DragDropAsyncSupport.isLinkable(uriPath);
    DragDropAsyncSupport.resetIsLinkableContent(uriPath);
    if (!isLinkableContent) {
      return;
    }
    const contentNameRespectingRoot = contentName ? contentName : ROOT_NAME;
    ContentLinkClipboard.#writeLink(
      editor,
      requireContentCkeModelUri(uriPath),
      contentNameRespectingRoot,
      dropCondition,
      isLast
    );
  }

  static #writeLink(
    editor: Editor,
    href: string,
    linkText: string,
    dropCondition: DropCondition,
    isLast: boolean
  ): void {
    if (dropCondition.multipleContentDrop) {
      ContentLinkClipboard.#writeLinkInOwnParagraph(editor, href, linkText, dropCondition, isLast);
    } else {
      ContentLinkClipboard.#writeLinkInline(editor, href, linkText);
    }
  }

  static #writeLinkInline(editor: Editor, href: string, linkText: string): void {
    editor.model.change((writer: Writer) => {
      const firstPosition = editor.model.document.selection.getFirstPosition();
      if (firstPosition === null) {
        return;
      }
      writer.overrideSelectionGravity();
      const linkElement = writer.createText(linkText, { linkHref: href });
      writer.insert(linkElement, firstPosition);
    });
  }

  static #writeLinkInOwnParagraph(
    editor: Editor,
    href: string,
    linkText: string,
    dropCondition: DropCondition,
    isLast: boolean
  ): void {
    editor.model.change((writer: Writer) => {
      const firstPosition = editor.model.document.selection.getFirstPosition();
      if (firstPosition === null) {
        return;
      }

      const isFirstDocumentPosition = ContentLinkClipboard.#isFirstPositionOfDocument(firstPosition);
      const text = writer.createText(linkText, {
        linkHref: href,
      });
      if (!isFirstDocumentPosition) {
        const split = writer.split(firstPosition);
        writer.insert(text, split.range.end);
      } else {
        writer.insert(text, firstPosition);
      }

      const afterTextPosition = writer.createPositionAt(text, "after");
      if (isLast && !dropCondition.initialDropAtEndOfParagraph) {
        const secondSplit = writer.split(afterTextPosition);
        writer.setSelection(secondSplit.range.end);
      } else {
        writer.setSelection(afterTextPosition);
      }
    });
  }

  static #isFirstPositionOfDocument(position: Position): boolean {
    const path = position.getCommonPath(position);
    for (const pathElement of path) {
      if (pathElement !== 0) {
        return false;
      }
    }
    return true;
  }

  static #evaluateLinkContent(data: DragEvent): Array<LinkContent> | null {
    if (data === null || data.dataTransfer === null) {
      return null;
    }

    const cmUriList = data.dataTransfer.getData("cm/uri-list");

    if (cmUriList) {
      const contentUris = extractContentUriFromDragEventJsonData(cmUriList);
      return ContentLinkClipboard.#toLinkContent(contentUris);
    }

    const url = data.dataTransfer.getData("text/uri-list");
    if (url) {
      return [new LinkContent(false, url)];
    }

    return [];
  }

  static #evaluateLinkContentOnDragover(): Array<LinkContent> | null {
    const contentUriPaths: Array<string> | null = receiveUriPathFromDragData();
    if (!contentUriPaths) {
      //due to we have no data, just set it empty...
      return null;
    }
    return ContentLinkClipboard.#toLinkContent(contentUriPaths);
  }

  static #setInitialSelection(editor: Editor, data: any): void {
    editor.model.change((writer: Writer) => {
      if (data.targetRanges) {
        writer.setSelection(data.targetRanges.map((viewRange: Range) => editor.editing.mapper.toModelRange(viewRange)));
      }
    });
  }

  static #toLinkContent(contentUris: Array<string> | null): Array<LinkContent> {
    if (!contentUris) {
      return [];
    }
    const linkContents: Array<LinkContent> = [];
    for (const contentUri of contentUris) {
      linkContents.push(new LinkContent(true, contentUri));
    }
    return linkContents;
  }

  static #createDropCondition(editor: Editor, links: Array<LinkContent>): DropCondition {
    const multipleContentDrop = links.length > 1;
    const initialDropPosition = editor.model.document.selection.getFirstPosition();
    const initialDropAtEndOfParagraph = initialDropPosition ? initialDropPosition.isAtEnd : false;
    return new DropCondition(multipleContentDrop, initialDropAtEndOfParagraph);
  }

  destroy(): Promise<never> | null {
    if (this._contentSubscription) {
      this._contentSubscription.unsubscribe();
    }
    return null;
  }

  static #hasOnlyContentLinks(linkContents: Array<LinkContent>): boolean {
    for (const linkContent of linkContents) {
      if (!linkContent.isContentLink) {
        return false;
      }
    }
    return true;
  }
}

class LinkContent {
  isContentLink;
  href: string;

  constructor(isContentLink: boolean, href: string) {
    this.isContentLink = isContentLink;
    this.href = href;
  }
}

class DropCondition {
  initialDropAtEndOfParagraph: boolean;
  multipleContentDrop: boolean;
  constructor(multipleContentDrop: boolean, initialDropAtEndOfParagraph: boolean) {
    this.multipleContentDrop = multipleContentDrop;
    this.initialDropAtEndOfParagraph = initialDropAtEndOfParagraph;
  }
}
