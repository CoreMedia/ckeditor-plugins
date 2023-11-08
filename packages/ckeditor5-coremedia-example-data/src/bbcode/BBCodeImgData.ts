import { ExampleData } from "../ExampleData";
import { pngBlue10x10, pngGreen10x10, pngRed10x10 } from "../media/Base64Images";

const text = `\
[h1]\\[img\\]: CKEditor 5 Links in BBCode[/h1]

The CKEditor 5 BBCode Plugin supports the \\[img\\] tag.
Processing integrates with the
[url=https://ckeditor.com/docs/ckeditor5/latest/features/images/images-overview.html]CKEditor 5 Image Features[/url].

[h2]Plain Images[/h2]

We use Base64 encoded images as example. Any URL could be used, though, like:

[code=bbcode]
\\[img\\]https://example.org/example.png\\[/img\\]
[/code]

Now some Base64 examples (10x10 images only):

[img]${pngRed10x10}[/img]

[img]${pngGreen10x10}[/img]

[img]${pngBlue10x10}[/img]

[h2]Alternative Text[/h2]

As supported by some BBCode dialects and to integrate with the
[url=https://ckeditor.com/docs/ckeditor5/latest/features/images/images-text-alternative.html]CKEditor 5 Image Text Alternative Feature[/url]
an "alt" attribute is supported, too, as, for example:

[code=bbcode]
\\[img alt="Alternative Text"\\]https://example.org/example.png\\[/img\\]
[/code]

Given the Base64 examples from above:

[img alt="Red"]${pngRed10x10}[/img]

[img alt="Green"]${pngGreen10x10}[/img]

[img alt="Blue"]${pngBlue10x10}[/img]
`;

export const imgData: ExampleData = {
  Images: text,
};
