import express from "express";
import { chromium, Page } from "playwright";

interface StartResult {
  shutdown: () => Promise<void>;
  page: Page;
  baseUrl: URL;
}

export async function start(appDir: string): Promise<StartResult> {
  const app = express();
  app.use("/", express.static(appDir));
  const port = 3001; // TODO: use a helper package (or own function to generate a random port)
  const server = app.listen(port);
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  return {
    baseUrl: new URL(`http://localhost:${port}/`),
    page,
    shutdown: async () => {
      await browser.close();
      server.close();
    }
  };
}
