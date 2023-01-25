import { byPriority, parseRule, RuleConfig, RuleSection } from "@coremedia/ckeditor5-dom-converter/Rule";
import { RuleBasedHtmlDomConverter } from "@coremedia/ckeditor5-dom-converter/RuleBasedHtmlDomConverter";

/**
 * Lightweight "data processor" just providing access to the DOM Converter API.
 */
export class RuleBasedHtmlDomConverterFactory {
  readonly toDataRules: RuleSection[] = [];
  readonly toViewRules: RuleSection[] = [];

  #addRule(config: RuleConfig): void {
    const { toData, toView } = parseRule(config);
    if (toData) {
      this.toDataRules.push(toData);
    }
    if (toView) {
      this.toViewRules.push(toView);
    }
  }

  addRules(configs: RuleConfig[]): void {
    configs.forEach((config) => this.#addRule(config));
    this.toDataRules.sort(byPriority);
    this.toViewRules.sort(byPriority);
  }

  createToViewConverter(targetDocument: Document): RuleBasedHtmlDomConverter {
    return new RuleBasedHtmlDomConverter(targetDocument, this.toViewRules);
  }

  createToDataConverter(targetDocument: Document): RuleBasedHtmlDomConverter {
    return new RuleBasedHtmlDomConverter(targetDocument, this.toDataRules);
  }
}
