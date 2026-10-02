from pathlib import Path
from zipfile import ZipFile
from lxml import etree
from copy import deepcopy
import re,json

ROOT=Path(__file__).resolve().parents[2]
TMP=Path(__file__).resolve().parent
GAMES=['the-economys-edge','signal-house','gdp-live','cpi-live','labor-force-files','takeout-taco-lunch-rush','room-to-stay','megastar-mania']
W='http://schemas.openxmlformats.org/wordprocessingml/2006/main'
NS={'w':W}
q=lambda name:'{'+W+'}'+name
LOOP='**Experience → Consequence → Economic Explanation → Formalization → Transfer**'
def plain(s):
    s=re.sub(r'^#{1,3} |^\d+\. |^- ','',s).replace('**','').strip('*')
    return re.sub(r'\[(.*?)\]\(.*?\)',r'\1',s)
def section(md,title):return md.split('## '+title+'\n\n',1)[1].split('\n## ',1)[0].strip()
def paragraphs(md,title):return [p for p in section(md,title).split('\n\n') if p and not p.startswith(('###','![','|','<!--'))]

reports={}
for game in GAMES:
    folder=TMP/game
    before=(folder/'before.md').read_text(encoding='utf-8')
    after=before
    replacements={}
    def replace(old,new):
        global after
        assert after.count(old)==1,(game,old[:100],after.count(old))
        after=after.replace(old,new,1)
        replacements[old]=new
    why=paragraphs(before,'Why This Game Exists')
    concepts=paragraphs(before,'What the Game Is Really Teaching')

    if game=='the-economys-edge':
        replace(why[0], 'I wanted students to experience the choices behind a PPF before I showed them a graph or asked for a calculation. That led me to an RPG/dungeon-crawler structure. Students make a decision, conditions change, and what they did earlier affects the choices they face next. Different paths can lead to different endings.')
        replace(why[1], 'It’s easy to learn which points on a PPF are efficient, inefficient, or unattainable without thinking much about the resource choices behind them. I wanted students to make those choices in Calder: decide what to produce, deal with a disruption, and work out how to recover and prepare for the future.')
        replace(why[2], 'Once students have an outcome in front of them, you can ask what happened and build the graph from their account. That’s the moment I wanted to make possible. The PPF gives a formal explanation of something they’ve already experienced.')
        replace(concepts[0], 'Calder begins with its workers and equipment fully used. Producing more household goods means producing fewer capital goods, and the reverse is also true. Even keeping the existing mix forgoes what another allocation could provide. Ask students to identify the best alternative use they sacrificed: that is the opportunity cost of their decision.')
        replace(concepts[1], 'As students push farther toward one sector, specialized workers and equipment move into less suitable uses. Each further shift gives up more of the other output. They encounter increasing opportunity cost through the production Calder loses along the way.')
        replace(concepts[2], 'Several mixes can use Calder’s resources efficiently. On the frontier, increasing one output requires giving up some of the other. Which efficient mix to choose depends on what society values; a balanced mix is not automatically better.')
        replace(concepts[3], 'When Calder prepares equipment, infrastructure, training, and improved methods, households give up goods they could have received today. That work can support later production, but the opportunity cost remains even when the investment pays off.')
        replace(paragraphs(before,'The Educational Loop')[0], 'At the outcome, What changed overall and Your path help students trace the result back to their six choices. Read the economics and Alternative decisions explain the tradeoffs. Read the frontier adds a schematic PPF and three applications in new settings, with explanations and retries before Application complete.')
        replace('Application attempts reset on reload, while students can still review their saved economic path.', '')
        replace('Use the game link supplied for your course; the standalone collection is in instructor preview at the time of this guide. ', '')

    elif game=='signal-house':
        replace(why[0], 'I wanted to try an escape room where the economics itself helped students get somewhere. Escape rooms are familiar, but I hadn’t seen many that worked that way. Students would search the house, find records, and gradually work out what had happened. Understanding the economics would let them move on.')
        replace(why[1], 'I wanted them to start with pieces of the story: a household has less left over, a producer faces a higher cost, and a national report shows weaker output. They’d have to connect those records before they could explain the event as a whole.')
        replace(why[2], 'Some of the game is ordinary searching. Then students have to compare accounts, read production records, weigh a business decision, and put the events in order. By the time they reach the AD–AS model, they have evidence to bring to it.')
        replace(concepts[0], 'In The Broken Signal, students find archived reports of storm damage and expensive emergency routes, then connect them to production records. A higher price alone could have several explanations. Timing, costs, firms’ decisions, and national observations let them build a case for what happened and decide whether a local event had wider effects.')
        replace(concepts[1], 'In the workshop, they compare the added revenue and added cost of jobs that use limited material. An already-paid, unrecoverable lease is a sunk cost. Material can stay in storage, so there’s no reason to use it all on work that loses money. Students can see why a firm might cut activity even while customer orders remain available.')
        replace(concepts[2], 'The production and staffing cuts then connect to national evidence of lower real output, higher unemployment, and higher prices. Higher costs across producers reduce what firms are willing to supply at a given price level. Students can use the wider evidence to explain a leftward shift in short-run aggregate supply (SRAS), moving beyond what one firm’s records could establish.')
        replace(concepts[3], 'Both case interpretations hold aggregate demand (AD) unchanged. Continuing customer orders help explain the first firm’s cost-driven response, and the final model explicitly fixes AD. In the second case, a separate demand log covers policy and independent spending conditions. An unchanged policy setting alone would not settle what happened to other sources of demand.')
        replace(concepts[4], 'The records also ask students to distinguish the measures. National output is measured at constant prices. A household can receive more nominal pay yet afford less of the same essential bundle. The price index describes a level; inflation describes its change over an interval. Mission 1 compares matching monthly inflation periods. The adjustment shown in a case does not establish an indefinitely rising or falling inflation path.')
        replace(concepts[5], 'After the adverse supply shock, students face a policy choice. Tighter demand policy can ease inflation pressure while weakening output and employment further. A looser response can support work and output while adding inflation pressure. Neither repairs the disrupted input network. The illustrative policy gauges let students compare those competing objectives without reading them as calibrated forecasts.')
        replace('when an object, interaction, or dependency blocks progress', 'when they get stuck on an object or need to connect discoveries')

    elif game=='gdp-live':
        replace(why[0], 'I wanted students to do more than remember the letters in the GDP formula. A new house, a transfer payment, and an imported consumer good can still be hard to place even when the equation is familiar. They have to decide what each transaction represents before the arithmetic means much.')
        replace(why[1], 'So GDP Live makes classification the activity. Students post transactions, see what enters the accounts, and work out why some exchanges leave GDP unchanged. I wanted them to build the identity one transaction at a time, then recognize their own postings in the equation.')
        replace(concepts[0], 'Start with a transaction students had to classify. What was produced, when, and where? Money changing hands is only the starting evidence. The examples separate current final goods and services from transfers, ownership changes, and inputs already included in a final product’s value.')
        replace(concepts[1], 'When a household buys newly produced final goods or services, the purchase enters C, subject to the separate treatment of residential construction. Students need to read both who bought something and what was bought.')
        replace(concepts[2], 'A new house belongs with business equipment and additions to inventories in investment. Unsold finished goods count because production has occurred; new housing adds to the housing capital stock. Buying existing shares instead exchanges a financial asset, creating no current production by itself.')
        replace(concepts[3], 'Government purchases of current goods and services enter G. Retirement and unemployment benefits are transfers. Have students classify the payment in front of them; a recipient’s later purchase would be a separate transaction.')
        replace('**Exports and imports.** Exports record domestic production bought abroad.', 'Goods produced domestically and bought abroad enter exports.')
        replace('**What is not counted.** The transaction bank includes', 'Other examples include')
        replace('**The accounting identity.** The completed ledger comes together as', 'Once the ledger is complete, its accounts come together as')
        replace(' Reloading begins a new run.', '')

    elif game=='cpi-live':
        replace(why[0], 'I wanted students to see what they were constructing when they calculated CPI. It’s possible to follow the steps and still be unsure why quantities stay fixed, why the base year is 100, or why subtracting two index values usually isn’t the inflation rate.')
        replace(why[1], 'CPI Live starts with the basket and its prices. Students calculate the cost, build the index, then measure inflation and explain what it means. I wanted each calculation to grow out of the previous one. The weighting comparison, analyst’s mistake, and later period give them another chance to use that reasoning.')
        old=paragraphs(before,'What Students Do')[-1]
        replace(old, 'Students can correct unsuccessful answers and use Need help? for a conceptual hint, with the formula one step deeper. Results summarize the basket, CPI, inflation, largest dollar contribution, and performance across the checks, followed by an interpretation recap. Play Again offers different examples. The separate index-level question asks what CPI establishes relative to the base year, without assuming it gives annual inflation.')
        replace(concepts[0], 'Students keep the same quantities while prices change, so they can compare the cost of the same purchases. Changing quantities too would mix a price change with a change in what was bought.')
        replace(concepts[1], 'For each item in the basket, expenditure equals price × fixed quantity. Adding those expenditures gives the basket cost in dollars. Both price increases and decreases enter the total. Adding unit prices alone would miss how much of each item the household buys.')
        replace(concepts[2], 'Students then calculate CPI = (current basket cost ÷ base basket cost) × 100. In the base year, they divide the cost by itself, so CPI is 100 regardless of the basket’s dollar cost. Later values compare the cost with that same reference.')
        replace(concepts[3], 'Once they have CPI, students use it to measure inflation: Inflation = ((new CPI − previous CPI) ÷ previous CPI) × 100. CPI is a level; inflation is its percentage change over an interval. Subtraction alone gives an index-point change. The first annual calculation starts from CPI 100, but the later example uses a different previous-year value. Ask students to name the comparison period before calculating.')
        replace('**Expenditure weights.** The weighting activity holds other prices at their base levels while students compare two possible changes.', 'Next, students predict which of two isolated price changes would move CPI more, with other prices held at their base levels.')
        replace('**Checking the method.** The audit can involve', 'The analyst’s draft gives students a method to check. The error can involve')
        replace('**Levels across years.** The separate timeline distinguishes', 'In the separate timeline, students distinguish')
        replace('Each episode has three authored variants, allowing 27 initial combinations. Replaying the extension changes all three selected contexts when alternatives exist. Saved progress retains the episode, variants, substitution choice, submitted calculations, and feedback in the same browser. Unsubmitted typing is not saved. Extension activity does not change the ten-check core score.', 'Replaying the extension offers different contexts for all three measurement problems. Students can compare how the same reasoning applies to another pair of substitutes, new product, or quality change. Extension activity leaves the ten-check core score unchanged.')
        replace(' Saved progress can resume in the same browser when local storage is available.', '')

    elif game=='labor-force-files':
        replace(why[0], 'I wanted students to decide where people belong before treating labor-market statistics as formulas. They can calculate an unemployment rate correctly and still be unsure who counts as unemployed or why the rate changed. Classifying people first gives the arithmetic something to describe.')
        replace(why[1], 'I also thought about where students encounter these numbers: reports and newspaper headlines. That led to the newspaper-report feel and film-noir look. Students build the labor force, calculate the rates, and follow people moving between groups. I wanted them to look past the headline and explain what happened to the people behind it.')
        replace(concepts[0], 'The four people give students a reason to sort out employment status. In this simplified model, having a job counts as employment, including part-time work. An unemployed person has no job, is available for work, and actively searches. Someone without employment or active search is outside the labor force. Wanting a job alone does not establish unemployment status.')
        replace('**Building the labor force.** The accounting begins with', 'Those classifications let students build the accounts:')
        replace('**Unemployment rate.** **UR = (Unemployed ÷ Labor Force) × 100** measures', 'They calculate UR = (Unemployed ÷ Labor Force) × 100 to measure')
        replace('**Labor-force participation rate.** **LFPR = (Labor Force ÷ Adult Population) × 100** measures', 'For participation, LFPR = (Labor Force ÷ Adult Population) × 100 measures')
        replace('**Worker flows change the accounts.** When an unemployed person finds work,', 'When an unemployed person finds work,')
        replace('**Discouragement changes who is counted.** A discouraged worker wants and is available for work but has stopped actively searching because they believe suitable work is unavailable.', 'Later, students meet discouraged workers: people who want and are available for work but have stopped actively searching because they believe suitable work is unavailable.')
        replace('In this model, that person is outside the labor force.', 'In this model, they are outside the labor force.')
        replace('**Read the measures together.** Employment can grow while UR rises if enough new participants are still searching.', 'By the headline audit, students have seen how employment can grow while UR rises if enough new participants are still searching.')
        replace('These are controlled comparisons within a simplified model, rather than a complete account of official labor-market measurement.', 'The game uses controlled comparisons in a simplified model; official labor-market measurement involves more detail.')
        replace(' Saved progress resumes in the same browser when storage is available.', '')

    elif game=='takeout-taco-lunch-rush':
        # The established first-person origin and the connected economics remain intact.
        # Preserve the later Word wording and synchronize its stale Markdown source.
        after=after.replace('the kitchen is beginning to tighten.', 'the kitchen is beginning to feel much more constrained.')
        replace('Students can complete the management run, review, graph questions, and capacity extension independently. Play Again starts a fresh run; reloading also starts over. You can request a final-screen screenshot and short explanation through your usual course workflow. Run records remain in the browser, with no automatic faculty report.', 'Students can complete the management run, review, graph questions, and capacity extension independently. You can request a final-screen screenshot and short explanation through your usual course workflow; the game provides no automatic faculty report.')

    elif game=='room-to-stay':
        # Preserve the requested first-game opening verbatim.
        replace('Developers then bring a different clock into the story.', 'Developers have to plan for homes that tenants cannot move into yet.')
        replace('Rental assistance addresses the payment problem for eligible households.', 'For eligible households struggling to pay, rental assistance offers another kind of help.')

    elif game=='megastar-mania':
        replace(why[0], 'I wanted to put supply and demand inside something students may already follow: a musician’s career. An artist gains fans, loses fans, adds shows, cancels dates, changes prices, and tries to reach a new audience. Students could manage those decisions first and then use the economics to explain what happened.')
        replace(why[1], 'A lot of supply-and-demand exercises ask about one change at a time. I wanted Jules Arlen’s career to keep going. A price that fits the early audience can leave fans outside after a hit, and a larger tour can have empty seats when interest fades. Later, you can ask which events moved a curve and which changed purchases along it. There’s a musician, an audience, and a set of decisions to return to.')
        replace('The comparison tests a mechanism; it need not identify a preferred career.', 'Ask what the comparison tells them about the mechanism, without treating one career path as the answer.')

    # Each guide keeps its own content. Calm direct emphasis after its prose audit.
    keep=[LOOP]
    for i,value in enumerate(keep):after=after.replace(value,f'__KEEP_{i}__')
    after=after.replace('**','')
    for i,value in enumerate(keep):after=after.replace(f'__KEEP_{i}__',value)
    after=re.sub(r' +\n','\n',after).strip()+'\n'

    with ZipFile(folder/'before.docx') as archive:
        xml=etree.fromstring(archive.read('word/document.xml'))
        body=xml.find('w:body',NS)
        before_bold=len(xml.xpath('//w:body/w:p/w:r/w:rPr/w:b',namespaces=NS))
        applied=set()
        for p in body.findall('w:p',NS):
            oldtext=''.join(p.xpath('.//w:t/text()',namespaces=NS))
            newtext=oldtext
            for old,new in replacements.items():
                a,b=plain(old),plain(new)
                if a in newtext:
                    assert old not in applied,(game,old[:60])
                    applied.add(old);newtext=newtext.replace(a,b,1)
            if newtext==oldtext:continue
            pp=p.find('w:pPr',NS)
            rp=p.find('w:r/w:rPr',NS)
            rp=deepcopy(rp) if rp is not None else None
            for child in list(p):
                if child is not pp:p.remove(child)
            r=etree.SubElement(p,q('r'))
            if rp is not None:r.append(rp)
            etree.SubElement(r,q('t')).text=newtext.rstrip()
        assert applied==set(replacements),(game,set(replacements)-applied)
        # Local layout repairs identified in the Word render; no font changes.
        for p in body.findall('w:p',NS):
            txt=''.join(p.xpath('.//w:t/text()',namespaces=NS))
            flag=None
            if game=='signal-house' and txt=='Questions to Consider':flag='pageBreakBefore'
            if game=='the-economys-edge' and txt.startswith('Calder begins with its workers'):flag='keepLines'
            if game=='the-economys-edge' and txt.startswith('Have students choose a moment'):flag='keepNext'
            if game=='cpi-live' and txt.startswith('For the beef/chicken example'):flag='keepLines'
            if flag:
                pp=p.find('w:pPr',NS)
                if pp is None:pp=etree.Element(q('pPr'));p.insert(0,pp)
                el=pp.find('w:'+flag,NS)
                if el is None:el=etree.SubElement(pp,q(flag))
                el.set(q('val'),'1')
        if game=='cpi-live':
            # Existing Markdown has the complete table; original DOCX omitted 3 columns.
            table=body.find('w:tbl',NS)
            source_rows=[[c.strip() for c in line.strip('|').split('|')] for line in before.splitlines() if line.startswith('|') and not line.startswith('| ---')]
            widths=[2200,1500,1500,2500,2236]
            grid=table.find('w:tblGrid',NS)
            for child in list(grid):grid.remove(child)
            for width in widths:etree.SubElement(grid,q('gridCol')).set(q('w'),str(width))
            for row,values in zip(table.findall('w:tr',NS),source_rows):
                template=deepcopy(row.findall('w:tc',NS)[-1])
                for col,value in enumerate(values):
                    cells=row.findall('w:tc',NS)
                    cell=cells[col] if col<len(cells) else deepcopy(template)
                    if col>=len(cells):row.append(cell)
                    cell.find('w:tcPr/w:tcW',NS).set(q('w'),str(widths[col]))
                    ts=cell.xpath('.//w:t',namespaces=NS)
                    ts[0].text=value
                    for t in ts[1:]:t.text=''
            assert [[ ''.join(c.xpath('.//w:t/text()',namespaces=NS)) for c in r.findall('w:tc',NS)] for r in table.findall('w:tr',NS)]==source_rows
        for p in body.findall('w:p',NS):
            txt=''.join(p.xpath('.//w:t/text()',namespaces=NS))
            if txt==plain(LOOP):continue
            for run in p.findall('w:r',NS):
                if game=='takeout-taco-lunch-rush' and ''.join(run.xpath('.//w:t/text()',namespaces=NS))=='Worker 4':continue
                for el in run.xpath('w:rPr/w:b | w:rPr/w:bCs',namespaces=NS):el.getparent().remove(el)
        doc_text='\n'.join(''.join(p.xpath('.//w:t/text()',namespaces=NS)).rstrip() for p in body.findall('w:p',NS))
        for line in after.splitlines():
            if not line or line.startswith(('![','|','Faculty Resource Guide','<!--')):continue
            assert plain(line) in doc_text,(game,line)
        # Questions, economic examples, figures and tables stay in place.
        for title in ['Questions to Consider','Common Misconceptions']:
            assert section(before,title).replace('**','')==section(after,title).replace('**',''),(game,title)
        assert re.findall(r'^#{1,3} .*$',before,re.M)==re.findall(r'^#{1,3} .*$',after,re.M)
        assert re.findall(r'^!\[.*$',before,re.M)==re.findall(r'^!\[.*$',after,re.M)
        raw=etree.tostring(xml,encoding='UTF-8',xml_declaration=True,standalone=True)
        with ZipFile(folder/'revised.docx','w') as out:
            for info in archive.infolist():out.writestr(info,raw if info.filename=='word/document.xml' else archive.read(info))
    with ZipFile(folder/'before.docx') as a,ZipFile(folder/'revised.docx') as b:
        changed=[n for n in a.namelist() if a.read(n)!=b.read(n)]
        assert changed==['word/document.xml']
    (folder/'revised.md').write_text(after,encoding='utf-8')
    count=lambda md:len(re.sub(r'!\[.*?\]\(.*?\)|<!--.*?-->','',md).split())
    reports[game]={'beforeWords':count(before),'afterWords':count(after),'whyRewritten':section(before,'Why This Game Exists')!=section(after,'Why This Game Exists'),'beforeBold':before_bold,'afterBold':len(xml.xpath('//w:body/w:p/w:r/w:rPr/w:b',namespaces=NS)),'changedParts':changed}
(TMP/'edit-stats.json').write_text(json.dumps(reports,indent=2))
print(json.dumps(reports,indent=2))
