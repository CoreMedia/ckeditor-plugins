const INLINE_IMG = "content/900#properties.data";

const differencingExample = `
<div xmlns="http://www.coremedia.com/2003/richtext-1.0" xmlns:xlink="http://www.w3.org/1999/xlink"
     xmlns:xdiff="http://www.coremedia.com/2015/xdiff">
     <h1>Differencing testcases</h1>
     <h3>Element Structure tests</h3>
     <h4>001 place text into element</h4>
     <p>Lorem ipsum dolor sit amet,
        <strong class="color--red background-color--purple">
        <xdiff:span xdiff:class="diff-html-changed"
                    xdiff:changes="&lt;b&gt;Strong&lt;/b&gt; style added with class color--red background-color--purple."
                    xdiff:id="changed-diff-0">consectetuer
        </xdiff:span>
        </strong>
        adipiscing elit.
    </p>
    <h3>003 place text into various nested elements</h3>
    <p>Lorem ipsum dolor sit amet,
      <xdiff:span xdiff:class="diff-html-removed" xdiff:id="removed-diff-0" xdiff:next="added-diff-0">consectetuer
      </xdiff:span>
      <strong>
        <xdiff:span xdiff:class="diff-html-added" xdiff:previous="removed-diff-0" xdiff:id="added-diff-0"
                    xdiff:next="changed-diff-0">consec
        </xdiff:span>
        <em>
          <xdiff:span xdiff:class="diff-html-added" xdiff:previous="removed-diff-0" xdiff:id="added-diff-0"
                      xdiff:next="changed-diff-0">tetuer
          </xdiff:span>
        </em>
      </strong>
      <em>
        <xdiff:span xdiff:class="diff-html-changed" xdiff:changes="&lt;b&gt;Emphasis&lt;/b&gt; style added."
                    xdiff:previous="added-diff-0" xdiff:id="changed-diff-0">adipiscing
        </xdiff:span>
      </em>
      elit.
    </p>
    <h3>Internal Link</h3>
    <h4>001 internal link target changed</h4>
    <p>This is an
      <a xlink:actuate="onRequest" xlink:href="content:6" xlink:show="replace" xlink:type="simple">
        <xdiff:span xdiff:class="diff-html-changed"
                    xdiff:changes="&lt;ul class='changelist'&gt;&lt;li&gt;Moved out of a &lt;b&gt;link&lt;/b&gt; with destination content:2 with xlink:actuate onRequest, xlink:show replace and xlink:type simple.&lt;/li&gt;&lt;li&gt;Moved to a &lt;b&gt;link&lt;/b&gt; with destination content:6 with xlink:actuate onRequest, xlink:show replace and xlink:type simple.&lt;/li&gt;&lt;/ul&gt;"
                    xdiff:id="changed-diff-0" xdiff:next="changed-diff-1">internal link
        </xdiff:span>
      </a>
      .
    </p>
    <p>This is an
      <a xlink:actuate="onRequest" xlink:href="content:6" xlink:show="replace" xlink:type="simple">
        <xdiff:span xdiff:class="diff-html-changed"
                    xdiff:changes="&lt;ul class='changelist'&gt;&lt;li&gt;Moved out of a &lt;b&gt;link&lt;/b&gt; with destination content:4 with xlink:actuate onRequest, xlink:show replace and xlink:type simple.&lt;/li&gt;&lt;li&gt;Moved to a &lt;b&gt;link&lt;/b&gt; with destination content:6 with xlink:actuate onRequest, xlink:show replace and xlink:type simple.&lt;/li&gt;&lt;/ul&gt;"
                    xdiff:previous="changed-diff-0" xdiff:id="changed-diff-1">internal link
        </xdiff:span>
      </a>
      .
    </p>
    <h4>002 internal link change show attribute</h4>
    <p>This is an
      <a xlink:actuate="onRequest" xlink:href="content:4" xlink:show="new" xlink:type="simple">
        <xdiff:span xdiff:class="diff-html-changed"
                    xdiff:changes="&lt;ul class='changelist'&gt;&lt;li&gt;Moved out of a &lt;b&gt;link&lt;/b&gt; with destination content:4 with xlink:actuate onRequest, xlink:show replace and xlink:type simple.&lt;/li&gt;&lt;li&gt;Moved to a &lt;b&gt;link&lt;/b&gt; with destination content:4 with xlink:actuate onRequest, xlink:show new and xlink:type simple.&lt;/li&gt;&lt;/ul&gt;"
                    xdiff:id="changed-diff-0">internal link
        </xdiff:span>
      </a>
      .
    </p>
    <h3>Misc.</h3>
    <h4>001 class attribute change</h4>
    <p>Lorem ipsum dolor sit amet,
      <strong class="color--red very-new-class background-color--purple">
        <xdiff:span xdiff:class="diff-html-changed"
                    xdiff:changes="&lt;ul class='changelist'&gt;&lt;li&gt;&lt;b&gt;Strong&lt;/b&gt; style removed with class color--red background-color--purple.&lt;/li&gt;&lt;li&gt;&lt;b&gt;Strong&lt;/b&gt; style added with class color--red very-new-class background-color--purple.&lt;/li&gt;&lt;/ul&gt;"
                    xdiff:id="changed-diff-0">consectetuer
        </xdiff:span>
      </strong>
      adipiscing elit.
    </p>
</div>`;
const differencingTable = `
<div xmlns="http://www.coremedia.com/2003/richtext-1.0" xmlns:xdiff="http://www.coremedia.com/2015/xdiff">
<h2>Differencing with tables</h2>
  <p>
    Known issues: 
    <ul>
      <li>
        Moving the table row is not detected as DaisyDiff cannot deal with structural changes which are not bound to a text node
        in some way.
      </li>
      <li>
        Moving the table cell is not detected as DaisyDiff cannot deal with structural changes which are not bound to a text
        node in some way.
      </li>
    </ul>
  </p>
  <h4>003 table move row in small filled table</h4>
  <table>
    <tr>
      <td rowspan="1" colspan="1">
        <p>
          <xdiff:span xdiff:class="diff-html-added" xdiff:id="added-diff-0" xdiff:next="removed-diff-0">sit</xdiff:span>
        </p>
      </td>
      <td rowspan="1" colspan="1">
        <p>
          <xdiff:span xdiff:class="diff-html-added" xdiff:id="added-diff-0" xdiff:next="removed-diff-0">amet
          </xdiff:span>
        </p>
      </td>
      <td rowspan="1" colspan="1">
        <p>
          <xdiff:span xdiff:class="diff-html-added" xdiff:id="added-diff-0" xdiff:next="removed-diff-0">consectetuer
          </xdiff:span>
        </p>
      </td>
    </tr>
    <tr>
      <td rowspan="1" colspan="1">
        <p>Lorem</p>
      </td>
      <td rowspan="1" colspan="1">
        <p>ipsum</p>
      </td>
      <td rowspan="1" colspan="1">
        <p>dolor</p>
      </td>
    </tr>
    <tr>
      <td rowspan="1" colspan="1">
        <p>
          <xdiff:span xdiff:class="diff-html-removed" xdiff:previous="added-diff-0" xdiff:id="removed-diff-0">sit
          </xdiff:span>
        </p>
      </td>
      <td rowspan="1" colspan="1">
        <p>
          <xdiff:span xdiff:class="diff-html-removed" xdiff:previous="added-diff-0" xdiff:id="removed-diff-0">amet
          </xdiff:span>
        </p>
      </td>
      <td rowspan="1" colspan="1">
        <p>
          <xdiff:span xdiff:class="diff-html-removed" xdiff:previous="added-diff-0"
                      xdiff:id="removed-diff-0">consectetuer
          </xdiff:span>
        </p>
      </td>
    </tr>
    <tr>
      <td rowspan="1" colspan="1">
        <p>adipiscing</p>
      </td>
      <td rowspan="1" colspan="1">
        <p>elit</p>
      </td>
      <td rowspan="1" colspan="1">
        <p>Aenean</p>
      </td>
    </tr>
  </table>
  <h4>004 table move cell in small filled table</h4>
  <table>
    <tr>
      <td rowspan="1" colspan="1">
        <p>Lorem</p>
      </td>
      <td rowspan="1" colspan="1">
        <p>
          <xdiff:span xdiff:class="diff-html-added" xdiff:id="added-diff-0" xdiff:next="removed-diff-0">dolor
          </xdiff:span>
        </p>
      </td>
      <td rowspan="1" colspan="1">
        <p>ipsum
          <xdiff:span xdiff:class="diff-html-removed" xdiff:previous="added-diff-0" xdiff:id="removed-diff-0"
                      xdiff:next="added-diff-1">dolor
          </xdiff:span>
        </p>
      </td>
    </tr>
    <tr>
      <td rowspan="1" colspan="1">
        <p>
          <xdiff:span xdiff:class="diff-html-added" xdiff:previous="removed-diff-0" xdiff:id="added-diff-1"
                      xdiff:next="removed-diff-1">amet
          </xdiff:span>
        </p>
      </td>
      <td rowspan="1" colspan="1">
        <p>sit</p>
      </td>
      <td rowspan="1" colspan="1">
        <p>
          <xdiff:span xdiff:class="diff-html-removed" xdiff:previous="added-diff-1" xdiff:id="removed-diff-1"
                      xdiff:next="removed-diff-2">amet
          </xdiff:span>
        </p>
      </td>
      <td rowspan="1" colspan="1">
        <p>consectetuer</p>
      </td>
    </tr>
    <tr>
      <td rowspan="1" colspan="1">
        <p>
          <xdiff:span xdiff:class="diff-html-removed" xdiff:previous="removed-diff-1" xdiff:id="removed-diff-2"
                      xdiff:next="added-diff-2">adipiscing
          </xdiff:span>
        </p>
      </td>
      <td rowspan="1" colspan="1">
        <p>elit</p>
      </td>
      <td rowspan="1" colspan="1">
        <p>Aenean</p>
      </td>
      <td rowspan="1" colspan="1">
        <p>
          <xdiff:span xdiff:class="diff-html-added" xdiff:previous="removed-diff-2" xdiff:id="added-diff-2">adipiscing
          </xdiff:span>
        </p>
      </td>
    </tr>
  </table>
</div>
`
const differencingImages = `
<div xmlns="http://www.coremedia.com/2003/richtext-1.0" xmlns:xlink="http://www.w3.org/1999/xlink"
     xmlns:xdiff="http://www.coremedia.com/2015/xdiff">
    <h2>Differencing Images</h2>
    <h4>Image Inserted</h4>
    <p>Lorem
      <xdiff:span xdiff:class="diff-html-added" xdiff:id="added-diff-0" xdiff:next="added-diff-1">
        <img alt="text" xlink:actuate="onLoad" xlink:href="${INLINE_IMG}" xlink:role="myRole"
             xlink:show="embed" xlink:title="legacy (swing editor/non-UAPI) coremedia URI link style" xlink:type="simple"
             xdiff:changetype="diff-added-image"/>
      </xdiff:span>
      ipsum dolor sit amet, consectetuer adipiscing
      <xdiff:span xdiff:class="diff-html-added" xdiff:previous="added-diff-0" xdiff:id="added-diff-1">
        <img alt="text" xlink:actuate="onLoad" xlink:href="${INLINE_IMG}"
             xlink:role="oldRole" xlink:show="embed" xlink:title="new UAPI coremedia URI style" xlink:type="simple"
             xdiff:changetype="diff-added-image"/>
      </xdiff:span>
      elit.
    </p>
    <h4>Image deleted</h4>
    <p>Lorem
      <xdiff:span xdiff:class="diff-html-removed" xdiff:id="removed-diff-0" xdiff:next="removed-diff-1">
        <img alt="text" xlink:actuate="onLoad" xlink:href="${INLINE_IMG}" xlink:role="myRole"
             xlink:show="embed" xlink:title="legacy (swing editor/non-UAPI) coremedia URI link style" xlink:type="simple"
             xdiff:changetype="diff-removed-image"/>
      </xdiff:span>
      ipsum dolor sit amet, consectetuer adipiscing
      <xdiff:span xdiff:class="diff-html-removed" xdiff:previous="removed-diff-0" xdiff:id="removed-diff-1">
        <img alt="text" xlink:actuate="onLoad" xlink:href="${INLINE_IMG}"
             xlink:role="oldRole" xlink:show="embed" xlink:title="new UAPI coremedia URI style" xlink:type="simple"
             xdiff:changetype="diff-removed-image"/>
      </xdiff:span>
      elit.
    </p>
    <h4>Image alignment changed</h4>
    <p>abcd
      <xdiff:span xdiff:class="diff-html-changed" xdiff:changes="<ul class='changelist'><li>Changed from an <b>image</b> with alt , class float--right, xlink:actuate onLoad, xlink:show embed, xlink:type simple and xlink:href ${INLINE_IMG}.</li><li>Changed to an <b>image</b> with alt , class float--none, xlink:actuate onLoad, xlink:show embed, xlink:type simple and xlink:href ${INLINE_IMG}.</li></ul>" xdiff:id="changed-diff-0">
          <img alt="" class="float--none" xlink:actuate="onLoad" xlink:show="embed" xlink:type="simple" xlink:href="${INLINE_IMG}"/>
      </xdiff:span>
      acbd
    </p>
</div>
`
const differencingTextOnly = `
  <div xmlns="http://www.coremedia.com/2003/richtext-1.0" xmlns:xlink="http://www.w3.org/1999/xlink"
     xmlns:xdiff="http://www.coremedia.com/2015/xdiff">
    <h2>Differencing Text Only</h2>
    <h4>001 text change (en_US)</h4>
    <p>If there were
      <xdiff:span xdiff:class="diff-html-removed" xdiff:id="removed-diff-0" xdiff:next="added-diff-0">a</xdiff:span>
      <xdiff:span xdiff:class="diff-html-added" xdiff:previous="removed-diff-0"
                  xdiff:id="added-diff-0">an interesting</xdiff:span>difference, it would certainly be seen.
    </p>
    <h4>002 text added inbetween</h4>
    <p>Lorem ipsum dolor sit amet, <xdiff:span xdiff:class="diff-html-added"
                                           xdiff:id="added-diff-0">Wortberg</xdiff:span>consectetuer adipiscing elit.
    </p>
    <h4>003 text added at beginning</h4>
    <p><xdiff:span xdiff:class="diff-html-added"
               xdiff:id="added-diff-0">Wortberg</xdiff:span>Lorem ipsum dolor sit amet, consectetuer adipiscing elit.
    </p>
    <h4>004 text added at end</h4>
    <p>Lorem ipsum dolor sit amet, consectetuer adipiscing elit.
      <xdiff:span xdiff:class="diff-html-added" xdiff:id="added-diff-0">Wortberg</xdiff:span>
    </p>
    <h4>005 text removed inbetween</h4>
    <p>Lorem ipsum dolor sit amet, <xdiff:span xdiff:class="diff-html-removed"
                                             xdiff:id="removed-diff-0">Wortberg</xdiff:span>consectetuer adipiscing elit.
    </p>
    <h4>006 text removed at beginning</h4>
      <p><xdiff:span xdiff:class="diff-html-removed"
                 xdiff:id="removed-diff-0">Wortberg</xdiff:span>Lorem ipsum dolor sit amet, consectetuer adipiscing elit.
  </p>
    <h4>007 text removed at end</h4>
      <p>Lorem ipsum dolor sit amet, consectetuer adipiscing elit.
    <xdiff:span xdiff:class="diff-html-removed" xdiff:id="removed-diff-0">Wortberg</xdiff:span>
  </p>
    <h4>008 text change (ja_JP)</h4>
      <p>
    <xdiff:span xdiff:class="diff-html-removed" xdiff:id="removed-diff-0" xdiff:next="added-diff-0">相違があった</xdiff:span>
    <xdiff:span xdiff:class="diff-html-added" xdiff:previous="removed-diff-0"
                xdiff:id="added-diff-0">興味深い違いがあった</xdiff:span>場合、それは確かに見られる。
  </p>
    <h4>009 text change (de_DE)</h4>
      <p>Wäre hier ein <xdiff:span xdiff:class="diff-html-added"
                               xdiff:id="added-diff-0">interessanter</xdiff:span>Unterschied, wäre er sicherlich zu sehen.
  </p>
    <h4>010 text change (ar_DZ)</h4>
      <p>إذا كان هناك فرق <xdiff:span xdiff:class="diff-html-added"
                                  xdiff:id="added-diff-0">مثيرة للاهتمام</xdiff:span>، ومن المؤكد أن يطلع عليها.
  </p>
  </div>
`

export {
  differencingExample,
  differencingTextOnly,
  differencingTable,
  differencingImages
}
