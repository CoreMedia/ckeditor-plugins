import { ToViewElementToElementConfig, ToView, toView, ToViewHelpers } from "./ToViewConversion";
import { ConversionApi, DataElementToViewElementByClassConfig, toData, ToData, ToDataHelpers } from "./RichTextDataProcessor";
import { Element } from "@ckeditor/ckeditor5-engine";

export interface Conversion {
  for<T extends ToData | ToView>(direction: T): T extends ToData ? ToDataHelpers : ToViewHelpers;

  /**
   * Convenience methods for frequent use-cases.
   */
  dataElementToViewElementByClass(config: DataElementToViewElementByClassConfig): void;
  // TODO[poc] Should not be exposed for configuration.
  toView(fragment: DocumentFragment): void;
}

class ConversionImpl implements Conversion {
  readonly #toData: ToDataHelpers | undefined;
  readonly #toView: ToViewHelpersImpl = new ToViewHelpersImpl();

  constructor() {}

  toView(fragment: DocumentFragment): void {
    this.#toView.apply(fragment);
  }

  dataElementToViewElementByClass(config: DataElementToViewElementByClassConfig): void {
    this.for(toData).elementToElement({
      view: config.view,
      data: (element: Element, conversionApi: ConversionApi): Element =>
        // TODO[poc] Don't do anything yet. Just sketching API.
        element,
      priority: config.priority,
    });
    this.for(toView).elementToElement({
      data: config.data,
      view: (element: Element, conversionApi: ConversionApi): Element =>
        // TODO[poc] Don't do anything yet. Just sketching API.
        element,
      priority: config.priority,
    });
  }

  for<T extends ToData | ToView>(direction: T): T extends ToData ? ToDataHelpers : ToViewHelpers {
    switch (direction) {
      case toData:
        // @ts-expect-error API not straight here. TODO[poc]
        return {};
      case toView:
        // @ts-expect-error API not straight here. TODO[poc]
        return {};
      default:
        throw new Error(`Unknown direction: ${String(direction)}.`);
    }
  }
}

class ToViewHelpersImpl implements ToViewHelpers {
  readonly #configs: ToViewElementToElementConfig[] = [];
  elementToElement(config: ToViewElementToElementConfig): this {
    this.#configs.push(config);
    return this;
  }

  apply(fragment: DocumentFragment): void {
  }
}
