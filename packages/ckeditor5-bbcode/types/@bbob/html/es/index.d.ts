declare module "@bbob/html/es" {
  interface BBNodeObject {
    content: null | unknown;
    tag: string;
    attrs: unknown;
  }
  type BBNode = null | string | number | BBNodeObject | BBNode[];
  export default function toHTML(
    source: string,
    // eslint-disable-next-line @typescript-eslint/ban-types
    plugins?: Function | Function[],
    options?: {
      onlyAllowTags?: string[];
      contextFreeTags?: string[];
      enableEscapeTags?: boolean;
    },
  ): string;
  export const render: (nodes: BBNode, { stripTags = false } = {}) => string;
}
