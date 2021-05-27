import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import Editor from "@ckeditor/ckeditor5-core/src/editor/editor";
import { Logger, LoggerProvider } from "@coremedia/coremedia-utils/index";
import Writer from "@ckeditor/ckeditor5-engine/src/model/writer";
import { DiffItem, DiffItemAttribute } from "@ckeditor/ckeditor5-engine/src/model/differ";
import { LINK_TARGET_MODEL, LINK_TARGET_VIEW } from "./Constants";
import LinkTargetCommand from "./LinkTargetCommand";

/**
 * Same priority as used for link-downcasting (href and decorators).
 * It is important, that this is the very same priority as for href
 * attributes, as otherwise `<a>` elements won't merge when transformed
 * to data.
 */
const LINK_ATTRIBUTE_PRIORITY = 5;

/**
 * Adds an attribute `linkTarget` to the model, which will be represented
 * as `target` attribute in view.
 *
 * @see <a href="https://stackoverflow.com/questions/51303892/how-to-add-target-attribute-to-a-tag-in-ckeditor5">How to add "target" attribute to `a` tag in ckeditor5? - Stack Overflow</a>
 */
export default class LinkTargetModelView extends Plugin {
  static readonly pluginName: string = "LinkTargetModelView";
  private readonly logger: Logger = LoggerProvider.getLogger(LinkTargetModelView.pluginName);
  private readonly TEXT_NAME = "$text";

  /**
   * Defines `linkTarget` model-attribute which is represented on downcast
   * (to data and for editing) as `target` attribute.
   */
  init(): Promise<void> | null {
    const startTimestamp = performance.now();

    this.logger.debug(`Initializing ${LinkTargetModelView.pluginName}...`);

    const editor: Editor = this.editor;
    const model = editor.model;
    const document = model.document;

    // Allow link attribute on all inline nodes.
    model.schema.extend(this.TEXT_NAME, { allowAttributes: LINK_TARGET_MODEL });

    // Downcast: Model -> Output (Data & Editing)
    // Create element with target attribute. Element will be merged with
    // a-Element created by Link plugin.
    editor.conversion.for("downcast").attributeToElement({
      model: LINK_TARGET_MODEL,
      view: (modelAttributeValue, { writer }) => {
        const element = writer.createAttributeElement(
          "a",
          {
            target: modelAttributeValue,
          },
          { priority: LINK_ATTRIBUTE_PRIORITY }
        );
        // Signal Link-Plugin, that this is a link, too.
        writer.setCustomProperty("link", true, element);
        return element;
      },
      converterPriority: "low",
    });

    // Upcast: Input (Data & Editing) -> Model
    // Take the view target-attribute of a-element and transform it to
    // linkTarget attribute in model.
    editor.conversion.for("upcast").elementToAttribute({
      view: {
        name: "a",
        attributes: {
          [LINK_TARGET_VIEW]: true,
        },
      },
      model: {
        key: LINK_TARGET_MODEL,
        value: (viewElement) => viewElement.getAttribute(LINK_TARGET_VIEW) || null,
      },
      converterPriority: "low",
    });

    document.registerPostFixer(fixZombieLinkTargetsAfterLinkHrefRemoval);

    editor.commands.add("linkTarget", new LinkTargetCommand(editor));

    this.logger.debug(`Initialized ${LinkTargetModelView.pluginName} within ${performance.now() - startTimestamp} ms.`);

    return null;
  }
}

/**
 * This function ensures, that no `linkTarget` attribute is kept, when the editor
 * actually asked to remove a link by `UnlinkCommand. This function is meant
 * to be used as so-called <em>>post-fixer</em>, which is, to fix a now considered
 * invalid state of the model.
 *
 * Having a post-fixer instead of a listener to the execution of the
 * Unlink-Command not only correctly handles the undo/redo-state, it is also
 * independent for any other possibly custom actions dealing with the `linkHref`
 * attribute.
 *
 * @param writer
 */
function fixZombieLinkTargetsAfterLinkHrefRemoval(writer: Writer): boolean {
  const model = writer.model;
  const ranges = model.document.differ
    .getChanges()
    .filter(isRemoveLinkHrefAttributeDiffItem)
    .map((c) => (<DiffItemAttribute>c).range);
  const validRanges = Array.from(model.schema.getValidRanges(ranges, LINK_TARGET_MODEL));

  // Workaround for missing feature ckeditor/ckeditor5#9627
  const operationsBefore = writer.batch.operations.length;
  /*
   * We have not applied all required attribute removals for linkTarget yet.
   * Instead of checking for the uncovered ranges, yet, we just add corresponding
   * removeAttribute calls again.
   */
  validRanges.forEach((range) => writer.removeAttribute(LINK_TARGET_MODEL, range));

  const operationsAfter = writer.batch.operations.length;

  /*
   * If there were no (more) linkTarget attributes to remove, `removeAttribute`
   * would not have added any more operations.
   *
   * We take this to signal, if a re-run of other post-fixers (including this
   * one) is required (= true) or not (= false).
   */
  return operationsBefore !== operationsAfter;
}

/**
 * Checks, if this diff item represents a change regarding removal of
 * linkHref.
 *
 * @param diffItem item to check
 */
function isRemoveLinkHrefAttributeDiffItem(diffItem: DiffItem): boolean {
  if (diffItem.type !== "attribute") {
    return false;
  }
  const diffItemAttribute: DiffItemAttribute = <DiffItemAttribute>diffItem;
  // We must not simply check for 'falsy' here, as an empty string does not
  // represent a deletion of the attribute, but signals (you guessed it), that
  // the attribute got set to an empty string.
  // Note, that any change in here, may collide with the post-fixing behavior
  // in `LinkTargetCommand.
  const isDeleteAttribute =
    diffItemAttribute.attributeNewValue === null || diffItemAttribute.attributeNewValue === undefined;
  return isDeleteAttribute && diffItemAttribute.attributeKey === "linkHref";
}
