import { LINK_BEHAVIOR } from "../src/utils";
import { getLinkBehaviorLabels, uiValuesToLinkTarget } from "../dist/utils";

describe("uiValuesToLinkTarget", () => {
  /**
   * As self-repair mechanism, unexpected targets for a given behavior shall be ignored.
   */
  const ignorableTarget = "ignorableTarget";
  const someTarget = "someTarget";
  const ExpectError = Symbol("ExpectError");

  test.each<{uiBehavior: string, uiTarget?: string, modelValue: string | typeof ExpectError}>([
    {
      uiBehavior: LINK_BEHAVIOR.DEFAULT,
      modelValue: "",
    },
    {
      uiBehavior: LINK_BEHAVIOR.DEFAULT,
      uiTarget: ignorableTarget,
      modelValue: "",
    },
    {
      uiBehavior: LINK_BEHAVIOR.OPEN_IN_NEW_TAB,
      modelValue: "_blank",
    },
    {
      uiBehavior: LINK_BEHAVIOR.OPEN_IN_NEW_TAB,
      uiTarget: ignorableTarget,
      modelValue: "_blank",
    },
    {
      uiBehavior: LINK_BEHAVIOR.OPEN_IN_CURRENT_TAB,
      modelValue: "_self",
    },
    {
      uiBehavior: LINK_BEHAVIOR.OPEN_IN_CURRENT_TAB,
      uiTarget: ignorableTarget,
      modelValue: "_self",
    },
    {
      uiBehavior: LINK_BEHAVIOR.SHOW_EMBEDDED,
      modelValue: "_embed",
    },
    {
      uiBehavior: LINK_BEHAVIOR.SHOW_EMBEDDED,
      uiTarget: ignorableTarget,
      modelValue: "_embed",
    },
    {
      uiBehavior: LINK_BEHAVIOR.OPEN_IN_FRAME,
      uiTarget: someTarget,
      modelValue: someTarget,
    },
    {
      uiBehavior: LINK_BEHAVIOR.OPEN_IN_FRAME,
      modelValue: "_other",
    },
    {
      uiBehavior: LINK_BEHAVIOR.OPEN_IN_FRAME,
      uiTarget: "",
      modelValue: "_other",
    },
    {
      uiBehavior: "unknown",
      modelValue: ExpectError,
    },
  ])("[$#] Should transform UI values $uiBehavior and $uiTarget to $modelValue", ({uiBehavior, uiTarget, modelValue}) => {
    if (modelValue === ExpectError) {
      expect(() => uiValuesToLinkTarget(uiBehavior, uiTarget)).toThrow();
    } else {
      const actualModelValue = uiValuesToLinkTarget(uiBehavior, uiTarget);
      expect(actualModelValue).toBe(modelValue);
    }
  })
});

describe("getLinkBehaviorLabels", () => {
  test.each <{ behavior: string, label: string }>([
    {
      behavior: LINK_BEHAVIOR.OPEN_IN_NEW_TAB,
      label: "Open in New Tab",
    },
    {
      behavior: LINK_BEHAVIOR.OPEN_IN_CURRENT_TAB,
      label: "Open in Current Tab",
    },
    {
      behavior: LINK_BEHAVIOR.SHOW_EMBEDDED,
      label: "Show Embedded",
    },
    {
      behavior: LINK_BEHAVIOR.OPEN_IN_FRAME,
      label: "Open in Frame",
    },
    {
      behavior: LINK_BEHAVIOR.DEFAULT,
      label: "Unspecified",
    },
  ])("[$#] should provide mapping for $behavior to $label", ({ behavior, label }) => {
    const map = getLinkBehaviorLabels((s: string) => s);
    const actualLabel = map[behavior];
    expect(actualLabel).toBe(label);
  });
});
