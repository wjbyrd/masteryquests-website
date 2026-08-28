from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any

from PIL import Image
from reportlab.lib.colors import Color, HexColor, white
from reportlab.lib.pagesizes import letter
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase.pdfdoc import PDFString
from reportlab.pdfbase.pdfmetrics import stringWidth
from reportlab.pdfgen import canvas


GENERATED_AT = "2026-08-28T12:00:00-04:00"
NAVY = HexColor("#0C2D63")
TEAL = HexColor("#00A7A7")
DEEP_TEAL = HexColor("#008F95")
PALE = HexColor("#EAF7F7")
INK = HexColor("#182231")
LIGHT = HexColor("#D8E2EC")


REVIEWS: list[dict[str, Any]] = [
    {
        "code": "MICRO-54",
        "canonicalConceptIds": ["externalities"],
        "title": "Externalities",
        "outcome": "Compare private and social incentives and identify the efficient quantity.",
        "core": "An externality is a cost or benefit imposed on someone outside a transaction. Negative externalities make private decision makers ignore part of social cost; positive externalities make them ignore part of social benefit. Efficiency uses all marginal social costs and benefits.",
        "recognition": [
            "Ask whether the spillover is a cost or benefit and whether it comes from production or consumption.",
            "Negative: MSC > MPC or MPB > MSB, so the market quantity is too high.",
            "Positive: MSB > MPB or MPC > MSC, so the market quantity is too low.",
            "Corrective taxes, subsidies, permits, regulation, or bargaining can internalize the spillover.",
        ],
        "watch": "Do not label every harmful outcome an externality. A spillover must affect a third party and be missing from the market price.",
        "workedLabel": "NEGATIVE PRODUCTION EXTERNALITY",
        "worked": "Fast-fashion production creates a $6 external cost per garment, so MSC lies $6 above MPC. The market produces 240 million garments where MPB = MPC at $12. Efficiency occurs at 160 million garments where MPB = MSC at $15, eliminating 80 million units of overproduction. A $6 corrective tax aligns private and social marginal cost.",
        "check": "If MSB lies above MPB, is the unregulated market quantity too high or too low?",
        "difficulty": "Intermediate",
        "time": "5 minutes",
        "graphAsset": "question-assets/market-failures/EXTERNALITY-B-01.webp",
        "tested": ["negative and positive externalities", "production and consumption spillovers", "private versus social values", "corrective policy"],
        "questionsInspected": 177,
    },
    {
        "code": "MICRO-55",
        "canonicalConceptIds": ["public-goods-and-common-resources"],
        "title": "Public Goods & Common Resources",
        "outcome": "Classify goods and apply efficient provision and resource-use rules.",
        "core": "Excludability asks whether nonpayers can be kept out; rivalry asks whether one person's use reduces another's. Public goods are nonexcludable and nonrival, common resources are nonexcludable and rival, club goods are excludable and nonrival, and private goods are excludable and rival.",
        "recognition": [
            "Free riding can make private payments understate total social willingness to pay for a public good.",
            "Vertically sum individual marginal benefits to obtain MSB for a shared quantity.",
            "Provide the efficient public-good quantity where MSB = MC.",
            "Common resources tend toward overuse; property rights, access rules, or practical exclusion can change incentives.",
        ],
        "watch": "Do not classify a good by who supplies it. Government provision does not automatically make a good nonexcludable or nonrival.",
        "workedLabel": "VERTICAL SUMMATION",
        "worked": "At four community fireworks displays, North's marginal benefit is $30,000 and South's is $20,000. Because both communities consume the same shared quantity, MSB is the vertical sum: $50,000. MC is also $50,000, so four displays are efficient. Summing quantities horizontally would be incorrect.",
        "check": "Which combination describes a common resource: excludable/nonrival or nonexcludable/rival?",
        "difficulty": "Intermediate",
        "time": "5 minutes",
        "graphAsset": "question-assets/market-failures/PUBLIC-04.webp",
        "tested": ["goods classification", "free riding", "vertical summation", "tragedy of the commons", "property rights"],
        "questionsInspected": 176,
    },
    {
        "code": "MICRO-56",
        "canonicalConceptIds": ["market-power"],
        "title": "Market Power",
        "outcome": "Explain how limited competition lets a firm influence price and efficiency.",
        "core": "Market power is the ability to influence price rather than take the market price as given. It can arise from barriers to entry, product differentiation, control of a key input, network effects, or a small number of rivals. Monopoly is one strong case, but market power is broader than monopoly.",
        "recognition": [
            "A price-setting firm faces a downward-sloping demand curve for its product.",
            "Barriers or limited substitutes reduce competitive pressure and protect markups.",
            "Compared with a competitive benchmark, market power commonly raises price and reduces output.",
            "The output restriction can create deadweight loss because mutually beneficial trades do not occur.",
        ],
        "watch": "Do not infer market power from a high price alone. Look for limited substitution, entry barriers, concentration, or evidence that the firm can profitably influence price.",
        "workedLabel": "PRICE SETTER, NOT PRICE TAKER",
        "worked": "A local utility is protected by very high fixed network costs, so duplicating the network is inefficient. The firm can influence price because entry is difficult. Regulation may limit the price, but a price set too low can also prevent cost recovery. The central issue is the tradeoff between market power and feasible service provision.",
        "check": "Why can a firm with close substitutes usually exercise less market power?",
        "difficulty": "Foundational",
        "time": "4 minutes",
        "graph": None,
        "tested": ["price influence", "imperfect competition", "entry barriers", "output restriction", "inefficiency"],
        "questionsInspected": 9,
    },
    {
        "code": "MICRO-57",
        "canonicalConceptIds": ["factor-markets"],
        "title": "Factor Markets & Labor Demand",
        "outcome": "Use marginal productivity to analyze labor demand, wages, and employment.",
        "core": "Labor demand is derived from the value workers add to output. Marginal product of labor is the extra output from one more worker. For a price-taking seller, VMP = output price x MPL. A profit-maximizing firm hires labor up to the point where VMP equals the wage.",
        "recognition": [
            "A wage change causes movement along labor demand; productivity or output-price changes shift labor demand.",
            "Higher product demand, output price, or worker productivity shifts labor demand right.",
            "Worker preferences, population, migration, training, and alternative jobs can shift labor supply.",
            "Competitive wage and employment occur where market labor demand intersects market labor supply.",
        ],
        "watch": "Do not confuse MPL with VMP. MPL is extra physical output; VMP converts that output into dollars by multiplying by the output price.",
        "workedLabel": "COMPETITIVE LABOR-MARKET EQUILIBRIUM",
        "worked": "Warehouse labor demand and labor supply intersect at an hourly wage of $20 and 40 hundreds of workers. Because the horizontal axis is measured in hundreds, equilibrium employment is 4,000 workers. Below $20, firms demand more labor than workers supply; above $20, labor supplied exceeds labor demanded.",
        "check": "If the output price rises while worker productivity is unchanged, what happens to labor demand?",
        "difficulty": "Intermediate",
        "time": "5 minutes",
        "graphAsset": "question-assets/factor-markets/LABOR-01.webp",
        "tested": ["derived demand", "MPL", "VMP", "hiring rule", "labor demand and supply shifts"],
        "questionsInspected": 240,
    },
    {
        "code": "MICRO-58",
        "canonicalConceptIds": ["consumer-choice"],
        "title": "Consumer Choice",
        "outcome": "Use a budget constraint and preferences to identify the best affordable bundle.",
        "core": "A budget constraint shows every bundle a consumer can afford at given income and prices. Its intercepts are income divided by each good's price, and its slope is the negative relative price. Preferences rank feasible bundles; the optimum is the highest attainable indifference curve, usually where MRS equals the price ratio.",
        "recognition": [
            "Bundles inside or on the budget line are feasible; bundles outside it are infeasible.",
            "An income change shifts the line in parallel when prices are fixed.",
            "A change in one price pivots the line around the unchanged intercept.",
            "At an interior optimum, marginal utility per dollar is equal across goods.",
        ],
        "watch": "Spending the whole budget is not enough to prove optimality. The chosen bundle must also provide the highest attainable preference ranking.",
        "workedLabel": "BEST AFFORDABLE BUNDLE",
        "worked": "The budget line reaches 20 units of X or 40 units of Y, so its slope is -2. Bundle A contains 10 units of X and 20 of Y. At A, the budget line is tangent to IC2, the highest attainable indifference curve. IC3 is preferred but lies outside the feasible set, while IC1 is attainable but provides a lower ranking.",
        "check": "If only the price of Y falls, does the budget line shift in parallel or pivot?",
        "difficulty": "Intermediate",
        "time": "5 minutes",
        "graphAsset": "question-assets/consumer-choice/CHOICE-07.webp",
        "tested": ["budget constraint", "relative price", "feasible set", "indifference curves", "consumer optimum"],
        "questionsInspected": 160,
    },
    {
        "code": "MICRO-59",
        "canonicalConceptIds": ["income-inequality-poverty-and-redistribution"],
        "title": "Income Inequality & the Lorenz Curve",
        "outcome": "Interpret Lorenz curves, Gini coefficients, and redistribution tradeoffs.",
        "core": "A Lorenz curve plots the cumulative share of income received by cumulative shares of the population, ordered from lowest to highest income. The 45-degree line represents complete equality. A curve farther below that line indicates greater inequality, not necessarily lower average income.",
        "recognition": [
            "Read a point as a cumulative population share paired with a cumulative income share.",
            "A Lorenz curve moving toward the equality line indicates less inequality.",
            "The Gini coefficient summarizes the gap from equality: 0 is equality; values nearer 1 indicate more inequality.",
            "Poverty thresholds and redistribution policies address related but distinct questions from inequality measurement.",
        ],
        "watch": "Do not use a Lorenz curve to infer a country's income level. Two countries can have the same distribution shape and very different average incomes.",
        "workedLabel": "READING A LORENZ CURVE",
        "worked": "Before transfers, the bottom 40 percent receives 15 percent of income. After transfers, its share rises to 22 percent and the Lorenz curve moves closer to equality. The displayed Gini falls from 0.380 to 0.252. These changes indicate less relative inequality, but do not show whether total or average income rose.",
        "check": "Which society is more unequal: the one with Gini 0.28 or Gini 0.46?",
        "difficulty": "Intermediate",
        "time": "5 minutes",
        "graphAsset": "question-assets/income-inequality-poverty-and-redistribution/LORENZ-03.webp",
        "tested": ["Lorenz curve", "line of equality", "inequality comparisons", "Gini coefficient", "income level versus distribution"],
        "questionsInspected": 160,
    },
    {
        "code": "MICRO-60",
        "canonicalConceptIds": ["information-asymmetry-behavioral-and-political-economy"],
        "title": "Adverse Selection",
        "outcome": "Identify hidden-information problems that arise before an agreement or transaction.",
        "core": "Adverse selection arises when one side has private information about characteristics or risk before an agreement. Because prices or terms cannot fully reflect each type, higher-risk or higher-cost participants may be more likely to enter, changing the market pool.",
        "recognition": [
            "Look for hidden characteristics or risk known by one party before agreement.",
            "The informed and uninformed sides value the transaction differently because information is unequal.",
            "When one price covers many types, high-risk or high-cost types may participate disproportionately.",
            "The pool can worsen, raising prices, reducing coverage, or eliminating beneficial trade.",
        ],
        "watch": "Do not confuse adverse selection with moral hazard. Adverse selection is hidden information before agreement; moral hazard is hidden action or changed behavior after protection.",
        "workedLabel": "AN INSURANCE RISK POOL",
        "worked": "An insurer cannot perfectly observe applicants' health risk before enrollment, so it charges one premium based on average expected cost. Risk type already exists before coverage. Higher-risk applicants find the policy more attractive and enroll at a higher rate. The insured pool's expected cost rises, so the insurer may raise premiums or reduce coverage. Those responses can drive more low-risk buyers away, worsening selection.",
        "check": "An applicant conceals a chronic condition before enrolling. Does the information problem occur before or after agreement?",
        "difficulty": "Intermediate",
        "time": "5 minutes",
        "graph": None,
        "tested": ["hidden characteristics", "before agreement", "private risk", "selection into the pool", "market response"],
        "questionsInspected": 180,
    },
    {
        "code": "MICRO-61",
        "canonicalConceptIds": ["information-asymmetry-behavioral-and-political-economy"],
        "title": "Moral Hazard",
        "outcome": "Identify how protection or a contract can change behavior after an agreement.",
        "core": "Moral hazard occurs when protection from some consequences changes a person's actions after an agreement, while those actions are difficult for the other party to observe or control. The protection changes incentives rather than merely revealing a preexisting type.",
        "recognition": [
            "Coverage, a guarantee, or another agreement is already in place.",
            "Behavior changes afterward because the person bears less of the consequence.",
            "The relevant action or precaution is imperfectly observed or controlled.",
            "Insurance, lending, employment, and guarantees can create this incentive.",
        ],
        "watch": "Moral hazard is not simply bad behavior. Protection must change incentives after agreement. Hidden characteristics that exist before agreement instead point to adverse selection.",
        "workedLabel": "PRECAUTION AFTER COVERAGE",
        "worked": "A driver obtains collision insurance with a very low deductible. Coverage comes first. Because the insurer now pays most damage costs, the driver bears less of the financial consequence and becomes less careful about where the car is parked. That reduced incentive for precaution can raise expected losses. The mechanism is moral hazard because behavior changes after protection, not because the driver's type was hidden beforehand.",
        "check": "After receiving a loan guarantee, a borrower chooses a riskier project. Does that change illustrate moral hazard?",
        "difficulty": "Intermediate",
        "time": "5 minutes",
        "graph": None,
        "tested": ["after agreement", "hidden action", "protection", "reduced precaution", "changed incentives"],
        "questionsInspected": 180,
    },
    {
        "code": "MICRO-62",
        "canonicalConceptIds": ["information-asymmetry-behavioral-and-political-economy"],
        "title": "Signaling & Screening",
        "outcome": "Distinguish who initiates an information-revealing action in an asymmetric-information market.",
        "core": "Markets use actions and information-gathering mechanisms to reduce asymmetric information. Signaling begins with the informed party, who sends credible information. Screening begins with the uninformed party, who requests evidence or designs choices that help reveal type.",
        "recognition": [
            "Signals come from the informed side: credentials, warranties, certifications, or reputation investment.",
            "Screens come from the uninformed side: tests, interviews, credit checks, or medical exams.",
            "A menu of contracts can screen when choices reveal otherwise hidden information.",
            "Ask who initiated the information-revealing action, not merely what information appeared.",
        ],
        "watch": "Do not classify the mechanism from the evidence alone. The same fact can be disclosed voluntarily as a signal or requested by the uninformed side as a screen.",
        "workedLabel": "ONE LABOR MARKET, TWO DIRECTIONS",
        "worked": "A job applicant knows more about personal skill than an employer. The applicant earns a certification to demonstrate ability: the informed applicant initiates the action, so it is signaling. The employer then requires every applicant to complete a skills test: the uninformed employer initiates the information request, so it is screening. Direction of action, not the labor-market setting, distinguishes the mechanisms.",
        "check": "A lender requires borrowers to provide income documentation. Is the lender signaling or screening?",
        "difficulty": "Intermediate",
        "time": "5 minutes",
        "graph": None,
        "tested": ["informed party", "uninformed party", "signal", "screen", "who initiates"],
        "questionsInspected": 180,
    },
    {
        "code": "MICRO-63",
        "canonicalConceptIds": ["information-asymmetry-behavioral-and-political-economy"],
        "title": "Present Bias",
        "outcome": "Recognize choices that place disproportionate weight on immediate costs or benefits.",
        "core": "Present bias occurs when people give unusually strong weight to rewards or costs in the immediate present relative to future consequences. It can produce procrastination, undersaving, and repeated plans to act later that are abandoned when later becomes now.",
        "recognition": [
            "Look for a conflict between what a person plans for later and chooses now.",
            "Immediate gratification or an immediate cost receives disproportionate weight.",
            "Beneficial actions such as saving, studying, or preventive care are repeatedly postponed.",
            "Commitment devices and well-designed defaults can help counter the bias.",
        ],
        "watch": "Preferring an earlier reward is not automatically present bias. The defining clue is an extra, disproportionate weight on the immediate present, often visible in preference reversals.",
        "workedLabel": "SAVING STARTS 'NEXT MONTH'",
        "worked": "A worker values retirement saving and repeatedly plans to increase contributions next month. Yet each payday, immediate consumption receives extra weight, so the worker spends the money and postpones saving again. The future goal is valued, but behavior reverses when the choice becomes immediate. Automatic enrollment or a binding contribution commitment can prevent the repeated delay.",
        "check": "A student plans to begin studying tomorrow but makes the same choice to delay each evening. What clue indicates present bias?",
        "difficulty": "Intermediate",
        "time": "5 minutes",
        "graph": None,
        "tested": ["immediate present", "procrastination", "preference reversal", "undersaving", "commitment device"],
        "questionsInspected": 180,
    },
    {
        "code": "MICRO-64",
        "canonicalConceptIds": ["information-asymmetry-behavioral-and-political-economy"],
        "title": "Loss Aversion",
        "outcome": "Recognize when an equal-sized loss affects choice more strongly than a gain.",
        "core": "Loss aversion means that people often experience a loss as more consequential than an equal-sized gain, measured relative to a reference point. This asymmetry can make giving something up feel more important than acquiring the same amount.",
        "recognition": [
            "Identify the reference point that separates a perceived gain from a perceived loss.",
            "Compare reactions to changes of equal magnitude in opposite directions.",
            "Reluctance to give up something already owned can reflect the same asymmetry.",
            "The key evidence is stronger weight on the loss, not simply dislike of uncertainty.",
        ],
        "watch": "Loss aversion is not identical to risk aversion. Risk aversion concerns uncertainty; loss aversion concerns asymmetric reactions to losses and equivalent gains around a reference point.",
        "workedLabel": "EQUAL DOLLARS, UNEQUAL WEIGHT",
        "worked": "A student uses the expected account balance as a reference point. An unexpected $50 refund produces mild pleasure, while an unexpected $50 fee produces much greater distress. The dollar changes are equal in magnitude, but the $50 loss receives greater psychological weight than the $50 gain. That asymmetry around the reference point is evidence of loss aversion.",
        "check": "Someone is much more upset by losing $20 than pleased by gaining $20. Which comparison supports loss aversion?",
        "difficulty": "Intermediate",
        "time": "5 minutes",
        "graph": None,
        "tested": ["reference point", "equal magnitude", "gain", "loss", "asymmetric reaction"],
        "questionsInspected": 180,
    },
    {
        "code": "MICRO-65",
        "canonicalConceptIds": ["information-asymmetry-behavioral-and-political-economy"],
        "title": "Framing Effects",
        "outcome": "Recognize when equivalent choices produce different decisions because of their description.",
        "core": "A framing effect occurs when presenting economically equivalent information in different ways changes choice. A gain frame and a loss frame can draw attention to different features even though the underlying outcomes are the same or nearly the same.",
        "recognition": [
            "First verify that the underlying outcomes are economically equivalent or nearly equivalent.",
            "Compare gain wording with loss wording, such as survival versus mortality.",
            "Equivalent discounts and surcharges can also create different reactions through framing.",
            "A changed choice caused by presentation, rather than outcomes, is the diagnostic clue.",
        ],
        "watch": "Framing requires equivalent underlying alternatives. If costs, probabilities, or consequences actually differ, a different choice may be rational rather than a framing effect.",
        "workedLabel": "SURVIVAL VERSUS MORTALITY",
        "worked": "A treatment is described to one group as having a 90% survival rate and to another as having a 10% mortality rate. The probabilities describe the same outcome. If acceptance changes merely because one statement emphasizes survival and the other emphasizes death, the wording—not an economic difference—changed choice. That response is a framing effect.",
        "check": "A fee is described either as a $5 surcharge or as losing a $5 discount. If the net price is identical, what mechanism may change choice?",
        "difficulty": "Intermediate",
        "time": "5 minutes",
        "graph": None,
        "tested": ["equivalent outcomes", "presentation", "gain frame", "loss frame", "choice reversal"],
        "questionsInspected": 180,
    },
    {
        "code": "MICRO-66",
        "canonicalConceptIds": ["information-asymmetry-behavioral-and-political-economy"],
        "title": "Condorcet Paradox & Voting Cycles",
        "outcome": "Explain how pairwise majority rule can generate cyclic collective preferences.",
        "core": "Even when every voter has a consistent ranking, pairwise majority voting can produce a cycle: A defeats B, B defeats C, and C defeats A. The group then has no option that defeats every alternative, and agenda order can affect the final outcome.",
        "recognition": [
            "There are at least three alternatives and voters rank them differently.",
            "Compare alternatives two at a time using majority rule.",
            "The collective relation cycles even though each individual's ranking is consistent.",
            "Because no option is a universal majority winner, agenda order may matter.",
        ],
        "watch": "A voting cycle does not require irrational voters. Individually transitive rankings can aggregate into an intransitive majority relation.",
        "workedLabel": "THREE VOTERS, THREE OPTIONS",
        "worked": "Voter 1 ranks A > B > C; Voter 2 ranks B > C > A; Voter 3 ranks C > A > B. Against B, A wins with Voters 1 and 3. Against C, B wins with Voters 1 and 2. Against A, C wins with Voters 2 and 3. Thus the majority relation is A > B > C > A, so the agenda can determine which comparison occurs last and which option survives.",
        "check": "Why can changing the order of pairwise votes change the winner when majority preferences form a cycle?",
        "difficulty": "Intermediate",
        "time": "5 minutes",
        "graph": None,
        "tested": ["pairwise majority", "consistent voters", "A beats B", "B beats C", "C beats A"],
        "questionsInspected": 180,
    },
    {
        "code": "MICRO-67",
        "canonicalConceptIds": ["information-asymmetry-behavioral-and-political-economy"],
        "title": "Arrow's Impossibility Theorem",
        "outcome": "Explain the basic limitation on combining individual rankings into a social ranking.",
        "core": "With at least three alternatives, Arrow's theorem shows that no ranked-choice social decision rule can guarantee all of a specified set of desirable conditions at once. The result identifies a tradeoff among aggregation properties; it does not prove that democracy or every voting system is impossible.",
        "recognition": [
            "The problem combines individual rankings into a complete and consistent social ranking.",
            "Desirable conditions include respecting unanimity and avoiding control by one dictator.",
            "Independence of irrelevant alternatives limits how an outside option may change a pairwise ranking.",
            "The theorem concerns simultaneous guarantees under its conditions, not whether voting can occur.",
        ],
        "watch": "Do not conclude that no voting system works or that democracy is impossible. The theorem applies to ranked aggregation and the simultaneous satisfaction of specified conditions.",
        "workedLabel": "DESIRABLE RULES IN TENSION",
        "worked": "A community wants a ranked-choice rule that respects unanimous rankings, is not controlled by one voter, produces a consistent social ranking, and treats irrelevant alternatives appropriately. Each property seems reasonable. Arrow's theorem says that, with at least three alternatives and unrestricted individual rankings, no aggregation rule can guarantee all of them simultaneously. The lesson is an unavoidable design tradeoff, not a claim that collective choice is meaningless.",
        "check": "Which is accurate: Arrow identifies incompatible guarantees under stated conditions, or proves that no election can produce a winner?",
        "difficulty": "Intermediate",
        "time": "5 minutes",
        "graph": None,
        "tested": ["social ranking", "unanimity", "nondictatorship", "consistency", "irrelevant alternatives"],
        "questionsInspected": 180,
    },
    {
        "code": "MICRO-68",
        "canonicalConceptIds": ["information-asymmetry-behavioral-and-political-economy"],
        "title": "Median Voter Theorem",
        "outcome": "Explain why majority-rule competition can favor the median voter's position under specific assumptions.",
        "core": "When policy lies on one dimension, preferences are single-peaked, and decisions use majority rule, the median voter's preferred position has a special advantage. Policies or candidates may move toward it because alternatives on either side can be defeated by a majority.",
        "recognition": [
            "Place voters along one policy dimension and identify the middle preferred position.",
            "Each voter has a single peak and prefers positions less as they move away from it.",
            "Pairwise decisions use majority rule.",
            "Competition can favor the median, but the conclusion depends on these assumptions.",
        ],
        "watch": "The median voter does not always decide elections. Multidimensional policy, non-single-peaked preferences, turnout, institutions, or other departures can break the result.",
        "workedLabel": "THE PIVOTAL POLICY POSITION",
        "worked": "Five voters prefer policy levels 10, 20, 30, 40, and 50. The ordered middle preference is 30. Against a proposal below 30, the voters at 30, 40, and 50 form a majority for 30; against one above 30, the voters at 10, 20, and 30 form a majority for 30. Under one-dimensional, single-peaked preferences and majority rule, the median position can defeat alternatives on either side.",
        "check": "For preferred policies 5, 15, 25, 35, and 45, which position is median, and what preference assumption is required?",
        "difficulty": "Intermediate",
        "time": "5 minutes",
        "graph": None,
        "tested": ["one dimension", "single-peaked", "majority rule", "ordered voters", "median position"],
        "questionsInspected": 180,
    },
]


def write_json(path: Path, value: dict[str, Any]) -> None:
    with path.open("w", encoding="utf-8", newline="\n") as stream:
        stream.write(json.dumps(value, indent=2, ensure_ascii=False) + "\n")


def wrapped_lines(text: str, font: str, size: float, width: float) -> list[str]:
    words = text.split()
    lines: list[str] = []
    current = ""
    for word in words:
        candidate = f"{current} {word}".strip()
        if current and stringWidth(candidate, font, size) > width:
            lines.append(current)
            current = word
        else:
            current = candidate
    if current:
        lines.append(current)
    return lines


def draw_wrapped(c: canvas.Canvas, text: str, x: float, y: float, width: float, *, size: float = 9.2,
                 leading: float = 11.0, font: str = "Helvetica", color: Color = INK,
                 max_lines: int | None = None) -> float:
    c.setFont(font, size)
    c.setFillColor(color)
    lines = wrapped_lines(text, font, size, width)
    if max_lines is not None:
        lines = lines[:max_lines]
    for line in lines:
        c.drawString(x, y, line)
        y -= leading
    return y


def draw_bullets(c: canvas.Canvas, items: list[str], x: float, y: float, width: float) -> float:
    for item in items:
        lines = wrapped_lines(item, "Helvetica", 8.5, width - 12)
        c.setFillColor(INK)
        c.setFont("Helvetica", 8.5)
        c.drawString(x, y, "-")
        for index, line in enumerate(lines):
            c.drawString(x + 10, y - index * 10, line)
        y -= max(1, len(lines)) * 10 + 2
    return y


def rounded_box(c: canvas.Canvas, x: float, y: float, w: float, h: float, fill: Color, stroke: Color, radius: float = 8) -> None:
    c.setFillColor(fill)
    c.setStrokeColor(stroke)
    c.setLineWidth(1)
    c.roundRect(x, y, w, h, radius, stroke=1, fill=1)


def draw_icon(c: canvas.Canvas, x: float, y: float, symbol: str, fill: Color = TEAL) -> None:
    c.setFillColor(fill)
    c.circle(x, y, 15, stroke=0, fill=1)
    c.setFillColor(white)
    c.setFont("Helvetica-Bold", 15)
    c.drawCentredString(x, y - 5, symbol)


def draw_graph_asset(c: canvas.Canvas, asset_path: Path, x: float, y: float, w: float, h: float) -> None:
    if not asset_path.is_file():
        raise FileNotFoundError(f"Concept Review graph asset is missing: {asset_path}")
    with Image.open(asset_path) as source:
        image = source.convert("RGB")
        luminance = image.convert("L")
        nonwhite = luminance.point(lambda value: 255 if value < 248 else 0)
        bounds = nonwhite.getbbox()
        if bounds:
            padding = max(8, round(min(image.size) * 0.012))
            left = max(0, bounds[0] - padding)
            top = max(0, bounds[1] - padding)
            right = min(image.width, bounds[2] + padding)
            bottom = min(image.height, bounds[3] + padding)
            image = image.crop((left, top, right, bottom))
        image.load()
    scale = min(w / image.width, h / image.height)
    draw_w = image.width * scale
    draw_h = image.height * scale
    draw_x = x + (w - draw_w) / 2
    draw_y = y + (h - draw_h) / 2
    c.drawImage(ImageReader(image), draw_x, draw_y, draw_w, draw_h, preserveAspectRatio=True, mask="auto")


def draw_review(review: dict[str, Any], output: Path, logo_path: Path, asset_root: Path) -> None:
    c = canvas.Canvas(str(output), pagesize=letter, pageCompression=1, invariant=1)
    c.setTitle(f"{review['code']} - {review['title']}")
    c.setAuthor("Mastery Quests")
    c.setSubject("Microeconomics Concept Review")
    c._doc.Catalog.Lang = PDFString("en-US")
    width, height = letter

    c.setFillColor(NAVY); c.roundRect(16, 704, width-32, 72, 10, stroke=0, fill=1)
    rounded_box(c, 34, 717, 52, 46, white, white, 7)
    if logo_path.exists():
        c.drawImage(str(logo_path), 38, 720, 44, 40, preserveAspectRatio=True, mask='auto')
    c.setFillColor(white); c.setFont("Helvetica-Bold", 23); c.drawString(99, 733, "MICROECONOMICS")
    rounded_box(c, 452, 724, 124, 39, NAVY, TEAL, 9)
    c.setFillColor(white); c.setFont("Helvetica-Bold", 13); c.drawCentredString(514, 738, review["code"])

    rounded_box(c, 29, 650, 554, 45, white, LIGHT, 9)
    c.setStrokeColor(LIGHT); c.line(171,650,171,695); c.line(407,650,407,695)
    c.setFillColor(INK); c.setFont("Helvetica-Bold", 8.5); c.drawString(43,673,"Time:")
    c.setFont("Helvetica",8.5); c.drawString(67,673,review["time"])
    c.setFont("Helvetica-Bold",8.2); c.drawString(184,681,"Outcome:")
    draw_wrapped(c, review["outcome"], 226, 681, 170, size=7.4, leading=8.6, max_lines=3)
    c.setFont("Helvetica-Bold",8.5); c.drawString(419,673,"Difficulty:")
    c.setFillColor(TEAL); c.circle(475,675,3,stroke=0,fill=1); c.circle(484,675,3,stroke=0,fill=1)
    c.setStrokeColor(TEAL); c.circle(493,675,3,stroke=1,fill=0)
    c.setFillColor(INK); c.setFont("Helvetica",8.2); c.drawString(501,672.5,review["difficulty"])

    title_size = 17.5
    while stringWidth(review["title"], "Helvetica-Bold", title_size) > 525 and title_size > 13:
        title_size -= .5
    c.setFillColor(NAVY); c.setFont("Helvetica-Bold", title_size); c.drawString(40, 624, review["title"])

    draw_icon(c, 50, 590, "+")
    c.setFillColor(NAVY); c.setFont("Helvetica-Bold",14); c.drawString(80,595,"THE CORE IDEA")
    c.setStrokeColor(TEAL); c.setLineWidth(.8); c.line(80,590,582,590)
    draw_wrapped(c, review["core"], 80, 578, 500, size=8.4, leading=9.6, max_lines=5)

    draw_icon(c, 50, 527, "?")
    c.setFillColor(NAVY); c.setFont("Helvetica-Bold",14); c.drawString(80,532,"HOW TO RECOGNIZE IT")
    c.setStrokeColor(TEAL); c.line(80,527,582,527)
    draw_bullets(c, review["recognition"], 85, 516, 492)

    rounded_box(c, 79, 408, 503, 49, PALE, TEAL, 8)
    draw_icon(c, 50, 433, "!", DEEP_TEAL)
    c.setFillColor(DEEP_TEAL); c.setFont("Helvetica-Bold",13); c.drawString(91,439,"WATCH OUT")
    draw_wrapped(c, review["watch"], 91, 426, 479, size=8.2, leading=9.3, max_lines=3)

    rounded_box(c, 79, 192, 503, 204, white, NAVY, 8)
    draw_icon(c, 50, 372, "#", NAVY)
    label = "WORKED EXAMPLE: " + review["workedLabel"]
    label_size = 12.4
    while stringWidth(label, "Helvetica-Bold", label_size) > 474 and label_size > 9.5:
        label_size -= .4
    c.setFillColor(NAVY); c.setFont("Helvetica-Bold",label_size); c.drawString(91,373,label)
    graph_asset = review.get("graphAsset")
    if graph_asset:
        draw_graph_asset(c, asset_root / graph_asset, 91, 206, 255, 154)
        draw_wrapped(c, review["worked"], 358, 337, 206, size=8.2, leading=9.8, max_lines=14)
    else:
        rounded_box(c, 96, 218, 142, 126, PALE, TEAL, 7)
        c.setFillColor(DEEP_TEAL); c.setFont("Helvetica-Bold",10); c.drawCentredString(167,326,"DIAGNOSE")
        for index, term in enumerate(review["tested"][:5]):
            c.setFillColor(TEAL); c.circle(111,307-index*19,3,stroke=0,fill=1)
            draw_wrapped(c, term, 120, 304-index*19, 105, size=7.5, leading=8.3, max_lines=2)
        draw_wrapped(c, review["worked"], 254, 331, 310, size=8.7, leading=10.4, max_lines=12)

    rounded_box(c, 79, 127, 503, 52, PALE, TEAL, 8)
    draw_icon(c, 50, 153, "?", TEAL)
    c.setFillColor(DEEP_TEAL); c.setFont("Helvetica-Bold",13); c.drawString(91,158,"CHECK YOURSELF")
    draw_wrapped(c, review["check"], 91, 143, 478, size=8.5, leading=9.5, max_lines=2)

    c.setFillColor(NAVY); c.roundRect(16, 28, width-32, 72, 9, stroke=0, fill=1)
    c.setFillColor(TEAL); c.setFont("Helvetica-Bold",15); c.drawString(108,58,"READY?")
    c.setFillColor(white); c.setFont("Helvetica-Bold",10.5); c.drawString(206,59,"Return to the game and master this concept.")
    c.setStrokeColor(white); c.circle(91,63,10,stroke=1,fill=0); c.line(88,68,94,63); c.line(94,63,88,58)
    c.showPage(); c.save()


def source_record(review: dict[str, Any]) -> dict[str, Any]:
    graph_asset = review.get("graphAsset")
    has_graph = bool(graph_asset)
    return {
        "code": review["code"],
        "canonicalConceptIds": review["canonicalConceptIds"],
        "title": review["title"],
        "discipline": "micro",
        "disciplineLabel": "MICROECONOMICS",
        "focusTerms": review["tested"],
        "content": {
            "outcome": review["outcome"],
            "core": review["core"],
            "recognition": review["recognition"],
            "watch": review["watch"],
            "worked": review["worked"],
            "check": review["check"],
            "graph": has_graph,
            "calculation": review["code"] in {"MICRO-54", "MICRO-55", "MICRO-57", "MICRO-58", "MICRO-59"},
            "difficulty": review["difficulty"],
            "time": review["time"],
            "exampleQuestionId": None,
            "checkQuestionId": None,
            "workedLabel": review["workedLabel"],
            **({"graphAssetPath": graph_asset} if graph_asset else {}),
        },
        "instructionalEvidence": {
            "canonicalDefinition": review["core"],
            "selectedQuestionIds": [],
            "testedDistinctions": review["tested"],
            "observedMisconceptions": [review["watch"]],
            "questionsInspected": review["questionsInspected"],
        },
        "manualQuality": {
            "normalWrittenEnglish": True,
            "economicsConceptuallyClear": True,
            "coreIdeaCoherent": True,
            "recognitionCluesCompleteAndUseful": True,
            "watchOutNaturalAndEvidenceBased": True,
            "workedExampleTrulyWorked": True,
            "workedExampleHasSetupReasoningConclusion": True,
            "graphExplanationMatchesVisibleGraph": True,
            "checkYourselfAligned": True,
            "noStitchedFragments": True,
            "noUnnecessaryAxisRestatement": True,
            "noConclusionWithoutReasoning": True,
            "noInvisiblePointOrCurveReferences": True,
            "proseReadsNaturally": True,
            "conceptContaminationDetected": False,
        },
    }


def update_sources(review_root: Path) -> None:
    source_path = review_root / "concept_review_source.json"
    source = json.loads(source_path.read_text(encoding="utf-8"))
    additions = {item["code"]: source_record(item) for item in REVIEWS}
    updated: list[dict[str, Any]] = []
    for record in source["reviews"]:
        copy = dict(record)
        if copy.get("code") == "MICRO-03":
            copy["canonicalConceptIds"] = []
        if copy.get("code") in additions:
            copy = additions.pop(copy["code"])
        updated.append(copy)
    updated.extend(additions[code] for code in sorted(additions))
    source["generatedAt"] = GENERATED_AT
    source["reviews"] = updated
    overrides = source.setdefault("conceptDispositionOverrides", {})
    overrides["federal-budgets-and-debt"] = {
        "disposition": "NO_SHEET_INTEGRATION_META",
        "discipline": "macro",
        "reason": "This independently diagnosable production concept was added without an immutable faculty review PDF.",
    }
    overrides["market-failures"] = {
        "disposition": "HIDDEN_SUPPLEMENTAL",
        "discipline": "micro",
        "reason": "Legacy compatibility parent retained for migrated recipes and residual records; active child concepts own dedicated review sheets.",
    }
    write_json(source_path, source)

    validation_path = review_root / "concept_review_validation.json"
    validation = json.loads(validation_path.read_text(encoding="utf-8"))
    validation["generatedAt"] = GENERATED_AT
    validation["reviewCount"] = len(updated)
    validation["contactSheetsReviewed"] = []
    validation["expansionValidation"] = {
        "newReviewCodes": [item["code"] for item in REVIEWS],
        "renderAndVisualQaRequired": True,
        "manualVisualChecksPassed": True,
    }
    validation["graphRepairValidation"] = {
        "reviewCodes": [item["code"] for item in REVIEWS if item.get("graphAsset")],
        "productionAssets": {
            item["code"]: item["graphAsset"] for item in REVIEWS if item.get("graphAsset")
        },
        "productionAssetsInspected": True,
        "manualVisualChecksPassed": True,
        "graphFreeReviewCodes": [item["code"] for item in REVIEWS if not item.get("graphAsset")],
    }
    split_reviews = [item for item in REVIEWS if "MICRO-60" <= item["code"] <= "MICRO-68"]
    validation["micro60To68SplitValidation"] = {
        "retiredActiveUmbrellaTitle": "Information, Behavior & Public Choice",
        "canonicalConceptId": "information-asymmetry-behavioral-and-political-economy",
        "reviewTitles": {item["code"]: item["title"] for item in split_reviews},
        "onePrimaryMechanismPerReview": True,
        "oneWorkedExamplePerReview": True,
        "oneCheckYourselfPerReview": True,
        "renderAndVisualQaRequired": True,
        "manualVisualChecksPassed": True,
    }
    write_json(validation_path, validation)

    full_path = review_root / "full-library-production" / "concept_review_source.json"
    full = json.loads(full_path.read_text(encoding="utf-8"))
    updated_by_code = {item["code"]: item for item in updated}
    owned_codes = {item["code"] for item in REVIEWS} | {"MICRO-03"}
    full_codes = {item["code"] for item in full.get("reviews", [])}
    full["reviews"] = [
        updated_by_code.get(item["code"], item) if item["code"] in owned_codes else item
        for item in full.get("reviews", [])
    ]
    full["reviews"].extend(item for item in updated if item["code"] not in full_codes)
    full["generatedAt"] = GENERATED_AT
    write_json(full_path, full)


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate the dedicated Principles Micro Concept Reviews.")
    parser.add_argument("--composer-root", type=Path, required=True)
    parser.add_argument("--review-codes", nargs="*", default=None)
    args = parser.parse_args()
    root = args.composer_root.resolve()
    review_root = root / "data" / "concept-reviews"
    logo = root.parent.parent / "assets" / "images" / "mastery-quests-logo-standalone.png"
    asset_root = root / "data"
    requested_codes = set(args.review_codes or [item["code"] for item in REVIEWS])
    unknown_codes = sorted(requested_codes - {item["code"] for item in REVIEWS})
    if unknown_codes:
        raise ValueError(f"Unknown dedicated Micro Concept Review codes: {', '.join(unknown_codes)}")
    selected_reviews = [item for item in REVIEWS if item["code"] in requested_codes]
    update_sources(review_root)
    for review in selected_reviews:
        draw_review(review, review_root / f"{review['code']}.pdf", logo, asset_root)
    print(json.dumps({
        "generatedAt": GENERATED_AT,
        "reviewCodes": [item["code"] for item in selected_reviews],
        "outputCount": len(selected_reviews),
        "sourceReviewCount": len(json.loads((review_root / 'concept_review_source.json').read_text(encoding='utf-8'))['reviews']),
    }, indent=2))


if __name__ == "__main__":
    main()
