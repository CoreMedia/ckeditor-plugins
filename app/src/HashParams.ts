/**
 * Regular expression to split up hash parameters similar to query parameters,
 * thus, having a name and a value.
 */
export const hashParamRegExp = /([^=]*)=(.*)/;

export const getHashParams = (): Record<string, string | boolean> => {
  // Check for `window`: Required when used from within Jest tests, where
  // 'jsdom' is not available.
  const { location } = window ?? {};
  if (!location) {
    return {};
  }
  const { hash: rawHash } = location;
  if (rawHash.length === 0) {
    return {};
  }
  // substring: Remove hash
  const hash: string = rawHash.substring(1);
  const hashParams: string[] = hash.split(/&/);
  const parsedHashParams: Record<string, string | boolean> = {};
  for (const hashParam of hashParams) {
    const paramMatch: RegExpExecArray | null = hashParamRegExp.exec(hashParam);
    let key: string;
    let value: string | boolean;
    if (paramMatch) {
      key = paramMatch[1];

      const rawValue = paramMatch[2];

      switch (rawValue.trim().toLowerCase()) {
        case "":
          // Map empty String to truthy value.
          value = true;
          break;
        case "true":
        case "on":
          value = true;
          break;
        case "false":
        case "off":
          value = false;
          break;
        default:
          value = rawValue;
      }
    } else {
      // We have a toggle hash param.
      key = hashParam;
      value = true;
    }
    parsedHashParams[key] = value;
  }
  return parsedHashParams;
};

export const toHashParam = (hashParams: Record<string, string | boolean>): string => {
  let result = "";
  for (const [key, value] of Object.entries(hashParams)) {
    result = `${result}${result ? "&" : ""}${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
  }
  return result;
};

export const setHashParam = (key: string, value: string | boolean, reload = false): void => {
  const { location, history } = window ?? {};
  if (!location) {
    console.info(`Skipped setting hash parameter ${key} to ${value} as window location and/or history is unknown.`);
    return;
  }

  const hashParams = getHashParams();
  hashParams[key] = value;
  location.hash = toHashParam(hashParams);
  if (reload) {
    location.reload();
  }
};

/**
 * Get hash parameter value from `window.location`.
 *
 * @param key - hash parameter key
 */
export const getHashParam = (key: string | undefined): string | boolean => {
  // Check for `window`: Required when used from within Jest tests, where
  // 'jsdom' is not available.
  if (key === undefined) {
    return false;
  }
  return getHashParams()[key] ?? false;
};
