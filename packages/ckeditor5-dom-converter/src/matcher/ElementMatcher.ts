import { compileElementMatcherPattern, ElementMatcherPattern, ElementPredicate } from "./Element";
import { Matcher } from "./Matcher";

/**
 * Matcher for elements.
 */
export class ElementMatcher implements Matcher<Element, ReturnType<ElementPredicate>>{
  readonly #predicate: ElementPredicate;

  constructor(pattern: ElementMatcherPattern) {
    this.#predicate = compileElementMatcherPattern(pattern);
  }

  match(element: Element): ReturnType<ElementPredicate> {
    return this.#predicate(element);
  }
}
