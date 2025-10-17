import type { ExampleData } from "../ExampleData";

// The following text uses `#` to represent a backslash character in BBCode.
// This makes it easier to write the BBCode without struggling with escaping
// within JavaScript. Subsequent, some replace operation will replace all
// `#` by a backslash character to be placed into BBCode.
const text = `\
[h1]Security Challenges[/h1]

BBCode is assumed to emerge from untrusted sources, input of any users
(or robots) worldwide.

Having this, care must be taken, not to propagate probably malicious data
to the CKEditor 5 instance, as it may run in a trusted environment.

Below are some examples, how attackers may try to misuse BBCode parsing to
hack into the rendered HTML, for example.

[h2]Escaping[/h2]

Prior to the security challenges below, we enabled the BBCode escaping feature.
While there is no defined standard, best practice is using backslash as
escape character.

Having set up some escaping is important to safely process possibly malicious
data, also when later generating BBCode again from the HTML edited within
CKEditor 5.

[code=bbcode]
Lorem ###[b###]ip####sum###[/b###] dolor
[/code]

Rendered as:

[quote]
Lorem #[b#]ip##sum#[/b#] dolor
[/quote]

[h2]Inline HTML[/h2]

As we are [i]within[/i] BBCode, HTML element syntax has no meaning (which is
different to Markdown that may transparently switch to HTML). As such, we need
proper transformation to corresponding &lt; and &gt; entities in "toView"
processing, not to generate possibly even malicious HTML. Similar to that,
there is also no HTML entities in BBCode, so that these entities must be
properly transformed, too.

[code=bbcode]
Lorem <strong>ip&sum</strong> dolor
[/code]

Rendered as:

[quote]
Lorem <strong>ip&sum</strong> dolor
[/quote]

[h2]Repetitive Processing Challenge[/h2]

One layer deeper, we must ensure, that during a transformation sequence such
as data → data view → model → data view → data → data view → model, we do not
[i]escape the escaping[/i], thus, what was an entity for a square bracket
originally, later is processed to a square bracket again in generated data,
which again may trigger BBCode parsing.

An malicious processing example may be easier to understand here:

[list=1]
[*] data (BBCode): &lsqb;b&rsqb;not bold&lsqb;/b&rsqb;
[*] data view (HTML): #[b#]not bold#[/b#]
[*] data from data view (BBCode again): #[b#]not bold#[/b#]
[/list]

We already intervene on first layer, as we do not let the HTML (data view) layer
reach the HTML entities. And even later, thus, starting with
#[b#]not bold#[/b#] in data view, it will later be transformed to escaped
BBCode:

[code=bbcode]
###[b###]not bold###[/b###]
[/code]

Such examples are best challenged, if you switch the source editing, change
some characters (to force CKEditor 5 to reparse the data), switch to editing
view and back again to source editing. Ideally, you should not see any
surprising BBCode.
`.replace(/#/g, "\\");

/**
 * Same possible challenges to BBCode to HTML and vice versa processing.
 *
 * @see [XSS Filter Evasion – OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/cheatsheets/XSS_Filter_Evasion_Cheat_Sheet.html)
 */
export const securityChallengeData: ExampleData = {
  "Security Challenges": text,
};
