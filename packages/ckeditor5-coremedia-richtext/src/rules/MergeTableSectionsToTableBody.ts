import { RuleConfig } from "@coremedia/ckeditor5-dom-converter";
import { PriorityString } from "ckeditor5";
import { copyAttributesFrom, isHTMLTableElement, removeClass } from "@coremedia/ckeditor5-dom-support";
import { Direction, resolveDirectionToConfig } from "./Direction";

export interface MergeTableSectionsToTableBodyConfig {
  headerRowClass?: string;
  footerRowClass?: string;
  direction?: Direction;
  priority?: PriorityString;
}

export const defaultMergeTableSectionsToTableBodyConfig: Required<MergeTableSectionsToTableBodyConfig> = {
  headerRowClass: "tr--header",
  footerRowClass: "tr--footer",
  direction: "bijective",
  priority: "normal",
};
export const mergeTableSectionsToTableBody = (config?: MergeTableSectionsToTableBodyConfig): RuleConfig => {
  const { headerRowClass, footerRowClass, direction, priority } = {
    ...defaultMergeTableSectionsToTableBodyConfig,
    ...config,
  };
  return resolveDirectionToConfig({
    direction,
    toData: () => ({
      id: `toData-merge-table-sections-to-tbody`,
      // We do this early, to benefit from `HTMLTableElement` features.
      prepare: (node): void => {
        if (!isHTMLTableElement(node)) {
          return;
        }
        const { tHead, tFoot, ownerDocument } = node;
        // Create a snapshot of tBodies before creating a new one.
        const tBodies = [...node.tBodies];
        const targetBody = node.createTBody();
        const transferAttributesToTargetBody = (section: HTMLTableSectionElement): void => {
          // We risk overriding here for now, not expecting any collisions.
          // If collisions exist, we may want to prefer those of tbody.
          copyAttributesFrom(section, targetBody);
        };

        // Attributes: Attributes of first `<tbody>` always take precedence
        // over any other attributes set. Also decided, as `<thead> is supported
        // by CKEditor 5, while `<tfoot>` isn't supported yet, that attributes
        // of `<thead>` take precedence over `<tfoot>`.

        if (tFoot) {
          transferAttributesToTargetBody(tFoot);
        }
        if (tHead) {
          transferAttributesToTargetBody(tHead);
        }

        // Attributes of first `<tbody>` preferred, thus, applying
        // reverse transfer of attributes.
        [...tBodies].reverse().forEach((tBody) => {
          transferAttributesToTargetBody(tBody);
        });
        if (tHead) {
          [...tHead.rows].forEach((row) => {
            row.classList.add(headerRowClass);
          });
          const range = ownerDocument.createRange();
          range.selectNodeContents(tHead);
          targetBody.append(range.extractContents());
          node.deleteTHead();
        }
        tBodies.forEach((tBody) => {
          // We don't mark the origin of `<tbody>` here, thus, we only support
          // ony `<tbody>`. To change this behavior, we would have to remember
          // the index of `<tbody>` as class, for example.
          const range = ownerDocument.createRange();
          range.selectNodeContents(tBody);
          targetBody.append(range.extractContents());
          tBody.remove();
        });
        if (tFoot) {
          [...tFoot.rows].forEach((row) => {
            row.classList.add(footerRowClass);
          });
          const range = ownerDocument.createRange();
          range.selectNodeContents(tFoot);
          targetBody.append(range.extractContents());
          node.deleteTFoot();
        }
      },
      priority,
    }),
    toView: () => ({
      id: `toView-spread-tbody-children-to-sections`,
      // Do this late, to benefit from `HTMLTableElement` features.
      importedWithChildren: (node): Node => {
        if (!isHTMLTableElement(node)) {
          return node;
        }
        // Get a snapshot of current rows.
        const rows = [...node.rows];
        const previousBodies = [...node.tBodies];
        // DevNote: Methods also directly attach sections to table.
        const tHead = node.createTHead();
        const tFoot = node.createTFoot();
        const tBody = node.createTBody();
        rows.forEach((row) => {
          if (row.classList.contains(headerRowClass)) {
            tHead.append(row);
            removeClass(row, headerRowClass);
          } else if (row.classList.contains(footerRowClass)) {
            tFoot.append(row);
            removeClass(row, footerRowClass);
          } else {
            // Put all remaining rows into one `<tbody>`.
            tBody.append(row);
          }
        });
        previousBodies.forEach((previousBody) => {
          for (const attribute of previousBody.attributes) {
            tHead.setAttributeNode(attribute.cloneNode(true) as Attr);
            tBody.setAttributeNode(attribute.cloneNode(true) as Attr);
            tFoot.setAttributeNode(attribute.cloneNode(true) as Attr);
          }
          previousBody.remove();
        });

        // Cleanup possibly empty `<thead>`
        if (tHead.childElementCount === 0) {
          node.deleteTHead();
        }
        // Cleanup possibly empty `<tbody>`
        if (tBody.childElementCount === 0) {
          tBody.remove();
        }
        // Cleanup possibly empty `<tfoot>`
        if (tFoot.childElementCount === 0) {
          node.deleteTFoot();
        }
        return node;
      },
      priority,
    }),
    ruleDefaults: {
      id: `merge-table-sections-to-table-body-${direction}`,
    },
  });
};
