import { defaultStrictness, Strictness, StrictnessKey } from "../../src/Strictness";
import { RichTextSanitizer } from "../../src/sanitation/RichTextSanitizer";
import { SanitationListener } from "../../src/sanitation/SanitationListener";
import { AttributeCause, ElementCause } from "../../src/sanitation/Causes";
import { richtext } from "@coremedia-internal/ckeditor5-coremedia-example-data/RichTextBase";

class TestSanitationListener extends SanitationListener {
  readonly fatals: string[] = [];
  readonly removedNodes: string[] = [];
  readonly removedInvalidAttrs: string[] = [];

  clear(): void {
    this.fatals.length = 0;
    this.removedNodes.length = 0;
    this.removedInvalidAttrs.length = 0;
  }

  fatal(...data: unknown[]): void {
    this.fatals.push(data.join("|"));
  }

  removeNode(node: Node, cause: ElementCause): void {
    this.removedNodes.push(`${node.nodeName}|${cause}`);
  }

  removeInvalidAttr(attributeOwner: Element, attr: Attr, cause: AttributeCause): void {
    this.removedInvalidAttrs.push(`${attributeOwner.nodeName}.${attr.localName}|${cause}`);
  }
}

const listener = new TestSanitationListener();

const createRichTextSanitizer = (strictness: Strictness = defaultStrictness): RichTextSanitizer =>
  new RichTextSanitizer(strictness, listener);

const domParser = new DOMParser();
const xmlSerializer = new XMLSerializer();

describe("RichTextSanitizer", () => {
  describe.each`
    strictness
    ${"STRICT"}
    ${"LOOSE"}
    ${"LEGACY"}
    ${"NONE"}
  `("[$#] Testing strictness level $strictness", ({ strictness }: { strictness: StrictnessKey }) => {
    const sanitizer = createRichTextSanitizer(Strictness[strictness]);

    it("Should not modify empty richtext on sanitation", () => {
      const document = domParser.parseFromString(richtext(), "text/xml");
      const expectedXml = xmlSerializer.serializeToString(document);
      const result = sanitizer.sanitize(document);

      expect(result).toBe(document);
      const actualXml = xmlSerializer.serializeToString(document);
      expect(actualXml).toStrictEqual(expectedXml);
    });
  });
});
