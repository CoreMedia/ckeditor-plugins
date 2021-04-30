import Range from './range';

/**
 * `LiveRange` is a type of {@link module:engine/model/range~Range Range}
 * that updates itself as {@link module:engine/model/document~Document document}
 * is changed through operations. It may be used as a bookmark.
 *
 * @see <a href="https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_model_liverange-LiveRange.html">Class LiveRange (engine/model/liverange~LiveRange) - CKEditor 5 API docs</a>
 */
export default class LiveRange extends Range {
  constructor(start: any, end: any);

  detach(): void;

  is(type: string): boolean;

  toRange(): Range;

  static fromRange(range: Range): LiveRange;
}
