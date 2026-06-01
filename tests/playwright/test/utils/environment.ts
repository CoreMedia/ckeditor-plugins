export const applicationPort = process.env.APPLICATION_PORT ?? "12345";

export const applicationUrl = `http://localhost:${applicationPort}/sample`;

export const timeoutFactor = parseInt(process.env.PLAYWRIGHT_TIMEOUT_FACTOR ?? "1");

export const retries = parseInt(process.env.PLAYWRIGHT_RETRIES ?? "0");
