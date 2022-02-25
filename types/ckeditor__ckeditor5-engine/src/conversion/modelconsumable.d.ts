import { Item as ModelItem } from "../model/item";
import ModelSelection from "../model/selection";
import ModelRange from "../model/range";

export default class ModelConsumable {
  consume(item: ModelItem | ModelSelection | ModelRange, type: string): boolean;
}
