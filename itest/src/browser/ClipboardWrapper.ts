import { Page } from "playwright";

export default class ClipboardWrapper {
  static async writeText(page: Page, text: string): Promise<void> {
    return page.evaluate((textToCopy): void => {
      navigator.clipboard.writeText(textToCopy);
    }, text);
  }

  static async write(page: Page, itemOuter: { type: string; content: string }): Promise<void> {
    return page.evaluate((item): void => {
      const blob = new Blob([item.content], { type: item.type });
      const clipboardItem = new ClipboardItem({
        [item.type]: blob,
      });
      navigator.clipboard.write([clipboardItem]);
    }, itemOuter);
  }
}
