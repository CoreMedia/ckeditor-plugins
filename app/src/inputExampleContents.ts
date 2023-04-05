import MockContentPlugin from "@coremedia/ckeditor5-coremedia-studio-integration-mock/content/MockContentPlugin";
import ClassicEditor from "@ckeditor/ckeditor5-editor-classic/src/classiceditor";
import MockInputExamplePlugin, {
  InputExampleElement,
} from "@coremedia/ckeditor5-coremedia-studio-integration-mock/content/MockInputExamplePlugin";

const INPUT_EXAMPLE_CONTENT_DIV_CLASS = "inputExampleContentDiv";

const initInputExampleContent = (editor: ClassicEditor) => {
  const mockContentPlugin = editor.plugins.get(MockContentPlugin);
  const mockInputExamplePlugin = editor.plugins.get(MockInputExamplePlugin);
  // Just ensure that the default content provided by MockContentPlugin
  // still fulfills our expectations.
  const requireExplicitContent = mockContentPlugin.requireExplicitContent;

  // Add some content of not insertable type. By default, only contents of type
  // 'document' are considered insertable.
  mockContentPlugin.addContents({
    id: 40,
    type: "notinsertable",
    name: "Not insertable Content Type",
    linkable: false,
  });

  const singleInputDocuments: InputExampleElement[] = [
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
      label: "Short Name",
      tooltip: "Document with short name (1-unicode char)",
      classes: ["linkable", "type-document"],
      items: [114],
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
    {
      label: "Image",
      tooltip: "Content with some red image blob.",
      classes: ["linkable", "embeddable", "type-document"],
      items: [requireExplicitContent(900)],
    },
    {
      label: "Only Embeddable",
      tooltip: "An image document which may only be embedded but not linked.",
      classes: ["embeddable", "type-document"],
      items: [requireExplicitContent(922)],
    },
    {
      label: "Image (edit)",
      tooltip: "An image, whose blob frequently changes.",
      classes: ["linkable", "embeddable", "type-document"],
      items: [requireExplicitContent(906)],
    },
  ];

  const singleInputs = [
    {
      label: "Root",
      tooltip: "Root Folder; insertable for test-scenarios with empty name",
      classes: ["linkable", "type-folder"],
      // id is an extra option, which overrides any ID calculation.
      items: [requireExplicitContent(1)],
    },
    ...singleInputDocuments,
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
    {
      label: "Image (unreadable)",
      tooltip: "Image document cannot be read.",
      classes: ["linkable", "embeddable", "type-document"],
      items: [requireExplicitContent(914)],
    },
  ];
  const singleInputsNotInsertable = [
    {
      label: "Folder",
      tooltip: "Some Folder",
      classes: ["non-linkable", "type-folder"],
      items: [31],
    },
    {
      label: "Not Insertable",
      tooltip: "Content of not insertable type.",
      classes: ["non-linkable", "type-folder"],
      items: [requireExplicitContent(40)],
    },
  ];
  const slowDocuments: InputExampleElement[] = [
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
    {
      label: "Image (slow)",
      tooltip: "An image, which takes some time to load.",
      classes: ["linkable", "embeddable", "type-document"],
      items: [requireExplicitContent(908)],
    },
  ];
  const pairedExamples = [
    {
      label: "Two",
      tooltip: "Two documents, which are valid to insert.",
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
      tooltip: "Slow/Fast/Slow for testing insert order after lazy loading",
      classes: ["linkable", "type-collection"],
      items: [requireExplicitContent(800), 32, requireExplicitContent(804)],
    },
    {
      label: "Insertable/Not Insertable",
      tooltip: "Two contents, one of them is not allowed to be inserted.",
      classes: ["non-linkable", "type-collection"],
      items: [31, 32],
    },
    {
      label: "Three Images",
      tooltip: "Three images, which are valid to insert.",
      classes: ["linkable", "embeddable", "type-collection"],
      items: [requireExplicitContent(900), requireExplicitContent(902), requireExplicitContent(904)],
    },
  ];
  const allInputs = [
    {
      label: `Several Inputs`,
      tooltip: `${singleInputs.length} contents which are allowed to be inserted.`,
      classes: ["linkable", "type-collection"],
      items: singleInputs.flatMap((item) => item.items),
    },
    {
      label: `Several Input Documents`,
      tooltip: `${singleInputDocuments.length} documents which are allowed to be inserted.`,
      classes: ["linkable", "type-collection"],
      items: singleInputDocuments.flatMap((item) => item.items),
    },
    {
      label: `Insertable Documents (incl. Slow)`,
      tooltip: `${singleInputDocuments.length + slowDocuments.length} including ${
        slowDocuments.length
      } documents at the start which load slowly.`,
      classes: ["linkable", "type-collection"],
      items: slowDocuments.concat(singleInputDocuments).flatMap((item) => item.items),
    },
  ];

  const externalContents: InputExampleElement[] = [
    {
      label: "Insertable external content",
      tooltip: "Insertable External Content",
      classes: ["linkable"],
      items: [{ externalId: 2000 }],
    },
    {
      label: "Already imported external content",
      tooltip: "Already imported external Content",
      classes: ["linkable"],
      items: [{ externalId: 2002 }],
    },
    {
      label: "Not insertable external content",
      tooltip: "Not droppable external content (Unknown type)",
      classes: ["non-linkable"],
      items: [{ externalId: 2004 }],
    },
    {
      label: "Multiple insertable external contents",
      tooltip: "Multiple insertable external contents",
      classes: ["linkable"],
      items: [{ externalId: 2000 }, { externalId: 2002 }],
    },
    {
      label: "Multiple external contents (including not insertable)",
      tooltip: "Multiple external contents (including not insertable)",
      classes: ["non-linkable"],
      items: [{ externalId: 2000 }, { externalId: 2002 }, { externalId: 2004 }],
    },
    {
      label: "External content - error",
      tooltip: "External content - error",
      classes: ["linkable"],
      items: [{ externalId: 2006 }],
    },
  ];

  const allData: InputExampleElement[] = [
    ...singleInputs,
    ...singleInputsNotInsertable,
    ...slowDocuments,
    ...pairedExamples,
    ...allInputs,
    ...unreadables,
    ...createBulkOf50Contents(),
    ...externalContents,
  ];

  const main = () => {
    const examplesEl = document.getElementById(INPUT_EXAMPLE_CONTENT_DIV_CLASS);
    if (!examplesEl) {
      console.error(`Required element missing: ${INPUT_EXAMPLE_CONTENT_DIV_CLASS}`);
      return;
    }

    allData.forEach((data) => {
      const insertDiv: HTMLDivElement = mockInputExamplePlugin.createInsertElement(data);
      examplesEl.appendChild(insertDiv);
    });
    console.log(`Initialized ${allData.length} insert examples.`);
  };

  main();
};

const createBulkOf50Contents = (): [{ classes: string[]; tooltip: string; label: string; items: number[] }] => {
  const ids = [];
  for (let i = 13000; i < 13100; i = i + 2) {
    ids.push(i);
  }
  return [
    {
      label: "50 contents",
      tooltip: "50 contents: ",
      classes: ["linkable", "type-document"],
      items: ids,
    },
  ];
};
export { initInputExampleContent };
