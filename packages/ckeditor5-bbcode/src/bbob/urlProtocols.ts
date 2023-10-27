/**
 * While it is in insecure in general just to block some selected protocols
 * (just as there are many of them and even growing), there are some protocols
 * we know for sure, that they trigger malicious behavior - especially if used
 * within user-provided contents as it is typical for BBCode.
 *
 * The following list of protocols must not be used at all. For reasoning see
 * corresponding line comments.
 */
export const forbiddenProtocols = [
  // Considered harmful for user provided URLs. XSS Exploits, e.g., use
  // data:text/html to trigger JavaScript in the context of the current
  // page.
  "data",
  // File handles are sometimes misused to read contents from a machine that
  // parses this URL.
  "file",
  // Users may trigger unwanted behaviors.
  "javascript",
] as const;

/**
 * Rather broad set of protocols/URI-schemes, we respect as secure.
 * Note that blocking dedicated protocols is considered not enough.
 *
 * @see <https://en.wikipedia.org/wiki/List_of_URI_schemes>
 */
export const approvedProtocols = [
  "about",
  "callto",
  "chrome",
  "facetime",
  "fax",
  "feed",
  "ftp",
  "geo",
  "git",
  "gopher",
  "gtalk",
  "http",
  "https",
  "im",
  "irc",
  "ircs",
  "jabber",
  "mailto",
  "news",
  "nntp",
  "rtmfp",
  "sftp",
  "skype",
  "soap",
  "spotify",
  "steam",
  "svn",
  "tel",
  "telnet",
  "xmpp",
] as const;

/**
 * Validates if the given value represents an approved protocol. Protocol must
 * be given without trailing `:` (colon).
 *
 * @param value - value to validate
 */
export const isApprovedProtocol = (value: unknown): value is (typeof approvedProtocols)[number] =>
  typeof value === "string" && approvedProtocols.some((approved) => value === approved) && forbiddenProtocols.every((forbidden) => forbidden !== value);

/**
 * A given href/src string denotes a relative URL.
 */
export const relativeProtocol = Symbol("relative");

/**
 * The protocol type could not be determined.
 */
export const unknownProtocol = Symbol("unknown");

/**
 * Get the parsed protocol from a given string, e.g., originating from some
 * denoted `href` of an anchor element or `srd` of an image element.
 *
 * @param value - value to parse
 */
export const getParsedProtocol = (value: string): `${string}:` | typeof relativeProtocol | typeof unknownProtocol => {
  if (!value) {
    return relativeProtocol;
  }
  try {
    const url = new URL(value);
    return url.protocol as `${string}:`;
  } catch (e) {
    if (value.includes(":")) {
      return unknownProtocol;
    }
    return relativeProtocol;
  }
};
