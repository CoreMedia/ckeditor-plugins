import { capitalize, increaseUpToAndRestart, isObject } from "../../src/content/MockContentUtils";

describe("MockContentUtils", () => {
  test.each`
    input | upperBound | expected | expectedRestart
    ${0}  | ${0}       | ${0}     | ${true}
    ${0}  | ${1}       | ${0}     | ${true}
    ${0}  | ${-1}      | ${0}     | ${true}
    ${1}  | ${0}       | ${0}     | ${true}
    ${1}  | ${1}       | ${0}     | ${true}
    ${2}  | ${1}       | ${0}     | ${true}
    ${0}  | ${2}       | ${1}     | ${false}
    ${1}  | ${2}       | ${0}     | ${true}
  `("[$#] increaseUpToAndRestart($input, $upperBound) = $expected, restart? $expectedRestart", (data) => {
    const { input, upperBound, expected, expectedRestart } = data;
    expect(increaseUpToAndRestart(input, upperBound)).toStrictEqual({
      value: expected,
      restart: expectedRestart,
    });
  });

  test.each`
    input                 | expected
    ${undefined}          | ${false}
    ${null}               | ${false}
    ${[]}                 | ${true}
    ${""}                 | ${false}
    ${"lorem"}            | ${false}
    ${["lorem"]}          | ${true}
    ${0}                  | ${false}
    ${42}                 | ${false}
    ${[42]}               | ${true}
    ${false}              | ${false}
    ${true}               | ${false}
    ${[true]}             | ${true}
    ${Symbol("@")}        | ${false}
    ${BigInt(0)}          | ${false}
    ${() => {}}           | ${false}
    ${{}}                 | ${true}
    ${{ lorem: "ipsum" }} | ${true}
  `("[$#] isObject($input) = $expected", (data) => {
    const { input, expected } = data;
    expect(isObject(input)).toStrictEqual(expected);
  });

  test.each`
    input           | expected
    ${""}           | ${""}
    ${"a"}          | ${"A"}
    ${"A"}          | ${"A"}
    ${"lorem"}      | ${"Lorem"}
    ${"Lorem"}      | ${"Lorem"}
    ${"loremIpsum"} | ${"LoremIpsum"}
    ${"_"}          | ${"_"}
    ${"_lorem"}     | ${"_lorem"}
  `("[$#] capitalize($input) = $expected", (data) => {
    const { input, expected } = data;
    expect(capitalize(input)).toStrictEqual(expected);
  });
});
