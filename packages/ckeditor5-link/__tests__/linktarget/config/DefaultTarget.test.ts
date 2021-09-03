import { DEFAULT_TARGETS_ARRAY } from "../../../dist/linktarget/config/DefaultTarget";

describe("DefaultTarget", () => {
  describe("DEFAULT_TARGETS_ARRAY", () => {
    test("should contain entries in expected order", () => {
      const names = DEFAULT_TARGETS_ARRAY.map((definition) => definition.name);
      // These are the buttons we want to see in the given order by default,
      // if no other configuration got provided.
      expect(names).toEqual(["_self", "_blank", "_embed", "_other"]);
    })
  });
});
