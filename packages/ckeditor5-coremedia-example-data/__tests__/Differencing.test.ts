import { Differencing, EOD } from "../src/Differencing";

describe("Differencing", () => {
  it("should provide empty span", () => {
    const xdiff = new Differencing();
    const actual = xdiff.span("", { type: "added", ...EOD });
    expect(actual).toStrictEqual(`<xdiff:span xdiff:class="diff-html-added" xdiff:id="diff-0"></xdiff:span>`);
  });

  it("should provide convenience to add HTML", () => {
    const xdiff = new Differencing();
    const actual = xdiff.add("Lorem", EOD);
    expect(actual).toStrictEqual(`<xdiff:span xdiff:class="diff-html-added" xdiff:id="diff-0">Lorem</xdiff:span>`);
  });

  it("should provide convenience to remove HTML", () => {
    const xdiff = new Differencing();
    const actual = xdiff.del("Lorem", EOD);
    expect(actual).toStrictEqual(`<xdiff:span xdiff:class="diff-html-removed" xdiff:id="diff-0">Lorem</xdiff:span>`);
  });

  it("should provide added Image along with expected surrounding xdiff:span", () => {
    const xdiff = new Differencing();
    const uri = "some:uri";
    const actual = xdiff.simpleImg(uri, { type: "added", ...EOD });
    // noinspection HtmlUnknownAttribute
    expect(actual).toStrictEqual(
      `<xdiff:span xdiff:class="diff-html-added" xdiff:id="diff-0"><img xlink:href="some:uri" alt="Some Image" xdiff:changetype="diff-added-image"/></xdiff:span>`,
    );
  });

  it("should automatically track IDs", () => {
    const xdiff = new Differencing();
    const actual = [
      xdiff.add("First"),
      xdiff.add("Second"),
      xdiff.add("Last", { endOfDifferences: true }),
      xdiff.add("New Diff Section"),
    ];
    expect(actual).toStrictEqual([
      `<xdiff:span xdiff:class="diff-html-added" xdiff:id="diff-0" xdiff:next="diff-1">First</xdiff:span>`,
      `<xdiff:span xdiff:class="diff-html-added" xdiff:id="diff-1" xdiff:previous="diff-0" xdiff:next="diff-2">Second</xdiff:span>`,
      `<xdiff:span xdiff:class="diff-html-added" xdiff:id="diff-2" xdiff:previous="diff-1">Last</xdiff:span>`,
      `<xdiff:span xdiff:class="diff-html-added" xdiff:id="diff-0" xdiff:next="diff-1">New Diff Section</xdiff:span>`,
    ]);
  });
});
