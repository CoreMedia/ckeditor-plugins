import express from "express";
import { chromium, Page } from "playwright";
import { AddressInfo } from "net";

interface StartResult {
  shutdown: () => Promise<void>;
  page: Page;
  baseUrl: URL;
}

const isAddressInfo = (value: unknown): value is AddressInfo => {
  return typeof value === "object" && value !== null && value.hasOwnProperty("port");
}

export async function start(appDir: string): Promise<StartResult> {
  const app = express();
  app.use("/", express.static(appDir));
  const server = app.listen(0);
  const address = server.address();
  if (!isAddressInfo(address)) {
    throw new Error(`Incompatible address information. Expected AddressInfo but is: ${address} (${typeof address})`);
  }
  const port = address.port
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
