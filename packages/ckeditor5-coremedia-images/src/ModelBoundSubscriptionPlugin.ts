import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import Editor from "@ckeditor/ckeditor5-core/src/editor/editor";
import ModelElement from "@ckeditor/ckeditor5-engine/src/model/element";
import { DiffItemInsert } from "@ckeditor/ckeditor5-engine/src/model/differ";
import Writer from "@ckeditor/ckeditor5-engine/src/model/writer";
import RootElement from "@ckeditor/ckeditor5-engine/src/model/rootelement";
import SubscriptionCache from "./SubscriptionCache";
import { Subscription } from "rxjs";

/**
 * The ModelBoundSubscriptionPlugin enables to store subscriptions for a model element.
 * If a ModelElement has a subscription to an asynchronous service (e.g. image xlink-href which resolves the src attribute asynchronously)
 * this plugin can be used to track those subscriptions.
 * Tracked subscriptions will be unsubscribed on destroy or when the ModelElement has been removed from the document.
 *
 * The plugin generates an attribute `cmSubscriptionId` for inserted registered model elements.
 * Listens to changes in the document regarding the registered model elements.
 * If a registered model element is removed all subscriptions will be unsubscribed.
 * Subscriptions have to be added manually to the `ModelBoundSubscriptionPlugin` by calling `addSubscription`.
 */
export default class ModelBoundSubscriptionPlugin extends Plugin {
  static readonly #modelElements: Array<string> = [];
  static readonly ID_MODEL_ATTRIBUTE_NAME = "cmSubscriptionId";
  static readonly #SUBSCRIPTION_CACHE: SubscriptionCache = new SubscriptionCache();
  static readonly PLUGIN_NAME = "ModelBoundSubscriptionPlugin";

  static get pluginName(): string {
    return ModelBoundSubscriptionPlugin.PLUGIN_NAME;
  }

  static get requires(): Array<new (editor: Editor) => Plugin> {
    return [];
  }

  afterInit(): null {
    this.#addSubscriptionIdToInsertedElementListener();
    this.#unsubscribeOnElementRemoval();
    return null;
  }

  destroy(): null {
    ModelBoundSubscriptionPlugin.#SUBSCRIPTION_CACHE.unsubscribeAll();
    return null;
  }

  /**
   * Add a subscription to the subscription cache for unsubscription on related model changes.
   *
   * @param modelElement - the model element related to the subscription (must contain the `cmSubscriptionId`).
   * @param subscription - the subscription
   */
  addSubscription(modelElement: ModelElement, subscription: Subscription): void {
    const subscriptionId = modelElement.getAttribute(ModelBoundSubscriptionPlugin.ID_MODEL_ATTRIBUTE_NAME);
    if (!subscriptionId) {
      return;
    }
    ModelBoundSubscriptionPlugin.#SUBSCRIPTION_CACHE.addSubscription(subscriptionId, subscription);
  }

  /**
   * Registers a model element to be tracked by the plugin.
   * This means for the model elements the attribute `cmSubscriptionId` will be generated on insertion and
   * added subscriptions will be unsubscribed on element removal and document desotrying.
   *
   * @param modelElementName - the model element name which is tracked.
   */
  registerModelElement(modelElementName: string): void {
    ModelBoundSubscriptionPlugin.#modelElements.push(modelElementName);
    this.editor.model.schema.extend(modelElementName, {
      allowAttributes: [ModelBoundSubscriptionPlugin.ID_MODEL_ATTRIBUTE_NAME],
    });
  }

  #unsubscribeOnElementRemoval(): void {
    this.editor.model.document.on("change:data", () => {
      const changes = this.editor.model.document.differ.getChanges({ includeChangesInGraveyard: true });
      const insertsOnGraveyard = changes
        .filter((change) => change.type === "insert")
        .map((value) => value as DiffItemInsert)
        .filter(ModelBoundSubscriptionPlugin.#isOnGraveyard);
      const allRemovedElementsWithSubscriptions: Array<ModelElement> = [];

      for (const entry of insertsOnGraveyard) {
        const nodeAfter = entry.position.nodeAfter;
        if (nodeAfter && nodeAfter.is("element")) {
          allRemovedElementsWithSubscriptions.push(
            ...ModelBoundSubscriptionPlugin.#recursiveSearch(nodeAfter as ModelElement)
          );
        }
      }
      for (const modelElement of allRemovedElementsWithSubscriptions) {
        const id = modelElement.getAttribute(ModelBoundSubscriptionPlugin.ID_MODEL_ATTRIBUTE_NAME);
        ModelBoundSubscriptionPlugin.#SUBSCRIPTION_CACHE.unsubscribe(id);
      }
    });
  }

  #addSubscriptionIdToInsertedElementListener(): void {
    this.editor.model.document.on("change:data", () => {
      const changes = this.editor.model.document.differ.getChanges();
      //find all elements which have been inserted in the current change set.
      const insertions = changes
        .filter((diffItem) => diffItem.type === "insert")
        .map((diffItem) => diffItem as DiffItemInsert)
        .map((diffItem) => diffItem.position.nodeAfter)
        .filter((value) => value !== null && value.is("element"))
        .map((value) => value as ModelElement);

      const insertedRegisteredElements: Array<ModelElement> = [];
      for (const insertion of insertions) {
        insertedRegisteredElements.push(...ModelBoundSubscriptionPlugin.#findRegisteredModelElements(insertion));
      }
      this.editor.model.enqueueChange("transparent", (writer: Writer) => {
        for (const insertedElement of insertedRegisteredElements) {
          writer.setAttribute(ModelBoundSubscriptionPlugin.ID_MODEL_ATTRIBUTE_NAME, Math.random(), insertedElement);
        }
      });
    });
  }

  static #isOnGraveyard(insert: DiffItemInsert): boolean {
    const rootElement = insert.position.root;
    if (rootElement.is("rootElement")) {
      return (rootElement as RootElement).rootName === "$graveyard";
    }
    return false;
  }

  static #recursiveSearch(element: ModelElement): Array<ModelElement> {
    if (ModelBoundSubscriptionPlugin.#isSubscribedModel(element)) {
      return [element];
    }
    const children = Array.from(element.getChildren());
    const modelElements: Array<ModelElement> = [];
    for (const child of children) {
      if (child.is("element")) {
        modelElements.push(...this.#recursiveSearch(child as ModelElement));
      }
    }
    return modelElements;
  }

  static #findRegisteredModelElements(element: ModelElement): Array<ModelElement> {
    if (ModelBoundSubscriptionPlugin.#isSubscribedModel(element)) {
      return [element];
    }
    const children = Array.from(element.getChildren());
    const modelElements = [];
    for (const child of children) {
      if (child.is("element")) {
        modelElements.push(...ModelBoundSubscriptionPlugin.#findRegisteredModelElements(child as ModelElement));
      }
    }
    return modelElements;
  }

  /**
   * Determines if a element is registered.
   *
   * @param element - the model element to check
   * @private
   */
  static #isSubscribedModel(element: ModelElement): boolean {
    for (const subscribedElement of this.#modelElements) {
      if (element.is("element", subscribedElement)) {
        return true;
      }
    }
    return false;
  }
}
