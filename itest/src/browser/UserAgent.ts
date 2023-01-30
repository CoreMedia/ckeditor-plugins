export const ctrlOrMeta = async function (): Promise<string> {
  return (await isMac()) ? "Meta" : "Control";
};

const isMac = async (): Promise<boolean> => {
  const response = String(await page.evaluate(() => navigator.userAgent));
  return response.includes("Mac");
};
