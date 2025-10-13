import "global-jsdom/register";
import type { TestContext } from "node:test";
import test, { describe } from "node:test";
import expect from "expect";
import { BBCodeCode, bbCodeCode } from "../src/rules/BBCodeCode";
import { requireHTMLElement } from "./DOMUtils";

void describe("BBCodeCode", () => {
  void describe("Default Configuration", () => {
    const rule = bbCodeCode;

    const cases = [
      {
        dataView: `<pre><code>TEXT</code></pre>`,
        expected: `[code]\nTEXT\n[/code]\n`,
        comment: `newlines for minor pretty-printing`,
      },
      {
        dataView: `<pre><code class="language-css">TEXT</code></pre>`,
        expected: `[code=css]\nTEXT\n[/code]\n`,
        comment: `respect language`,
      },
      {
        dataView: `<pre><code class="language-plaintext">TEXT</code></pre>`,
        expected: `[code]\nTEXT\n[/code]\n`,
        comment: `strip irrelevant plaintext language`,
      },
      {
        dataView: `<pre>\n<code>TEXT</code>\n</pre>`,
        expected: `[code]\nTEXT\n[/code]\n`,
        comment: `trimming: don't pile up newlines (here: in <pre>)`,
      },
      {
        dataView: `<pre><code>\nTEXT\n</code></pre>`,
        expected: `[code]\nTEXT\n[/code]\n`,
        comment: `trimming: don't pile up newlines (here: in <code>)`,
      },
      {
        dataView: `<pre>\n\n<code>\n\nTEXT\n\n</code>\n\n</pre>`,
        expected: `[code]\nTEXT\n[/code]\n`,
        comment: `trimming: even remove extra newlines`,
      },
      {
        dataView: `<pre><code>\n  TEXT1\n  TEXT2\n</code></pre>`,
        expected: `[code]\n  TEXT1\n  TEXT2\n[/code]\n`,
        comment: `trimming: must not remove indents`,
      },
      {
        dataView: `<pre><code>TEXT  \n</code></pre>`,
        expected: `[code]\nTEXT\n[/code]\n`,
        comment: `trimming (Design Scope): We put some extra effort removing irrelevant blanks at the end.`,
      },
      {
        dataView: `<p>TEXT</p>`,
        expected: undefined,
        comment: `ignore unmatched`,
      },
      {
        dataView: `<pre>TEXT</pre>`,
        expected: `[code]\nTEXT\n[/code]\n`,
        comment: `robustness: ignore possible missing nested <code> element`,
      },
    ] as const;

    void test("cases", async (t: TestContext) => {
      for (const [i, { dataView, expected, comment }] of cases.entries()) {
        await t.test(`[${i}] Should process '${dataView}' to '${expected}' (${comment})`, () => {
          const element = requireHTMLElement(dataView);
          const bbCode = rule.toData(element, element.textContent ?? "");
          expect(bbCode).toEqual(expected);
        });
      }
    });
  });

  void describe("Custom Configuration", () => {
    const isUnsetCases = [
      {
        dataView: `<pre><code class="language-css">TEXT</code></pre>`,
        expected: `[code=css]\nTEXT\n[/code]\n`,
        comment: `respect language`,
      },
      {
        dataView: `<pre><code class="language-ignored">TEXT</code></pre>`,
        expected: `[code]\nTEXT\n[/code]\n`,
        comment: `strip irrelevant language by custom config`,
      },
    ] as const;

    void test("cases", async (t: TestContext) => {
      for (const [i, { dataView, expected, comment }] of isUnsetCases.entries()) {
        await t.test(`[${i}] Custom isUnset: Should process '${dataView}' to '${expected}' (${comment})`, () => {
          const rule = new BBCodeCode({
            isUnset: (lang) => lang === "ignored",
          });
          const element = requireHTMLElement(dataView);
          const bbCode = rule.toData(element, element.textContent ?? "");
          expect(bbCode).toEqual(expected);
        });
      }
    });

    const fromClassCases = [
      {
        dataView: `<pre><code class="language-css">TEXT</code></pre>`,
        expected: `[code=css]\nTEXT\n[/code]\n`,
        comment: `respect language`,
      },
      {
        dataView: `<pre><code class="language-ignored">TEXT</code></pre>`,
        expected: `[code]\nTEXT\n[/code]\n`,
        comment: `strip irrelevant language by custom config`,
      },
    ] as const;

    void test("cases", async (t: TestContext) => {
      for (const [i, { dataView, expected, comment }] of fromClassCases.entries()) {
        await t.test(`[${i}] Custom fromClass: Should process '${dataView}' to '${expected}' (${comment})`, () => {
          const rule = new BBCodeCode({
            fromClass: (entry) => entry,
          });
          const element = requireHTMLElement(dataView);
          const bbCode = rule.toData(element, element.textContent ?? "");
          expect(bbCode).toEqual(expected);
        });
      }
    });
  });
});
