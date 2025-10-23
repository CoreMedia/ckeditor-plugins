export const bijective = "<=>";
export const toView = "=>";
export const toData = "<=";
type Bijective = typeof bijective;
type ToView = typeof toView;
type ToData = typeof toData;
export type TestDirection = Bijective | ToView | ToData;
export const isToView = (direction: TestDirection): boolean => [bijective, toView].includes(direction);
export const isToData = (direction: TestDirection): boolean => [bijective, toData].includes(direction);
