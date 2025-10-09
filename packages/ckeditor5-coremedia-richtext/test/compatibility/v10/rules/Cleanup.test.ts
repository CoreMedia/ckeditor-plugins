

import "global-jsdom/register";
import { describe } from "node:test";
import { allDataProcessingTests, DataProcessingTestCase, Direction } from "../DataDrivenTests";

// noinspection HttpUrlsUsage
const ns_richtext = "http://www.coremedia.com/2003/richtext-1.0";
const text = `TEXT`;

const wrapContent = (content: string): string => `<div xmlns="${ns_richtext}">${content}</div>`;

/*
 * In CKEditor 4 data-processing we did some clean-up of elements. While this
 * was most likely dealing with shortcomings of CKEditor 4, we want to ensure
 * (for now) that the clean-up mechanisms still work, at least to provide
 * compatibility with existing richtext data.
 *
 * Later, it may become a configuration option to keep this legacy behavior.
 */
void describe("CoreMediaRichTextConfig: Cleanup", () => {
  const data: DataProcessingTestCase[] = [
    {
      name: "CLEANUP#1: Remove top-level <br> tag.",
      direction: Direction.toData,
      data: `<div xmlns="${ns_richtext}"/>`,
      dataView: wrapContent(`<br/>`),
    },
    {
      name: "CLEANUP#2: Remove trailing <br> tag in <td>.",
      direction: Direction.toData,
      data: wrapContent(`<table><tbody><tr><td>${text}</td></tr></tbody></table>`),
      dataView: wrapContent(`<table><tbody><tr><td>${text}<br/></td></tr></tbody></table>`),
    },
    {
      name: "CLEANUP#3: Remove trailing <br> tag in <p>.",
      direction: Direction.toData,
      data: wrapContent(`<p>${text}</p>`),
      dataView: wrapContent(`<p>${text}<br/></p>`),
    },
    {
      name: "CLEANUP#4: Remove singleton <br> in <td>",
      direction: Direction.toData,
      comment: "This is a CKEditor 4 CoreMedia RichText Behavior.",
      data: wrapContent(`<table><tbody><tr><td/></tr></tbody></table>`),
      dataView: wrapContent(`<table><tbody><tr><td><br/></td></tr></tbody></table>`),
    },
    {
      name: "CLEANUP#5: Remove singleton <p> in <td>",
      direction: Direction.toData,
      comment: "This is a CKEditor 4 CoreMedia RichText Behavior.",
      data: wrapContent(`<table><tbody><tr><td/></tr></tbody></table>`),
      dataView: wrapContent(`<table><tbody><tr><td><p/></td></tr></tbody></table>`),
    },
    {
      name: "CLEANUP#6: Remove singleton <p> only containing <br> in <td>",
      direction: Direction.toData,
      comment: "This is a CKEditor 4 CoreMedia RichText Behavior.",
      data: wrapContent(`<table><tbody><tr><td/></tr></tbody></table>`),
      dataView: wrapContent(`<table><tbody><tr><td><p><br/></p></td></tr></tbody></table>`),
    },
    {
      name: "CLEANUP#7: Don't remove possibly irrelevant <span>.",
      direction: Direction.toData,
      comment:
        "While around 2011 we decided to delete irrelevant spans, there is no reason with regards to RichText DTD. And clean-up will make things more complicate. Thus, decided in 2021 to keep it.",
      data: wrapContent(`<p><span>${text}</span></p>`),
      dataView: wrapContent(`<p><span>${text}</span></p>`),
    },
  ];

  allDataProcessingTests(data);
});
