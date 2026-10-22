/*
 * Faculty-editable instructional-resource catalog for The Market Gate.
 * Video metadata comes from resources/instructional-resource-catalog.csv.
 * Each official learning objective appears once; resource IDs in the mapping
 * are ordered as focused video, broader video, worked-problems video, slides.
 */
(function registerMarketGateResources(global) {
    "use strict";

    if (global.MARKET_GATE_INSTRUCTIONAL_RESOURCES) {
        console.warn("[Market Gate] INSTRUCTIONAL_RESOURCES already exists; keeping the existing catalog.");
        return;
    }

    const chapters = {
        "1": {
            title: "Ten Principles of Economics",
            fallbackResourceIds: ["c3jTlBVTvre", "cOi0lknUNLr", "chapter-1-lecture-slides"],
            resources: [
                { id: "c3jTlBVTvre", chapter: 1, type: "video", title: "Ten Principles of Economics", description: "Review the primary concepts associated with Chapter 1 learning objectives.", url: "https://wjbyrd.screencasthost.com/watch/c3jTlBVTvre", actionLabel: "Watch Video", external: true, transcript: "ten-principles-of-economics-transcript.srt", priority: 1 },
                { id: "cOi0lknUNLr", chapter: 1, type: "worked-problem", title: "Chapter 1 Worked Problems", description: "Practice applying the Chapter 1 principles through worked problems.", url: "https://wjbyrd.screencasthost.com/watch/cOi0lknUNLr", actionLabel: "Watch Video", external: true, transcript: "chapter-1-worked-problems-transcript.srt", priority: 2 },
                { id: "chapter-1-lecture-slides", chapter: 1, type: "slides", title: "Chapter 1 Lecture Slides", description: "Review trade-offs, opportunity cost, incentives, trade, and markets.", url: "resources/slides/chapter-1-ten-principles-of-economics.pdf", actionLabel: "Open Slides", external: false, downloadable: true, priority: 3 }
            ]
        },
        "2": {
            title: "Thinking Like an Economist",
            fallbackResourceIds: ["cr6j2rVXFzG", "chapter-2-lecture-slides"],
            resources: [
                { id: "c3jT26VTvAg", chapter: 2, type: "video", title: "Circular Flow Diagram", description: "Review the circular-flow model and how it represents economic activity.", url: "https://wjbyrd.screencasthost.com/watch/c3jT26VTvAg", actionLabel: "Watch Video", external: true, transcript: "circular-flow-diagram-transcript.srt", priority: 1 },
                { id: "cr6jouVXFdS", chapter: 2, type: "video", title: "Reading and Analyzing a Production Possibilities Curve", description: "Practice analyzing choices and trade-offs with a production possibilities curve.", url: "https://wjbyrd.screencasthost.com/watch/cr6jouVXFdS", actionLabel: "Watch Video", external: true, transcript: "reading-and-analyzing-a-production-possibilities-curve-transcript.srt", priority: 2 },
                { id: "cr6j2rVXFzG", chapter: 2, type: "worked-problem", title: "Chapter 2 Worked Problems", description: "Practice applying the methods and models used in Chapter 2.", url: "https://wjbyrd.screencasthost.com/watch/cr6j2rVXFzG", actionLabel: "Watch Video", external: true, transcript: "chapter-2-worked-problems-transcript.srt", priority: 3 },
                { id: "chapter-2-lecture-slides", chapter: 2, type: "slides", title: "Chapter 2 Lecture Slides", description: "Review economic models, the circular-flow diagram, the PPF, and economic reasoning.", url: "resources/slides/chapter-2-thinking-like-an-economist.pdf", actionLabel: "Open Slides", external: false, downloadable: true, priority: 4 }
            ]
        },
        "4": {
            title: "The Market Forces of Supply and Demand",
            fallbackResourceIds: ["cT60q9nbK8I", "cT60Yxnb7cL", "chapter-4-lecture-slides"],
            resources: [
                { id: "cT60qNnbKN7", chapter: 4, type: "video", title: "Demand", description: "Review demand and the law of demand in a competitive market.", url: "https://wjbyrd.screencasthost.com/watch/cT60qNnbKN7", actionLabel: "Watch Video", external: true, transcript: "demand-transcript.srt", priority: 1 },
                { id: "cT60qRnbK8O", chapter: 4, type: "video", title: "Supply", description: "Review supply and the law of supply in a competitive market.", url: "https://wjbyrd.screencasthost.com/watch/cT60qRnbK8O", actionLabel: "Watch Video", external: true, transcript: "supply-transcript.srt", priority: 1 },
                { id: "cT60q9nbK8I", chapter: 4, type: "video", title: "Demand and Supply", description: "Review how demand and supply interact in a competitive market.", url: "https://wjbyrd.screencasthost.com/watch/cT60q9nbK8I", actionLabel: "Watch Video", external: true, transcript: "demand-and-supply-transcript.srt", priority: 2 },
                { id: "cT60Yxnb7cL", chapter: 4, type: "worked-problem", title: "Chapter 4 Worked Problems", description: "Practice applying competitive-market concepts through worked problems.", url: "https://wjbyrd.screencasthost.com/watch/cT60Yxnb7cL", actionLabel: "Watch Video", external: true, transcript: "chapter-4-worked-problems-transcript.srt", priority: 3 },
                { id: "chapter-4-lecture-slides", chapter: 4, type: "slides", title: "Chapter 4 Lecture Slides", description: "Review demand, supply, equilibrium, and government intervention in markets.", url: "resources/slides/chapter-4-the-market-forces-of-supply-and-demand.pdf", actionLabel: "Open Slides", external: false, downloadable: true, priority: 4 }
            ]
        },
        "6": {
            title: "Supply, Demand, and Government Policies",
            fallbackResourceIds: ["cT60YKnb7ex", "chapter-6-lecture-slides"],
            resources: [
                { id: "cT60YQnbK9q", chapter: 6, type: "video", title: "Price Ceilings", description: "Review the effects of government policies that place a ceiling on prices.", url: "https://wjbyrd.screencasthost.com/watch/cT60YQnbK9q", actionLabel: "Watch Video", external: true, transcript: "price-ceilings-transcript.srt", priority: 1 },
                { id: "cT60Y6nbK9H", chapter: 6, type: "video", title: "Price Floors", description: "Review the effects of government policies that put a floor under prices.", url: "https://wjbyrd.screencasthost.com/watch/cT60Y6nbK9H", actionLabel: "Watch Video", external: true, transcript: "price-floors-transcript.srt", priority: 1 },
                { id: "cT60YInbKR4", chapter: 6, type: "video", title: "Tax Incidence", description: "Review how taxes affect prices, quantities, and the burden on buyers and sellers.", url: "https://wjbyrd.screencasthost.com/watch/cT60YInbKR4", actionLabel: "Watch Video", external: true, transcript: "tax-incidence-transcript.srt", priority: 2 },
                { id: "cT60YKnb7ex", chapter: 6, type: "worked-problem", title: "Chapter 6 Worked Problems", description: "Practice applying price-control and tax concepts through worked problems.", url: "https://wjbyrd.screencasthost.com/watch/cT60YKnb7ex", actionLabel: "Watch Video", external: true, transcript: "chapter-6-worked-problems-transcript.srt", priority: 3 },
                { id: "chapter-6-lecture-slides", chapter: 6, type: "slides", title: "Chapter 6 Lecture Slides", description: "Review price controls, taxes, and their effects on markets.", url: "resources/slides/chapter-6-supply-demand-and-government-policies.pdf", actionLabel: "Open Slides", external: false, downloadable: true, priority: 4 }
            ]
        }
    };

    const catalog = {
        version: 2,
        gameId: "market-gate",
        gameTitle: "The Market Gate",
        settings: { maximumRecommendations: 3, enableChapterFallback: true },
        chapters,
        objectives: {
            "LO1.1": { chapter: 1, title: "Identify how individuals face trade-offs and how to analyze them.", resourceIds: ["c3jTlBVTvre", "cOi0lknUNLr"] },
            "LO1.2": { chapter: 1, title: "Apply the meaning of opportunity cost and how to calculate it.", resourceIds: ["c3jTlBVTvre", "cOi0lknUNLr"] },
            "LO1.3": { chapter: 1, title: "Identify marginal reasoning and calculate decisions at the margin.", resourceIds: ["c3jTlBVTvre", "cOi0lknUNLr"] },
            "LO1.4": { chapter: 1, title: "Recognize how incentives affect people’s behavior.", resourceIds: ["c3jTlBVTvre", "cOi0lknUNLr"] },
            "LO1.5": { chapter: 1, title: "Explain why trade among people or nations can be good for everyone.", resourceIds: ["c3jTlBVTvre", "cOi0lknUNLr"] },
            "LO1.6": { chapter: 1, title: "Enumerate why markets are a good—but not perfect—way to allocate resources.", resourceIds: ["c3jTlBVTvre", "cOi0lknUNLr"] },
            "LO2.1": { chapter: 2, title: "Describe how economists apply the methods of science; explain how models shed light on the world.", resourceIds: ["c3jT26VTvAg", "cr6jouVXFdS", "cr6j2rVXFzG"] },
            "LO2.2": { chapter: 2, title: "Apply the circular-flow model and PPF to analyze choices and trade-offs.", resourceIds: ["c3jT26VTvAg", "cr6jouVXFdS", "cr6j2rVXFzG"] },
            "LO2.3": { chapter: 2, title: "Distinguish microeconomics from macroeconomics.", resourceIds: ["cr6j2rVXFzG"] },
            "LO2.4": { chapter: 2, title: "Distinguish positive from normative statements.", resourceIds: ["cr6j2rVXFzG"] },
            "LO2.5": { chapter: 2, title: "Explain economists’ roles in policy.", resourceIds: [] },
            "LO4.1": { chapter: 4, title: "Define what a competitive market is.", resourceIds: ["cT60Yxnb7cL"] },
            "LO4.2": { chapter: 4, title: "Label the demand for a good in a competitive market and apply the law of demand.", resourceIds: ["cT60qNnbKN7", "cT60q9nbK8I", "cT60Yxnb7cL"] },
            "LO4.3": { chapter: 4, title: "Label the supply of a good in a competitive market and apply the law of supply.", resourceIds: ["cT60qRnbK8O", "cT60q9nbK8I", "cT60Yxnb7cL"] },
            "LO4.4": { chapter: 4, title: "Illustrate and apply how supply and demand together set the price of a good and the quantity sold and analyze market changes.", resourceIds: ["cT60q9nbK8I", "cT60Yxnb7cL"] },
            "LO4.5": { chapter: 4, title: "Demonstrate the key role of prices in allocating scarce resources in market economies.", resourceIds: ["cT60q9nbK8I", "cT60Yxnb7cL"] },
            "LO6.1": { chapter: 6, title: "Identify and calculate the effects of government policies that place a ceiling on prices.", resourceIds: ["cT60YQnbK9q", "cT60YKnb7ex"] },
            "LO6.2": { chapter: 6, title: "Identify and calculate the effects of government policies that put a floor under prices.", resourceIds: ["cT60Y6nbK9H", "cT60YKnb7ex"] },
            "LO6.3": { chapter: 6, title: "Illustrate and apply how a tax on a good affects the price of the good and the quantity sold.", resourceIds: ["cT60YInbKR4", "cT60YKnb7ex"] },
            "LO6.4": { chapter: 6, title: "Illustrate and apply how taxes levied on sellers and taxes levied on buyers are equivalent.", resourceIds: ["cT60YInbKR4", "cT60YKnb7ex"] },
            "LO6.5": { chapter: 6, title: "Recognize how the burden of a tax is split between buyers and sellers.", resourceIds: ["cT60YInbKR4", "cT60YKnb7ex"] }
        }
    };
    global.MARKET_GATE_INSTRUCTIONAL_RESOURCES = catalog;
    if (!global.INSTRUCTIONAL_RESOURCES) global.INSTRUCTIONAL_RESOURCES = catalog;
}(window));
