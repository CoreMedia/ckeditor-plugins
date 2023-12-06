import { ExampleData } from "../ExampleData";

const text = `\
[h1]\\[url\\]: CKEditor 5 Links in BBCode[/h1]

The CKEditor 5 BBCode Plugin supports the \\[url\\] tag.
Processing integrates with the
[url=https://ckeditor.com/docs/ckeditor5/latest/features/link.html]CKEditor 5 Link Feature[/url].

[h2]Standard URL[/h2]

[code=bbcode]
\\[url="https://example.org/"\\]Link\\[/url\\]
[/code]

Renders as: [url="https://example.org/"]Link[/url].

[h2]URL = Text[/h2]

[code=bbcode]
\\[url\\]https://example.org/\\[/url\\]
[/code]

Renders as: [url]https://example.org/[/url].

This is also the preferred output in the "toData" processing, i.e., if text
content and URL are alike, the shortened format will be generated.

[h2]Auto-Encoding of Square Brackets[/h2]

[code=bbcode]
\\[url="https://example.org/?brackets=%5B%5D"\\]Link\\[/url\\]
[/code]

Renders as: [url="https://example.org/?brackets=%5B%5D"]Link[/url].

Data-Processing is put to the challenge, if you enter a perfectly valid URL
having square brackets directly within the link dialog. They will be
automatically transformed in the "toData" processing to prevent possible
conflicts. Just try on your own with this URL entered:

[code]
https://example.org/?brackets=[]
[/code]

[h2]Security[/h2]

The CKEditor 5 BBCode Plugin does not hold responsible for any possibly
malicious URLs. Instead, it relies, for example, on security layers set by
CKEditor 5 (like preventing clicks on "javascript:" links) and on any
application that integrates CKEditor 5 along with the BBCode Plugin.
For example, preventing that clicking links may trigger malicious actions.

Some examples:

[code=bbcode]
\\[url="javascript:alert('Got you!');"\\]Link\\[/url\\]
[/code]

Renders as: [url="javascript:alert('Got you!');"]Link[/url].

[code=bbcode]
\\[url="data:text/html;base64,PHNjcmlwdD5hbGVydCgnR290IHlvdSEnKTs8L3NjcmlwdD4="\\]Link\\[/url\\]
[/code]

where the Base64 encoded string decodes to:

[code=xml]
<script>alert('Got you!');</script>
[/code]

Renders as: [url="data:text/html;base64,PHNjcmlwdD5hbGVydCgnR290IHlvdSEnKTs8L3NjcmlwdD4="]Link[/url].
`;

export const linkData: ExampleData = {
  Links: text,
};
