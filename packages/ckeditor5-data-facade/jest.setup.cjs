URL.createObjectURL = jest.fn();
// @ts-expect-error place ResizeObserver
global.window.ResizeObserver = class {
  observe() {}

  unobserve() {}

  disconnect() {}
};
