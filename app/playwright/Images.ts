import { Page } from "playwright";

export interface Rectangle {
  width: number;
  height: number;
  color: string;
}

export const DEFAULT_RECTANGLE: Rectangle = {
  width: 240,
  height: 135,
  color: "red",
}

export class Images {
  readonly #page: Page;

  constructor(page: Page) {
    this.#page = page;
  }

  static #generateRandomString(length = 10) {
    // Kudos to: https://dev.to/oyetoket/fastest-way-to-generate-random-strings-in-javascript-2k5a
    return Math.random().toString(20).substr(2, length)
  }

  async #rectangleDiv(rectangle = DEFAULT_RECTANGLE): Promise<string> {
    const id = `rect-${Images.#generateRandomString()}`;
    const { width, height, color } = rectangle;
    const styles = {
      width: `${width}px`,
      height: `${height}px`,
      "background-color": `${color}`,
      position: "absolute",
      "top": "0px",
      "left": "0px",
      // We must ensure that it is visible, as screenshot will be taken at
      // position, no matter what is seen there.
      "z-index": 9999,
    };
    const style: string = Object.entries(styles).map(([k, v]) => `${k}:${v} !important`).join(";");
    const args = {
      id,
      style,
    };

    return page.evaluate(({ id, style }) => {
      const div = document.createElement("div");
      div.setAttribute("id", id);
      div.setAttribute("style", style);
      document.body.insertAdjacentElement("beforeend", div);
      return id;
    }, args);
  }

  async rectangle(rectangle: Partial<Rectangle> = {}): Promise<string> {
    const id = await this.#rectangleDiv({
      ...DEFAULT_RECTANGLE,
      ...rectangle,
    });
    const buffer = await page.locator(`#${id}`).screenshot();
    const base64 = buffer.toString("base64");
    await page.evaluate((id) => document.getElementById(id)?.remove(), id);
    return `data:image/png;base64,${base64}`;
  }
}
