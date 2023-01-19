import { RuleConfig } from "../Rule";
import { PriorityString } from "@ckeditor/ckeditor5-utils/src/priorities";
import { Direction, resolveDirectionToConfig } from "./Direction";
import { isHTMLTableElement } from "@coremedia/ckeditor5-dom-support/HTMLTableElements";

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
        // Create snapshot of tBodies before creating a new one.
        const tBodies = [...node.tBodies];
        const targetBody = node.createTBody();

        if (tHead) {
          [...tHead.rows].forEach((row) => {
            row.classList.add(headerRowClass);
          });
          const range = ownerDocument.createRange();
          range.selectNodeContents(tHead);
          targetBody.append(range.extractContents());
          node.deleteTHead();
        }

        [...tBodies].forEach((tBody) => {
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
        // Get snapshot of current rows.
        const rows = [...node.rows];
        const previousBodies = [...node.tBodies];
        // DevNote: Methods also directly attach sections to table.
        const tHead = node.createTHead();
        const tFoot = node.createTFoot();
        const tBody = node.createTBody();

        rows.forEach((row) => {
          if (row.classList.contains(headerRowClass)) {
            tHead.append(row);
            row.classList.remove(headerRowClass);
          } else if (row.classList.contains(footerRowClass)) {
            tFoot.append(row);
            row.classList.remove(footerRowClass);
          } else {
            // Put all remaining rows into one `<tbody>`.
            tBody.append(row);
          }
        });

        previousBodies.forEach((previousBody) => previousBody.remove());

        // Cleanup possibly empty `<thead>`
        if (tHead.childElementCount === 0) {
          node.deleteTHead();
        }
        // Cleanup possibly empty `<tbody>`
        if (tBody.childElementCount === 0) {
          node.deleteTHead();
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
