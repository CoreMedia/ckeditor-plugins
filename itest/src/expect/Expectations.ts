/* eslint @typescript-eslint/no-duplicate-imports: off */
// noinspection JSUnusedGlobalSymbols

// Import expect.extend
import "./ApplicationConsoleExpectations";
import "./ApplicationWrapperExpectations";
import "./ClassicEditorWrapperExpectations";
import "./ElementHandleExpectations";
import "./IsVisible/WaitToBeVisible";

// Import Matcher Interfaces
import { ApplicationWrapperMatchers } from "./ApplicationWrapperExpectations";
import { ClassicEditorWrapperMatchers } from "./ClassicEditorWrapperExpectations";
import { ElementHandleMatchers } from "./ElementHandleExpectations";
import { ApplicationConsoleMatchers } from "./ApplicationConsoleExpectations";
import { WaitToBeVisible } from "./IsVisible/WaitToBeVisible";

/**
 * Tell TypeScript to know of new matchers.
 */
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    interface Expect
      extends ApplicationConsoleMatchers,
        ApplicationWrapperMatchers,
        ClassicEditorWrapperMatchers,
        ElementHandleMatchers,
        WaitToBeVisible {}

    // eslint-disable-next-line @typescript-eslint/ban-types
    interface Matchers<R = unknown, T = {}>
      extends ApplicationConsoleMatchers<R, T>,
        ApplicationWrapperMatchers<R, T>,
        ClassicEditorWrapperMatchers<R, T>,
        ElementHandleMatchers<R, T>,
        WaitToBeVisible<R, T> {}

    interface InverseAsymmetricMatchers
      extends ApplicationConsoleMatchers,
        ApplicationWrapperMatchers,
        ElementHandleMatchers,
        ClassicEditorWrapperMatchers,
        WaitToBeVisible {}
  }
}
