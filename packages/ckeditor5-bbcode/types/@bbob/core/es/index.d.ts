export default function bbob(
  // eslint-disable-next-line @typescript-eslint/ban-types
  plugs?: Function | Function[],
): {
  process: (
    input: string | undefined,
    opts?: {
      // eslint-disable-next-line @typescript-eslint/ban-types
      parser?: Function;
      // eslint-disable-next-line @typescript-eslint/ban-types
      render?: Function;
      skipParse?: boolean;
      data?: null | unknown;
      onlyAllowTags?: string[];
      contextFreeTags?: string[];
      enableEscapeTags?: boolean;
    },
  ) => {
    readonly html: string;
    tree: {
      messages: unknown[];
      options: object;
      walk: unknown;
      // eslint-disable-next-line @typescript-eslint/ban-types
      match: Function;
    };
    raw: unknown;
    messages: unknown[];
  };
};
