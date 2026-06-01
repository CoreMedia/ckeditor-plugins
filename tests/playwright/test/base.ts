import { test } from "@playwright/test";
import { Page } from "playwright-core";
import { ApplicationConsole } from "./aut/ApplicationConsole.ts";
import { expectNoErrorsOrWarnings } from "./aut/expectations.ts";

const consoles: Map<Page, ApplicationConsole> = new Map();

test.beforeEach(async ({ page }) => {
  const console = new ApplicationConsole(page);
  console.open();
  consoles.set(page, console);
});

test.afterEach(async ({ page }) => {
  const console = consoles.get(page);
  if (console) {
    console.close();
    expectNoErrorsOrWarnings(console);
    consoles.delete(page);
  }
});

export { test };
