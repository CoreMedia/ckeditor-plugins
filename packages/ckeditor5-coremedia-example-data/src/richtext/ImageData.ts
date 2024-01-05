import { ExampleData } from "../ExampleData";
import { h1, p, richtext, img, a, h2 } from "../RichText";

const documentReference = "content/100";
const imageBlobReference = (contentId: number): string => `content/${contentId}#properties.data`;

/**
 * This refers on pre-defined images available in test context. This is a minor
 * quirk, as it is a forward reference to the actual test application setup.
 * If refactored, it is better to provide a way to create such mocked contents
 * on the fly. Considered current solution enough for now.
 */
const predefinedImage = {
  red: imageBlobReference(900),
  green: imageBlobReference(902),
  blue: imageBlobReference(904),
  updatedBlob: imageBlobReference(906),
  slowLoading: imageBlobReference(908),
  unsetBlob: imageBlobReference(910),
  sometimesUnsetBlob: imageBlobReference(912),
  unreadable: imageBlobReference(914),
  sometimesUnreadable: imageBlobReference(916),
  frequentlyEdited: imageBlobReference(918),
  frequentlyEditedSmall: imageBlobReference(920),
  redSmall: imageBlobReference(924),
  greenSmall: imageBlobReference(926),
  blueSmall: imageBlobReference(928),
};

const imageFixture = (title: string, text: string): [string, string] => [title, richtext(`${h1(title)}${text}`)];

const simpleImage = imageFixture(
  "Image: Simple",
  `\
${p(
  img({
    "xlink:href": predefinedImage.red,
    "alt": "Red Image",
  }),
)}\
${p(`\
  Images in CoreMedia Rich Text refer to content items in CoreMedia CMS \
  containing BLOB data in one property. The CKEditor 5 integration ensures \
  that the content item and property reference to such a BLOB are resolved \
  to a URL to represent the image within the edited text in CKEditor 5.\
`)}\
`,
);

const unreadableImage = imageFixture(
  "Image: Unreadable",
  `\
${p(
  img({
    "xlink:href": predefinedImage.unreadable,
    "alt": "Unreadable Image",
  }),
)}\
${p(`\
  Images in CoreMedia Rich Text refer to content items in CoreMedia CMS \
  containing BLOB data in one property. The CoreMedia CMS allows to restrict \
  access to content items, so that it may happen, that, while editors can edit \
  some text, they are not allowed to access the required image. The CKEditor 5 \
  integration ensures, that such editors get a hint about the unreadable state \
  and that they can continue editing the text, even if the image itself cannot \
  be accessed.
`)}\
`,
);

const updatingImages = imageFixture(
  "Image: Updating",
  `\
${p(`\
  Images in CoreMedia Rich Text refer to content items in CoreMedia CMS \
  containing BLOB data in one property. These content items, again, may be \
  edited concurrently while editing rich text data referring to them. \
  The CKEditor 5 integration ensures, that corresponding parallel updates are \
  automatically also represented in the CKEditor 5 editing view.\
`)}\
${h2("Simple Updating Image")}\
${p(
  img({
    "xlink:href": predefinedImage.updatedBlob,
    "alt": "Updating Image",
  }),
)}\
${h2("Updating, Sometimes Empty Image")}\
${p(
  img({
    "xlink:href": predefinedImage.sometimesUnsetBlob,
    "alt": "Sometimes Unset Image BLOB Data",
  }),
)}\
${h2("Updating, Sometimes Unreadable Image")}\
${p(
  img({
    "xlink:href": predefinedImage.sometimesUnreadable,
    "alt": "Sometimes Unreadable Image Data",
  }),
)}\
`,
);

const multipleImages = imageFixture(
  "Image: Multiple",
  `\
${p(
  img({
    "xlink:href": predefinedImage.red,
    "alt": "Red Image",
  }),
)}\
${p(
  img({
    "xlink:href": predefinedImage.green,
    "alt": "Green Image",
  }),
)}\
${p(
  img({
    "xlink:href": predefinedImage.blue,
    "alt": "Blue Image",
  }),
)}\
`,
);

const linkedImage = imageFixture(
  "Image: Linked",
  `\
  ${p(
    a(
      img({
        "xlink:href": predefinedImage.red,
        "alt": "Red Image",
      }),
      {
        "xlink:href": documentReference,
      },
    ),
  )}\
  ${p(`\
  Images may be used within links. If the link refers to a content-item \
  it can be opened via the corresponding contextual balloon.\
  `)}
`,
);

const inlineImages = imageFixture(
  "Image: Inline",
  `\
  ${p(`\
  Images may be added as inline elements within the text:\
  `)}
${p(`\
  ${img({
    "xlink:href": predefinedImage.redSmall,
    "alt": "Red Small Image",
  })} \
is Red, \
  ${img({
    "xlink:href": predefinedImage.greenSmall,
    "alt": "Green Small Image",
  })} \
is Green, \
  ${img({
    "xlink:href": predefinedImage.blueSmall,
    "alt": "Blue Small Image",
  })} \
is Blue, and \
  ${img({
    "xlink:href": predefinedImage.frequentlyEditedSmall,
    "alt": "Frequently Edited Small Image",
  })} \
cannot make up its mind.\
`)}\
`,
);

const slowImage = imageFixture(
  "Image: Slow Loading",
  `\
${p(
  img({
    "xlink:href": predefinedImage.slowLoading,
    "alt": "Slow Loading Image",
  }),
)}\
${p(`\
  Images in CoreMedia Rich Text refer to content items in CoreMedia CMS \
  containing BLOB data in one property. Resolving such references may take \
  some time, so that, while loading such BLOB data is not finished yet, a \
  corresponding loading indicator is shown.\
`)}
`,
);

const floatingImageBug: [string, string] = [
  "Image: Floating Image Bug",
  richtext(`\
${p(
  img({
    "xlink:href": predefinedImage.red,
    "alt": "Floating Image",
    "class": "float--left",
  }),
)}\
${p(`An observed bug back in 2023: Having a text starting with a \
    floating image and immediately followed by some text, an additional blank \
    space appeared above the text content. This extra space disappeared when \
    focussing the editor for the first time.\
  `)}\
  ${p(`\
    This fixture reproduced this bug back then.
  `)}\
  ${p(`\
    An additional observation was: It was impossible to moving the cursor \
    before the image, which is, it was impossible adding text before the \
    floating image.\
  `)}\
  ${p(`\
    The underlying cause was a misconception of image rendering only relying \
    on so-called inline images. For CKEditor 5 to behave well, it is important \
    to support both, inline as well as block images.\
  `)}\
`),
];

export const imageData: ExampleData = Object.fromEntries([
  simpleImage,
  multipleImages,
  linkedImage,
  inlineImages,
  slowImage,
  floatingImageBug,
  updatingImages,
  unreadableImage,
]);
