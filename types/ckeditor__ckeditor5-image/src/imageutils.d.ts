import Plugin from "@ckeditor/ckeditor5-core/src/plugin";

import ViewElement from "@ckeditor/ckeditor5-engine/src/view/element";

export default class ImageUtils extends Plugin {
  isInlineImageView(element: ViewElement): boolean;
}
