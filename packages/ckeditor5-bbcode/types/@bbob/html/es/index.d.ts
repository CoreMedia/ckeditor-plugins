import { TagNode } from "@bbob/plugin-helper/es";

type BBNode = null | string | number | TagNode | BBNode[];
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
