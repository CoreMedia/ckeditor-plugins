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
    <h3>Image Tests</h3>
    <h4>001 Image Inserted</h4>
    <p>Lorem
      <xdiff:span xdiff:class="diff-html-added" xdiff:id="added-diff-0" xdiff:next="added-diff-1">
        <img alt="text" xlink:actuate="onLoad" xlink:href="content:28#thumbnail" xlink:role="myRole"
             xlink:show="embed" xlink:title="legacy (swing editor/non-UAPI) coremedia URI link style" xlink:type="simple"
             xdiff:changetype="diff-added-image"/>
      </xdiff:span>
      ipsum dolor sit amet, consectetuer adipiscing
      <xdiff:span xdiff:class="diff-html-added" xdiff:previous="added-diff-0" xdiff:id="added-diff-1">
        <img alt="text" xlink:actuate="onLoad" xlink:href="content:28#thumbnail"
             xlink:role="oldRole" xlink:show="embed" xlink:title="new UAPI coremedia URI style" xlink:type="simple"
             xdiff:changetype="diff-added-image"/>
      </xdiff:span>
      elit.
    </p>
    <h4>002 Image deleted</h4>
    <p>Lorem
      <xdiff:span xdiff:class="diff-html-removed" xdiff:id="removed-diff-0" xdiff:next="removed-diff-1">
        <img alt="text" xlink:actuate="onLoad" xlink:href="content:28#thumbnail" xlink:role="myRole"
             xlink:show="embed" xlink:title="legacy (swing editor/non-UAPI) coremedia URI link style" xlink:type="simple"
             xdiff:changetype="diff-removed-image"/>
      </xdiff:span>
      ipsum dolor sit amet, consectetuer adipiscing
      <xdiff:span xdiff:class="diff-html-removed" xdiff:previous="removed-diff-0" xdiff:id="removed-diff-1">
        <img alt="text" xlink:actuate="onLoad" xlink:href="content:28#thumbnail"
             xlink:role="oldRole" xlink:show="embed" xlink:title="new UAPI coremedia URI style" xlink:type="simple"
             xdiff:changetype="diff-removed-image"/>
      </xdiff:span>
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
    <h4>002 complex richtext with images</h4>
      <p>Coffee was first planted in Costa Rica in the early 19th century, and was first shipped to Europe in 1843, soon becoming Costa Rica's first major export. Coffee production would remain Costa Rica's principal source of wealth well into the 20th century. Most of the coffee exported was grown around the main centers of population in the Central Plateau and then transported by oxcart to the Pacific port of Puntarenas.
      <br/>
      <br/>The coffee production in Costa Rica played a key role in the country's history and still is important for the Costa Rican economy. In 2006, coffee was Costa Rica's number three export, after being the number one cash cropexport for several decades. In 1997, the agriculture sector employed 28 percent of the labor force and comprised 20 percent of Costa Rica's total GNP. Production increased from 158,000 tons in 1988 to 168,000 tons in 1992. Costa Rican coffee is high in caffeine; it is often blended with inferior varieties. The largest growing areas are in the provinces of San José, Alajuela, Heredia, Puntarenas, and Cartago. The coffee is exported to other countries in the world and is also exported to cities in Costa Rica.
    </p>
    <p class="p--heading-2">History</p>
    <p>Coffee production in the country began in 1779 in the Meseta Central which had ideal soil and climate conditions for coffee plantations. Coffea arabica first imported to Europe through Arabia, whence it takes its name, was introduced to the country directly from Ethiopia. In the nineteenth century, the Costa Rican government strongly encouraged coffee production, and the industry fundamentally transformed a colonial regime and village economy built on direct extraction by a city-based elite towards organized production for export on a larger scale. The government offered farmers plots of land for anybody who wanted to harvest the plants. The coffee plantation system in the country therefore developed in the nineteenth century largely as result of the government's open policy, although the problem with coffee barons did play a role in internal differentiation, and inequality in growth.[2] Soon coffee became a major source of revenue surpassing cacao, tobacco, and sugar production as early as 1829.
      <br/>
      <img alt="" xlink:actuate="onLoad" xlink:show="embed" xlink:type="simple"
           xlink:href="content:32#data"/>
    </p>
    <p>Exports across the border to Panama were not interrupted when Costa Rica joined other Central American provinces in 1821 in a joint declaration of independence from Spain. In 1832, Costa Rica, at the time a state in the Federal Republic of Central America, began exporting coffee to Chile where it was re-bagged and shipped to England under the brand of “Café Chileno de Valparaíso”. In 1843, a shipment was sent directly to the United Kingdom by William Le Lacheur Lyon, captain of the English ship, The Monarch, who had seen the potential of directly cooperating with the Costa Ricans. He sent several hundred-pound bags and following this the British developed an interest in the country.[3] They invested heavily in the Costa Rican coffee industry, becoming the principal customer for exports until World War II. Growers and traders of the coffee industry transformed the Costa Rican economy, and contributed to modernization in the country, which provided funding for young aspiring academics to study in Europe. The revenue generated by the coffee industry in Costa Rica funded the first railroads linking the country to the Atlantic Coast in 1890, the “Ferrocarril al Atlántico”. The National Theater itself in San José is a product of the first coffee farmers in the country.
    </p>
    <p>
      <img alt="" xlink:actuate="onLoad" xlink:show="embed" xlink:type="simple"
           xlink:href="content:34#data"/>
    </p>
    <p>Coffee was vital to the Costa Rican economy by the early to mid-20th Century. Leading coffee growers were prominent members of society. Due to the centrality of coffee in the economy, price fluctuations from changes to conditions in larger coffee producers, like Brazil, had major reverberations in Costa Rica. When the price of coffee on the global market dropped, it could greatly impact the Costa Rican economy.
      <br/>
      <br/>In 1955 an export tax was placed on Costa Rican coffee. This however was abolished in 1994. In 1983, a major blight struck the coffee industry in the country, throwing the industry into a crisis that coincided with falling market prices; world coffee prices plummeted around 40% after the collapse of the world quota cartel system. By the late 1980s and early 1990s, coffee production had increased, from 158,000 tons in 1988 to 168,000 in 1992, but prices had fallen, from $316 million in 1988 to $266 million in 1992. In 1989, Costa Rica joined Honduras, Guatemala, Nicaragua, and El Salvador to establish a Central American coffee retention plan which agreed that the product was to be sold in installments to ensure market stability. There was an attempt by the International Coffee Organization in the 1990s to maintain export quotas that would support coffee prices worldwide.
      <br/>
      <br/>At present, the production of coffee in the Great Metropolitan Area around the capital of San José has decreased in recent years due to the effects of urban sprawl. As the cities have expanded into the countryside, poor plantation owners have often been forced to sell up to building corporations.
    </p>
    <h3>Table</h3>
    <h4>001 class attribute change</h4>
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

const miscW5000Text = `
<div xmlns="http://www.coremedia.com/2003/richtext-1.0" xmlns:xdiff="http://www.coremedia.com/2015/xdiff">
  <p>Auch gibt es niemanden, der den Schmerz an sich liebt, sucht oder wünscht, nur, weil er Schmerz ist, es sei denn, es kommt zu zufälligen Umständen, in denen Mühen und Schmerz ihm große Freude bereiten können. Um ein triviales Beispiel zu nehmen, wer von uns unterzieht sich je anstrengender körperlicher Betätigung, außer um Vorteile daraus zu ziehen?</p>
  <p>Aber wer hat irgend ein Recht, einen Menschen zu tadeln, der die Entscheidung trifft, eine Freude zu genießen, die keine unangenehmen Folgen hat, oder einen, der Schmerz vermeidet, welcher keine daraus resultierende Freude nach sich zieht? Auch gibt es niemanden, der den Schmerz an sich liebt, sucht oder wünscht, nur, weil er Schmerz ist, es sei denn, es kommt zu zufälligen Umständen, in denen Mühen und Schmerz ihm große Freude bereiten können.</p>
  <p>Um ein triviales Beispiel zu nehmen, wer von uns unterzieht sich je anstrengender körperlicher Betätigung, außer um Vorteile daraus zu ziehen? Aber wer hat irgend ein Recht, einen Menschen zu tadeln, der die Entscheidung trifft, eine Freude zu genießen, die keine unangenehmen Folgen hat, oder einen, der Schmerz vermeidet, welcher keine daraus resultierende Freude nach sich zieht?</p>
  <p>Auch gibt es niemanden, der den Schmerz an sich liebt, sucht oder wünscht, nur, weil er Schmerz ist, es sei denn, es kommt zu zufälligen Umständen, in denen Mühen und Schmerz ihm große Freude bereiten können. Um ein triviales Beispiel zu nehmen, wer von uns unterzieht sich je anstrengender körperlicher Betätigung, außer um Vorteile daraus zu ziehen?</p>
  <p>Aber wer hat irgend ein Recht, einen Menschen zu tadeln, der die Entscheidung trifft, eine Freude zu genießen, die keine unangenehmen Folgen hat,
    <em>
      <xdiff:span xdiff:class="diff-html-changed" xdiff:changes="&lt;b&gt;Emphasis&lt;/b&gt; style added."
                  xdiff:id="changed-diff-0" xdiff:next="changed-diff-1">oder
      </xdiff:span>
    </em>
    einen, der Schmerz vermeidet, welcher keine daraus resultierende Freude nach sich zieht? Auch gibt es niemanden, der den Schmerz an sich liebt, sucht oder wünscht, nur, weil er Schmerz ist, es sei denn, es kommt zu zufälligen Umständen, in denen Mühen und Schmerz ihm große Freude bereiten können.
  </p>
  <p>Um ein triviales Beispiel zu nehmen, wer von uns unterzieht sich je anstrengender körperlicher Betätigung, außer um Vorteile daraus zu ziehen? Aber wer hat irgend ein Recht, einen Menschen zu tadeln, der die Entscheidung trifft, eine Freude zu genießen, die keine unangenehmen Folgen hat, oder einen, der Schmerz vermeidet, welcher keine daraus resultierende Freude nach sich zieht?</p>
  <p>Auch gibt es niemanden, der den Schmerz an sich liebt, sucht oder wünscht, nur, weil er Schmerz ist, es sei denn, es kommt zu zufälligen Umständen, in denen Mühen und Schmerz ihm große Freude bereiten können. Um ein triviales Beispiel zu nehmen, wer von uns unterzieht sich je anstrengender körperlicher Betätigung, außer um Vorteile daraus zu ziehen?</p>
  <p>Aber wer hat irgend ein Recht, einen Menschen zu tadeln, der die Entscheidung trifft, eine Freude zu genießen, die keine unangenehmen Folgen hat, oder einen, der Schmerz vermeidet, welcher keine daraus resultierende Freude nach sich zieht? Auch gibt es niemanden, der den Schmerz an sich liebt, sucht oder wünscht, nur, weil er Schmerz ist, es sei denn, es kommt zu zufälligen Umständen, in denen Mühen und Schmerz ihm große Freude bereiten können.</p>
  <p>Um ein triviales Beispiel zu nehmen, wer von uns unterzieht sich je anstrengender körperlicher Betätigung, außer um Vorteile daraus zu ziehen? Aber wer hat irgend ein Recht, einen Menschen zu tadeln, der die Entscheidung trifft, eine Freude zu genießen, die keine unangenehmen Folgen hat, oder einen, der Schmerz vermeidet, welcher keine daraus resultierende Freude nach sich zieht?</p>
  <p>Auch gibt es niemanden, der den Schmerz an sich liebt, sucht oder wünscht, nur, weil er Schmerz ist, es sei denn, es kommt zu zufälligen Umständen, in denen Mühen und Schmerz ihm große Freude bereiten können. Um ein triviales Beispiel zu nehmen, wer von uns unterzieht sich je anstrengender körperlicher Betätigung, außer um Vorteile daraus zu ziehen?</p>
  <p>Aber wer hat irgend ein Recht, einen Menschen zu
    <strong>
      <xdiff:span xdiff:class="diff-html-changed" xdiff:changes="&lt;b&gt;Strong&lt;/b&gt; style added."
                  xdiff:previous="changed-diff-0" xdiff:id="changed-diff-1" xdiff:next="added-diff-0">tadeln
      </xdiff:span>
    </strong>
    , der die Entscheidung trifft, eine Freude zu genießen, die keine unangenehmen Folgen hat, oder einen, der Schmerz vermeidet, welcher keine daraus resultierende Freude nach sich zieht? Auch gibt es niemanden, der den Schmerz an sich liebt, sucht oder wünscht, nur, weil er Schmerz ist, es sei denn, es kommt zu zufälligen Umständen, in denen Mühen und Schmerz ihm große Freude bereiten können.
  </p>
  <p>Um ein triviales Beispiel zu nehmen, wer von uns unterzieht sich je anstrengender körperlicher Betätigung, außer um Vorteile daraus zu ziehen? Aber wer hat irgend ein Recht, einen Menschen zu tadeln, der die Entscheidung trifft, eine Freude zu genießen, die keine unangenehmen Folgen hat, oder einen, der Schmerz vermeidet, welcher keine daraus resultierende Freude nach sich zieht?</p>
  <p>Auch gibt es niemanden, der den Schmerz an sich liebt, sucht oder wünscht, nur, weil er Schmerz ist, es sei denn, es kommt zu zufälligen Umständen, in denen Mühen und Schmerz ihm große Freude bereiten können. Um ein triviales Beispiel zu nehmen, wer von uns unterzieht sich je anstrengender körperlicher Betätigung, außer um Vorteile daraus zu ziehen?</p>
  <p>Aber wer hat irgend ein Recht, einen Menschen zu tadeln, der die Entscheidung trifft, eine Freude zu genießen, die keine unangenehmen Folgen hat, oder einen, der Schmerz vermeidet, welcher keine daraus resultierende Freude nach sich zieht? Auch gibt es niemanden, der den Schmerz an sich liebt, sucht oder wünscht, nur, weil er Schmerz ist, es sei denn, es kommt zu zufälligen Umständen, in denen Mühen und Schmerz ihm große Freude bereiten können.</p>
  <p>Um ein triviales Beispiel zu nehmen, wer von uns unterzieht sich je anstrengender körperlicher Betätigung, außer um Vorteile daraus zu ziehen? Aber wer hat irgend ein Recht, einen Menschen zu tadeln, der die Entscheidung trifft, eine Freude zu genießen, die keine unangenehmen Folgen hat, oder einen, der Schmerz vermeidet, welcher keine daraus resultierende Freude nach sich zieht?</p>
  <p>Auch gibt es niemanden, der den Schmerz an sich liebt, sucht oder wünscht, nur, weil er Schmerz ist, es sei denn, es kommt zu zufälligen Umständen, in denen Mühen und Schmerz ihm große Freude bereiten können. Um ein triviales Beispiel zu nehmen, wer von uns unterzieht sich je anstrengender körperlicher Betätigung, außer um Vorteile daraus zu ziehen?</p>
  <p>Aber wer hat irgend ein Recht, einen Menschen zu tadeln, der die Entscheidung trifft, eine Freude zu genießen, die keine unangenehmen Folgen hat, oder einen, der Schmerz vermeidet, welcher keine daraus resultierende Freude nach sich zieht? Auch gibt es niemanden, der den Schmerz an sich liebt, sucht oder wünscht, nur, weil er Schmerz ist, es sei denn, es kommt zu zufälligen Umständen, in denen Mühen und Schmerz ihm große Freude bereiten können.</p>
  <p>Um ein triviales Beispiel zu nehmen, wer von uns unterzieht sich je anstrengender körperlicher Betätigung, außer um Vorteile daraus zu ziehen? Aber wer hat irgend ein Recht, einen Menschen zu tadeln, der die Entscheidung trifft, eine Freude zu genießen, die keine unangenehmen Folgen hat, oder einen, der Schmerz vermeidet, welcher keine daraus resultierende Freude nach sich zieht?</p>
  <p>Auch gibt es niemanden, der den Schmerz an sich liebt, sucht oder wünscht, nur, weil er Schmerz ist, es sei denn, es kommt zu zufälligen Umständen, in denen Mühen und Schmerz ihm große Freude bereiten können. Um ein triviales Beispiel zu nehmen, wer von uns unterzieht sich je anstrengender körperlicher Betätigung, außer um Vorteile daraus zu ziehen?</p>
  <p>Aber wer hat irgend ein Recht, einen Menschen zu tadeln, der die Entscheidung trifft, eine Freude zu genießen, die keine unangenehmen Folgen hat, oder einen, der Schmerz vermeidet, welcher keine daraus resultierende Freude nach sich zieht? Auch gibt es niemanden, der den Schmerz an sich liebt, sucht oder wünscht, nur, weil er Schmerz ist, es sei denn, es kommt zu zufälligen Umständen, in denen Mühen und Schmerz ihm große Freude bereiten können.</p>
  <p>Um ein triviales Beispiel zu nehmen, wer von uns unterzieht sich je anstrengender körperlicher Betätigung, außer um Vorteile daraus zu ziehen? Aber wer hat irgend ein Recht, einen Menschen zu tadeln, der die Entscheidung trifft, eine Freude zu genießen, die keine unangenehmen Folgen hat, oder einen, der Schmerz vermeidet, welcher keine daraus resultierende Freude nach sich zieht?</p>
  <p>Auch gibt es niemanden, der den Schmerz an sich liebt, sucht oder wünscht, nur, weil er Schmerz ist, es sei denn, es kommt zu zufälligen Umständen, in denen Mühen und Schmerz ihm große Freude bereiten können. Um ein triviales Beispiel zu nehmen, wer von uns unterzieht sich je anstrengender körperlicher Betätigung, außer um Vorteile daraus zu ziehen?</p>
  <p>Aber wer hat irgend ein Recht, einen Menschen zu tadeln, der die Entscheidung trifft, eine Freude zu genießen, die keine unangenehmen Folgen hat, oder einen, der Schmerz vermeidet, welcher keine daraus resultierende Freude nach sich zieht? Auch gibt es niemanden, der den Schmerz an sich liebt, sucht oder wünscht, nur, weil er Schmerz ist, es sei denn, es kommt zu zufälligen Umständen, in denen Mühen und Schmerz ihm große Freude bereiten können.</p>
  <p>Um ein triviales Beispiel zu nehmen, wer von uns unterzieht sich je anstrengender körperlicher Betätigung, außer um Vorteile daraus zu ziehen? Aber wer hat irgend ein Recht, einen Menschen zu tadeln, der die Entscheidung trifft, eine Freude zu genießen, die keine unangenehmen Folgen hat, oder einen, der Schmerz vermeidet, welcher keine daraus resultierende Freude nach sich zieht?</p>
  <p>Auch gibt es niemanden, der den Schmerz an sich liebt, sucht oder wünscht, nur, weil er Schmerz ist, es sei denn, es kommt zu zufälligen Umständen, in denen Mühen und Schmerz ihm große Freude bereiten können. Um ein triviales Beispiel zu nehmen, wer von uns unterzieht sich je anstrengender körperlicher Betätigung, außer um Vorteile daraus zu ziehen?</p>
  <p>Aber wer hat irgend ein Recht, einen Menschen zu tadeln, der die Entscheidung trifft, eine Freude zu genießen, die keine unangenehmen Folgen hat, oder einen, der Schmerz vermeidet, welcher keine daraus resultierende Freude nach sich zieht? Auch gibt es niemanden, der den Schmerz an sich liebt, sucht oder wünscht, nur, weil er Schmerz ist, es sei denn, es kommt zu zufälligen Umständen, in denen Mühen und Schmerz ihm große Freude bereiten können.</p>
  <p>Um ein triviales Beispiel zu nehmen, wer von uns unterzieht sich je anstrengender körperlicher Betätigung, außer um Vorteile daraus zu ziehen? Aber wer hat irgend ein Recht, einen Menschen zu tadeln, der die Entscheidung trifft, eine Freude zu genießen, die keine unangenehmen Folgen hat, oder einen, der Schmerz vermeidet, welcher keine daraus resultierende Freude nach sich zieht?</p>
  <p>Auch gibt es niemanden, der den Schmerz an sich liebt, sucht oder wünscht, nur, weil er Schmerz ist, es sei denn, es kommt zu zufälligen Umständen, in denen Mühen und Schmerz ihm große Freude bereiten können. Um ein triviales Beispiel zu nehmen, wer von uns unterzieht sich je anstrengender körperlicher Betätigung, außer um Vorteile daraus zu ziehen?</p>
  <p>Aber wer hat irgend ein Recht, einen Menschen zu tadeln, der die Entscheidung trifft, eine Freude zu genießen, die keine unangenehmen Folgen hat, oder einen, der Schmerz vermeidet, welcher keine daraus resultierende Freude nach sich zieht? Auch gibt es niemanden, der den Schmerz an sich liebt, sucht oder wünscht, nur, weil er Schmerz ist, es sei denn, es kommt zu zufälligen Umständen, in denen Mühen und Schmerz ihm große Freude bereiten können.</p>
  <p>Um ein triviales Beispiel zu nehmen, wer von uns unterzieht sich je anstrengender körperlicher Betätigung, außer um Vorteile daraus zu ziehen? Aber wer hat irgend ein Recht, einen Menschen zu tadeln, der die Entscheidung trifft, eine Freude zu genießen, die keine unangenehmen Folgen hat, oder einen, der Schmerz vermeidet, welcher keine daraus resultierende Freude nach sich zieht?</p>
  <p>Auch gibt es niemanden, der den Schmerz an sich liebt, sucht oder wünscht, nur, weil er Schmerz ist, es sei denn, es kommt zu zufälligen Umständen, in denen Mühen und Schmerz ihm große Freude bereiten können. Um ein triviales Beispiel zu nehmen, wer von uns unterzieht sich je anstrengender körperlicher Betätigung, außer um Vorteile daraus zu ziehen?</p>
  <p><xdiff:span xdiff:class="diff-html-added" xdiff:previous="changed-diff-1" xdiff:id="added-diff-0"
                 xdiff:next="added-diff-1">Um ein triviales Beispiel zu nehmen, wer von uns unterzieht sich je anstrengender körperlicher Betätigung, außer um Vorteile daraus zu ziehen?</xdiff:span>Aber wer hat irgend ein Recht, einen Menschen zu tadeln, der die Entscheidung trifft, eine Freude zu genießen, die keine unangenehmen Folgen hat, oder einen, der Schmerz vermeidet, welcher keine daraus resultierende Freude nach sich zieht?
    <xdiff:span xdiff:class="diff-html-added" xdiff:previous="added-diff-0" xdiff:id="added-diff-1"
                xdiff:next="removed-diff-0"/>
  </p>
  <p>Auch gibt es niemanden, der den Schmerz an sich liebt, sucht oder wünscht, nur, weil er Schmerz ist, es sei denn, es kommt zu zufälligen Umständen, in denen Mühen und Schmerz ihm große Freude bereiten können.
    <xdiff:span xdiff:class="diff-html-removed" xdiff:previous="added-diff-1" xdiff:id="removed-diff-0"
                xdiff:next="added-diff-2"/>
    Um ein triviales Beispiel zu nehmen, wer von uns unterzieht sich je anstrengender körperlicher Betätigung, außer um Vorteile daraus zu ziehen?
    <xdiff:span xdiff:class="diff-html-added" xdiff:previous="removed-diff-0" xdiff:id="added-diff-2"
                xdiff:next="removed-diff-1"/>
  </p>
  <p>Aber wer hat irgend ein Recht, einen Menschen zu tadeln, der die Entscheidung trifft, eine Freude zu genießen, die keine unangenehmen Folgen hat, oder einen, der Schmerz vermeidet, welcher keine daraus resultierende Freude nach sich zieht?
    <xdiff:span xdiff:class="diff-html-removed" xdiff:previous="added-diff-2" xdiff:id="removed-diff-1"
                xdiff:next="added-diff-3"/>
    Auch gibt es niemanden, der den Schmerz an sich liebt, sucht oder wünscht, nur, weil er Schmerz ist, es sei denn, es kommt zu zufälligen Umständen, in denen Mühen und Schmerz ihm große Freude bereiten können.
    <xdiff:span xdiff:class="diff-html-added" xdiff:previous="removed-diff-1" xdiff:id="added-diff-3"
                xdiff:next="removed-diff-2"/>
  </p>
  <p>Um ein triviales Beispiel zu nehmen, wer von uns unterzieht sich je anstrengender körperlicher Betätigung, außer um Vorteile daraus zu ziehen?
    <xdiff:span xdiff:class="diff-html-removed" xdiff:previous="added-diff-3" xdiff:id="removed-diff-2"
                xdiff:next="added-diff-4"/>
    Aber wer hat irgend ein Recht, einen Menschen zu tadeln, der die Entscheidung trifft, eine Freude zu genießen, die keine unangenehmen Folgen hat, oder einen, der Schmerz vermeidet, welcher keine daraus resultierende Freude nach sich zieht?
    <xdiff:span xdiff:class="diff-html-added" xdiff:previous="removed-diff-2" xdiff:id="added-diff-4"
                xdiff:next="removed-diff-3"/>
  </p>
  <p>Auch gibt es niemanden, der den Schmerz an sich liebt, sucht oder wünscht, nur, weil er Schmerz ist, es sei denn, es kommt zu zufälligen Umständen, in denen Mühen und Schmerz ihm große Freude bereiten können.
    <xdiff:span xdiff:class="diff-html-removed" xdiff:previous="added-diff-4" xdiff:id="removed-diff-3"
                xdiff:next="added-diff-5"/>
    Um ein triviales Beispiel zu nehmen, wer von uns unterzieht sich je anstrengender körperlicher Betätigung, außer um Vorteile daraus zu ziehen?
    <xdiff:span xdiff:class="diff-html-added" xdiff:previous="removed-diff-3" xdiff:id="added-diff-5"
                xdiff:next="removed-diff-4"/>
  </p>
  <p>Aber wer hat irgend ein Recht, einen Menschen zu tadeln, der die Entscheidung trifft, eine Freude zu genießen, die keine unangenehmen Folgen hat, oder einen, der Schmerz vermeidet, welcher keine daraus resultierende Freude nach sich zieht?
    <xdiff:span xdiff:class="diff-html-removed" xdiff:previous="added-diff-5" xdiff:id="removed-diff-4"
                xdiff:next="added-diff-6"/>
    Auch gibt es niemanden, der den Schmerz an sich liebt, sucht oder wünscht, nur, weil er Schmerz ist, es sei denn, es kommt zu zufälligen Umständen, in denen Mühen und Schmerz ihm große Freude bereiten können.
    <xdiff:span xdiff:class="diff-html-added" xdiff:previous="removed-diff-4" xdiff:id="added-diff-6"
                xdiff:next="removed-diff-5"/>
  </p>
  <p>Um ein triviales Beispiel zu nehmen, wer von uns unterzieht sich je anstrengender körperlicher Betätigung, außer um Vorteile daraus zu ziehen?
    <xdiff:span xdiff:class="diff-html-removed" xdiff:previous="added-diff-6" xdiff:id="removed-diff-5"
                xdiff:next="added-diff-7"/>
    Aber wer hat irgend ein Recht, einen Menschen zu tadeln, der die Entscheidung trifft, eine Freude zu genießen, die keine unangenehmen Folgen hat, oder einen, der Schmerz vermeidet, welcher keine daraus resultierende Freude nach sich zieht?
    <xdiff:span xdiff:class="diff-html-added" xdiff:previous="removed-diff-5" xdiff:id="added-diff-7"
                xdiff:next="removed-diff-6"/>
  </p>
  <p>Auch gibt es niemanden, der den Schmerz an sich liebt, sucht oder wünscht, nur, weil er Schmerz ist, es sei denn, es kommt zu zufälligen Umständen, in denen Mühen und Schmerz ihm große Freude bereiten können.
    <xdiff:span xdiff:class="diff-html-removed" xdiff:previous="added-diff-7" xdiff:id="removed-diff-6"
                xdiff:next="added-diff-8"/>
    Um ein triviales Beispiel zu nehmen, wer von uns unterzieht sich je anstrengender körperlicher Betätigung, außer um Vorteile daraus zu ziehen?
    <xdiff:span xdiff:class="diff-html-added" xdiff:previous="removed-diff-6" xdiff:id="added-diff-8"
                xdiff:next="removed-diff-7"/>
  </p>
  <p>Aber wer hat irgend ein Recht, einen Menschen zu tadeln, der die Entscheidung trifft, eine Freude zu genießen, die keine unangenehmen Folgen hat, oder einen, der Schmerz vermeidet, welcher keine daraus resultierende Freude nach sich zieht?
    <xdiff:span xdiff:class="diff-html-removed" xdiff:previous="added-diff-8" xdiff:id="removed-diff-7"
                xdiff:next="added-diff-9"/>
    Auch gibt es niemanden, der den Schmerz an sich liebt, sucht oder wünscht, nur, weil er Schmerz ist, es sei denn, es kommt zu zufälligen Umständen, in denen Mühen und Schmerz ihm große Freude bereiten können.
    <xdiff:span xdiff:class="diff-html-added" xdiff:previous="removed-diff-7" xdiff:id="added-diff-9"
                xdiff:next="removed-diff-8"/>
  </p>
  <p>Um ein triviales Beispiel zu nehmen, wer von uns unterzieht sich je anstrengender körperlicher Betätigung, außer um Vorteile daraus zu ziehen?
    <xdiff:span xdiff:class="diff-html-removed" xdiff:previous="added-diff-9" xdiff:id="removed-diff-8"
                xdiff:next="added-diff-10"/>
    Aber wer hat irgend ein Recht, einen Menschen zu tadeln, der die Entscheidung trifft, eine Freude zu genießen, die keine unangenehmen Folgen hat, oder einen, der Schmerz vermeidet, welcher keine daraus resultierende Freude nach sich zieht?
    <xdiff:span xdiff:class="diff-html-added" xdiff:previous="removed-diff-8" xdiff:id="added-diff-10"
                xdiff:next="removed-diff-9"/>
  </p>
  <p>Auch gibt es niemanden, der den Schmerz an sich liebt, sucht oder wünscht, nur, weil er Schmerz ist, es sei denn, es kommt zu zufälligen Umständen, in denen Mühen und Schmerz ihm große Freude bereiten können.
    <xdiff:span xdiff:class="diff-html-removed" xdiff:previous="added-diff-10" xdiff:id="removed-diff-9"
                xdiff:next="added-diff-11"/>
    Um ein triviales Beispiel zu nehmen, wer von uns unterzieht sich je anstrengender körperlicher Betätigung, außer um Vorteile daraus zu ziehen?
    <xdiff:span xdiff:class="diff-html-added" xdiff:previous="removed-diff-9" xdiff:id="added-diff-11"
                xdiff:next="removed-diff-10"/>
  </p>
  <p>Aber wer hat irgend ein Recht, einen Menschen zu tadeln, der die Entscheidung trifft, eine Freude zu genießen, die keine unangenehmen Folgen hat, oder einen, der Schmerz vermeidet, welcher keine daraus resultierende Freude nach sich zieht?
    <xdiff:span xdiff:class="diff-html-removed" xdiff:previous="added-diff-11" xdiff:id="removed-diff-10"
                xdiff:next="added-diff-12"/>
    Auch gibt es niemanden, der den Schmerz an sich liebt, sucht oder wünscht, nur, weil er Schmerz ist, es sei denn, es kommt zu zufälligen Umständen, in denen Mühen und Schmerz ihm große Freude bereiten können.
    <xdiff:span xdiff:class="diff-html-added" xdiff:previous="removed-diff-10" xdiff:id="added-diff-12"
                xdiff:next="removed-diff-11"/>
  </p>
  <p>Um ein triviales Beispiel zu nehmen, wer von uns unterzieht sich je anstrengender körperlicher Betätigung, außer um Vorteile daraus zu ziehen?
    <xdiff:span xdiff:class="diff-html-removed" xdiff:previous="added-diff-12" xdiff:id="removed-diff-11"
                xdiff:next="added-diff-13"/>
    Aber wer hat irgend ein Recht, einen Menschen zu tadeln, der die Entscheidung trifft, eine Freude zu genießen, die keine unangenehmen Folgen hat, oder einen, der Schmerz vermeidet, welcher keine daraus resultierende Freude nach sich zieht?
    <xdiff:span xdiff:class="diff-html-added" xdiff:previous="removed-diff-11" xdiff:id="added-diff-13"
                xdiff:next="removed-diff-12"/>
  </p>
  <p>Auch gibt es niemanden, der den Schmerz an sich liebt, sucht oder wünscht, nur, weil er Schmerz ist, es sei denn, es kommt zu zufälligen Umständen, in denen Mühen und Schmerz ihm große Freude bereiten können.
    <xdiff:span xdiff:class="diff-html-removed" xdiff:previous="added-diff-13" xdiff:id="removed-diff-12"
                xdiff:next="added-diff-14"/>
    Um ein triviales Beispiel zu nehmen, wer von uns unterzieht sich je anstrengender körperlicher Betätigung, außer um Vorteile daraus zu ziehen?
    <xdiff:span xdiff:class="diff-html-added" xdiff:previous="removed-diff-12" xdiff:id="added-diff-14"
                xdiff:next="removed-diff-13"/>
  </p>
  <p>Aber wer hat irgend ein Recht, einen Menschen zu tadeln, der die Entscheidung trifft, eine Freude zu genießen, die keine unangenehmen Folgen hat, oder einen, der Schmerz vermeidet, welcher keine daraus resultierende Freude nach sich zieht?
    <xdiff:span xdiff:class="diff-html-removed" xdiff:previous="added-diff-14" xdiff:id="removed-diff-13"
                xdiff:next="removed-diff-14"/>
    Auch gibt es niemanden, der den Schmerz an sich liebt, sucht oder wünscht, nur, weil er Schmerz ist, es sei denn, es kommt zu zufälligen Umständen, in denen Mühen und Schmerz ihm große Freude bereiten können.
    <xdiff:span xdiff:class="diff-html-removed" xdiff:previous="removed-diff-13" xdiff:id="removed-diff-14"
                xdiff:next="changed-diff-2">Um ein triviales Beispiel zu nehmen, wer von uns unterzieht sich je anstrengender körperlicher Betätigung, außer um Vorteile daraus zu ziehen?
    </xdiff:span>
  </p>
  <p>Aber wer hat irgend ein Recht, einen Menschen zu tadeln, der die Entscheidung trifft, eine Freude zu genießen, die keine unangenehmen Folgen hat, oder einen, der Schmerz vermeidet, welcher keine daraus resultierende Freude nach sich zieht? Auch gibt es niemanden, der den Schmerz an sich liebt, sucht oder wünscht, nur, weil er Schmerz ist, es sei denn, es kommt zu zufälligen Umständen, in denen Mühen und Schmerz ihm große Freude bereiten können.</p>
  <p>Um ein triviales Beispiel zu nehmen, wer von uns unterzieht sich je anstrengender körperlicher Betätigung, außer um Vorteile daraus zu ziehen? Aber wer hat irgend ein Recht, einen Menschen zu tadeln, der die Entscheidung trifft, eine Freude zu genießen, die keine unangenehmen Folgen hat, oder einen, der Schmerz vermeidet, welcher keine daraus resultierende Freude nach sich zieht?</p>
  <p>Auch gibt es niemanden, der den Schmerz an sich liebt, sucht oder wünscht, nur, weil er Schmerz ist, es sei denn, es kommt zu zufälligen Umständen, in denen Mühen und Schmerz ihm große Freude bereiten können. Um ein triviales Beispiel zu nehmen, wer von uns unterzieht sich je anstrengender körperlicher Betätigung, außer um Vorteile daraus zu ziehen?</p>
  <p>Aber wer hat irgend ein Recht, einen Menschen zu tadeln, der die Entscheidung trifft, eine Freude zu genießen, die keine unangenehmen Folgen hat, oder einen, der Schmerz vermeidet, welcher keine daraus resultierende Freude nach sich zieht? Auch gibt es niemanden, der den Schmerz an sich liebt, sucht oder wünscht, nur, weil er Schmerz ist, es sei denn, es kommt zu zufälligen Umständen, in denen Mühen und Schmerz ihm große Freude bereiten können.</p>
  <p>Um ein triviales Beispiel zu nehmen, wer von uns unterzieht sich je anstrengender körperlicher Betätigung, außer um Vorteile daraus zu ziehen? Aber wer hat irgend ein Recht, einen Menschen zu tadeln, der die Entscheidung trifft, eine Freude zu genießen, die keine unangenehmen Folgen hat, oder einen, der Schmerz vermeidet, welcher keine daraus resultierende Freude nach sich zieht? Auch gibt es niemanden, der den Schmerz an sich liebt, sucht oder wünscht, nur, weil er Schmerz ist, es sei denn, es kommt zu zufälligen Umständen, in denen Mühen und Schmerz ihm große Freude bereiten können.</p>
  <p>Um ein triviales Beispiel zu nehmen, wer von uns unterzieht sich je anstrengender körperlicher Betätigung, außer um Vorteile daraus zu ziehen? Aber wer hat irgend ein Recht, einen Menschen zu tadeln, der die Entscheidung trifft, eine Freude zu genießen, die keine unangenehmen Folgen hat, oder einen, der Schmerz vermeidet, welcher keine daraus resultierende Freude nach sich zieht? Auch gibt es niemanden, der den Schmerz an sich liebt, sucht oder wünscht, nur, weil er Schmerz ist, es sei denn, es kommt zu zufälligen Umständen, in denen Mühen und Schmerz ihm große Freude bereiten können.</p>
  <p>Um ein triviales Beispiel zu nehmen, wer von uns unterzieht sich je anstrengender körperlicher Betätigung, außer um Vorteile daraus zu ziehen? Aber wer hat irgend ein Recht, einen Menschen zu tadeln, der die Entscheidung trifft, eine Freude zu genießen, die keine unangenehmen Folgen hat, oder einen, der Schmerz vermeidet, welcher keine daraus resultierende Freude nach sich zieht? Auch gibt es niemanden, der den Schmerz an sich liebt, sucht oder wünscht, nur, weil er Schmerz ist, es sei denn, es kommt zu zufälligen Umständen, in denen Mühen und Schmerz ihm große Freude bereiten können.</p>
  <p>Um ein triviales Beispiel zu nehmen, wer von uns unterzieht sich je anstrengender körperlicher Betätigung, außer um Vorteile daraus zu ziehen? Aber wer hat irgend ein Recht, einen Menschen zu tadeln, der die Entscheidung trifft, eine Freude zu genießen, die keine unangenehmen Folgen hat, oder einen, der Schmerz vermeidet, welcher keine daraus resultierende Freude nach sich zieht? Auch gibt es niemanden, der den Schmerz an sich liebt, sucht oder wünscht, nur, weil er Schmerz ist, es sei denn, es kommt zu zufälligen Umständen, in denen Mühen und Schmerz ihm große Freude bereiten können.</p>
  <p>Um ein triviales Beispiel zu nehmen, wer von uns unterzieht sich je anstrengender körperlicher Betätigung, außer um Vorteile daraus zu ziehen? Aber wer hat irgend ein Recht, einen Menschen zu tadeln, der die Entscheidung trifft, eine Freude zu genießen, die keine unangenehmen Folgen hat, oder einen, der Schmerz vermeidet, welcher keine daraus resultierende Freude nach sich zieht? Auch gibt es niemanden, der den Schmerz an sich liebt, sucht oder wünscht, nur, weil er Schmerz ist, es sei denn, es kommt zu zufälligen Umständen, in denen Mühen und Schmerz ihm große Freude bereiten können.</p>
  <p>Um ein triviales Beispiel zu nehmen, wer von uns unterzieht sich je anstrengender körperlicher Betätigung, außer um Vorteile daraus zu ziehen? Aber wer hat irgend ein Recht, einen Menschen zu tadeln, der die Entscheidung trifft, eine Freude zu genießen, die keine unangenehmen Folgen hat, oder einen, der Schmerz vermeidet, welcher keine daraus resultierende Freude nach sich zieht? Auch gibt es niemanden, der den Schmerz an sich liebt, sucht oder wünscht, nur, weil er Schmerz ist, es sei denn, es kommt zu zufälligen Umständen, in denen Mühen und Schmerz ihm große Freude bereiten können.</p>
  <p>Um ein triviales Beispiel zu nehmen, wer von uns unterzieht sich je anstrengender körperlicher Betätigung, außer um Vorteile daraus zu ziehen? Aber wer hat irgend ein Recht, einen Menschen zu tadeln, der die Entscheidung trifft, eine Freude zu genießen, die keine unangenehmen Folgen hat, oder einen, der Schmerz vermeidet, welcher keine daraus resultierende Freude nach sich zieht? Auch gibt es niemanden, der den Schmerz an sich liebt, sucht oder wünscht, nur, weil er Schmerz ist, es sei denn, es kommt zu zufälligen Umständen, in denen Mühen und Schmerz ihm große Freude bereiten können.</p>
  <p>Um ein triviales Beispiel zu nehmen, wer von uns unterzieht sich je anstrengender körperlicher Betätigung, außer um Vorteile daraus zu ziehen? Aber wer hat irgend ein Recht, einen Menschen zu tadeln, der die Entscheidung trifft, eine Freude zu genießen, die keine unangenehmen Folgen hat, oder einen, der Schmerz vermeidet, welcher keine daraus resultierende Freude nach sich zieht? Auch gibt es niemanden, der den Schmerz an sich liebt, sucht oder wünscht, nur, weil er Schmerz ist, es sei denn, es kommt zu zufälligen Umständen, in denen Mühen und Schmerz ihm große Freude bereiten können.</p>
  <p>Um ein triviales Beispiel zu nehmen, wer von uns unterzieht sich je anstrengender körperlicher Betätigung, außer um Vorteile daraus zu ziehen? Aber wer hat irgend ein Recht, einen Menschen zu tadeln, der die Entscheidung trifft, eine Freude zu genießen, die keine unangenehmen Folgen hat, oder einen, der Schmerz vermeidet, welcher keine daraus resultierende Freude nach sich zieht? Auch gibt es niemanden, der den Schmerz an sich liebt, sucht oder wünscht, nur, weil er Schmerz ist, es sei denn, es kommt zu zufälligen Umständen, in denen Mühen und Schmerz ihm große Freude bereiten können.</p>
  <p>Um ein triviales Beispiel zu nehmen, wer von uns unterzieht sich je anstrengender körperlicher Betätigung, außer um Vorteile daraus zu ziehen? Aber wer hat irgend ein Recht, einen Menschen zu tadeln, der die Entscheidung trifft, eine Freude zu genießen, die keine unangenehmen Folgen hat, oder einen, der Schmerz vermeidet, welcher keine daraus resultierende Freude nach sich zieht? Auch gibt es niemanden, der den Schmerz an sich liebt, sucht oder wünscht, nur, weil er Schmerz ist, es sei denn, es kommt zu zufälligen Umständen, in denen Mühen und Schmerz ihm große Freude bereiten können.</p>
  <p>Um ein triviales Beispiel zu nehmen, wer von uns unterzieht sich je anstrengender körperlicher Betätigung, außer um Vorteile daraus zu ziehen? Aber wer hat irgend ein Recht, einen Menschen zu tadeln, der die Entscheidung trifft, eine Freude zu genießen, die keine unangenehmen Folgen hat, oder einen, der Schmerz vermeidet, welcher keine daraus resultierende Freude nach sich zieht? Auch gibt es niemanden, der den Schmerz an sich liebt, sucht oder wünscht, nur, weil er Schmerz ist, es sei denn, es kommt zu zufälligen Umständen, in denen Mühen und Schmerz ihm große Freude bereiten können.</p>
  <p>Um ein triviales Beispiel zu nehmen, wer von uns unterzieht sich je anstrengender körperlicher Betätigung, außer um Vorteile daraus zu ziehen? Aber wer hat irgend ein Recht, einen Menschen zu tadeln, der die Entscheidung trifft, eine Freude zu genießen, die keine unangenehmen Folgen hat, oder einen, der Schmerz vermeidet, welcher keine daraus resultierende Freude nach sich zieht? Auch gibt es niemanden, der den Schmerz an sich liebt, sucht oder wünscht, nur, weil er Schmerz ist, es sei denn, es kommt zu zufälligen Umständen, in denen Mühen und Schmerz ihm große Freude bereiten können.</p>
  <p>Um ein triviales Beispiel zu nehmen, wer von uns unterzieht sich je anstrengender körperlicher Betätigung, außer um Vorteile daraus zu ziehen? Aber wer hat irgend ein Recht, einen Menschen zu tadeln, der die Entscheidung trifft, eine Freude zu genießen, die keine unangenehmen Folgen hat, oder einen, der Schmerz vermeidet, welcher keine daraus resultierende Freude nach sich zieht? Auch gibt es niemanden, der den Schmerz an sich liebt, sucht oder wünscht, nur, weil er Schmerz ist, es sei denn, es kommt zu zufälligen Umständen, in denen Mühen und Schmerz ihm große Freude bereiten können.</p>
  <p>Um ein triviales Beispiel zu nehmen, wer von uns unterzieht sich je anstrengender körperlicher Betätigung, außer um Vorteile daraus zu ziehen? Aber wer hat irgend ein Recht, einen Menschen zu tadeln, der die Entscheidung trifft, eine Freude zu genießen, die keine unangenehmen Folgen hat, oder einen, der Schmerz vermeidet, welcher keine daraus resultierende Freude nach sich zieht? Auch gibt es niemanden, der den Schmerz an sich liebt, sucht oder wünscht, nur, weil er Schmerz ist, es sei denn, es kommt zu zufälligen Umständen, in denen Mühen und Schmerz ihm große Freude bereiten können.</p>
  <p>Um ein triviales Beispiel zu nehmen, wer von uns unterzieht sich je anstrengender körperlicher Betätigung, außer um Vorteile daraus zu ziehen? Aber wer hat irgend ein Recht, einen Menschen zu tadeln, der die Entscheidung trifft, eine Freude zu genießen, die keine unangenehmen Folgen hat, oder einen, der Schmerz vermeidet, welcher keine daraus resultierende Freude nach sich zieht? Auch gibt es niemanden, der den Schmerz an sich liebt, sucht oder wünscht, nur, weil er Schmerz ist, es sei denn, es kommt zu zufälligen Umständen, in denen Mühen und Schmerz ihm große Freude bereiten können.</p>
  <p>Um ein triviales Beispiel zu nehmen, wer von uns unterzieht sich je anstrengender körperlicher Betätigung, außer um Vorteile daraus zu ziehen? Aber wer hat irgend ein Recht, einen Menschen zu tadeln, der die Entscheidung trifft, eine Freude zu genießen, die keine unangenehmen Folgen hat, oder einen, der Schmerz vermeidet, welcher keine daraus resultierende Freude nach sich zieht? Auch gibt es niemanden, der den Schmerz an sich liebt, sucht oder wünscht, nur, weil er Schmerz ist, es sei denn, es kommt zu zufälligen Umständen, in denen Mühen und Schmerz ihm große Freude bereiten können.</p>
  <p>Um ein triviales Beispiel zu nehmen, wer von uns unterzieht sich je anstrengender körperlicher Betätigung, außer um Vorteile daraus zu ziehen? Aber wer hat irgend ein Recht, einen Menschen zu tadeln, der die Entscheidung trifft, eine Freude zu genießen, die keine unangenehmen Folgen hat, oder einen, der Schmerz vermeidet, welcher keine daraus resultierende Freude nach sich zieht? Auch gibt es niemanden, der den Schmerz an sich liebt, sucht oder wünscht, nur, weil er Schmerz ist, es sei denn, es kommt zu zufälligen Umständen, in denen Mühen und Schmerz ihm große Freude bereiten können.</p>
  <p>Um ein triviales Beispiel zu nehmen, wer von uns unterzieht sich je anstrengender körperlicher Betätigung, außer um Vorteile daraus zu ziehen? Aber wer hat irgend ein Recht, einen Menschen zu tadeln, der die Entscheidung trifft, eine Freude zu genießen, die keine unangenehmen Folgen hat, oder einen, der Schmerz vermeidet, welcher keine daraus resultierende Freude nach sich zieht? Auch gibt es niemanden, der den Schmerz an sich liebt, sucht oder wünscht, nur, weil er Schmerz ist, es sei denn, es kommt zu zufälligen Umständen, in denen Mühen und Schmerz ihm große Freude bereiten können.</p>
  <p>Um ein
    <span class="color--red">
      <xdiff:span xdiff:class="diff-html-changed"
                  xdiff:changes="Moved to a &lt;b&gt;span&lt;/b&gt; with class color--red."
                  xdiff:previous="removed-diff-14" xdiff:id="changed-diff-2"
                  xdiff:next="removed-diff-15">triviales Beispiel zu nehmen
      </xdiff:span>
    </span>
    , wer von uns unterzieht sich je anstrengender körperlicher Betätigung, außer um Vorteile daraus zu ziehen? Aber wer hat irgend ein Recht, einen Menschen zu tadeln, der die Entscheidung trifft, eine Freude zu genießen, die keine unangenehmen Folgen hat, oder einen, der Schmerz vermeidet, welcher keine daraus resultierende Freude nach sich zieht? Auch gibt es niemanden, der den Schmerz an sich liebt, sucht oder wünscht, nur, weil er Schmerz ist, es sei denn, es kommt zu zufälligen Umständen, in denen Mühen und Schmerz ihm große Freude bereiten können.
  </p>
  <p>Um ein triviales Beispiel zu nehmen, wer von uns unterzieht sich je anstrengender körperlicher Betätigung, außer um Vorteile daraus zu ziehen? Aber wer hat irgend ein Recht, einen Menschen zu tadeln, der die Entscheidung trifft, eine Freude zu genießen, die keine unangenehmen Folgen hat, oder einen, der Schmerz vermeidet, welcher keine daraus resultierende Freude nach sich zieht? Auch gibt es niemanden, der den Schmerz an sich liebt, sucht oder wünscht, nur, weil er Schmerz ist, es sei denn, es kommt zu zufälligen Umständen, in denen Mühen und Schmerz ihm große Freude bereiten können. Um ein triviales Beispiel zu nehmen, wer von uns unterzieht sich je anstrengender körperlicher Betätigung, außer um
    <xdiff:span xdiff:class="diff-html-removed" xdiff:previous="changed-diff-2" xdiff:id="removed-diff-15"
                xdiff:next="added-diff-15">Vorteile
    </xdiff:span>
    <xdiff:span xdiff:class="diff-html-added" xdiff:previous="removed-diff-15"
                xdiff:id="added-diff-15">Nachteile</xdiff:span>daraus zu ziehen? Aber wer hat irgend ein Recht, einen Menschen zu tadeln, der die Entscheidung trifft,
  </p>
</div>
`
const miscW1000Text = `<div xmlns="http://www.coremedia.com/2003/richtext-1.0" xmlns:xdiff="http://www.coremedia.com/2015/xdiff">
  <p>Auch gibt es niemanden, der den Schmerz an sich liebt, sucht oder wünscht, nur, weil er Schmerz ist, es sei denn, es kommt zu zufälligen Umständen, in denen Mühen und Schmerz ihm große Freude bereiten können.</p>
  <p>Um ein triviales Beispiel zu nehmen, wer von uns unterzieht sich je anstrengender körperlicher Betätigung, außer um Vorteile daraus zu ziehen?</p>
  <p>Aber wer hat irgend ein Recht, einen
    <em>
      <xdiff:span xdiff:class="diff-html-changed" xdiff:changes="&lt;b&gt;Emphasis&lt;/b&gt; style added."
                  xdiff:id="changed-diff-0" xdiff:next="removed-diff-0">Menschen
      </xdiff:span>
    </em>
    zu tadeln, der die Entscheidung trifft, eine Freude zu genießen, die keine unangenehmen Folgen hat, oder einen, der Schmerz vermeidet, welcher keine daraus resultierende Freude nach sich zieht?
  </p>
  <p>Auch gibt es niemanden, der den Schmerz an sich liebt, sucht oder wünscht, nur, weil er Schmerz ist, es sei denn, es kommt zu zufälligen Umständen, in denen Mühen und Schmerz ihm große Freude bereiten können.</p>
  <p>Um ein triviales Beispiel zu nehmen, wer von uns unterzieht sich je anstrengender körperlicher Betätigung, außer um Vorteile daraus zu ziehen?</p>
  <p>Aber wer hat irgend ein Recht, einen Menschen zu tadeln, der die Entscheidung trifft, eine Freude zu genießen, die keine unangenehmen Folgen hat, oder einen, der Schmerz vermeidet, welcher keine daraus resultierende Freude nach sich zieht?</p>
  <p>Auch gibt es niemanden, der den Schmerz an sich liebt, sucht oder wünscht, nur, weil er Schmerz ist, es sei denn, es kommt zu zufälligen Umständen, in denen Mühen und Schmerz ihm große Freude bereiten können.</p>
  <p>Um ein triviales Beispiel zu nehmen, wer von uns unterzieht sich je anstrengender körperlicher Betätigung, außer um Vorteile daraus zu ziehen?</p>
  <p>Aber wer hat irgend ein Recht, einen Menschen zu tadeln, der die Entscheidung trifft, eine Freude zu genießen, die keine unangenehmen Folgen hat, oder einen, der Schmerz vermeidet, welcher keine daraus resultierende Freude nach sich zieht?</p>
  <p>Auch gibt es niemanden, der den Schmerz an sich liebt, sucht oder wünscht, nur, weil er Schmerz ist, es sei denn, es kommt zu zufälligen Umständen, in denen Mühen und Schmerz ihm große Freude bereiten können.</p>
  <p>Um ein triviales Beispiel zu nehmen, wer von uns unterzieht sich je anstrengender körperlicher Betätigung, außer um Vorteile daraus zu ziehen?</p>
  <p>
    <xdiff:span xdiff:class="diff-html-removed" xdiff:previous="changed-diff-0" xdiff:id="removed-diff-0"
                xdiff:next="changed-diff-1">Aber wer hat irgend ein Recht, einen Menschen zu tadeln, der die Entscheidung trifft, eine Freude zu genießen, die keine unangenehmen Folgen hat, oder einen, der Schmerz vermeidet, welcher keine daraus resultierende Freude nach sich zieht?
    </xdiff:span>
  </p>
  <p>Auch gibt es niemanden, der den Schmerz an sich liebt, sucht oder wünscht, nur, weil er Schmerz ist, es sei denn, es kommt zu zufälligen Umständen, in denen Mühen und Schmerz ihm große Freude bereiten können.</p>
  <p>Um ein triviales Beispiel zu nehmen, wer von uns unterzieht sich je anstrengender körperlicher Betätigung, außer um Vorteile daraus zu ziehen?</p>
  <p>Aber wer hat irgend ein Recht, einen Menschen zu tadeln, der die Entscheidung trifft, eine Freude zu genießen, die keine unangenehmen Folgen hat, oder einen, der Schmerz vermeidet, welcher keine daraus resultierende Freude nach sich zieht?</p>
  <p>Auch gibt es niemanden, der den Schmerz an sich liebt, sucht oder wünscht, nur, weil er Schmerz ist, es sei denn, es kommt zu zufälligen Umständen, in denen Mühen und Schmerz ihm große Freude bereiten können.</p>
  <p>Um ein triviales Beispiel zu nehmen, wer von uns unterzieht sich je anstrengender körperlicher Betätigung, außer um Vorteile daraus zu ziehen?</p>
  <p>Aber wer hat irgend ein Recht, einen Menschen zu tadeln, der die Entscheidung trifft, eine Freude zu genießen, die keine unangenehmen Folgen hat, oder einen, der Schmerz vermeidet, welcher keine daraus resultierende Freude nach sich zieht?</p>
  <p>Auch gibt es niemanden, der den Schmerz an sich liebt, sucht oder wünscht, nur, weil er Schmerz ist, es sei denn, es kommt zu zufälligen Umständen, in denen Mühen und Schmerz ihm große Freude bereiten können. Um ein triviales Beispiel zu nehmen, wer von uns unterzieht sich je anstrengender körperlicher Betätigung, außer um Vorteile daraus zu ziehen?</p>
  <p>Aber wer hat irgend ein Recht, einen Menschen zu
    <strong>
      <xdiff:span xdiff:class="diff-html-changed" xdiff:changes="&lt;b&gt;Strong&lt;/b&gt; style added."
                  xdiff:previous="removed-diff-0" xdiff:id="changed-diff-1"
                  xdiff:next="removed-diff-1">tadeln, der die Entscheidung trifft, eine Freude zu genießen, die keine unangenehmen Folgen hat, oder einen, der Schmerz vermeidet, welcher keine daraus resultierende Freude nach sich zieht?
      </xdiff:span>
    </strong>
  </p>
  <p>Auch gibt es niemanden, der den Schmerz an sich liebt, sucht oder wünscht, nur, weil er Schmerz ist, es sei denn, es kommt zu zufälligen Umständen, in denen Mühen und Schmerz ihm große Freude bereiten können. Um ein triviales Beispiel zu nehmen, wer von uns unterzieht sich je anstrengender körperlicher Betätigung, außer um Vorteile daraus zu ziehen?</p>
  <p>Aber wer hat irgend ein Recht, einen Menschen zu tadeln, der die Entscheidung trifft, eine Freude zu genießen, die keine unangenehmen Folgen hat, oder einen, der Schmerz vermeidet, welcher keine daraus resultierende Freude nach sich zieht? Auch gibt es niemanden, der den Schmerz an sich liebt, sucht oder wünscht, nur, weil er Schmerz ist, es sei denn, es kommt zu zufälligen Umständen, in denen Mühen und Schmerz ihm große Freude bereiten können.</p>
  <p>Um ein triviales Beispiel zu nehmen, wer von uns unterzieht sich je anstrengender körperlicher Betätigung, außer um Vorteile daraus zu ziehen? Aber wer hat irgend ein Recht, einen Menschen zu tadeln, der die Entscheidung trifft, eine Freude zu genießen, die keine unangenehmen Folgen hat, oder einen, der Schmerz vermeidet, welcher keine daraus resultierende Freude nach sich zieht?</p>
  <p>Auch gibt es niemanden, der den
    <xdiff:span xdiff:class="diff-html-removed" xdiff:previous="changed-diff-1" xdiff:id="removed-diff-1"
                xdiff:next="added-diff-0">Schmerz
    </xdiff:span>
    <xdiff:span xdiff:class="diff-html-added" xdiff:previous="removed-diff-1" xdiff:id="added-diff-0"
                xdiff:next="changed-diff-2">Unmut</xdiff:span>an sich liebt, sucht oder wünscht, nur, weil er Schmerz ist, es sei denn, es kommt zu zufälligen Umständen, in denen Mühen und Schmerz ihm große Freude bereiten können. Um ein triviales Beispiel zu nehmen, wer von uns unterzieht sich je anstrengender körperlicher Betätigung, außer um Vorteile daraus zu ziehen?
  </p>
  <p>Aber wer hat irgend ein Recht, einen Menschen zu tadeln, der die Entscheidung trifft, eine Freude zu genießen, die keine unangenehmen Folgen hat, oder einen, der Schmerz vermeidet, welcher keine daraus resultierende Freude nach sich zieht? Auch gibt es niemanden, der den
    <span class="color--red">
      <xdiff:span xdiff:class="diff-html-changed"
                  xdiff:changes="Moved to a &lt;b&gt;span&lt;/b&gt; with class color--red."
                  xdiff:previous="added-diff-0" xdiff:id="changed-diff-2" xdiff:next="added-diff-1">Schmerz
      </xdiff:span>
    </span>
    an sich liebt, sucht oder wünscht, nur, weil er Schmerz ist, es sei denn, es kommt zu zufälligen Umständen, in denen Mühen und Schmerz ihm große Freude bereiten können. Um ein triviales Beispiel zu nehmen, wer von uns unterzieht sich je anstrengender körperlicher Betätigung, außer um Vorteile daraus zu ziehen? Aber wer hat irgend ein Recht, einen Menschen zu tadeln, der die Entscheidung
    <xdiff:span xdiff:class="diff-html-added" xdiff:previous="changed-diff-2" xdiff:id="added-diff-1">. Ende!
    </xdiff:span>
  </p>
</div>`
export {
  differencingExample,
  miscW5000Text,
  miscW1000Text,
  differencingTextOnly,
  differencingTable
}
