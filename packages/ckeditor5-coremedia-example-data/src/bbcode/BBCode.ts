import { RequireSelected } from "@coremedia/ckeditor5-common";

export interface StyleOptions {
  size?: string;
  color?: string;
}

const replaceTrailingNewline = (text: string, replacement = ""): string => text.replace(/[\n\r]*$/, replacement);

/**
 * BBCode formatting options. This API is just meant for internal use. It is
 * not robust for malicious BBCode.
 *
 * There is no official "escape mechanism" for BBCode.
 * For details, see: https://www.phpbb.com/community/viewtopic.php?t=1721345.
 *
 * The provided factory methods are not meant to align with any used BBCode
 * parser. It just summarizes some possible options for rendering BBCode.
 * Skipped, for example, `[pipe]` which provides an alternative syntax for
 * tables, supported by some parsers.
 *
 * See also:
 *
 * * https://en.wikipedia.org/wiki/BBCode.
 * * https://www.bbcode.org/reference.php
 * * https://www.bbcode.org/how-to-use-bbcode-a-complete-guide.php
 */
export const bbCode = {
  heading: (text: string, level: 1 | 2 | 3 | 4 | 5 | 6) => `\n[h${level}]${replaceTrailingNewline(text)}[/h${level}]\n`,
  h1: (text: string) => bbCode.heading(text, 1),
  h2: (text: string) => bbCode.heading(text, 2),
  h3: (text: string) => bbCode.heading(text, 3),
  h4: (text: string) => bbCode.heading(text, 4),
  h5: (text: string) => bbCode.heading(text, 5),
  h6: (text: string) => bbCode.heading(text, 6),
  p: (text: string) => `\n${text.replace(/[\n\r]*$/, "\n\n")}`,
  bold: (text: string) => `[b]${text}[/b]`,
  italic: (text: string) => `[i]${text}[/i]`,
  underline: (text: string) => `[u]${text}[/u]`,
  strikethrough: (text: string) => `[s]${text}[/s]`,
  url: (textOrUrl: string, url?: string) => (url ? `[url=${url}]${textOrUrl}[/url]` : `[url]${textOrUrl}[/url]`),
  img: (url: string) => `[img]${url}[/img]`,
  emoji: (emoji: string) => `[${emoji}]`,
  quote: (text: string, author?: string) => (author ? `[quote="${author}"]${text}[/quote]` : `[quote]${text}[/quote]`),
  code: (text: string, language?: string) =>
    language ? `[code=${language}]\n${text}\n[/code]` : `[code]\n${text}\n[/code]`,
  style: (text: string, style: RequireSelected<StyleOptions, "size"> | RequireSelected<StyleOptions, "color">) => {
    let styleOptions = ``;
    if (style.size) {
      styleOptions = `${styleOptions} size="${style.size}"`;
    }
    if (style.color) {
      if (style.color.startsWith("#")) {
        styleOptions = `${styleOptions} color=${style.color}`;
      } else {
        styleOptions = `${styleOptions} color="${style.color}"`;
      }
    }
    return `[style ${styleOptions.trim()}]${text}[/style]`;
  },
  color: (text: string, color: string) =>
    color.startsWith("#") ? `[color=${color}]${text}[/color]` : `[color="${color}"]${text}[/color]`,
  list: (entries: string[], listType: "ordered" | "unordered" = "unordered") => {
    let result = listType === "unordered" ? `\n[list]` : `\n[list=1]`;
    entries.forEach((entry) => {
      result = `${result}\n[*]${replaceTrailingNewline(entry, "\n")}`;
    });
    result = `${result}\n[/list]\n`;
    return result;
  },
  table: (entries: string[][]) => {
    let result = `\n[table]`;
    for (const row of entries) {
      result = `${result}\n[tr]\n`;
      for (const column of row) {
        result = `${result}\n[td]${replaceTrailingNewline(column)}[/td]\n`;
      }
      result = `${result}\n[/tr]\n`;
    }
    result = `${result}\n[/table]\n`;
    return result;
  },
};
