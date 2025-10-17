import type { TagNode } from "@bbob/plugin-helper";
import type { TagNodeTree } from "@bbob/types";

const { isStringNode, isTagNode } = await import("@bbob/plugin-helper");

/**
 * Renders a tag node to its raw content.
 *
 * @param node - node to render
 */
export const renderRaw = (node: TagNode): string => {
  const render = (currentNode: TagNodeTree): string => {
    if (isStringNode(currentNode)) {
      return typeof currentNode === "string" ? currentNode : String(currentNode);
    }

    if (isTagNode(currentNode)) {
      return render(currentNode.content);
    }

    if (Array.isArray(currentNode)) {
      return currentNode.map((entry) => render(entry)).join("");
    }

    return "";
  };

  return render(node.content);
};
