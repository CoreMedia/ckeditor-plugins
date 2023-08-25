import { CachedDataAccess } from "./CachedDataAccess";
import { Context, ContextOptions, DefaultContext } from "./Context";
import { GetDataOptions, SetDataData, SetDataOptions } from "./DataControllerTypes";
import { invalidContext, InvalidData } from "./InvalidData";
import Logger from "@coremedia/ckeditor5-logging/src/logging/Logger";
import LoggerProvider from "@coremedia/ckeditor5-logging/src/logging/LoggerProvider";

export class ContextAwareCachedDataAccess extends CachedDataAccess {
  static readonly #logger: Logger = LoggerProvider.getLogger("ContextAwareCachedDataAccess");

  #lastContext: Context = DefaultContext;

  set context(context: Context) {
    const logger = ContextAwareCachedDataAccess.#logger;

    if (this.#lastContext !== context) {
      logger.debug(`Switching data context from ${String(this.#lastContext)} to ${String(context)}.`);
      this.#lastContext = context;
    }
  }

  get context(): Context {
    return this.#lastContext;
  }

  override setData(data: SetDataData, options: SetDataOptions & ContextOptions = {}): void {
    const { context = DefaultContext } = options;
    super.setData(data, options);
    this.context = context;
  }

  override getData(options: GetDataOptions & ContextOptions = {}): string | InvalidData {
    const logger = ContextAwareCachedDataAccess.#logger;
    const { context = DefaultContext } = options;
    if (this.context !== context) {
      logger.debug(
        `Trying to get data for mismatched context. Actual Context: ${String(
          this.context
        )}, Requested Context: ${String(context)}`
      );
      return invalidContext;
    }
    const data = super.getData(options);
    logger.debug(`Got Data for Context ${String(context)}: ${String(data)}`);
    return data;
  }
}
