import { ElementPredicate } from "../matcher/Element";
import { RuleExecutable } from "./RuleExecutable";
import { compileElementDefinition, ElementDefinitionType, isElement } from "../dom/Element";

/**
 * Type of element rule executable responses.
 */
export type ElementRuleExecutableResponse = Exclude<ReturnType<ElementPredicate>, false>;

/**
 * Executable for element rules.
 */
export type ElementRuleExecutable = RuleExecutable<Element, ElementRuleExecutableResponse>;

export const replaceByElementAndClass = (
  definition: ElementDefinitionType,
  reservedClass: string
): ElementRuleExecutable => {
  const compiledDefinition = compileElementDefinition(definition);

  return (params): Node => {
    const { node } = params;
    const { ownerDocument } = node;

    if (!isElement(node)) {
      // Previous rules may have changed identity already. Skipping.
      return node;
    }

    const replacementDefinition = {
      namespaceURI: node.namespaceURI,
      ...compiledDefinition,
    };

    // namespaceURI: Already transformed by DOMConverter before. We can use it as is.
    const replacement: Element = ownerDocument.createElementNS(
      replacementDefinition.namespaceURI,
      replacementDefinition.qualifiedName
    );

    for (const attribute of node.attributes) {
      const imported = ownerDocument.importNode(attribute);
      replacement.setAttributeNodeNS(imported);
    }

    replacement.classList.add(reservedClass);
    return replacement;
  };
};

export const replaceFromElementAndClass = (
  definition: ElementDefinitionType,
  reservedClass: string
): ElementRuleExecutable => {
  const compiledDefinition = compileElementDefinition(definition);

  return (params): Node => {
    const { node } = params;
    const { ownerDocument } = node;

    if (!isElement(node)) {
      // Previous rules may have changed identity already. Skipping.
      return node;
    }

    const replacementDefinition = {
      namespaceURI: node.namespaceURI,
      ...compiledDefinition,
    };

    // namespaceURI: Already transformed by DOMConverter before. We can use it as is.
    const replacement: Element = ownerDocument.createElementNS(
      replacementDefinition.namespaceURI,
      replacementDefinition.qualifiedName
    );

    for (const attribute of node.attributes) {
      const imported = ownerDocument.importNode(attribute);
      replacement.setAttributeNodeNS(imported);
    }

    replacement.classList.remove(reservedClass);

    // Cleanup required, as it seems:
    if (replacement.classList.length === 0) {
      replacement.removeAttribute("class");
    }
    return replacement;
  };
};
