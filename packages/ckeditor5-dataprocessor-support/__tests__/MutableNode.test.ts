/**
 * A wrapper for DOM nodes, to store changes to be applied to the DOM structure
 * later on.
 */
class MutableA {
  private static readonly A_SYMBOL: symbol = Symbol("A");
  protected readonly _symbol: symbol[];

  constructor(...symbol: symbol[]) {
    this._symbol = [MutableA.A_SYMBOL, ...symbol];
  }

/*
  static [Symbol.hasInstance](x: any) {
    if (!x || !x.hasOwnProperty("_symbol")) {
      return false;
    }
    return x._symbol.indexOf(MutableA.A_SYMBOL) >= 0;
  }
*/
}

class MutableB extends MutableA {
  private static readonly B_SYMBOL: symbol = Symbol("B");

  constructor(...symbol: symbol[]) {
    super(MutableB.B_SYMBOL, ...symbol);
  }

/*
  static [Symbol.hasInstance](x: any) {
    if (!x || !x.hasOwnProperty("_symbol")) {
      return false;
    }
    return x._symbol.indexOf(MutableB.B_SYMBOL) >= 0;
  }
*/
}

test("Proof of concept", () => {
  const a = new MutableA();
  const b = new MutableB();

  expect(a).toBeInstanceOf(MutableA);
  expect(b).toBeInstanceOf(MutableB);
  expect(a).not.toBeInstanceOf(MutableB);
  expect(b).toBeInstanceOf(MutableA);
});
