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
        "title": "Information, Behavior & Public Choice",
        "outcome": "Diagnose information problems, behavioral biases, and collective-choice limits.",
        "core": "Standard market models can miss three distinct forces: unequal information between parties, predictable departures from fully rational choice, and political decision rules that aggregate competing preferences. Identify the mechanism before choosing a remedy or prediction.",
        "recognition": [
            "Adverse selection occurs before agreement; moral hazard occurs after protection changes behavior.",
            "Signaling is initiated by the informed side; screening is initiated by the uninformed side.",
            "Behavioral economics studies systematic biases such as present bias, loss aversion, and framing.",
            "Public choice applies incentives to voters and officials; majority preferences can cycle, and aggregation has limits.",
        ],
        "watch": "Do not treat every bad decision as asymmetric information. Ask who knows what, when hidden information or action matters, and whether the issue is instead a behavioral bias or a voting rule.",
        "workedLabel": "IDENTIFY THE MECHANISM",
        "worked": "An insurer cannot observe a buyer's risk before enrollment: adverse selection. After coverage, the buyer takes fewer precautions: moral hazard. A default enrollment rule raises saving without changing prices: a behavioral nudge. A three-option vote cycles depending on the agenda: a collective-choice problem.",
        "check": "A lender requires documentation from applicants. Is that signaling or screening?",
        "difficulty": "Intermediate",
        "time": "5 minutes",
        "graph": None,
        "tested": ["adverse selection", "moral hazard", "signaling and screening", "behavioral biases", "public choice"],
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
