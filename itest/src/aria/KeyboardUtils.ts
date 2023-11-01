
type ClickModifiers = "Meta" | "Control";

export const clickModifiers = async (): Promise<ClickModifiers[]> => ((await isMac()) ? ["Meta"] : ["Control"]);

const isMac = async (): Promise<boolean> => {
  const response = String(await page.evaluate(() => navigator.userAgent));
  return response.includes("Mac");
};
