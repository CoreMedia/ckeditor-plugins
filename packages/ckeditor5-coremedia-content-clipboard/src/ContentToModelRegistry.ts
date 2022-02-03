import Writer from "@ckeditor/ckeditor5-engine/src/model/writer";
import Node from "@ckeditor/ckeditor5-engine/src/model/node";

export type CreateModelFunction = (writer: Writer) => Node;
export type CreateModelFunctionCreator = (contentUri: string) => Promise<CreateModelFunction>;

export default class ContentToModelRegistry {
  static #contentToModel: Map<string, CreateModelFunctionCreator> = new Map<string, CreateModelFunctionCreator>();

  static registerToModelFunction(type: string, createNodeFunction: CreateModelFunctionCreator): void {
    ContentToModelRegistry.#contentToModel.set(type, createNodeFunction);
  }

  static getToModelFunction(type: string, contentUri: string): Promise<CreateModelFunction> | undefined {
    const createModelFunctionCreator: CreateModelFunctionCreator | undefined =
      ContentToModelRegistry.#contentToModel.get(type);
    if (!createModelFunctionCreator) {
      return undefined;
    }
    return createModelFunctionCreator(contentUri);
  }
}
