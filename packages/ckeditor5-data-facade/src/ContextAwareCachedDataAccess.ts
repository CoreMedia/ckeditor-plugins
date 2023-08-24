import { CachedDataAccess } from "./CachedDataAccess";
import { Context, ContextOptions, DefaultContext } from "./Context";
import { GetDataOptions, SetDataData, SetDataOptions } from "./DataControllerTypes";
import { invalidContext, InvalidData } from "./InvalidData";

export class ContextAwareCachedDataAccess extends CachedDataAccess {
  #lastContext: Context = DefaultContext;

  override setData(data: SetDataData, options: SetDataOptions & ContextOptions = {}): void {
    const { context = DefaultContext } = options;
    super.setData(data, options);
    this.#lastContext = context;
  }

  override getData(options: GetDataOptions & ContextOptions = {}): string | InvalidData {
    const { context = DefaultContext } = options;
    if (this.#lastContext !== context) {
      return invalidContext;
    }
    return super.getData(options);
  }
}
