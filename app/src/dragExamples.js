import {serviceAgent} from "@coremedia/service-agent";
import MockDragDropService from "@coremedia/ckeditor5-coremedia-studio-integration-mock/content/MockDragDropService";
import MockContentPlugin from "@coremedia/ckeditor5-coremedia-studio-integration-mock/content/MockContentPlugin";

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
    dragEvent.dataTransfer.setData('text', JSON.stringify(contentList(...idsArray)));
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

const initDragExamples = (editor) => {

  const mockContentPlugin = editor.plugins.get(MockContentPlugin);
  // Just ensure, that the default content provided by MockContentPlugin
  // still fulfills our expectations.
  const requireExplicitContent = mockContentPlugin.requireExplicitContent;

  // Add some content of undroppable type. (By default only contents of type 'document'
  // are considered droppable.
  mockContentPlugin.addContents({
    id: 40,
    type: "undroppable",
    name: "Undroppable Content Type",
  });

  const singleDroppableDocuments = [
    {
      label: "Document 1",
      tooltip: "Some Document",
      classes: ["linkable", "type-document"],
      items: [30],
    },
    {
      label: "Document 2",
      tooltip: "Some Other Document",
      classes: ["linkable", "type-document"],
      items: [32],
    },
    {
      label: "Document (edit)",
      tooltip: "Document which is actively edited",
      classes: ["linkable", "type-document"],
      items: [requireExplicitContent(112)],
    },
    {
      label: "Entities",
      tooltip: "Entities in name",
      classes: ["linkable", "type-document"],
      items: [requireExplicitContent(600)],
    },
    {
      label: "Characters",
      tooltip: "Various characters in name",
      classes: ["linkable", "type-document"],
      items: [requireExplicitContent(602)],
    },
    {
      label: "RTL",
      tooltip: "Left-to-Right name",
      classes: ["linkable", "type-document"],
      items: [requireExplicitContent(604)],
    },
    {
      label: "XSS",
      tooltip: "Some possible Cross-Site-Scripting Attack",
      classes: ["linkable", "type-document"],
      items: [requireExplicitContent(606)],
    },
    {
      label: "Long",
      tooltip: "Very long name",
      classes: ["linkable", "type-document"],
      items: [requireExplicitContent(608)],
    },
  ];

  const singleDroppables = [
    {
      label: "Root",
      tooltip: "Root Folder; droppable for test-scenarios with empty name",
      classes: ["linkable", "type-folder"],
      // id is an extra option, which overrides any ID calculation.
      items: [requireExplicitContent(1)],
    },
    ...singleDroppableDocuments,
  ];
  const unreadables = [
    {
      label: "Unreadable",
      tooltip: "Document cannot be read.",
      classes: ["linkable", "type-document"],
      items: [requireExplicitContent(104)],
    },
    {
      label: "Sometimes Unreadable",
      tooltip: "Document cannot be read sometimes.",
      classes: ["linkable", "type-document"],
      items: [requireExplicitContent(106)],
    },
    {
      label: "Some Unreadable",
      tooltip: "One document can be read, the other cannot be read.",
      classes: ["linkable", "type-collection"],
      items: [30, requireExplicitContent(104), 32],
    },
  ];
  const singleUndroppables = [
    {
      label: "Folder",
      tooltip: "Some Folder",
      classes: ["non-linkable", "type-folder"],
      items: [31],
    },
    {
      label: "Undroppable",
      tooltip: "Content of undroppable type.",
      classes: ["non-linkable", "type-folder"],
      items: [requireExplicitContent(40)],
    },
  ];
  const slowDocuments = [
    {
      label: "Slow",
      tooltip: "Slowed down access to content",
      classes: ["linkable", "type-document"],
      items: [requireExplicitContent(800)],
    },
    {
      label: "Very Slow",
      tooltip: "Content takes more than just minutes to load.",
      classes: ["linkable", "type-document"],
      items: [requireExplicitContent(802)],
    },
  ];
  const pairedExamples = [
    {
      label: "Two",
      tooltip: "Two documents, which are valid to drop.",
      classes: ["linkable", "type-collection"],
      items: [30, 32],
    },
    {
      label: "Slow/Fast",
      tooltip: "Two documents, the first one slow to load, the other fast to load.",
      classes: ["linkable", "type-collection"],
      items: [requireExplicitContent(800), 32],
    },
    {
      label: "Fast/Slow",
      tooltip: "Two documents, the first one fast to load, the other slow to load.",
      classes: ["linkable", "type-collection"],
      items: [32, requireExplicitContent(800)],
    },
    {
      label: "Slow/Fast/Slow",
      tooltip: "Slow/Fast/Slow for testing drop order after lazy loading",
      classes: ["linkable", "type-collection"],
      items: [requireExplicitContent(800), 32, requireExplicitContent(804)],
    },
    {
      label: "Droppable/Not Droppable",
      tooltip: "Two contents, one of them is not allowed to be dropped.",
      classes: ["non-linkable", "type-collection"],
      items: [31, 32],
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
    ...unreadables
  ];

  const generateUriPath = (item) => {
    return `content/${item}`;
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
