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
import "./aria/ToHaveAriaLabel";

// Import Matcher Interfaces
import type { ApplicationWrapperMatchers } from "./ApplicationWrapperExpectations";
import type { ClassicEditorWrapperMatchers } from "./ClassicEditorWrapperExpectations";
import type { ElementHandleMatchers } from "./ElementHandleExpectations";
import type { ApplicationConsoleMatchers } from "./ApplicationConsoleExpectations";
import type { WaitToBeVisible } from "./IsVisible/WaitToBeVisible";
import type { WaitToBeOn } from "./isToggleable/WaitToBeOn";
import type { WaitToBeEnabled } from "./isEnabled/WaitToBeEnabled";
import type { WaitToHaveContentName } from "./contentName/WaitToHaveContentName";
import type { WaitToHaveAriaLabel } from "./aria/ToHaveAriaLabel";

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
        WaitToHaveAriaLabel,
        WaitToBeOn {}

    interface Matchers<R, T>
      extends ApplicationConsoleMatchers<R, T>,
        ApplicationWrapperMatchers<R, T>,
        ClassicEditorWrapperMatchers<R, T>,
        ElementHandleMatchers<R, T>,
        WaitToBeVisible<R, T>,
        WaitToBeEnabled<R, T>,
        WaitToHaveContentName<R, T>,
        WaitToHaveAriaLabel<R, T>,
        WaitToBeOn<R, T> {}

    interface InverseAsymmetricMatchers
      extends ApplicationConsoleMatchers,
        ApplicationWrapperMatchers,
        ElementHandleMatchers,
        ClassicEditorWrapperMatchers,
        WaitToBeVisible,
        WaitToBeEnabled,
        WaitToHaveContentName,
        WaitToHaveAriaLabel,
        WaitToBeOn {}
  }
}
