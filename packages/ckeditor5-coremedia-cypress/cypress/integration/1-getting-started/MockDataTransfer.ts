export class MockDataTransfer {
  // TSLoader for Cypress cannot handle private syntax '#' as it seems.
  // It also fails with `Module parse failed: Unexpected token`, when this is an inner class of the spec file.
  data: Map<string, unknown>;

  constructor() {
    this.data = new Map<string, unknown>();
  }

  setData(format: string, data: unknown): void {
    this.data.set(format, data);
  }

  getData(format: string): unknown | undefined {
    return this.data.get(format);
  }
}
