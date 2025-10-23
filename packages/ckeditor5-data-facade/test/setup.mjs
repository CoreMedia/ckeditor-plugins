import { setup } from "@coremedia-internal/studio-client.test-runner-helper";

setup(true);

// @ts-expect-error place ResizeObserver
global.window.ResizeObserver = class {
  observe() {
  }

  unobserve() {
  }

  disconnect() {
  }
};
