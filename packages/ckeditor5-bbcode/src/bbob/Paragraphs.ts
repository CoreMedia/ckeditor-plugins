import { isEOL, isTagNode, N, TagNode } from "@bbob/plugin-helper/es";
import { Tag } from "./types";
import { bbCodeLogger } from "../BBCodeLogger";

const toNode = TagNode.create;

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
   * If to skip empty paragraphs.
   *
   * Defaults to `true`.
   */
  skipEmpty?: boolean;
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
  blockTags?: Tag[];
}

/**
 * Represents heading tags h1 to h6.
 */
const headingTags = [...Array(6).keys()].map((n) => `h${n + 1}`);

/**
 * Default tags to consider _block-level_. As child-contents were not processed
 * yet, these are raw BBCode elements and not intermediate elements such as
 * `blockquote`, that will later be transformed directly to HTML `<blockquote>`.
 *
 * Block-level elements must not be wrapped into paragraphs and may co-exist on
 * the same layer as paragraphs.
 */
const defaultBlockTags: NonNullable<ParagraphAwareContentOptions["blockTags"]> = [
  "code",
  "list",
  "quote",
  "table",
  ...headingTags,
];

/**
 * Debugging. Helps to understand the somewhat complex processing of paragraphs.
 *
 * @param msg - some message
 * @param state - optional state; values will be represented as JSON (stringify)
 */
const debug = (msg: string, state?: Record<string, unknown>): void => {
  const logger = bbCodeLogger;
  if (state) {
    logger.debug(msg, Object.fromEntries(Object.entries(state).map(([key, value]) => [key, JSON.stringify(value)])));
  } else {
    logger.debug(msg);
  }
};

/**
 * Processes the top level string nodes and possibly adds a paragraph, where
 * required.
 *
 * Note that processing ignores any possible contained "block-level" elements
 * that for valid HTML5 must not be contained within a paragraph.
 *
 * **BBob API Note:** The tokenizer will split all newline characters into an
 * extra string-entry. This may be important to know to understand the
 * implementation of this function.
 *
 * @param content - content to process
 * @param options - options to respect
 */
export const paragraphAwareContent = (
  content: NonNullable<TagNode["content"]>,
  options: ParagraphAwareContentOptions = {},
): NonNullable<TagNode["content"]> => {
  const {
    requireParagraph: fromConfigRequireParagraph = false,
    skipEmpty = true,
    newlineThreshold = 2,
    blockTags = defaultBlockTags,
  } = options;

  debug("Start: paragraphAwareContent", {
    content,
    options,
  });

  if (content.length === 0) {
    if (fromConfigRequireParagraph) {
      // We were told, a paragraph is required as nested tag. Thus,
      // also add it for empty content.
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

  // Intermediate buffer, that may need to go to a paragraph node.
  const buffer: NonNullable<TagNode["content"]> = [];
  // Collected EOLs. They will not make it to `buffer` until flushed.
  const trailingNewlineBuffer: (typeof N)[] = [];
  // The result to return in the end.
  const result: NonNullable<TagNode["content"]> = [];

  /**
   * Clear temporary buffers.
   */
  const clearBuffers = (): void => {
    debug("Start: clearBuffers", {
      buffer,
      trailingNewlineBuffer,
    });

    buffer.length = 0;
    trailingNewlineBuffer.length = 0;

    debug("Done: clearBuffers", {
      buffer,
      trailingNewlineBuffer,
    });
  };

  /**
   * Signals, if the given content shall be considered empty or not.
   */
  const isNonEmpty = (content: NonNullable<TagNode["content"]>): boolean =>
    content.some((entry) => isTagNode(entry) || entry.trim() !== "");

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
    debug("Start: addCopyAsParagraph", {
      content,
      result,
      requireParagraph,
      skipEmpty,
    });

    if (isNonEmpty(content)) {
      result.push(toNode("p", {}, [...content]));
    } else if (requireParagraph || !skipEmpty) {
      result.push(toNode("p", {}, []));
    }

    requireParagraph = true;

    debug("Done: addCopyAsParagraph", {
      content,
      result,
      requireParagraph,
      skipEmpty,
    });
  };

  /**
   * We may have collected yet unprocessed newlines that did not reach the
   * given threshold. We must not ignore them completely, as they may
   * represent a relevant separator. But it is safe to squash them to one
   * single blank character. Just to keep the identity similar, we again use
   * a newline character as this squashed result.
   *
   * As an alternative, a `br` tag may be added here, in case we want to
   * keep line-breaks.
   */
  const squashAndPushNewlinesToBuffer = (): void => {
    debug("Start: squashAndPushNewlinesToBuffer", {
      buffer,
      trailingNewlineBuffer,
    });

    if (trailingNewlineBuffer.length > 0) {
      buffer.push(N);
      // Clear buffer, we respected the newlines.
      trailingNewlineBuffer.length = 0;
    }

    debug("Done: squashAndPushNewlinesToBuffer", {
      buffer,
      trailingNewlineBuffer,
    });
  };

  /**
   * Flush when we processed the last content entry.
   */
  const flushFinally = (): void => {
    debug("Start: flushFinally", {
      requireParagraph,
      buffer,
      result,
      fromConfigRequireParagraph,
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

    debug("Done: flushFinally", {
      requireParagraph,
      buffer,
      result,
      fromConfigRequireParagraph,
    });
  };

  /**
   * Intermediate flush of `buffer` to the result. Any non-empty buffer
   * will trigger wrapping the content into a paragraph node.
   */
  const flush = (): void => {
    debug("Start: flush", {
      buffer,
    });

    if (buffer.length > 0) {
      // Any trailing EOLs may safely be ignored here.
      addCopyAsParagraph(buffer);
    }
    // Design Scope: Not having an else-branch here also means that we
    // ignore any leading newlines.
    clearBuffers();

    debug("Done: flush", {
      buffer,
    });
  };

  /**
   * Detects, if the current state denotes that the piled-up buffer entries
   * are meant to be wrapped into a paragraph node.
   *
   * Otherwise, assuming this function gets called when a non-EOL-character
   * was read, any pending newlines will be added to the buffer first.
   * Pending newlines will be squashed into a single EOL character.
   */
  const flushOnParagraph = (): void => {
    debug("Start: flushOnParagraph", {
      trailingNewlineBuffer,
    });

    if (trailingNewlineBuffer.length >= newlineThreshold) {
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
      squashAndPushNewlinesToBuffer();
    }

    debug("Done: flushOnParagraph", {
      trailingNewlineBuffer,
    });
  };

  /**
   * Handles a tag-node on current level. Respects block-tags that may enforce
   * previous buffer entries to be added as paragraph.
   */
  const handleTagNode = (node: TagNode): void => {
    debug("Start: handleTagNode", {
      node,
      buffer,
      result,
    });

    const { tag } = node;
    if (blockTags.includes(tag)) {
      // If it is a block-tag, put previous contents in a paragraph.
      flush();
      result.push(node);
    } else {
      flushOnParagraph();
      buffer.push(node);
    }

    debug("Done: handleTagNode", {
      node,
      buffer,
      result,
    });
  };

  /**
   * Handles a string entry on current level. Respects EOL characters, which
   * will be added to the `trailingNewlineBuffer` instead.
   */
  const handleString = (value: string): void => {
    debug("Start: handleString", {
      value,
      buffer,
      trailingNewlineBuffer,
    });

    if (isEOL(value)) {
      trailingNewlineBuffer.push(value);
    } else {
      flushOnParagraph();
      buffer.push(value);
    }

    debug("Done: handleString", {
      value,
      buffer,
      trailingNewlineBuffer,
    });
  };

  // Main processing of content items to possibly wrap into paragraphs.
  for (const contentItem of content) {
    if (isTagNode(contentItem)) {
      handleTagNode(contentItem);
    } else {
      handleString(contentItem);
    }
  }

  flushFinally();

  debug("Done: paragraphAwareContent", {
    result,
  });

  return result;
};
