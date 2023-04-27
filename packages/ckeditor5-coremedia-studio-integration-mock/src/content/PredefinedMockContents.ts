/* eslint no-null/no-null: off */

import { MockContentConfig } from "./MockContent";
import {
  CONTENT_NAME_CHALLENGE_CHARSETS,
  CONTENT_NAME_CHALLENGE_ENTITIES,
  CONTENT_NAME_CHALLENGE_LENGTH,
  CONTENT_NAME_CHALLENGE_RTL,
  CONTENT_NAME_CHALLENGE_XSS,
  PNG_BLUE_10x10,
  PNG_BLUE_240x135,
  PNG_GREEN_10x10,
  PNG_GREEN_240x135,
  PNG_RED_10x10,
  PNG_RED_240x135,
} from "./MockFixtures";
import { capitalize } from "./MockContentUtils";
import { contentUriPath } from "@coremedia/ckeditor5-coremedia-studio-integration/src/content/UriPath";
import { defaultTypeById } from "./MockContentType";

type PredefinedMockContentConfig = { comment?: string } & MockContentConfig;

const hoursInMs = (hours: number): number => hours * 1000 * 60 * 60;

const FOLDER_MOCKS: PredefinedMockContentConfig[] = [
  {
    id: 101,
    name: "Some Folder",
  },
  {
    id: 103,
    comment: "Folder, renamed from time to time.",
    name: ["Renaming Folder, It. 1", "Renaming Folder, It. 2"],
  },
  {
    id: 105,
    name: "Unreadable Folder",
    readable: false,
  },
  {
    id: 107,
    name: "Folder, sometimes Unreadable",
    readable: [false, true],
  },
];
const DOCUMENT_MOCKS: PredefinedMockContentConfig[] = [
  {
    id: 100,
    name: "Some Document",
  },
  {
    id: 102,
    comment: "Document, renamed from time to time.",
    name: ["Renaming Document, It. 1", "Renaming Document, It. 2"],
  },
  {
    id: 104,
    name: "Unreadable Document",
    readable: false,
  },
  {
    id: 106,
    name: "Document, sometimes Unreadable",
    readable: [false, true],
  },
  {
    id: 108,
    name: "Edited Document",
    editing: true,
  },
  {
    id: 110,
    name: "Document, sometimes edited",
    editing: [true, false],
  },
  {
    id: 112,
    comment: "Document which is actively edited, renamed, moved.",
    changeDelayMs: 1000,
    name: Array.from(Array(10).keys()).map((idx) => `Name No. ${idx}`),
    editing: [true, false],
    readable: [true, true, true, false, false, false],
  },
];
const NAME_CHALLENGE_MOCKS: PredefinedMockContentConfig[] = [
  {
    id: 600,
    comment: "Challenges escaping having entities inside its name.",
    name: CONTENT_NAME_CHALLENGE_ENTITIES,
  },
  {
    id: 602,
    comment: "Challenges name display with different characters inside.",
    name: CONTENT_NAME_CHALLENGE_CHARSETS,
  },
  {
    id: 604,
    comment: "Challenges name display with RTL text.",
    name: CONTENT_NAME_CHALLENGE_RTL,
  },
  {
    id: 606,
    comment: "Challenges name display with a possible XSS attack.",
    name: CONTENT_NAME_CHALLENGE_XSS,
  },
  {
    id: 608,
    comment: "Challenges name display with some lengthy name.",
    name: CONTENT_NAME_CHALLENGE_LENGTH,
  },
  {
    id: 610,
    comment: "Challenge by having a very short and a very long name.",
    name: ["Α", CONTENT_NAME_CHALLENGE_LENGTH, "Ω"],
  },
  {
    id: 612,
    comment: "Fast toggle: Challenge by having a very short and a very long name.",
    changeDelayMs: 1000,
    name: ["Α", CONTENT_NAME_CHALLENGE_LENGTH, "Ω"],
  },
  {
    id: 614,
    comment: "Challenge, because it toggles from long name display to unreadable state back and forth.",
    name: CONTENT_NAME_CHALLENGE_LENGTH,
    readable: [true, false],
  },
];
const SLOW_CONTENTS: PredefinedMockContentConfig[] = [
  {
    id: 800,
    initialDelayMs: 10000,
    name: "Slow Loading Content",
  },
  {
    id: 802,
    initialDelayMs: hoursInMs(1),
    name: "Nearly Endless Loading Content",
  },
  {
    id: 804,
    initialDelayMs: 5000,
    name: "Not so slow Loading Content",
  },
];
const BLOB_CONTENTS: PredefinedMockContentConfig[] = [
  {
    id: 900,
    name: "Red Image",
    linkable: true,
    embeddable: true,
    blob: PNG_RED_240x135,
  },
  {
    id: 902,
    name: "Green Image",
    linkable: true,
    embeddable: true,
    blob: PNG_GREEN_240x135,
  },
  {
    id: 904,
    name: "Blue Image",
    linkable: true,
    embeddable: true,
    blob: PNG_BLUE_240x135,
  },
  {
    id: 906,
    name: "Red, Green, Blue Updated Image",
    linkable: true,
    embeddable: true,
    blob: [PNG_RED_240x135, PNG_GREEN_240x135, PNG_BLUE_240x135],
  },
  {
    id: 908,
    initialDelayMs: 10000,
    name: "Slow Loading Red Image Content",
    linkable: true,
    embeddable: true,
    blob: PNG_RED_240x135,
  },
  {
    id: 910,
    name: "Unset Image Blob",
    readable: true,
    linkable: true,
    embeddable: true,
    blob: [null],
  },
  {
    id: 912,
    name: "Sometimes Unset Image Blob",
    readable: true,
    linkable: true,
    embeddable: true,
    changeDelayMs: 5000,
    blob: [PNG_RED_240x135, null],
  },
  {
    id: 914,
    name: "Unreadable Image",
    linkable: true,
    readable: false,
    embeddable: true,
    blob: PNG_RED_240x135,
  },
  {
    id: 916,
    name: "Sometimes Unreadable Image",
    linkable: true,
    readable: [false, true],
    embeddable: true,
    blob: PNG_RED_240x135,
  },
  {
    id: 918,
    name: Array.from(Array(10).keys()).map((idx) => `Image No. ${idx}`),
    comment: "Frequently Edited Image",
    readable: [false, true, true, true, true],
    editing: [false, false, true, false, false, false, false],
    linkable: true,
    embeddable: true,
    changeDelayMs: 3000,
    blob: [PNG_RED_240x135, PNG_GREEN_240x135, null, PNG_BLUE_240x135, null],
  },
  {
    id: 920,
    name: "Frequently Updated Small Image",
    linkable: true,
    embeddable: true,
    changeDelayMs: 2000,
    blob: [PNG_RED_10x10, PNG_GREEN_10x10, PNG_BLUE_10x10, PNG_GREEN_10x10],
  },
  {
    id: 922,
    name: "Green Image (not linkable)",
    // In standard setups in Blueprint CoreMedia Studio, image documents are
    // always also linkable. But in theory, this is not required, so that we
    // produce an artificial state here.
    linkable: false,
    embeddable: true,
    blob: PNG_GREEN_240x135,
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
  ...BLOB_CONTENTS,
];

const wrapInRichText = (rawData: string): string =>
  // noinspection HttpUrlsUsage
  `<?xml version="1.0" encoding="utf-8"?><div xmlns="http://www.coremedia.com/2003/richtext-1.0" xmlns:xlink="http://www.w3.org/1999/xlink">${rawData}</div>`;
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
    .filter((c) => !c.blob)
    // Get some useful name and the URI Path for the link.
    .map((c) => {
      const { id, name: mockName, type: configType, comment } = c;
      const type = configType ?? defaultTypeById(id);
      const uriPath = contentUriPath(id);
      let name: string;
      if (comment) {
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

// noinspection HtmlUnknownAttribute
/**
 * A CoreMedia RichText 1.0 document, which contains all predefined
 * mock blob contents.
 */
const PREDEFINED_MOCK_BLOB_DATA = wrapInRichText(
  PREDEFINED_MOCK_CONTENTS
    // Only use mocks with blob data.
    .filter((c) => !!c.blob)
    // Get some useful name and the URI Path for the link.
    .map((c) => {
      const { id, name: mockName, type: configType, comment } = c;
      const type = configType ?? defaultTypeById(id);
      const uriPath = contentUriPath(id);
      let name: string;
      if (comment) {
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
    // Property is irrelevant for mocking.
    .map(
      ({ name, uriPath }) =>
        `<p>${name}:<br/><img alt="Alternative Text: ${name}" xlink:href="${uriPath}#properties.data"/></p><p>${name} with link to self:<br/><a xlink:href="${uriPath}"><img alt="Alternative Text: ${name}" xlink:href="${uriPath}#properties.data"/></a></p>`
    )
    .join("")
);

export { PREDEFINED_MOCK_CONTENTS, PREDEFINED_MOCK_LINK_DATA, PREDEFINED_MOCK_BLOB_DATA, PredefinedMockContentConfig };
