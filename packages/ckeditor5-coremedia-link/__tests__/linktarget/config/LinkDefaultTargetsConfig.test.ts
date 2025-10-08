/* eslint no-null/no-null: off */

import "global-jsdom/register";
import test, { describe, beforeEach, TestContext } from "node:test";
import expect from "expect";
import { Config } from "ckeditor5";
import { computeDefaultLinkTargetForUrl } from "../../../src/linktarget/config/LinkTargetConfig";

describe("LinkTargetDefaultsConfig", () => {
  describe("computeDefaultLinkTargetForUrl", () => {
    // @ts-expect-error - Requires generic type since CKEditor 37.x.
    let config: Config;
    beforeEach(() => {
      config = new Config();
      config.set("link.defaultTargets", [
        {
          type: "externalLink",
          target: "_toBeOverridden",
        },
        {
          type: "externalLink",
          target: "_blank",
        },
        {
          type: "contentLink",
          target: "_embed",
        },
      ]);
    });

    const cases = [
      { url: "content:123", expectedTarget: "_embed" },
      { url: "https://www.example.com", expectedTarget: "_blank" },
      { url: "unexpectedFormat", expectedTarget: undefined },
    ] as const;

    test("cases", async (t: TestContext) => {
      for (const [i, { url, expectedTarget }] of cases.entries()) {
        await t.test(`[${i}] For the url '${url}' a target with the value '${expectedTarget}' is expected.`, () => {
          const target = computeDefaultLinkTargetForUrl(url, config);
          expect(target).toStrictEqual(expectedTarget);
        });
      }
    });
  });
});
