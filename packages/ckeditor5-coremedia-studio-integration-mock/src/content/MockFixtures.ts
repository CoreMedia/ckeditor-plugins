/**
 * Example Blob Fixture for 10×10 red PNG.
 */
export const PNG_RED_10x10 =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKAQMAAAC3/F3+AAAAA1BMVEX/AAAZ4gk3AAAACXBIWXMAAA7EAAAOxAGVKw4bAAAACklEQVQIHWPACwAAHgAB95hMXAAAAABJRU5ErkJggg==";
/**
 * Example Blob Fixture for 10×10 green PNG.
 */
export const PNG_GREEN_10x10 =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKAQMAAAC3/F3+AAAAA1BMVEUA/wA0XsCoAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAACklEQVQIHWPACwAAHgAB95hMXAAAAABJRU5ErkJggg==";
/**
 * Example Blob Fixture for 10×10 blue PNG.
 * @see https://www.base64-image.de/
 */
export const PNG_BLUE_10x10 =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKAQMAAAC3/F3+AAAAA1BMVEUAAP+KeNJXAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAACklEQVQIHWPACwAAHgAB95hMXAAAAABJRU5ErkJggg==";

/**
 * A content name containing several entities.
 */
export const CONTENT_NAME_CHALLENGE_ENTITIES = "&lt;br&gt;&amp;&quot;&#412;";
/**
 * A content name with various charsets.
 */
export const CONTENT_NAME_CHALLENGE_CHARSETS = "年Ϩ";
/**
 * A content name with RTL characters.
 */
export const CONTENT_NAME_CHALLENGE_RTL = "عامعام";
/**
 * A content name, which challenges possible Cross-Site-Scripting-Attacks.
 */
export const CONTENT_NAME_CHALLENGE_XSS = `<iframe src="javascript:alert('Boo 👻')" width="1px" height="1px">`;
/**
 * A long content name of 250 characters, which is slightly over the default
 * name length allowed in CoreMedia CMS.
 */
export const CONTENT_NAME_CHALLENGE_LENGTH =
  "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea tak";
