// noinspection JSUnusedGlobalSymbols

// Import expect.extend
import "./ElementHandleExpectations";
import "./LocatorExpectations";
import "./ApplicationWrapperExpectations";
import "./ClassicEditorWrapperExpectations";

// Import Matcher Interfaces
import { ElementHandleMatchers } from "./ElementHandleExpectations";
import { LocatorMatchers } from "./LocatorExpectations";
import { ApplicationWrapperMatchers } from "./ApplicationWrapperExpectations";
import { ClassicEditorWrapperMatchers } from "./ClassicEditorWrapperExpectations";

/**
 * Tell TypeScript to know of new matchers.
 */
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    interface Expect
      extends ApplicationWrapperMatchers,
        ClassicEditorWrapperMatchers,
        ElementHandleMatchers,
        LocatorMatchers {}

    // eslint-disable-next-line @typescript-eslint/ban-types
    interface Matchers<R = unknown, T = {}>
      extends ApplicationWrapperMatchers<R, T>,
        ClassicEditorWrapperMatchers<R, T>,
        ElementHandleMatchers<R, T>,
        LocatorMatchers<R, T> {}

    interface InverseAsymmetricMatchers
      extends ApplicationWrapperMatchers,
        ElementHandleMatchers,
        ClassicEditorWrapperMatchers,
        LocatorMatchers {}
  }
}
