/**
 * Places the given text into a CoreMedia RichText Heading Level 1.
 */
const h1 = (text) => `<p class="p--heading-1">${text}</p>`;
/**
 * Places the given text into some section heading (bold text paragraph).
 */
const section = (text) => `<p><strong>${text}</strong></p>`;

/**
 * Simple escaping mechanism for encoding HTML in attribute values.
 * This is, what is expected by corresponding server responses (data).
 */
const escape = (text) => text === undefined ? undefined : text
        .replaceAll(/&/g, "&amp;")
        .replaceAll(/</g, "&lt;")
        .replaceAll(/>/g, "&gt;")
        .replaceAll(/"/g, "&quot;");

/**
 * Simple ID tracking. Should be reset between examples sets.
 */
let currentId = 0;

/**
 * Creates a generic ID (simplified for examples).
 */
const id = () => `diff-${currentId}`;
/**
 * Creates a reference to previous ID. `undefined` iff. `hasPrevious` is `false`.
 */
const previous = (hasPrevious) => hasPrevious ? `diff-${currentId - 1}` : undefined;
/**
 * Creates a reference to next ID. `undefined` iff. `hasNext` is `false`.
 */
const next = (hasNext) => hasNext ? `diff-${currentId + 1}` : undefined;

/**
 * Surrounds given text with outer CoreMedia RichText `<div>` element with
 * required namespaces for augmented differencing markup.
 */
const differencingContainer = (xml) => {
  const xlinkNS = xml.includes("xlink:") ? ` xmlns:xlink="http://www.w3.org/1999/xlink"` : ``;
  return `<?xml version="1.0" encoding="utf-8"?>\
<div xmlns="http://www.coremedia.com/2003/richtext-1.0"${xlinkNS} xmlns:xdiff="http://www.coremedia.com/2015/xdiff">\
${xml}\
</div>`
};

/**
 * Adds some introduction text to the set of differencing examples.
 * @param topic - topic the examples are about
 */
const differencingIntroduction = (topic) => `
${h1(`Differencing: ${topic}`)}
<p>
  These examples refer to representing results of server-side differencing
  in CoreMedia Studio. Note, that in general, such markup is only represented
  in <em>read-only mode</em>, i.e., the examples below are not meant to be
  edited. <em>Non-bijective:</em> This is also the reason, why you will not find
  the corresponding differencing markup in the resulting data-representation as
  can be seen in source editing view, for example.
</p>
`;

/**
 * Formats the corresponding `xdiff` attribute (with leading whitespace).
 * An empty string is returned, if the given value is `undefined`.
 */
const xdiffAttr = (name, value) => {
  if (value === undefined) {
    return ``;
  }
  return ` xdiff:${name}="${value}"`
};

/**
 * Formats an `xdiff:span` with the given configuration options. Any unset
 * values in configuration are ignored. If a text is provided, it will be
 * wrapped into the `xdiff:span` element.
 */
const xdiffSpan = (config, content) => {
  const {
    "class": className,
    id,
    previous,
    next,
    changetype,
    changes
  } = config;
  const actualContent = content ?? "";
  return [
    `<xdiff:span`,
    xdiffAttr("class", className),
    xdiffAttr("id", id),
    xdiffAttr("previous", previous),
    xdiffAttr("next", next),
    xdiffAttr("changetype", changetype),
    // Changes-String should contain escaped HTML only.
    xdiffAttr("changes", escape(changes)),
    `>`,
    actualContent,
    `</xdiff:span>`
  ].join("");
};

/**
 * Base function for additions, deletions and changes to format corresponding
 * `xdiff:span`.
 */
const formatXdiff = (text, config) => {
  const {type, changes, hasNext, hasPrevious} = {
    type: "undefined",
    changes: undefined,
    hasNext: false,
    hasPrevious: currentId !== 0,
    ...config,
  };
  const result = xdiffSpan({
    class: `diff-html-${type}`,
    id: id(),
    previous: previous(hasPrevious),
    next: next(hasNext),
    changes,
  }, text);
  currentId++;
  return result;
};

/**
 * Represents an addition.
 */
const add = (text, config) => formatXdiff(text, {type: "added", ...config});
/**
 * Represents an deletion.
 */
const del = (text, config) => formatXdiff(text, {type: "removed", ...config});
/**
 * Represents a change.
 */
const change = (text, config) => formatXdiff(text, {type: "changed", ...config});

const textReplaced = (next) => {
  const hasPrevious = currentId !== 0;
  const hasNext = next ?? true;

  return `\
${section("Text Replaced")}
<p>
Old text has been replaced by new text:
${del(`Old`, {hasPrevious})}\
${add('New', {hasNext})}.\
</p>`
};

const textInlineStyleApplied = (next) => {
  const hasPrevious = currentId !== 0;
  const hasNext = next ?? true;

  return `\
${section("Inline-Style Applied to Text")}
<p>
Set to bold with class-attribute change:
<strong class="some--class">\
${change(`Lorem ipsum`, {
    changes: `<b>Strong</b> style added with class some--class.`,
    hasPrevious,
    hasNext,
})}\
</strong>.
</p>`;
};

const textClassAttributeValueChanged = (next) => {
  const hasPrevious = currentId !== 0;
  const hasNext = next ?? true;

  return `\
${section("Class Attribute Value Changed for Text")}
<p>
For bold text changed applied class attribute values:
<strong class="new--class">\
${change(`Lorem ipsum`, {
    changes: `<ul class='changelist'><li><b>Strong</b> style removed with class old--class.</li><li><b>Strong</b> style added with class new--class.</li></ul>`,
    hasPrevious,
    hasNext,
  })}\
</strong>.
</p>`;
};

const textLinkContentReferenceChanged = (next) => {
  const hasPrevious = currentId !== 0;
  const hasNext = next ?? true;

  // noinspection HtmlUnknownAttribute
  return `\
${section("Link Content Reference Changed")}
<p>
The content reference of the following link has been changed:
<a xlink:actuate="onRequest" xlink:href="content/6" xlink:show="replace" xlink:type="simple">\
${change(`Link`, {
    changes: `<ul class='changelist'><li>Moved out of a <b>link</b> with destination content/2 with xlink:actuate onRequest, xlink:show replace and xlink:type simple.</li><li>Moved to a <b>link</b> with destination content/6 with xlink:actuate onRequest, xlink:show replace and xlink:type simple.</li></ul>`,
    hasPrevious,
    hasNext,
})}\
</a>.
</p>
`;
};

const textNewlineAdded = (next) => {
  const hasPrevious = currentId !== 0;
  const hasNext = next ?? true;

  return `\
${section("Newline Added")}
<p>
Text before added newline\
${add("", { hasPrevious, hasNext })}\
</p>
<p>
Text that continued previous line prior to newline added.
</p>`
};

const textLinkTargetAttributeChanged = (next) => {
  const hasPrevious = currentId !== 0;
  const hasNext = next ?? true;

  // noinspection HtmlUnknownAttribute
  return `\
${section("Link Target Changed")}
<p>
The target of the following link has been changed:
<a xlink:actuate="onRequest" xlink:href="content/4" xlink:show="new" xlink:type="simple">\
${change(`Link`, {
    changes: `<ul class='changelist'><li>Moved out of a <b>link</b> with destination content/4 with xlink:actuate onRequest, xlink:show replace and xlink:type simple.</li><li>Moved to a <b>link</b> with destination content/4 with xlink:actuate onRequest, xlink:show new and xlink:type simple.</li></ul>`,
    hasPrevious,
    hasNext,
})}\
</a>.
</p>`
};

// Reset prior to text examples.
currentId = 0;

/**
 * Some general examples.
 */
const textExamples = differencingContainer(`\
${differencingIntroduction("Text Examples")}\
${textReplaced()}\
${textNewlineAdded()}\
${textInlineStyleApplied()}\
${textClassAttributeValueChanged()}\
${textLinkContentReferenceChanged()}\
${textLinkTargetAttributeChanged(false)}\
`);

const redImage = "content/900#properties.data";
const greenImage = "content/902#properties.data";
const blueImage = "content/904#properties.data";

const addImage = (next) => {
  const hasPrevious = currentId !== 0;
  const hasNext = next ?? true;

  // noinspection HtmlUnknownAttribute,RequiredAttributes
  return `\
${section("Image Added")}
<p>
${add(
          `<img alt="Some Image" xlink:actuate="onLoad" xlink:show="embed" xlink:type="simple" xlink:href="${blueImage}" xdiff:changetype="diff-added-image"/>`,
          { hasPrevious }
  )}\
${add("", { hasNext })}\
</p>`;
}

const removeImage = (next) => {
  const hasPrevious = currentId !== 0;
  const hasNext = next ?? true;

  // noinspection HtmlUnknownAttribute,RequiredAttributes
  return `\
${section("Image Removed")}
<p>
${del(
          `<img alt="Some Image" xlink:actuate="onLoad" xlink:show="embed" xlink:type="simple" xlink:href="${blueImage}" xdiff:changetype="diff-removed-image"/>`,
          { hasPrevious }
  )}\
${del("", { hasNext })}\
</p>`;
}

const replaceImage = (next) => {
  const hasPrevious = currentId !== 0;
  const hasNext = next ?? true;

  // noinspection HtmlUnknownAttribute,RequiredAttributes
  return `\
${section("Image Exchanged")}
<p>
${del(
        `<img alt="Some Image" xlink:actuate="onLoad" xlink:show="embed" xlink:type="simple" xlink:href="${blueImage}" xdiff:changetype="diff-removed-image"/>`,
          { hasPrevious }
)}\
${add(
          `<img alt="Some Image" xlink:actuate="onLoad" xlink:show="embed" xlink:type="simple" xlink:href="${greenImage}" xdiff:changetype="diff-added-image"/>`,
          { hasNext }
)}\
</p>`;
}

const changeImageAlignment = (next) => {
  const hasPrevious = currentId !== 0;
  const hasNext = next ?? true;

  // noinspection HtmlUnknownAttribute,RequiredAttributes
  return `\
${section("Change Image Alignment")}
<p>
${change(
          `<img alt="Some Image" class="float--right" xlink:actuate="onLoad" xlink:show="embed" xlink:type="simple" xlink:href="${redImage}"/>`,
          {
            changes: `<ul class='changelist'><li>Changed from an <b>image</b> with alt Some Image, class float--left, xlink:actuate onLoad, xlink:show embed, xlink:type simple and xlink:href ${redImage}.</li><li>Changed to an <b>image</b> with alt Some Image, class float--right, xlink:actuate onLoad, xlink:show embed, xlink:type simple and xlink:href ${redImage}.</li></ul>`,
            hasPrevious,
            hasNext
          }
  )}\
</p>`;
}

// Reset prior to table examples.
currentId = 0;

const differencingImages = differencingContainer(`\
${differencingIntroduction("Image Examples")}\
${addImage()}\
${removeImage()}\
${replaceImage()}\
${changeImageAlignment(false)}\
`);

export const differencingExamples = {
  "Differencing: Images": differencingImages,
  "Differencing: Text": textExamples,
};
