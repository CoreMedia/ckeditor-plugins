import { TagAttrs } from "@bbob/plugin-helper/es";
import { getParsedProtocol, isApprovedProtocol, relativeProtocol, unknownProtocol } from "./urlProtocols";

export interface AttributeValidationContext {
  attrName: string;
  owner: HTMLElement;
  tag: string;
  value: TagAttrs[string];
}

// TODO: Document undefined when not relevant/undecided.
export type AttributeValidator = (context: AttributeValidationContext) => boolean | undefined;

export const forbidEventHandlerAttributes =
  (): AttributeValidator =>
  ({ attrName }) =>
    !attrName.toLowerCase().startsWith("on");

const allowOnlyApprovedProtocol = (url: string, allowRelative = false): boolean => {
  const protocol = getParsedProtocol(url);
  if (protocol === unknownProtocol) {
    return false;
  }
  if (protocol === relativeProtocol) {
    return allowRelative;
  }
  const scheme = protocol.replace(/^(.*):$/, "$1");
  return isApprovedProtocol(scheme);
};

export const allowOnlyApprovedHref =
  ({ allowRelative = false } = {}): AttributeValidator =>
  ({ attrName, owner, value }): boolean | undefined => {
    if (attrName === "href" && owner instanceof HTMLAnchorElement) {
      return allowOnlyApprovedProtocol(value, allowRelative);
    }
  };

export const allowOnlyApprovedSrc =
  ({ allowRelative = false } = {}): AttributeValidator =>
  ({ attrName, owner, value }): boolean | undefined => {
    if (attrName === "src" && owner instanceof HTMLImageElement) {
      return allowOnlyApprovedProtocol(value, allowRelative);
    }
  };

const noObjectionsAny =
  (validators: AttributeValidator[]): AttributeValidator =>
  (context: AttributeValidationContext): boolean | undefined => {
    const vetoed = validators.some((v) => v(context) === false);
    return !vetoed;
  };

export interface AttributeGuardConfig {
  readonly validator: AttributeValidator;
}

export class AttributeGuard implements AttributeGuardConfig {
  readonly validator: AttributeValidator;

  constructor(config: AttributeGuardConfig) {
    this.validator = config.validator;
  }

  filteredEntries(
    attrs: TagAttrs,
    context: Pick<AttributeValidationContext, "owner" | "tag">,
  ): [name: string, value: string][] {
    return Object.entries(attrs).filter(([attrName, value]) =>
      this.validator({
        ...context,
        attrName,
        value,
      }),
    );
  }
}

export const defaultAttributeGuard = new AttributeGuard({
  // TODO: Disable relative links again with reference to: https://github.com/ckeditor/ckeditor5/issues/15258
  validator: noObjectionsAny([
    forbidEventHandlerAttributes(),
    allowOnlyApprovedHref({ allowRelative: true }),
    allowOnlyApprovedSrc(),
  ]),
});
