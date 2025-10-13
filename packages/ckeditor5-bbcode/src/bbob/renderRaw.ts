import type { TagNode } from "@bbob/plugin-helper/es";
import { isStringNode, isTagNode } from "@bbob/plugin-helper/es";

/**
 * Renders a tag node to its raw content.
 *
 * @param node - node to render
 */
export const renderRaw = (node: TagNode): string => {
  const render = (currentNode: NonNullable<TagNode["content"]>[number] | TagNode["content"]): string => {
    if (!currentNode) {
      return "";
    }

    if (isStringNode(currentNode)) {
      return currentNode;
    }

    if (isTagNode(currentNode)) {
      return render(currentNode.content);
    }

    return currentNode.map((entry) => render(entry)).join("");
  };

  return render(node.content);
};
