/* eslint no-null/no-null: off */

import Config from "@ckeditor/ckeditor5-utils/src/config";
import { computeDefaultLinkTargetForUrl } from "../../../src/linktarget/config/LinkTargetConfig";

jest.mock("@ckeditor/ckeditor5-utils/src/config");

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

    test.each`
      url                          | expectedTarget
      ${"content:123"}             | ${"_embed"}
      ${"https://www.example.com"} | ${"_blank"}
      ${"unexpectedFormat"}        | ${undefined}
    `("[$#] For the url `$url` a target with the value '$expectedTarget' is expected.", ({ url, expectedTarget }) => {
      const target = computeDefaultLinkTargetForUrl(url, config);
      expect(target).toStrictEqual(expectedTarget);
    });
  });
});
