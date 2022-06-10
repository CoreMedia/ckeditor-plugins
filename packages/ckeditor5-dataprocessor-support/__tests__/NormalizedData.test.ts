import { isNormalizedData, toNormalizedData } from "../src/NormalizedData";

// Just don't corrupt the table indentation too much.
const n = toNormalizedData;

describe("NormalizedData", () => {
  it.each`
    value          | transformed | comment
    ${""}          | ${true}     | ${"Should be possible to normalize empty string."}
    ${"Lorem"}     | ${true}     | ${"Should be possible to normalize some string."}
    ${"n8d:Lorem"} | ${false}    | ${"Faking normalized string should work."}
    ${n("Ipsum")}  | ${false}    | ${"Should not transform string already marked as normalized."}
  `("[$#] toNormalizedData for '${value}' ($comment)", ({ value, transformed }) => {
    const normalized = toNormalizedData(value);
    expect(isNormalizedData(normalized)).toStrictEqual(true);
    const expectedTransformation = (transformed ? expect(normalized).not : expect(normalized)).toStrictEqual;
    expectedTransformation(value);
  });
});
