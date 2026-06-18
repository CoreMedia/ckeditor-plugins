import fs from "node:fs";
import path, { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, devices } from "@playwright/test";
import { isCI } from "ci-info";
import { applicationUrl, retries, timeoutFactor } from "./test/utils/environment";
import { storybookUrl } from "./test/storybook/environment";

const testFile = /.*\.test.ts/;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

type Project = {
  name: string;
  testMatch: string;
};

const projects: Project[] = [];
const readTests = function (dirPath: string, projects: Project[]) {
  const files = fs.readdirSync(dirPath);
  files.forEach(function (name) {
    if (fs.statSync(dirPath + "/" + name).isDirectory()) {
      readTests(dirPath + "/" + name, projects);
    } else {
      if (name.match(testFile)) {
        projects.push({ name, testMatch: name });
      }
    }
  });
};
readTests(path.join(__dirname, "./test"), projects);

console.log("Running " + projects.length + " tests");

console.log("Timeout factor: " + timeoutFactor);
console.log("Retries: " + retries);

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: "./test",
  outputDir: "./build/playwright/test-results",
  fullyParallel: false,
  workers: 1,
  retries: retries,
  reportSlowTests: null,
  timeout: 180000 * timeoutFactor,
  expect: {
    timeout: 5000 * timeoutFactor,
  },
  reporter: [
    ["line"],
    [
      "html",
      {
        outputFolder: "./build/playwright/html-report",
        open: "never",
      },
    ],
  ],
  use: {
    // Spread Desktop Chrome HiDPI for deviceScaleFactor etc., but drop the
    // hardcoded Windows user agent so the browser reports its real UA.
    // Without this, CKEditor5's env.isMac is always false on macOS, causing
    // Ctrl+Shift+P to not be remapped to Cmd+Shift+P and breaking keyboard
    // shortcut tests on Mac.
    ...devices["Desktop Chrome HiDPI"],
    userAgent: undefined,
    viewport: {
      width: 1920,
      height: 1080,
    },
    // Mirrors the former jest-playwright `contextOptions.permissions`. Required,
    // for example, by the FontMapper tests that read from / write to the
    // clipboard (otherwise `clipboard-read` resolves to "prompt").
    permissions: ["clipboard-read", "clipboard-write"],
    headless: isCI,
    trace: {
      mode: "retain-on-failure",
      sources: false,
      snapshots: false,
      screenshots: false, // for now do not have screenshots for every step
    },
    screenshot: "only-on-failure",
    actionTimeout: 10000 * timeoutFactor,
  },
  webServer: [
    {
      command: "pnpm run webserver",
      url: applicationUrl,
      reuseExistingServer: !isCI,
    },
    {
      // Storybook runtime for migrated tests. Served by the Storybook package's
      // dev server; migrated tests navigate to story preview iframes instead of
      // the example application.
      command: "pnpm run webserver:storybook",
      url: storybookUrl,
      reuseExistingServer: !isCI,
      timeout: 180000 * timeoutFactor,
    },
  ],
  projects,
});
