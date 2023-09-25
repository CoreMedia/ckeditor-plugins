export class Autosave {
  adapter?: AutosaveAdapter;
  readonly editor: unknown;

  constructor(editor: unknown) {
    this.editor = editor;
  }

  init(): void {
    // Nothing to do/to mock.
  }

  save(): Promise<unknown> {
    return this.adapter?.save(this.editor) ?? Promise.resolve();
  }
}

export interface AutosaveAdapter {
  save(editor: unknown): Promise<unknown>;
}
