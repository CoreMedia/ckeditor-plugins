declare module "@bbob/html/es" {
  export default function toHTML(
    source: string,
    // eslint-disable-next-line @typescript-eslint/ban-types
    plugins?: Function | Function[],
    options?: {
      onlyAllowTags?: string[];
      contextFreeTags?: string[];
      enableEscapeTags?: boolean;
    }
  ): string;
}
