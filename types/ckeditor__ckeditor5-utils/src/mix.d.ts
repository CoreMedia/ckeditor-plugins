export default function mix<T>(baseClass: { new(...p: any[]): T }, ...mixins: Array<Partial<T>>): void;
