import Editor from "@ckeditor/ckeditor5-core/src/editor/editor";
import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import { MatcherPattern } from "@ckeditor/ckeditor5-engine/src/view/matcher";

/**
 * Allows to validate elements and element attributes registered by {@link module:html-support/dataschema~DataSchema}.
 *
 * To enable registered element in the editor, use {@link module:html-support/datafilter~DataFilter#allowElement} method:
 *
 *    dataFilter.allowElement( 'section' );
 *
 * You can also allow or disallow specific element attributes:
 *
 *    // Allow `data-foo` attribute on `section` element.
 *    dataFilter.allowAttributes( {
 *			name: 'section',
 *			attributes: {
 *				'data-foo': true
 *			}
 *		} );
 *
 *    // Disallow `color` style attribute on 'section' element.
 *    dataFilter.disallowAttributes( {
 *			name: 'section',
 *			styles: {
 *				color: /[\s\S]+/
 *			}
 *		} );
 *
 * @extends module:core/plugin~Plugin
 */
export default class DataFilter extends Plugin {
  /**
   * @inheritDoc
   */
  static get pluginName(): string;

  /**
   * @inheritDoc
   */
  static readonly requires?: Array<new(editor: Editor) => Plugin>;

  constructor(editor: Editor);

  /**
   * Load a configuration of one or many elements, where their attributes should be allowed.
   *
   * @param {Array.<module:engine/view/matcher~MatcherPattern>} config Configuration of elements
   * that should have their attributes accepted in the editor.
   */
  loadAllowedConfig(config: MatcherPattern[]): void;

  /**
   * Load a configuration of one or many elements, where their attributes should be disallowed.
   *
   * @param {Array.<module:engine/view/matcher~MatcherPattern>} config Configuration of elements
   * that should have their attributes rejected from the editor.
   */
  loadDisallowedConfig(config: MatcherPattern[]): void;

  /**
   * Allow the given element in the editor context.
   *
   * This method will only allow elements described by the {@link module:html-support/dataschema~DataSchema} used
   * to create data filter.
   *
   * @param {String|RegExp} viewName String or regular expression matching view name.
   */
  allowElement(viewName: string | RegExp): void;

  /**
   * Allow the given attributes for view element allowed by {@link #allowElement} method.
   *
   * @param {module:engine/view/matcher~MatcherPattern} config Pattern matching all attributes which should be allowed.
   */
  allowAttributes(config: MatcherPattern): void;

  /**
   * Disallow the given attributes for view element allowed by {@link #allowElement} method.
   *
   * @param {module:engine/view/matcher~MatcherPattern} config Pattern matching all attributes which should be disallowed.
   */
  disallowAttributes(config: MatcherPattern): void;
}
