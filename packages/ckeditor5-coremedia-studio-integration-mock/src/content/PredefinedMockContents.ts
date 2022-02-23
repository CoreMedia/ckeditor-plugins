import { MockContentConfig } from "./MockContent";
import {
  CONTENT_NAME_CHALLENGE_CHARSETS,
  CONTENT_NAME_CHALLENGE_ENTITIES,
  CONTENT_NAME_CHALLENGE_LENGTH,
  CONTENT_NAME_CHALLENGE_RTL,
  CONTENT_NAME_CHALLENGE_XSS,
} from "./MockFixtures";
import { capitalize } from "./MockContentUtils";
import { contentUriPath } from "@coremedia/ckeditor5-coremedia-studio-integration/content/UriPath";

type PredefinedMockContentConfig = { comment?: string } & MockContentConfig;

const hoursInMs = (hours: number): number => {
  return hours * 1000 * 60 * 60;
};

const FOLDER_MOCKS: PredefinedMockContentConfig[] = [
  {
    id: 101,
    type: "folder",
    name: "Some Folder",
  },
  {
    id: 103,
    type: "folder",
    comment: "Folder, renamed from time to time.",
    name: ["Renaming Folder, It. 1", "Renaming Folder, It. 2"],
  },
  {
    id: 105,
    type: "folder",
    name: "Unreadable Folder",
    readable: false,
  },
];
const DOCUMENT_MOCKS: PredefinedMockContentConfig[] = [
  {
    id: 100,
    type: "document",
    name: "Some Document",
  },
  {
    id: 102,
    type: "document",
    comment: "Document, renamed from time to time.",
    name: ["Renaming Document, It. 1", "Renaming Document, It. 2"],
  },
  {
    id: 104,
    type: "document",
    name: "Unreadable Document",
    readable: false,
  },
  {
    id: 106,
    type: "document",
    name: "Document, sometimes Unreadable",
    readable: [false, true],
  },
  {
    id: 108,
    type: "document",
    name: "Edited Document",
    editing: true,
  },
  {
    id: 110,
    type: "document",
    name: "Document, sometimes edited",
    editing: [true, false],
  },
];
const NAME_CHALLENGE_MOCKS: PredefinedMockContentConfig[] = [
  {
    id: 600,
    type: "document",
    comment: "Challenges escaping having entities inside its name.",
    name: CONTENT_NAME_CHALLENGE_ENTITIES,
  },
  {
    id: 602,
    type: "document",
    comment: "Challenges name display with different characters inside.",
    name: CONTENT_NAME_CHALLENGE_CHARSETS,
  },
  {
    id: 604,
    type: "document",
    comment: "Challenges name display with RTL text.",
    name: CONTENT_NAME_CHALLENGE_RTL,
  },
  {
    id: 606,
    type: "document",
    comment: "Challenges name display with a possible XSS attack.",
    name: CONTENT_NAME_CHALLENGE_XSS,
  },
  {
    id: 608,
    type: "document",
    comment: "Challenges name display with some lengthy name.",
    name: CONTENT_NAME_CHALLENGE_LENGTH,
  },
  {
    id: 610,
    type: "document",
    comment: "Challenge by having a very short and a very long name.",
    name: ["Α", CONTENT_NAME_CHALLENGE_LENGTH, "Ω"],
  },
  {
    id: 612,
    type: "document",
    comment: "Fast toggle: Challenge by having a very short and a very long name.",
    changeDelayMs: 1000,
    name: ["Α", CONTENT_NAME_CHALLENGE_LENGTH, "Ω"],
  },
  {
    id: 614,
    type: "document",
    comment: "Challenge, because it toggles from long name display to unreadable state back and forth.",
    name: CONTENT_NAME_CHALLENGE_LENGTH,
    readable: [true, false],
  },
];
const SLOW_CONTENTS: PredefinedMockContentConfig[] = [
  {
    id: 800,
    type: "document",
    initialDelayMs: 10000,
    name: "Slow Loading Content",
  },
  {
    id: 802,
    type: "document",
    initialDelayMs: hoursInMs(1),
    name: "Nearly Endless Loading Content",
  },
];
/**
 * Some set of contents we provide right from the start for easier testing.
 */
const PREDEFINED_MOCK_CONTENTS: PredefinedMockContentConfig[] = [
  ...FOLDER_MOCKS,
  ...DOCUMENT_MOCKS,
  ...NAME_CHALLENGE_MOCKS,
  ...SLOW_CONTENTS,
];

const wrapInRichText = (rawData: string): string => {
  // noinspection HttpUrlsUsage
  return `<?xml version="1.0" encoding="utf-8"?><div xmlns="http://www.coremedia.com/2003/richtext-1.0" xmlns:xlink="http://www.w3.org/1999/xlink">${rawData}</div>`;
};

const truncateName = (str: string, maxLength = 40): string => {
  if (str.length > maxLength) {
    return str.slice(0, maxLength - 3) + "...";
  } else {
    return str;
  }
};

// noinspection HtmlUnknownAttribute
/**
 * A CoreMedia RichText 1.0 document, which contains all predefined
 * mock contents (despite those, meant for Blob-Data).
 */
const PREDEFINED_MOCK_LINK_DATA = wrapInRichText(
  PREDEFINED_MOCK_CONTENTS
    // Don't use mocks with blob data.
    .filter((c) => (c.blob?.length || 0) === 0)
    // Get some useful name and the URI Path for the link.
    .map((c) => {
      const { id, name: mockName, type, comment } = c;
      const uriPath = contentUriPath(id);
      let name: string;
      if (!!comment) {
        name = comment;
      } else if (Array.isArray(mockName)) {
        name = `${capitalize(type)} with name toggle`;
      } else if (typeof mockName === "string") {
        name = truncateName(mockName);
      } else {
        name = `Some ${capitalize(type)}`;
      }
      return { name, uriPath };
    })
    .map(({ name, uriPath }) => `<p><a xlink:href="${uriPath}">${name}</a></p>`)
    .join("")
);

export { PREDEFINED_MOCK_CONTENTS, PREDEFINED_MOCK_LINK_DATA };
