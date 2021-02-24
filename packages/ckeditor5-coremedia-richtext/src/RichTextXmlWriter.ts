/**
 * Transforms fragment to a string representing CoreMedia RichText.
 */
export default class RichTextXmlWriter {
  private readonly serializer: XMLSerializer = new XMLSerializer();

  getXml(fragment: Node | DocumentFragment): string {
    return this.serializer.serializeToString(fragment);
  }
}
