import { fileURLToPath } from "node:url";
import { createPlaywrightConfig } from "@coremedia-internal/studio-client.playwright-config";
import { storybookUrl } from "./test/storybook/environment";

/**
 * Shared CoreMedia defaults from `@coremedia-internal/studio-client.playwright-config`,
 * see https://playwright.dev/docs/test-configuration for the available options.
 */
export default createPlaywrightConfig({
  testDir: fileURLToPath(new URL("./test", import.meta.url)),
  webServer: {
    // Storybook runtime for the tests. Served by the Storybook package's dev
    // server; tests navigate to story preview iframes.
    command: "pnpm run webserver:storybook",
    url: storybookUrl,
  },
});
