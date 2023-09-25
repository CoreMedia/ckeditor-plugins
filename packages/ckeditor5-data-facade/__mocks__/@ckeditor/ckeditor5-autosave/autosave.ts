export class Autosave {
  adapter?: AutosaveAdapter;

  init(): void {
    // Nothing to do/to mock.
  }
}

export interface AutosaveAdapter {
  save(editor: unknown): Promise<unknown>;
}
