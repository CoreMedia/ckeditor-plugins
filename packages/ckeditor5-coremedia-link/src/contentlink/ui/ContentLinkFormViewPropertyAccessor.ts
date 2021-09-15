import LinkFormView from "@ckeditor/ckeditor5-link/src/ui/linkformview";

export default interface ContentLinkFormViewPropertyAccessor extends LinkFormView {
  contentUriPath: string;
  contentName: unknown;
}
