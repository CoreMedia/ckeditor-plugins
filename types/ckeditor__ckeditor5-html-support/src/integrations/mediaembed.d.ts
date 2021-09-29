import Editor from "@ckeditor/ckeditor5-core/src/editor/editor";
import Plugin from "@ckeditor/ckeditor5-core/src/plugin";

/**
 * Provides the General HTML Support integration with {@link module:media-embed/mediaembed~MediaEmbed Media Embed} feature.
 *
 * @extends module:core/plugin~Plugin
 */
export default class MediaEmbedElementSupport extends Plugin {
  static get requires(): Array<new(editor: Editor) => Plugin>;

  init(): null;
}
