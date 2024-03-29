import { ContextMismatchError, isContextMismatchError } from "../src/ContextMismatchError";

describe("ContextMismatchError", () => {
  it("should be possible to instantiate the error without a message", () => {
    const error = new ContextMismatchError();
    expect(error).toHaveProperty("message", "");
  });

  it("should be possible to instantiate the error with a message", () => {
    const msg = "Lorem Ipsum";
    const error = new ContextMismatchError(msg);
    expect(error).toHaveProperty("message", msg);
  });

  it("should be possible to instantiate the error with a actual context", () => {
    const msg = "Lorem Ipsum";
    const actual = "actual";
    const contextInformation = {
      actual,
    };
    const error = new ContextMismatchError(msg, contextInformation);
    expect(error).toHaveProperty("message", msg);
    expect(error).toHaveProperty("actual", actual);
  });

  it("should be possible to instantiate the error with a expected context", () => {
    const msg = "Lorem Ipsum";
    const expected = "expected";
    const contextInformation = {
      expected,
    };
    const error = new ContextMismatchError(msg, contextInformation);
    expect(error).toHaveProperty("message", msg);
    expect(error).toHaveProperty("expected", expected);
  });

  it("should be possible to instantiate the error with both actual and expected context", () => {
    const msg = "Lorem Ipsum";
    const actual = "actual";
    const expected = "expected";
    const contextInformation = {
      actual,
      expected,
    };
    const error = new ContextMismatchError(msg, contextInformation);

    expect(error).toHaveProperty("message", msg);
    expect(error).toHaveProperty("actual", actual);
    expect(error).toHaveProperty("expected", expected);
  });

  it("should be possible to check if an error is a ContextMismatchError", () => {
    const error = new ContextMismatchError();
    expect(isContextMismatchError(error)).toBe(true);

    const anyError = new Error("This is any error and the typeguard should return false");
    expect(isContextMismatchError(anyError)).toBe(false);
  });
});
