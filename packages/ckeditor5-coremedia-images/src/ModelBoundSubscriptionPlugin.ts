/* eslint no-null/no-null: off */

import { Plugin, Element as ModelElement, Writer, DiffItemInsert } from "ckeditor5";
import SubscriptionCache from "./SubscriptionCache";
import { Subscription } from "rxjs";

/**
 * The ModelBoundSubscriptionPlugin enables to store subscriptions for a model
 * element.
 *
 * If a ModelElement has a subscription to an asynchronous service
 * (e.g., image `xlink-href`, which resolves the `src` attribute asynchronously),
 * this plugin can be used to track those subscriptions.
 *
 * Tracked subscriptions will be unsubscribed on destroy or when the
 * ModelElement has been removed from the document.
 *
 * The plugin generates an attribute `cmSubscriptionId` for inserted registered
 * model elements. It listens to changes in the document regarding the
 * registered model elements.
 *
 * If a registered model element is removed, all subscriptions will be
 * unsubscribed. Subscriptions have to be added manually to the
 * `ModelBoundSubscriptionPlugin` by calling `addSubscription`.
 */
export default class ModelBoundSubscriptionPlugin extends Plugin {
  static readonly #modelElements: string[] = [];
  static readonly ID_MODEL_ATTRIBUTE_NAME = "cmSubscriptionId";
  static readonly #SUBSCRIPTION_CACHE: SubscriptionCache = new SubscriptionCache();
  static readonly PLUGIN_NAME = "ModelBoundSubscriptionPlugin";
  static readonly pluginName = "ModelBoundSubscriptionPlugin";

  /**
   * Registers `change:data` listeners.
   */
  afterInit(): void {
    this.#addSubscriptionIdToInsertedElementListener();
    this.#unsubscribeOnElementRemoval();
  }

  /**
   * Makes sure to unsubscribe all subscriptions when the editor is destroyed.
   */
  override destroy(): void {
    ModelBoundSubscriptionPlugin.#SUBSCRIPTION_CACHE.unsubscribeAll();
  }

  /**
   * Add a subscription to the subscription cache for unsubscription on related
   * model changes.
   *
   * @param modelElement - the model element related to the subscription (must
   * contain the `cmSubscriptionId`).
   * @param subscription - the subscription
   */
  addSubscription(modelElement: ModelElement, subscription: Subscription): void {
    const subscriptionId = modelElement.getAttribute(ModelBoundSubscriptionPlugin.ID_MODEL_ATTRIBUTE_NAME);
    if (typeof subscriptionId !== "string" || !subscriptionId) {
      return;
    }
    ModelBoundSubscriptionPlugin.#SUBSCRIPTION_CACHE.addSubscription(subscriptionId, subscription);
  }

  /**
   * Registers a model element to be tracked by the plugin.
   *
   * This means for the model elements the attribute `cmSubscriptionId` will be
   * generated on insertion and added subscriptions will be unsubscribed on
   * element removal and document destroying.
   *
   * @param modelElementName - the model element name, which is tracked.
   */
  registerModelElement(modelElementName: string): void {
    ModelBoundSubscriptionPlugin.#modelElements.push(modelElementName);
    this.editor.model.schema.extend(modelElementName, {
      allowAttributes: [ModelBoundSubscriptionPlugin.ID_MODEL_ATTRIBUTE_NAME],
    });
  }

  /**
   * Adds a `change:data` listener to the model document, which searches for
   * removed registered model elements on the graveyard (removed elements)
   * If a registered model element is found on the graveyard it unsubscribes all
   * added subscriptions.
   *
   * The search is recursive if a container gets removed. Elements contained
   * in the container are not an explicit change in the change set.
   */
  #unsubscribeOnElementRemoval(): void {
    this.editor.model.document.on("change:data", () => {
      const changes = this.editor.model.document.differ.getChanges({
        includeChangesInGraveyard: true,
      });
      const insertsOnGraveyard = changes
        .filter((change) => change.type === "insert") // an insert on the graveyard means a removal on the root document
        .map((value) => value as DiffItemInsert)
        .filter(ModelBoundSubscriptionPlugin.#isOnGraveyard);
      const allRemovedElementsWithSubscriptions: ModelElement[] = [];
      for (const entry of insertsOnGraveyard) {
        const nodeAfter = entry.position.nodeAfter;
        if (nodeAfter?.is("element")) {
          allRemovedElementsWithSubscriptions.push(
            ...ModelBoundSubscriptionPlugin.#recursiveSearch(nodeAfter as ModelElement),
          );
        }
      }
      for (const modelElement of allRemovedElementsWithSubscriptions) {
        const id = modelElement.getAttribute(ModelBoundSubscriptionPlugin.ID_MODEL_ATTRIBUTE_NAME);
        if (typeof id === "string") {
          ModelBoundSubscriptionPlugin.#SUBSCRIPTION_CACHE.unsubscribe(id);
        }
      }
    });
  }

  /**
   * Adds a `change:data` listener to the model document, which adds a
   * `cmSubscriptionId` for registered model elements.
   *
   * The search is recursive if a container gets removed. Elements contained
   * in the container are not an explicit change in the change set.
   */
  #addSubscriptionIdToInsertedElementListener(): void {
    this.editor.model.document.on("change:data", () => {
      const changes = this.editor.model.document.differ.getChanges();
      //find all elements, which have been inserted in the current change set.
      const insertions = changes
        .filter((diffItem) => diffItem.type === "insert")
        .map((diffItem) => diffItem as DiffItemInsert)
        .map((diffItem) => diffItem.position.nodeAfter)
        .filter((value) => value?.is("element"))
        .map((value) => value as ModelElement);
      const insertedRegisteredElements: ModelElement[] = [];
      for (const insertion of insertions) {
        insertedRegisteredElements.push(...ModelBoundSubscriptionPlugin.#findRegisteredModelElements(insertion));
      }
      this.editor.model.enqueueChange(
        {
          isUndoable: false,
        },
        (writer: Writer) => {
          for (const insertedElement of insertedRegisteredElements) {
            writer.setAttribute(ModelBoundSubscriptionPlugin.ID_MODEL_ATTRIBUTE_NAME, Math.random(), insertedElement);
          }
        },
      );
    });
  }

  /**
   * Checks if the given change is an element on the graveyard.
   *
   * @param insert - the insert change.
   */
  static #isOnGraveyard(insert: DiffItemInsert): boolean {
    const rootElement = insert.position.root;
    if (rootElement.is("rootElement")) {
      return rootElement.rootName === "$graveyard";
    }
    return false;
  }

  static #recursiveSearch(element: ModelElement): ModelElement[] {
    if (ModelBoundSubscriptionPlugin.#isSubscribedModel(element)) {
      return [element];
    }
    const children = Array.from(element.getChildren());
    const modelElements: ModelElement[] = [];
    for (const child of children) {
      if (child.is("element")) {
        modelElements.push(...this.#recursiveSearch(child as ModelElement));
      }
    }
    return modelElements;
  }

  static #findRegisteredModelElements(element: ModelElement): ModelElement[] {
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
