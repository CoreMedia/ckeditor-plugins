import type { ModelWriter, ModelNode } from "ckeditor5";

export type CreateModelFunction = (writer: ModelWriter) => ModelNode;
export type CreateModelFunctionCreator = (contentUri: string) => Promise<CreateModelFunction>;

/**
 * The ContentToModelRegistry is a util class that allows to provide information
 * on how to insert certain content objects into the editor's model.
 *
 * By using {@link registerToModelFunction}, a type/function pair can be registered.
 * All registry entries will then be evaluated in the {@link DataToModelMechanism} to
 * properly insert a content object with a given type (e.g. "link" or "image").
 *
 * The ContentToModelRegistry can be accessed by other plugins via the
 * {@link ContentClipboardEditing} plugin.
 */

export default class ContentToModelRegistry {
  static readonly #contentToModel: Map<string, CreateModelFunctionCreator> = new Map<
    string,
    CreateModelFunctionCreator
  >();

  /**
   * Registers a "toModel" function for a certain type.
   *
   * @param type - the type (identifier) of the content object
   * @param createNodeFunction - a function that describes how to create the editor model element
   */
  static registerToModelFunction(type: string, createNodeFunction: CreateModelFunctionCreator): void {
    ContentToModelRegistry.#contentToModel.set(type, createNodeFunction);
  }

  /**
   * Returns the "toModel" function from the registry for a given type.
   *
   * @param type - the type of the content object
   * @param contentUri - the content uri
   * @returns the "toModel" function or undefined if no entry exists for the given type
   */
  static getToModelFunction(type: string, contentUri: string): Promise<CreateModelFunction> | undefined {
    const createModelFunctionCreator: CreateModelFunctionCreator | undefined =
      ContentToModelRegistry.#contentToModel.get(type);
    if (!createModelFunctionCreator) {
      return undefined;
    }
    return createModelFunctionCreator(contentUri);
  }
}
