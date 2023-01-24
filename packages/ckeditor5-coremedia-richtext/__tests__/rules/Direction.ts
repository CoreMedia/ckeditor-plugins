export const bijective = "<=>";
const toView = "=>";
export const toData = "<=";
type Bijective = typeof bijective;
type ToView = typeof toView;
type ToData = typeof toData;
export type Direction = Bijective | ToView | ToData;
export const isToView = (direction: Direction): boolean => [bijective, toView].includes(direction);
export const isToData = (direction: Direction): boolean => [bijective, toData].includes(direction);
