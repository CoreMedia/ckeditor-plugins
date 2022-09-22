/* eslint @typescript-eslint/no-duplicate-imports: off */
// noinspection JSUnusedGlobalSymbols

// Import expect.extend
import "./ApplicationConsoleExpectations";
import "./ApplicationWrapperExpectations";
import "./ClassicEditorWrapperExpectations";
import "./ElementHandleExpectations";
import "./IsVisible/WaitToBeVisible";
import "./isToggleable/WaitToBeOn";
import "./isEnabled/WaitToBeEnabled";
import "./contentName/WaitToHaveContentName";

// Import Matcher Interfaces
import { ApplicationWrapperMatchers } from "./ApplicationWrapperExpectations";
import { ClassicEditorWrapperMatchers } from "./ClassicEditorWrapperExpectations";
import { ElementHandleMatchers } from "./ElementHandleExpectations";
import { ApplicationConsoleMatchers } from "./ApplicationConsoleExpectations";
import { WaitToBeVisible } from "./IsVisible/WaitToBeVisible";
import { WaitToBeOn } from "./isToggleable/WaitToBeOn";
import { WaitToBeEnabled } from "./isEnabled/WaitToBeEnabled";
import { WaitToHaveContentName } from "./contentName/WaitToHaveContentName";

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
        WaitToBeVisible,
        WaitToBeEnabled,
        WaitToHaveContentName,
        WaitToBeOn {}

    // eslint-disable-next-line @typescript-eslint/ban-types
    interface Matchers<R = unknown, T = {}>
      extends ApplicationConsoleMatchers<R, T>,
        ApplicationWrapperMatchers<R, T>,
        ClassicEditorWrapperMatchers<R, T>,
        ElementHandleMatchers<R, T>,
        WaitToBeVisible<R, T>,
        WaitToBeEnabled<R, T>,
        WaitToHaveContentName<R, T>,
        WaitToBeOn<R, T> {}

    interface InverseAsymmetricMatchers
      extends ApplicationConsoleMatchers,
        ApplicationWrapperMatchers,
        ElementHandleMatchers,
        ClassicEditorWrapperMatchers,
        WaitToBeVisible,
        WaitToBeEnabled,
        WaitToHaveContentName,
        WaitToBeOn {}
  }
}
