import express from "express";
import { AddressInfo } from "net";

export interface StartResult {
  baseUrl: URL;
  indexUrl: URL;
  shutdown: () => Promise<void>;
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
  const baseUrl = new URL(`http://localhost:${port}/`);
  const indexUrl = new URL("/sample/index.html", baseUrl);
  const shutdown = async () => {
    await browser.close();
    server.close();
  }

  return { baseUrl, indexUrl, shutdown };
}
