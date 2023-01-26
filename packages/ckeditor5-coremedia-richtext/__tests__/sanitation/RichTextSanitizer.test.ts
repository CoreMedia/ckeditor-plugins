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

  get totalLengh(): number {
    return this.fatals.length + this.removedNodes.length + this.removedInvalidAttrs.length;
  }

  get empty(): boolean {
    return this.totalLengh === 0;
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
  beforeEach(() => {
    listener.clear();
  });

  describe.each`
    strictness
    ${"STRICT"}
    ${"LOOSE"}
    ${"LEGACY"}
    ${"NONE"}
  `("[$#] Testing strictness level $strictness", ({ strictness: strictnessKey }: { strictness: StrictnessKey }) => {
    const strictness = Strictness[strictnessKey];
    const sanitizer = createRichTextSanitizer(strictness);

    it("Should not modify empty richtext on sanitation", () => {
      const document = domParser.parseFromString(richtext(), "text/xml");
      const expectedXml = xmlSerializer.serializeToString(document);
      const result = sanitizer.sanitize(document);

      expect(result).toBe(document);
      const actualXml = xmlSerializer.serializeToString(document);
      expect(actualXml).toStrictEqual(expectedXml);
      expect(listener.empty).toBeTruthy();
    });

    it("Should fail on any non-richtext Document despite for Strictness.NONE", () => {
      const document = domParser.parseFromString("<root/>", "text/xml");
      const result = sanitizer.sanitize(document);

      if (strictness === Strictness.NONE) {
        expect(result).toBe(document);
        expect(listener.empty).toBeTruthy();
        return;
      }

      expect(result).toBeFalsy();
      expect(listener.fatals).toHaveLength(1);
    });
  });
});
