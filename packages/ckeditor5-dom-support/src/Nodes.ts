import { isElement } from "./Elements";

const serializer = new XMLSerializer();

/**
 * Serialize given node to string.
 *
 * @param node - node to serialize
 */
export const serializeToXmlString = (node: Node): string => serializer.serializeToString(node);

/**
 * Extracts node contents from given node. All child-nodes will be removed
 * from the given node.
 *
 * @param node - node to extract node contents from
 * @returns fragment containing all child nodes
 */
export const extractNodeContents = (node: Node): DocumentFragment => {
  const { ownerDocument } = node;
  const range = ownerDocument?.createRange() ?? new Range();
  range.selectNodeContents(node);
  return range.extractContents();
};

/**
 * Moves contents from one node to another, appending them to the target node.
 *
 * @param source - source node to move from
 * @param target - target node to move to
 */
export const appendNodeContents = (source: Node, target: Node): void => {
  const fragment = extractNodeContents(source);
  if (isElement(target)) {
    target.append(fragment);
  } else {
    for (const child of fragment.childNodes) {
      target.appendChild(child);
    }
  }
};

/**
 * Moves contents from one node to another, prepending them to the target node.
 *
 * @param source - source node to move from
 * @param target - target node to move to
 */
export const prependNodeContents = (source: Node, target: Node): void => {
  const fragment = extractNodeContents(source);
  if (isElement(target)) {
    target.prepend(fragment);
  } else {
    const { firstChild } = target;
    for (const child of fragment.childNodes) {
      target.insertBefore(child, firstChild);
    }
  }
};
