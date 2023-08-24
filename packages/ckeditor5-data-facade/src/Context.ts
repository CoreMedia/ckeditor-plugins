export const DefaultContext = Symbol("DefaultContext");

export type DefaultContextType = typeof DefaultContext;

export type Context = string | DefaultContextType;

export interface ContextOptions {
  context?: Context;
}
