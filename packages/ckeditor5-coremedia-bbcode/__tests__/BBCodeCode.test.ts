import { requireHTMLElement } from "./DOMUtils";
import { BBCodeCode, bbCodeCode } from "../src";

describe("BBCodeCode", () => {
  describe("Default Configuration", () => {
    const rule = bbCodeCode;

    it.each`
      dataView                                                     | expected                         | comment
      ${`<pre><code>TEXT</code></pre>`}                            | ${`[code]\nTEXT\n[/code]\n`}     | ${`newlines for minor pretty-printing`}
      ${`<pre><code class="language-css">TEXT</code></pre>`}       | ${`[code=css]\nTEXT\n[/code]\n`} | ${`respect language`}
      ${`<pre><code class="language-plaintext">TEXT</code></pre>`} | ${`[code]\nTEXT\n[/code]\n`}     | ${`strip irrelevant plaintext language`}
      ${`<p>TEXT</p>`}                                             | ${undefined}                     | ${"ignore unmatched"}
      ${`<pre>TEXT</pre>`}                                         | ${`[code]\nTEXT\n[/code]\n`}     | ${`robustness: ignore possible missing nested <code> element`}
    `(
      "$[$#] Should process '$dataView' to '$expected' ($comment)",
      ({ dataView, expected }: { dataView: string; expected: string | undefined }) => {
        const element = requireHTMLElement(dataView);
        const bbCode = rule.toData(element, element.textContent ?? "");
        expect(bbCode).toEqual(expected);
      },
    );
  });

  describe("Custom Configurations", () => {
    it.each`
      dataView                                                   | expected                         | comment
      ${`<pre><code class="language-css">TEXT</code></pre>`}     | ${`[code=css]\nTEXT\n[/code]\n`} | ${`respect language`}
      ${`<pre><code class="language-ignored">TEXT</code></pre>`} | ${`[code]\nTEXT\n[/code]\n`}     | ${`strip irrelevant language by custom config`}
    `(
      "$[$#] Custom isUnset: Should process '$dataView' to '$expected' ($comment)",
      ({ dataView, expected }: { dataView: string; expected: string | undefined }) => {
        const rule = new BBCodeCode({
          isUnset: (lang) => lang === "ignored",
        });
        const element = requireHTMLElement(dataView);
        const bbCode = rule.toData(element, element.textContent ?? "");
        expect(bbCode).toEqual(expected);
      },
    );

    it.each`
      dataView                                            | expected                         | comment
      ${`<pre><code class="css">TEXT</code></pre>`}       | ${`[code=css]\nTEXT\n[/code]\n`} | ${`respect language by custom extractor`}
      ${`<pre><code class="plaintext">TEXT</code></pre>`} | ${`[code]\nTEXT\n[/code]\n`}     | ${`strip irrelevant plaintext language`}
    `(
      "$[$#] Custom fromClass: Should process '$dataView' to '$expected' ($comment)",
      ({ dataView, expected }: { dataView: string; expected: string | undefined }) => {
        const rule = new BBCodeCode({
          fromClass: (entry) => entry,
        });
        const element = requireHTMLElement(dataView);
        const bbCode = rule.toData(element, element.textContent ?? "");
        expect(bbCode).toEqual(expected);
      },
    );
  });
});
