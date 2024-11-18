import * as cheerio from 'cheerio';

const html = `
<div>

<table class="WRD clickTranslate noTapHighlight" data-dict="enko"><tbody><tr class="wrtopsection"><td colspan="3" title="Principal Translations"><strong><span class="ph" data-ph="sMainMeanings">주요 번역</span></strong></td></tr><tr class="langHeader" style="font-size: 13px;text-decoration: underline;font-weight:bold;"><td class="FrWrd"><span class="ph" data-ph="sLang_en">영어</span></td><td></td><td class="ToWrd"><span class="ph" data-ph="sLang_ko">한국어</span></td></tr>
<tr class="even" id="enko:24118"><td class="FrWrd"><strong>pave <span title="something">[sth]</span><a title="conjugate pave" class="conjugate" href="/conj/enverbs.aspx?v=pave">⇒</a></strong> <em class="POS2 tooltip" data-lang="en" data-abbr="vtr" data-loaded="true">vtr<span style="bottom: 17.225px; top: auto; left: calc(50% + 21.55px);"><i>transitive verb</i>: Verb taking a direct object--for example, "<b>Say</b> something." "She <b>found</b> the cat."</span></em></td><td> (surface: a path, road)&nbsp;<span class="dsense" data-lang="ko" data-dict="enko">(<span data-lang="ko" data-dict="enko">도로</span>)</span></td><td class="ToWrd">~을 포장하다 <em class="POS2" data-lang="ko" data-abbr="%EB%8F%99(%ED%83%80)">동(타)</em><i class="copy"></i></td></tr>
<tr class="even"><td>&nbsp;</td><td colspan="2" class="FrEx"><span dir="ltr">The workers are paving the new road.</span></td></tr>
<tr class="even"><td>&nbsp;</td><td colspan="2" class="ToEx" dir="ltr">인부들이 새로운 도로를 포장하고 있다.</td></tr>
</tbody></table>
</div>
`
const $ = cheerio.load(html);
const element = $('div');
const frWrd = $(element).find('.FrWrd > strong')
let word = $($(frWrd.contents()[0])[0]).text().trim();