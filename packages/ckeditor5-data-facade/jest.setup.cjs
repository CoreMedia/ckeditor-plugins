// jsdom does not yet provide createObjectURL: https://github.com/jsdom/jsdom/issues/1721
// @ts-ignore
URL.createObjectURL = jest.fn();
// @ts-ignore
global.window.ResizeObserver = class {
  observe() {}

  unobserve() {}

  disconnect() {}
};
