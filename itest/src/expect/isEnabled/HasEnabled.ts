export interface HasEnabled {
  get enabled(): Promise<boolean>;
}
