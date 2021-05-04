import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import Editor from "@ckeditor/ckeditor5-core/src/editor/editor";
import { Logger, LoggerProvider } from "@coremedia/coremedia-utils/index";
import Writer from "@ckeditor/ckeditor5-engine/src/model/writer";
import { DiffItem, DiffItemAttribute } from "@ckeditor/ckeditor5-engine/src/model/differ";
import Range from "@ckeditor/ckeditor5-engine/src/model/range";

export const LINK_TARGET_MODEL = "linkTarget";
export const LINK_TARGET_VIEW = "target";

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
        return writer.createAttributeElement("a", {
          target: modelAttributeValue,
        });
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
  const changes: DiffItemAttribute[] = model.document.differ
    .getChanges()
    .filter(isRemoveLinkAttributeDiffItem)
    .map((c) => <DiffItemAttribute>c);
  const linkHrefChanges: DiffItemAttribute[] = changes.filter((di) => di.attributeKey === "linkHref");
  const linkHrefRanges: Range[] = linkHrefChanges.map((di) => di.range);

  /*
   * We need to check, if we haven't added required changes yet, because this
   * post-fixer will be called again in this process (as we return `true` on change).
   */
  if (changes.length <= linkHrefChanges.length) {
    const operationsBefore = writer.batch.operations.length;
    /*
     * We have not applied all required attribute removals for linkTarget yet.
     * Instead of checking for the uncovered ranges, yet, we just add corresponding
     * removeAttribute calls again.
     *
     * It is considered a corner-case unlikely to happen, that someone else despite
     * us added a removal of linkTarget attributes.
     */
    linkHrefRanges.forEach((r) => writer.removeAttribute(LINK_TARGET_MODEL, r));

    const operationsAfter = writer.batch.operations.length;

    if (operationsBefore === operationsAfter) {
      // There was no linkTarget attribute to remove. Thus, we signal, that nothing
      // has changed.
      return false;
    }

    // True: Re-trigger post-fix mechanism, so others can get aware of our changes.
    return true;
  }
  return false;
}

/**
 * Checks, if this diff item represents a change regarding removal of
 * linkHref or linkTarget attribute. We require both attribute changes in order
 * to see, if all removals of `linkHref` are represented by corresponding
 * removals of `linkTarget` in next stage.
 *
 * @param diffItem item to check
 */
function isRemoveLinkAttributeDiffItem(diffItem: DiffItem): boolean {
  if (diffItem.type !== "attribute") {
    return false;
  }
  const diffItemAttribute: DiffItemAttribute = <DiffItemAttribute>diffItem;
  return (
    (diffItemAttribute.attributeKey === "linkHref" || diffItemAttribute.attributeKey === LINK_TARGET_MODEL) &&
    !diffItemAttribute.attributeNewValue
  );
}
