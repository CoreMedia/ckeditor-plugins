import { LINK_BEHAVIOR, getLinkBehaviorLabels, linkTargetToUiValues, uiValuesToLinkTarget } from "../src/utils";

describe("linkTargetToUiValues", () => {
  describe.each<{ linkTarget: string, uiTarget: string, uiBehavior: string }>([
    {
      linkTarget: "",
      uiBehavior: LINK_BEHAVIOR.DEFAULT,
      uiTarget: "",
    },
    {
      linkTarget: "someTarget",
      uiBehavior: LINK_BEHAVIOR.OPEN_IN_FRAME,
      uiTarget: "someTarget",
    },
    {
      linkTarget: "some_target",
      uiBehavior: LINK_BEHAVIOR.OPEN_IN_FRAME,
      uiTarget: "some_target",
    },
    {
      linkTarget: "some_other_target",
      uiBehavior: LINK_BEHAVIOR.OPEN_IN_FRAME,
      uiTarget: "some_other_target",
    },
    {
      linkTarget: "_top",
      uiBehavior: LINK_BEHAVIOR.OPEN_IN_FRAME,
      uiTarget: "_top",
    },
    {
      linkTarget: "_parent",
      uiBehavior: LINK_BEHAVIOR.OPEN_IN_FRAME,
      uiTarget: "_parent",
    },
    {
      linkTarget: "_none",
      uiBehavior: LINK_BEHAVIOR.OPEN_IN_FRAME,
      uiTarget: "_none",
    },
    {
      linkTarget: "_top_",
      uiBehavior: LINK_BEHAVIOR.OPEN_IN_FRAME,
      uiTarget: "_top_",
    },
    {
      linkTarget: "_parent_",
      uiBehavior: LINK_BEHAVIOR.OPEN_IN_FRAME,
      uiTarget: "_parent_",
    },
    {
      linkTarget: "_none_",
      uiBehavior: LINK_BEHAVIOR.OPEN_IN_FRAME,
      uiTarget: "_none_",
    },
    {
      linkTarget: "_blank",
      uiBehavior: LINK_BEHAVIOR.OPEN_IN_NEW_TAB,
      uiTarget: "",
    },
    {
      linkTarget: "_self",
      uiBehavior: LINK_BEHAVIOR.OPEN_IN_CURRENT_TAB,
      uiTarget: "",
    },
    {
      linkTarget: "_embed",
      uiBehavior: LINK_BEHAVIOR.SHOW_EMBEDDED,
      uiTarget: "",
    },
    {
      linkTarget: "_other",
      uiBehavior: LINK_BEHAVIOR.OPEN_IN_FRAME,
      uiTarget: "",
    },
    {
      linkTarget: "_blank_",
      uiBehavior: LINK_BEHAVIOR.OPEN_IN_NEW_TAB,
      uiTarget: "",
    },
    {
      linkTarget: "_self_",
      uiBehavior: LINK_BEHAVIOR.OPEN_IN_CURRENT_TAB,
      uiTarget: "",
    },
    {
      linkTarget: "_embed_",
      uiBehavior: LINK_BEHAVIOR.SHOW_EMBEDDED,
      uiTarget: "",
    },
    {
      linkTarget: "_other_",
      uiBehavior: LINK_BEHAVIOR.OPEN_IN_FRAME,
      uiTarget: "",
    },
    {
      linkTarget: "_blank_someTarget",
      uiBehavior: LINK_BEHAVIOR.OPEN_IN_NEW_TAB,
      uiTarget: "someTarget",
    },
    {
      linkTarget: "_self_someTarget",
      uiBehavior: LINK_BEHAVIOR.OPEN_IN_CURRENT_TAB,
      uiTarget: "someTarget",
    },
    {
      linkTarget: "_embed_someTarget",
      uiBehavior: LINK_BEHAVIOR.SHOW_EMBEDDED,
      uiTarget: "someTarget",
    },
    {
      linkTarget: "_blank_some_target",
      uiBehavior: LINK_BEHAVIOR.OPEN_IN_NEW_TAB,
      uiTarget: "some_target",
    },
    {
      linkTarget: "_self_some_target",
      uiBehavior: LINK_BEHAVIOR.OPEN_IN_CURRENT_TAB,
      uiTarget: "some_target",
    },
    {
      linkTarget: "_embed_some_target",
      uiBehavior: LINK_BEHAVIOR.SHOW_EMBEDDED,
      uiTarget: "some_target",
    },
    {
      linkTarget: "_role_someTarget",
      uiBehavior: LINK_BEHAVIOR.OPEN_IN_FRAME,
      uiTarget: "someTarget",
    },
    {
      linkTarget: "_role_some_target",
      uiBehavior: LINK_BEHAVIOR.OPEN_IN_FRAME,
      uiTarget: "some_target",
    },
  ])("[$#] should transform model value '$linkTarget' to target='$uiTarget' and behavior='$uiBehavior'",
    ({
       linkTarget,
       uiTarget,
       uiBehavior
     }) => {
      const { target: actualTarget, linkBehavior: actualBehavior } = linkTargetToUiValues(linkTarget);
      test(`UI Target: Expecting '${uiTarget}' to be extracted from '${linkTarget}'`, () => {
        expect(actualTarget).toBe(uiTarget);
      });
      test(`UI Behavior: Expecting '${uiBehavior}' to be extracted from '${linkTarget}'`, () => {
        expect(actualBehavior).toBe(uiBehavior);
      });
    });
});

describe("uiValuesToLinkTarget", () => {
  /**
   * As self-repair mechanism, unexpected targets for a given behavior shall be ignored.
   */
  const ignorableTarget = "ignorableTarget";
  const someTarget = "someTarget";
  const ExpectError = Symbol("ExpectError");

  test.each<{ uiBehavior: string, uiTarget?: string, modelValue: string | typeof ExpectError }>([
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
  ])("[$#] Should transform UI values $uiBehavior and $uiTarget to $modelValue", ({
                                                                                    uiBehavior,
                                                                                    uiTarget,
                                                                                    modelValue
                                                                                  }) => {
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
    const map = getLinkBehaviorLabels((message) => <string>message);
    const actualLabel = map[behavior];
    expect(actualLabel).toBe(label);
  });
});
