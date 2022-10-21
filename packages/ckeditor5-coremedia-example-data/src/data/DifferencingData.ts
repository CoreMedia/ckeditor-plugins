import { ExampleData } from "../ExampleData";
import { Differencing } from "../Differencing";
import { h1, sectionHeading, richtext } from "../RichText";

const xdiff = new Differencing();

/**
 * Adds some introduction text to the set of differencing examples.
 *
 * @param topic - topic the examples are about
 */
const differencingIntroduction = (topic: string): string => `
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

const textReplaced = (hasNext = true): string => `\
${sectionHeading("Text Replaced")}
<p>
Old text has been replaced by new text:
${xdiff.del(`Old`)}\
${xdiff.add("New", { endOfDifferences: !hasNext })}.\
</p>`;

const textInlineStyleApplied = (hasNext = true): string => `\
${sectionHeading("Inline-Style Applied to Text")}
<p>
Set to bold with class-attribute change:
<strong class="some--class">\
${xdiff.change(`Lorem ipsum`, {
  changes: `<b>Strong</b> style added with class some--class.`,
})}\
</strong>.
</p>
${sectionHeading("Inline-Style Applied to Text And Following Space")}
<p>
On double click, most browsers select the word as well as the space after.
Setting such text to bold results in the following difference augmentation:
</p>
<p>
Lorem <strong>${xdiff.change(`ipsum `, {
  changes: `<b>Strong</b> style added.`,
})}\
${xdiff.add(` `, {
  endOfDifferences: !hasNext,
})}</strong>\
dolor\
</p>`;

const textClassAttributeValueChanged = (hasNext = true) => `\
${sectionHeading("Class Attribute Value Changed for Text")}
<p>
For bold text changed applied class attribute values:
<strong class="new--class">\
${xdiff.change(`Lorem ipsum`, {
  changes: `<ul class='changelist'><li><b>Strong</b> style removed with class old--class.</li><li><b>Strong</b> style added with class new--class.</li></ul>`,
  endOfDifferences: !hasNext,
})}\
</strong>.
</p>`;

const textLinkContentReferenceChanged = (hasNext = true) =>
  // noinspection HtmlUnknownAttribute
  `\
${sectionHeading("Link Content Reference Changed")}
<p>
The content reference of the following link has been changed:
<a xlink:actuate="onRequest" xlink:href="content/6" xlink:show="replace" xlink:type="simple">\
${xdiff.change(`Link`, {
  changes: `<ul class='changelist'><li>Moved out of a <b>link</b> with destination content/2 with xlink:actuate onRequest, xlink:show replace and xlink:type simple.</li><li>Moved to a <b>link</b> with destination content/6 with xlink:actuate onRequest, xlink:show replace and xlink:type simple.</li></ul>`,
  endOfDifferences: !hasNext,
})}\
</a>.
</p>
`;
const textNewlineAdded = (hasNext = true) => `\
${sectionHeading("Newline Added")}
<p>
Text before added newline\
${xdiff.add("", { endOfDifferences: !hasNext })}\
</p>
<p>
Text that continued previous line prior to newline added.
</p>`;

const textLinkTargetAttributeChanged = (hasNext = true) =>
  // noinspection HtmlUnknownAttribute
  `\
${sectionHeading("Link Target Changed")}
<p>
The target of the following link has been changed:
<a xlink:actuate="onRequest" xlink:href="content/4" xlink:show="new" xlink:type="simple">\
${xdiff.change(`Link`, {
  changes: `<ul class='changelist'><li>Moved out of a <b>link</b> with destination content/4 with xlink:actuate onRequest, xlink:show replace and xlink:type simple.</li><li>Moved to a <b>link</b> with destination content/4 with xlink:actuate onRequest, xlink:show new and xlink:type simple.</li></ul>`,
  endOfDifferences: !hasNext,
})}\
</a>.
</p>`;
const redImage = "content/900#properties.data";
const greenImage = "content/902#properties.data";
const blueImage = "content/904#properties.data";

const addImage = (hasNext = true) => `\
${sectionHeading("Image Added")}
<p>
${xdiff.simpleImg(blueImage, { type: "added" })}\
${xdiff.add("", { endOfDifferences: !hasNext })}\
</p>`;

const removeImage = (hasNext = true) => `\
${sectionHeading("Image Removed")}
<p>
${xdiff.simpleImg(blueImage, { type: "removed" })}\
${xdiff.del("", { endOfDifferences: !hasNext })}\
</p>`;

const replaceImage = (hasNext = true) => `\
${sectionHeading("Image Exchanged")}
<p>
${xdiff.simpleImg(blueImage, { type: "removed" })}\
${xdiff.simpleImg(greenImage, { type: "added", endOfDifferences: !hasNext })}\
</p>`;

const changeImageAlignment = (hasNext = true) => `\
${sectionHeading("Image Alignment Changed")}
<p>
${xdiff.simpleImg(redImage, {
  type: "changed",
  class: "float--right",
  changes: `<ul class='changelist'><li>Changed from an <b>image</b> with alt Some Image, class float--left, xlink:actuate onLoad, xlink:show embed, xlink:type simple and xlink:href ${redImage}.</li><li>Changed to an <b>image</b> with alt Some Image, class float--right, xlink:actuate onLoad, xlink:show embed, xlink:type simple and xlink:href ${redImage}.</li></ul>`,
  endOfDifferences: !hasNext,
})}\
</p>`;

// noinspection JSUnusedGlobalSymbols: Used in Example App
export const differencingData: ExampleData = {
  "Differencing: Text": richtext(`\
${differencingIntroduction("Text Examples")}\
${textReplaced()}\
${textNewlineAdded()}\
${textInlineStyleApplied()}\
${textClassAttributeValueChanged()}\
${textLinkContentReferenceChanged()}\
${textLinkTargetAttributeChanged(false)}\
`),
  "Differencing: Images": richtext(`\
${differencingIntroduction("Image Examples")}\
${addImage()}\
${removeImage()}\
${replaceImage()}\
${changeImageAlignment(false)}\
`),
};
