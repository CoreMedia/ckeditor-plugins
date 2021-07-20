import Editor from "@ckeditor/ckeditor5-core/src/editor/editor";
import Model from "@ckeditor/ckeditor5-engine/src/model/model";
import LinkCommand from "@ckeditor/ckeditor5-link/src/linkcommand";
import LinkTargetCommand from "../src/linktarget/LinkTargetCommand";
import DataApiMixin from "@ckeditor/ckeditor5-core/src/editor/utils/dataapimixin";
import mix from "@ckeditor/ckeditor5-utils/src/mix";

describe.skip("LinkTargetCommand", () => {
  let editor: Editor;
  let model: Model;
  let linkCommand: LinkCommand;
  let command: LinkTargetCommand;

  beforeEach(() => {
    return ModelTestEditor.create()
      .then(newEditor => {
        editor = newEditor;
        model = editor.model;
        linkCommand = new LinkCommand(editor);
        // command = new LinkTargetCommand(editor);

        model.schema.extend("$text", {
          allowIn: "$root",
          allowAttributes: ["linkHref", "bold", "linkTarget"],
        });

        model.schema.register('paragraph', { inheritAllFrom: '$block' });
      });
  });

  afterEach(() => {
    return editor?.destroy();
  });

  describe("hurz", () => {
    it("Nothing", () => {
      expect(true).toBe(true);
    });
  })
});


class ModelTestEditor extends Editor {
  constructor(config?: object) {
    super(config);

    // Disable editing pipeline.
    this.editing.destroy();

    // Create the ("main") root element of the model tree.
    this.model.document.createRoot();
  }

  static create(config?: object): Promise<Editor> {
    return new Promise(resolve => {
      console.info("create, destroy editing");
      const editor = new this(config || {});

      resolve(
        editor.initPlugins()
          .then(() => {
            // Fire `data#ready` event manually as `data#init()` method is not used.
            editor.data.fire('ready');
            editor.fire('ready');
          })
          .then(() => editor)
      );
    });
  }
}

mix<any>(ModelTestEditor, DataApiMixin);
