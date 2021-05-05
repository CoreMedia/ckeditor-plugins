//export default function toMap<T>(data: Record<string, T> | Array<[string, T]> | Map<string, T>): Map<string, T>;
export default function toMap<K, V>(data: readonly (readonly [K, V])[] | null): Map<K, V>;
