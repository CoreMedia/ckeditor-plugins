export interface HasToggleable {
  get toggleable(): Promise<boolean>;

  get on(): Promise<boolean>;
}
