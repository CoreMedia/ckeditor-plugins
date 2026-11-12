# Styleguide for Markdown

## Rules

* **Reference-Style Links:** The reference-style is the preferred syntax for
  links. If possible, normal words are preferred in favor of artificial IDs.

  ```markdown
  [Markdown][]

  [some markdown][Markdown]

  [private hash syntax][mdn:private]

  [Markdown]:
    <https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet>
    "Markdown Cheatsheet · adam-p/markdown-here Wiki"
  [mdn:private]:
    <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_class_fields>
    "Private class features - JavaScript | MDN"
  ```
