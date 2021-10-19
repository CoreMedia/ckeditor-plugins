/**
 * View matcher class.
 *
 * @see <a href="https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_view_matcher-Matcher.html">Class Matcher (engine/view/matcher~Matcher) - CKEditor 5 API docs</a>
 */
export default class Matcher {
  constructor(...pattern: MatcherPattern[]);

  add(...pattern: MatcherPattern[]): void;

  getElementName(): string | null;

  match(...element: Element[]): {
    element: Element;
    pattern: MatcherPattern;
    match: {
      name?: boolean | undefined;
      attribute?: string[] | undefined;
      classes?: string[] | undefined;
      styles?: Array<[string, string]> | undefined;
    };
  } | null;

  matchAll(...element: Element[]): Array<{
    element: Element;
    match: {
      name?: boolean | undefined;
      attribute?: string[] | undefined;
      classes?: string[] | undefined;
      styles?: Array<[string, string]> | undefined;
    };
  }> | null;
}

/**
 * An entity that is a valid pattern recognized by a matcher.
 *
 * @see <a href="https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_view_matcher-MatcherPattern.html">Typedef MatcherPattern (engine/view/matcher~MatcherPattern) - CKEditor 5 API docs</a>
 */
export type MatcherPattern =
  | ((element: Element) => void | null | {
  name?: boolean | undefined;
  attribute?: string[] | undefined;
  classes?: string[] | undefined;
  styles?: Array<[string, string]> | undefined;
})
  | string
  | RegExp
  | {
  attributes?:
    | Array<{
    key: string | RegExp;
    value: string | RegExp | boolean;
  }>
    | boolean
    | string
    | RegExp
    | Array<string | RegExp>
    | Record<string, string | RegExp | boolean | number>
    | undefined;
  classes?:
    | Array<{
    key: string | RegExp;
    value: boolean | string | RegExp;
  }>
    | boolean
    | string
    | RegExp
    | Record<string, boolean>
    | Array<string | RegExp>
    | undefined;
  name?: string | RegExp | undefined;
  styles?: RegExp | string | boolean | Record<string, string | RegExp | boolean> | undefined;
};
