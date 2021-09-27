import {
  createContentUriPath,
  ContentIdPrefix,
  changing$
} from "@coremedia/ckeditor5-coremedia-studio-integration-mock/content/MockContentDisplayService";
import { serviceAgent } from "@coremedia/service-agent";
import MockDragDropService from "@coremedia/ckeditor5-coremedia-studio-integration-mock/content/MockDragDropService";

const DRAG_EXAMPLES_ID = "dragExamplesDiv";

/**
 * Set the drag data stored in the attribute data-cmuripath to the dragEvent.dataTransfer and to the dragDropService in studio.
 *
 * @param dragEvent the drag event
 */
const setDragData = (dragEvent) => {
  const contentId = dragEvent.target.getAttribute("data-cmuripath");
  const idsArray = contentId.split(',');
  if (contentId) {
    const dragDropService = new MockDragDropService();
    dragDropService.dragData = JSON.stringify(contentDragData(...idsArray));
    serviceAgent.registerService(dragDropService);
    dragEvent.dataTransfer.setData('cm/uri-list', JSON.stringify(contentList(...idsArray)));
    return;
  }
  dragEvent.dataTransfer.setData('text/plain', dragEvent.target.childNodes[0].textContent)
};

/**
 * Unregister the old dragDropService.
 */
const removeDropData = () => {
  serviceAgent.unregisterServices('dragDropService');
};

const initDragExamples = () => {

  const singleDroppableDocuments = [
    {
      label: "Document 1",
      tooltip: "Some Document",
      classes: ["linkable", "type-document"],
      items: [{
        name: false,
      }],
    },
    {
      label: "Document 2",
      tooltip: "Some Other Document",
      classes: ["linkable", "type-document"],
      items: [{
        name: true,
      }],
    },
    {
      label: "Document (edit)",
      tooltip: "Document which is actively edited",
      classes: ["linkable", "type-document"],
      items: [{
        name: changing$,
        checkedIn: changing$,
      }],
    },
    {
      label: "Document 1 (XSS)",
      tooltip: "Document, XSS attack type 1",
      classes: ["linkable", "type-document"],
      items: [{
        name: false,
        prefix: ContentIdPrefix.evil,
      }],
    },
    {
      label: "Document 2 (XSS)",
      tooltip: "Document, XSS attack type 2",
      classes: ["linkable", "type-document"],
      items: [{
        name: true,
        prefix: ContentIdPrefix.evil,
      }],
    },
    {
      label: "Document (XSS, edit)",
      tooltip: "Document, actively edited and names to possibly trigger XSS-attack",
      classes: ["linkable", "type-document"],
      items: [{
        name: changing$,
        prefix: ContentIdPrefix.evil,
        checkedIn: changing$,
      }],
    },
  ];

  const singleDroppables = [
    {
      label: "Root",
      tooltip: "Root Folder; droppable for test-scenarios with empty name",
      classes: ["linkable", "type-folder"],
      // id is an extra option, which overrides any ID calculation.
      items: [{
        id: 1,
      }],
    },
    ...singleDroppableDocuments,
  ];
  const unreadables = [
    {
      label: "Unreadable Document",
      tooltip: "Document cannot be read.",
      classes: ["linkable", "type-document"],
      items: [{
        name: false,
        unreadable: true,
      }],
    },
    {
      label: "(Un-)readable Document (edit)",
      tooltip: "Document which is sometimes in a readable folder, sometimes not.",
      classes: ["linkable", "type-document"],
      items: [{
        name: false,
        unreadable: changing$,
      }],
    },
    {
      label: "Unreadable & Readable Document",
      tooltip: "One document can be read, the other cannot be read.",
      classes: ["linkable", "type-collection"],
      items: [
        {
          name: false,
          unreadable: true,
        },
        {
          name: true,
          unreadable: false,
        },
      ],
    },
    {
      label: "Mixed Unreadable & Readable Documents",
      tooltip: "Two readable, two unreadable documents.",
      classes: ["linkable", "type-collection"],
      items: [
        {
          name: false,
          unreadable: true,
        },
        {
          name: false,
          unreadable: false,
        },
        {
          name: true,
          unreadable: true,
        },
        {
          name: true,
          unreadable: false,
        },
      ],
    },
  ];
  const singleUndroppables = [
    {
      label: "Folder",
      tooltip: "Some Folder",
      classes: ["non-linkable", "type-folder"],
      items: [{
        isFolder: true,
      }],
    },
    {
      label: "Document (nodrop)",
      tooltip: "Some Document of a type forbidden to be dropped.",
      classes: ["non-linkable", "type-document"],
      items: [{
        undroppable: true,
      }],
    },
  ];
  const slowDocuments = [
    {
      label: "Slow Document 1",
      tooltip: "Some Document which takes long to load.",
      classes: ["linkable", "type-document"],
      items: [{
        name: false,
        prefix: ContentIdPrefix.slow,
      }],
    },
    {
      label: "Slow Document 2",
      tooltip: "Some Other Document which takes long to load.",
      classes: ["linkable", "type-document"],
      items: [{
        name: true,
        prefix: ContentIdPrefix.slow,
      }],
    },
  ];
  const pairedExamples = [
    {
      label: "2 Documents",
      tooltip: "Two documents, which are valid to drop.",
      classes: ["linkable", "type-collection"],
      items: [
        {name: false},
        {name: true},
      ],
    },
    {
      label: "2 Documents[Slow/Fast]",
      tooltip: "Slow/Fast",
      classes: ["linkable", "type-collection"],
      items: [
        {name: true, prefix: ContentIdPrefix.slow},
        {name: true},
      ],
    },
    {
      label: "2 Documents (1 nodrop)",
      tooltip: "Two documents, one of them is not allowed to be dropped.",
      classes: ["non-linkable", "type-collection"],
      items: [
        {name: false},
        {name: true, undroppable: true},
      ],
    },
  ];
  const allDroppables = [
    {
      label: `Several Droppables`,
      tooltip: `${singleDroppables.length} contents which are allowed to be dropped.`,
      classes: ["linkable", "type-collection"],
      items: singleDroppables.flatMap((item) => item.items),
    },
    {
      label: `Several Droppable Documents`,
      tooltip: `${singleDroppableDocuments.length} documents which are allowed to be dropped.`,
      classes: ["linkable", "type-collection"],
      items: singleDroppableDocuments.flatMap((item) => item.items),
    },
    {
      label: `Droppable Documents (incl. Slow)`,
      tooltip: `${singleDroppableDocuments.length + slowDocuments.length} including ${slowDocuments.length} documents at the start which load slowly.`,
      classes: ["linkable", "type-collection"],
      items: slowDocuments.concat(singleDroppableDocuments).flatMap((item) => item.items),
    },
  ];

  const allData = [
    ...singleDroppables,
    ...singleUndroppables,
    ...slowDocuments,
    ...pairedExamples,
    ...allDroppables,
    ...unreadables,
  ];

  const generateUriPath = (item) => {
    if (typeof item.id === "number") {
      return `content/${item.id}`;
    }
    return createContentUriPath(item);
  };

  const generateUriPathCsv = (items) => {
    return items.map((item) => generateUriPath(item)).join(",");
  };

  const addDragExample = (parent, data) => {
    const dragDiv = document.createElement("div");
    dragDiv.classList.add("drag-example", ...(data.classes || []));
    dragDiv.draggable = true;
    dragDiv.textContent = data.label || "Unset";
    dragDiv.dataset.cmuripath = generateUriPathCsv(data.items || []);
    dragDiv.title = data.tooltip + " (" + dragDiv.dataset.cmuripath + ")";
    dragDiv.addEventListener("dragstart", setDragData);
    dragDiv.addEventListener("dragend", removeDropData);
    parent.appendChild(dragDiv);
  };

  const main = () => {
    const examplesEl = document.getElementById(DRAG_EXAMPLES_ID);
    if (!examplesEl) {
      console.error(`Required element missing: ${DRAG_EXAMPLES_ID}`);
      return;
    }

    allData.forEach((data) => addDragExample(examplesEl, data));
    console.log(`Initialized ${allData.length} drag examples.`);
  };

  main();
};

const contentList = (...ids) => {
  return ids.map((id) => {
    return {
      $Ref: id,
    }
  });
};

const contentDragData = (...ids) => {
  return {
    contents: contentList(...ids),
  };
};

export {
  initDragExamples
};
