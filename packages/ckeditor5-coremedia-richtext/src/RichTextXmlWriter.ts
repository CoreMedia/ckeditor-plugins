/**
 * Transforms fragment to a string representing CoreMedia RichText.
 */
export default class RichTextXmlWriter {
  readonly #serializer: XMLSerializer = new XMLSerializer();

  getXml(fragment: Node | DocumentFragment): string {
    const a = [];
    return this.#serializer.serializeToString(fragment);
  }
}
