import { isEOL, isTagNode, TagNode } from "@bbob/plugin-helper/es";
import { toNode } from "./TagNodes";

/**
 * Options for `paragraphAwareContent`.
 */
export interface ParagraphAwareContentOptions {
  /**
   * If to require a paragraph. This would ensure that a paragraph even
   * surrounds plain text-content. Otherwise, for only text-contents, no
   * extra paragraph will be added.
   *
   * Defaults to `false`.
   */
  requireParagraph?: boolean;
  /**
   * Threshold of consecutive newlines that are meant to represent a paragraph.
   * Newlines that do not reach this limit will be taken as is to the
   * generated content. For standard HTML elements, this means that these
   * newlines will be regarded as normal blank characters.
   *
   * The threshold defaults to `2`.
   */
  newlineThreshold?: number;
  /**
   * Tag names to consider as _block_, which is, that they will not be embedded
   * within a `[p]` tag.
   */
  blockTags?: TagNode["tag"][];
}

/**
 * Default tags to consider _block-level_. As child-contents were not processed
 * yet, these are raw BBCode elements and not intermediate elements such as
 * `blockquote`, that will later be transformed directly to HTML `<blockquote>`.
 */
const defaultBlockTags: NonNullable<ParagraphAwareContentOptions["blockTags"]> = ["quote", "table", "list"];

/**
 * Processes the top level string nodes and possibly adds a paragraph, where
 * required.
 *
 * Note that processing ignores any possible contained "block-level" elements
 * that for valid HTML must not be contained within a paragraph.
 *
 * **BBob API Note:** The tokenizer will split all newline characters into an
 * extra string-entry. This may be important to know to understand the
 * implementation of this function.
 *
 * @param content - content to process
 * @param options - options to respect
 */
export const paragraphAwareContent = (
  content: TagNode["content"],
  options: ParagraphAwareContentOptions = {},
): TagNode["content"] => {
  const {
    requireParagraph: fromConfigRequireParagraph = false,
    newlineThreshold = 2,
    blockTags = defaultBlockTags,
  } = options;

  if (!content) {
    // eslint-disable-next-line no-null/no-null
    return null;
  }

  if (content.length === 0) {
    if (fromConfigRequireParagraph) {
      return [toNode("p", {}, [])];
    }
    return [];
  }

  /**
   * Flag, if we require adding a paragraph. As soon as we once decided to
   * require a paragraph, all following sections will also require to be
   * added as paragraph.
   */
  let requireParagraph = fromConfigRequireParagraph;

  console.debug("paragraphAwareContent", {
    content: JSON.stringify(content),
    options: JSON.stringify(options),
  });

  // Intermediate buffer, that may need to go to a paragraph node.
  const buffer: NonNullable<TagNode["content"]> = [];
  // Collected EOLs
  const trailingNewlineBuffer: "\n"[] = [];
  // The result to return in the end.
  const result: NonNullable<TagNode["content"]> = [];

  const dumpState = (id = "dumpState") => {
    console.debug(id, {
      buffer: JSON.stringify(buffer),
      trailingNewlineBuffer: JSON.stringify(trailingNewlineBuffer),
      result: JSON.stringify(result),
      requireParagraph,
    });
  };

  // Clear Buffers.
  const clearBuffers = (): void => {
    buffer.length = 0;
    trailingNewlineBuffer.length = 0;
  };

  /**
   * Adds a paragraph and triggers that all subsequent contents also
   * are required to be embedded into a paragraph.
   *
   * The passed content will be added as shallow copy, so that you may
   * safely clear any forwarded buffer afterward.
   *
   * @param content - content to add
   */
  const addCopyAsParagraph = (content: NonNullable<TagNode["content"]>): void => {
    console.debug("addCopyAsParagraph", {
      content: JSON.stringify(content),
    });
    result.push(toNode("p", {}, [...content]));
    requireParagraph = true;
    dumpState("addCopyAsParagraph done.");
  };

  /**
   * We may have collected yet unprocessed newlines that did not reach the
   * given threshold. We must not ignore them completely, as they may
   * represent a relevant separator. But it is safe to squash them to one
   * single blank character. Just to keep the identity similar, we again use
   * a newline character as this squashed result.
   */
  const squashAndPushNewlinesToBuffer = (): void => {
    console.debug("squashAndPushNewlinesToBuffer", {
      trailingNewlineBuffer,
    });
    if (trailingNewlineBuffer.length > 0) {
      buffer.push("\n");
      // Clear buffer, we respected the newlines.
      trailingNewlineBuffer.length = 0;
    }
    dumpState("squashAndPushNewlinesToBuffer done");
  };

  /**
   * Flush when we processed the last content entry.
   */
  const flushFinally = (): void => {
    console.debug(`flushFinally`, {
      buffer,
      trailingNewlineBuffer,
      result,
    });

    if (requireParagraph) {
      // Design Scope: Ignore any trailing newlines as irrelevant.
      // buffer.length > 0: By default, add no empty paragraphs.
      // fromConfigRequireParagraph: But, if originally we requested to always
      // add a paragraph, do so. It may be a structural requirement.
      // For this, we need to check the result-length, though, as otherwise
      // we may add an empty paragraph to some already existing content.
      if (buffer.length > 0 || (result.length === 0 && fromConfigRequireParagraph)) {
        addCopyAsParagraph(buffer);
      }
    } else {
      squashAndPushNewlinesToBuffer();
      result.push(...buffer);
    }

    dumpState("flushFinally done");
  };

  const flush = (): void => {
    console.debug(`flush`, {
      buffer,
      trailingNewlineBuffer,
      result,
    });
    if (buffer.length > 0) {
      // Any trailing EOLs may safely be ignored here.
      addCopyAsParagraph(buffer);
    }
    // Design Scope: Not having an else-branch here also means that we
    // ignore any leading newlines.
    clearBuffers();
    dumpState("flush done");
  };

  const flushOnParagraph = (): void => {
    if (trailingNewlineBuffer.length >= newlineThreshold) {
      console.debug(`flushOnParagraph: reached threshold`, {
        trailingNewlineBuffer,
        newlineThreshold,
      });
      const onlyNewlinesAtStart = 0 === result.length + buffer.length;
      if (onlyNewlinesAtStart) {
        // This triggers a similar behavior to when we did not reach the
        // threshold, i.e., to keep leading newlines, but squash them.
        squashAndPushNewlinesToBuffer();
      } else {
        // The previously stored entries represent a paragraph.
        // Let's create a new paragraph node.
        flush();
      }
    } else {
      console.debug(`flushOnParagraph: threshold not reached`, {
        trailingNewlineBuffer,
        newlineThreshold,
      });
      squashAndPushNewlinesToBuffer();
    }
    dumpState("flushOnParagraph done");
  };

  const handleTagNode = (node: TagNode): void => {
    const { tag } = node;
    if (blockTags.includes(tag)) {
      console.debug(`handleTagNode (as block tag): ${JSON.stringify(node)}`);
      // If it is a block-tag, put previous contents in a paragraph.
      flush();
      result.push(node);
    } else {
      console.debug(`handleTagNode (standard behavior): ${JSON.stringify(node)}`);
      flushOnParagraph();
      buffer.push(node);
    }
    dumpState("handleTagNode done");
  };

  const handleString = (value: string): void => {
    if (isEOL(value)) {
      console.debug(`handleString (as EOL): ${JSON.stringify(value)}`);
      trailingNewlineBuffer.push(value);
    } else {
      console.debug(`handleString (as normal string): ${JSON.stringify(value)}`);
      flushOnParagraph();
      buffer.push(value);
    }
    dumpState("handleString done");
  };

  for (const contentItem of content) {
    console.debug(`loop: ${JSON.stringify(contentItem)}`);
    if (isTagNode(contentItem)) {
      handleTagNode(contentItem);
    } else {
      handleString(contentItem);
    }
    dumpState(`loop done: ${JSON.stringify(contentItem)}`);
  }

  flushFinally();

  dumpState("paragraphAwareContent done");

  return result;
};
