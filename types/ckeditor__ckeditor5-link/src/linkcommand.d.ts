import Command from "@ckeditor/ckeditor5-core/src/command";
import Editor from "@ckeditor/ckeditor5-core/src/editor/editor";

export default class LinkCommand extends Command {
  readonly value: Object | undefined;

  constructor(editor: Editor);

  restoreManualDecoratorStates(): void;

  refresh(): void;
}
