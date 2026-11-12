import { Page } from "playwright-core";

export const editor = (page: Page) => page.getByRole("textbox", { name: "Rich Text Editor" });
