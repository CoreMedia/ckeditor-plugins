/**
 * Migrates properties of names as given in `R` from `T`
 * to properties of same type as given by `R`.
 *
 * @example
 * ```typescript
 * interface Source {
 *   id: number;
 *   name?: string | string[];
 * }
 *
 * interface Target {
 *   name?: string | string[];
 * }
 *
 * type Migrated = MigrateTo<Source, Target>;
 *
 * const process = (input: Migrated): void => {
 *   const id: number = input.id;
 *   const names: string[] = input.name;
 *   // ...
 * }
 * ```
 */
type MigrateTo<T extends MigrationTarget<R>, R> = Omit<T, keyof R> & R;

/**
 * Defines the migration target for `MigrateTo`.
 */
type MigrationTarget<T> = Partial<Record<keyof T, unknown>>;

export default MigrateTo;
export { MigrationTarget };
