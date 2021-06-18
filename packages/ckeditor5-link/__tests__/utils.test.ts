import { LINK_BEHAVIOR } from "../src/utils";
import { getLinkBehaviorLabels } from "../dist/utils";

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
  ])("should provide mapping for $behavior to $label", ({ behavior, label }) => {
    const map = getLinkBehaviorLabels((s: string) => s);
    const actualLabel = map[behavior];
    expect(actualLabel).toBe(label);
  });
});
