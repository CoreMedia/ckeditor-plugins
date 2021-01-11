export default class Matcher {
}

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
