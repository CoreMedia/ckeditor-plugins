/**
 * View matcher class.
 *
 * @see <a href="https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_view_matcher-Matcher.html">Class Matcher (engine/view/matcher~Matcher) - CKEditor 5 API docs</a>
 */
export default class Matcher {
}

/**
 * An entity that is a valid pattern recognized by a matcher.
 *
 * @see <a href="https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_view_matcher-MatcherPattern.html">Typedef MatcherPattern (engine/view/matcher~MatcherPattern) - CKEditor 5 API docs</a>
 */
export type MatcherPattern =
  ((element: Element) => null | { name: boolean; attribute?: string[]; }) |
  string |
  RegExp |
  {
    attributes?: { [key: string]: string | RegExp | boolean };
    classes?: string | RegExp | Array<string | RegExp>;
    name?: string | RegExp;
    styles?: { [key: string]: string | RegExp };
  };
