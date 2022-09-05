/* eslint @typescript-eslint/naming-convention: off */

import { allDataProcessingTests, DataProcessingTestCase, Direction } from "../DataDrivenTests";

// noinspection HttpUrlsUsage
const ns_richtext = "http://www.coremedia.com/2003/richtext-1.0";
const ns_xlink = "http://www.w3.org/1999/xlink";
const text = "TEXT";
const attr_link_external = "https://example.org/";
/**
 * Folders are represented by uneven IDs.
 * This format is as it is generated by the REST API of CoreMedia Studio,
 * while a normal content ID would look like `coremedia:///cap/content/41`.
 */
const attr_link_content_folder_data = "content/41";
/**
 * Folders are represented by uneven IDs.
 * This format is the representation in model using colons rather than
 * slashed, so that CKEditor's link feature will detect them as being
 * links and does not try adding any custom schema like https to these values.
 */
const attr_link_content_folder_model = "content:41";
/**
 * Documents are represented by even IDs.
 * This format is as it is generated by the REST API of CoreMedia Studio,
 * while a normal content ID would look like `coremedia:///cap/content/42`.
 */
const attr_link_content_document_data = "content/42";
/**
 * Documents are represented by even IDs.
 * This format is the representation in model using colons rather than
 * slashed, so that CKEditor's link feature will detect them as being
 * links and does not try adding any custom schema like https to these values.
 */
const attr_link_content_document_model = "content:42";
/**
 * In UAPI content URIs are represented this way. We want to be able to understand
 * them, if a user enters them in source editing, for example.
 */
const attr_link_content_document_uapi = "coremedia:///cap/content/42";

// noinspection XmlUnusedNamespaceDeclaration
const wrapAnchor = (anchor: string): string =>
  `<div xmlns="${ns_richtext}" xmlns:xlink="${ns_xlink}"><p>${anchor}</p></div>`;

interface XLinkBehavior {
  show?: string;
  role?: string;
}
type XlinkBehaviorDefinition = XLinkBehavior & {
  comment?: string;
  non_bijective?: boolean;
};
/**
 * Represents an empty target attribute.
 */
interface ExpectedTargetToXlinkShowAndRole {
  [target: string]: XlinkBehaviorDefinition;
}
/**
 * The mapping we agreed upon for `xlink:show` to some target value.
 * `other` is skipped here, as it is used for special meaning, which is,
 * that the `xlink:show` is ignored but `xlink:role` will take over representing
 * the `target` attribute.
 */
const show = {
  /**
   * Open in new tab. Nothing to argue about.
   */
  new: "_blank",
  /**
   * Either `_top` or `_self`. In CoreMedia CAE context we decided to
   * map `replace` to `_self` as this is, what is documented for example
   * at MDN.
   */
  replace: "_self",
  /**
   * Artificial mapping, we require, as there is no such `target` to represent
   * embedding links.
   */
  embed: "_embed",
  /**
   * Artificial mapping, we require, as there is no such `target` to represent
   * explicitly unspecified link behavior.
   */
  none: "_none",
};

/**
 * CoreMedia RichText 1.0 Element Definition for Anchors:
 *
 * ```
 * <!ELEMENT a (#PCDATA|br|span|img|em|strong|sub|sup)* >
 * <!ATTLIST a
 *   xml:lang       NMTOKEN                        #IMPLIED
 *   dir            (ltr|rtl)                      #IMPLIED
 *   xlink:show     (new|replace|embed|other|none) #IMPLIED
 *   xlink:title    CDATA                          #IMPLIED
 *   xlink:actuate  (onRequest|onLoad)             #IMPLIED
 *   xlink:href     CDATA                          #REQUIRED
 *   xlink:type     (simple)                       #FIXED 'simple'
 *   lang           NMTOKEN                        #IMPLIED
 *   class          CDATA                          #IMPLIED
 *   xlink:role     CDATA                          #IMPLIED >
 * ```
 */
describe("CoreMediaRichTextConfig: Anchors", () => {
  // noinspection NonAsciiCharacters
  const specialCharacterTargets: ExpectedTargetToXlinkShowAndRole = {
    äöü: {
      comment: "Special Characters in target: Umlauts",
      show: "other",
      role: "äöü",
    },
    "&quot;": {
      comment: "Special Character in target: Double-Quote",
      show: "other",
      role: "&quot;",
    },
    "'": {
      comment: "Special Character in target: Single-Quote",
      show: "other",
      role: "'",
    },
    "&lt;": {
      comment: "Special Character in target: Less-Than.",
      show: "other",
      role: "&lt;",
    },
    "&gt;": {
      comment: "Special Character in target: Greater-Than.",
      show: "other",
      role: "&gt;",
    },
  };
  const standardHtmlTargets: ExpectedTargetToXlinkShowAndRole = {
    [show.new]: {
      comment: `Decision: Map ${show.new} to xlink:show=new as it was for CKEditor 4.`,
      show: "new",
    },
    _top: {
      comment: "Well-known target, which cannot be represented with xlink attributes. Mapped to other/_top instead.",
      show: "other",
      role: "_top",
    },
    _parent: {
      comment: "Well-known target, which cannot be represented with xlink attributes. Mapped to other/_parent instead.",
      show: "other",
      role: "_parent",
    },
    [show.replace]: {
      comment: `Decision: Map ${show.replace} to xlink:show=replace.`,
      show: "replace",
    },
    "some target": {
      comment: "Some standard use-case: A named target got specified.",
      show: "other",
      role: "some target",
    },
  };
  /**
   * XLink States, which have no equivalent in well-known target attributes but
   * must be represented in some way. We have chosen to prefix them with underscores,
   * so that they feel like those well-known target names. This should provide nearly
   * no collision with targets found from external sources.
   */
  const artificialXlinkShowStates: ExpectedTargetToXlinkShowAndRole = {
    [show.embed]: {
      comment: "Chosen to represent xlink:show='embed'",
      show: "embed",
    },
    [show.none]: {
      comment: "Chosen to represent xlink:show='none'",
      show: "none",
    },
  };
  /**
   * Combinations, which may be modelled in CoreMedia RichText, but are unexpected
   * from clients such as CoreMedia Studio. Nevertheless, tools may decide to generate
   * these states, and we must ensure to represent them in model and view.
   */
  const artificialXlinkAttributeCombinations: ExpectedTargetToXlinkShowAndRole = {
    [`${show.new}_some_target`]: {
      show: "new",
      role: "some_target",
    },
    [`${show.replace}_some_target`]: {
      show: "replace",
      role: "some_target",
    },
    [`${show.embed}_some_target`]: {
      show: "embed",
      role: "some_target",
    },
    [`${show.none}_some_target`]: {
      show: "none",
      role: "some_target",
    },
    _role_some_target: {
      comment: "Here we have an xlink:role without xlink:show in RichText.",
      role: "some_target",
    },
    _other: {
      comment: "Here we have an xlink:show='other' without expected xlink:role.",
      show: "other",
    },
  };
  /**
   * Manual targets from external sources, which may be given trying to "hack"
   * into the mapping.
   */
  const penetrationTargets: ExpectedTargetToXlinkShowAndRole = {
    [`${show.new}_`]: {
      show: "other",
      role: `${show.new}_`,
    },
    [`${show.replace}_`]: {
      show: "other",
      role: `${show.replace}_`,
    },
    [`${show.embed}_`]: {
      show: "other",
      role: `${show.embed}_`,
    },
    [`${show.none}_`]: {
      show: "other",
      role: `${show.none}_`,
    },
    _role_: {
      show: "other",
      role: "_role_",
    },
  };
  /**
   * Represents no target attribute.
   */
  const noTarget = "NoTarget";
  const expectedTargetToXlinkShowAndRole: ExpectedTargetToXlinkShowAndRole = {
    // TODO[cke]: Using [NO_TARGET] fails currently to compile in Babel. An update may help.
    NoTarget: {
      comment: "For no target, no xlink:show/xlink:role attributes should be added.",
    },
    "": {
      comment:
        "We assume empty targets to be non-existing. As the state disappears, it is not bijective as other mappings.",
      non_bijective: true,
    },
    _role: {
      comment: "If artificial _role doesn't come with a role, assume to take it as target.",
      show: "other",
      role: "_role",
    },
    ...specialCharacterTargets,
    ...standardHtmlTargets,
    ...artificialXlinkShowStates,
    ...artificialXlinkAttributeCombinations,
    ...penetrationTargets,
  };
  const linkBehaviorFixtures: DataProcessingTestCase[] = Object.entries(expectedTargetToXlinkShowAndRole).map(
    ([target, { show, role, comment, non_bijective }], index) => {
      const name = `ANCHOR/BEHAVIOR#${index}: Should map ${
        target === noTarget ? "no target" : `target="${target}"`
      } to ${!show ? "no xlink:show" : `xlink:show="${show}"`} and ${!role ? "no xlink:role" : `xlink:show="${role}"`}${
        non_bijective ? " and vice versa" : ""
      }.`;
      const viewTarget = `${target === noTarget ? "" : ` target="${target}"`}`;
      const dataShow: string = !show ? "" : ` xlink:show="${show}"`;
      const dataRole: string = !role ? "" : ` xlink:role="${role}"`;
      const inputFromView = wrapAnchor(`<a href="${attr_link_external}"${viewTarget}>${text}</a>`);
      // noinspection HtmlUnknownAttribute
      const expectedData = wrapAnchor(`<a xlink:href="${attr_link_external}"${dataShow}${dataRole}>${text}</a>`);
      const testData: DataProcessingTestCase = {
        name,
        data: expectedData,
        dataView: inputFromView,
      };
      if (non_bijective) {
        testData.direction = Direction.toData;
      }
      if (!!comment) {
        testData.comment = comment;
      }

      // Silencing all, as some may cause expected console.outputs.
      // If this is too much, you may instead add a configuration to the processed test-data
      // if it shall be silent or not.
      testData.silent = true;
      return testData;
    }
  );

  // noinspection HtmlUnknownAttribute
  const attributes: DataProcessingTestCase[] = [
    {
      name: "ANCHOR/ATTRIBUTES#1: Should keep `dir` attribute.",
      data: wrapAnchor(`<a dir="rtl" xlink:href="${attr_link_external}">${text}</a>`),
      dataView: wrapAnchor(`<a dir="rtl" href="${attr_link_external}">${text}</a>`),
    },
    {
      name: "ANCHOR/ATTRIBUTES#2: Should transform xlink:title (data) to title attribute (data view) back and forth.",
      data: wrapAnchor(`<a xlink:href="${attr_link_external}" xlink:title="TITLE">${text}</a>`),
      dataView: wrapAnchor(`<a href="${attr_link_external}" title="TITLE">${text}</a>`),
    },
    {
      name: "ANCHOR/ATTRIBUTES#3: Should transform xlink:actuate (data) to data-xlink-actuate attribute (data view) back and forth.",
      data: wrapAnchor(`<a xlink:href="${attr_link_external}" xlink:actuate="onLoad">${text}</a>`),
      dataView: wrapAnchor(`<a href="${attr_link_external}" data-xlink-actuate="onLoad">${text}</a>`),
    },
    {
      name: "ANCHOR/ATTRIBUTES#4: Should transform xlink:type (data) to data-xlink-type attribute (data view) back and forth.",
      data: wrapAnchor(`<a xlink:href="${attr_link_external}" xlink:type="simple">${text}</a>`),
      dataView: wrapAnchor(`<a href="${attr_link_external}" data-xlink-type="simple">${text}</a>`),
    },
    {
      name: "ANCHOR/ATTRIBUTES#5: Should keep `class` attribute.",
      data: wrapAnchor(`<a class="CLASS" xlink:href="${attr_link_external}">${text}</a>`),
      dataView: wrapAnchor(`<a class="CLASS" href="${attr_link_external}">${text}</a>`),
    },
  ];

  // noinspection HtmlUnknownAttribute
  const languageAttributes: DataProcessingTestCase[] = [
    {
      name: "ANCHOR/LANG#1: Should transform xml:lang (data) to lang attribute (data view) back and forth.",
      data: wrapAnchor(`<a xlink:href="${attr_link_external}" xml:lang="en">${text}</a>`),
      dataView: wrapAnchor(`<a href="${attr_link_external}" lang="en">${text}</a>`),
    },
    {
      name: "ANCHOR/LANG#2: Should transform lang (data) to lang attribute (data view).",
      direction: Direction.toDataView,
      comment:
        "CoreMedia RichText supports xml:lang as well as lang attribute. While preferring xml:lang for toData transformation, we have to respect lang attribute from data as well.",
      data: wrapAnchor(`<a xlink:href="${attr_link_external}" lang="en">${text}</a>`),
      dataView: wrapAnchor(`<a lang="en" href="${attr_link_external}">${text}</a>`),
    },
    {
      name: "ANCHOR/LANG#3: Should prefer xml:lang over lang in data.",
      direction: Direction.toDataView,
      comment: "As in HTML specification, xml:lang should take precedence, when both are given.",
      data: wrapAnchor(`<a xlink:href="${attr_link_external}" lang="en" xml:lang="de">${text}</a>`),
      dataView: wrapAnchor(`<a lang="de" href="${attr_link_external}">${text}</a>`),
    },
  ];

  // noinspection HtmlUnknownAttribute
  const data: DataProcessingTestCase[] = [
    {
      name: "ANCHOR#1: Should ignore invalid show-attribute.",
      silent: true,
      direction: Direction.toDataView,
      data: wrapAnchor(`<a xlink:href="${attr_link_external}" xlink:show="unknown">${text}</a>`),
      dataView: wrapAnchor(`<a href="${attr_link_external}">${text}</a>`),
    },
    {
      name: "ANCHOR#2: Should ignore invalid show-attribute and only keep role attribute.",
      silent: true,
      direction: Direction.toDataView,
      data: wrapAnchor(`<a xlink:href="${attr_link_external}" xlink:show="unknown" xlink:role="some_role">${text}</a>`),
      dataView: wrapAnchor(`<a href="${attr_link_external}" target="_role_some_role">${text}</a>`),
    },
    {
      name: "ANCHOR#3: Should remove anchors without required href.",
      direction: Direction.toData,
      data: `<div xmlns="${ns_richtext}"><p>${text}</p></div>`,
      dataView: `<div xmlns="${ns_richtext}"><p><a class="some">${text}</a></p></div>`,
    },
    {
      name: "ANCHOR#4: Should transform xlink:href to xlink back and forth.",
      data: wrapAnchor(`<a xlink:href="${attr_link_external}">${text}</a>`),
      dataView: wrapAnchor(`<a href="${attr_link_external}">${text}</a>`),
    },
    {
      name: "ANCHOR#5: (Folders) Should transform xlink:href to xlink back and forth and also transform REST link to link with schema.",
      data: wrapAnchor(`<a xlink:href="${attr_link_content_folder_data}">${text}</a>`),
      dataView: wrapAnchor(`<a href="${attr_link_content_folder_model}">${text}</a>`),
    },
    {
      name: "ANCHOR#6: (Documents) Should transform xlink:href to xlink back and forth and also transform REST link to link with schema.",
      data: wrapAnchor(`<a xlink:href="${attr_link_content_document_data}">${text}</a>`),
      dataView: wrapAnchor(`<a href="${attr_link_content_document_model}">${text}</a>`),
    },
    {
      name: "ANCHOR#7: (UAPI URI) Should be able to understand UAPI URIs for toView processing.",
      direction: Direction.toDataView,
      data: wrapAnchor(`<a xlink:href="${attr_link_content_document_uapi}">${text}</a>`),
      dataView: wrapAnchor(`<a href="${attr_link_content_document_model}">${text}</a>`),
    },
    ...linkBehaviorFixtures,
    ...attributes,
    ...languageAttributes,
  ];

  allDataProcessingTests(data);
});
