/*
 * Standalone instructional-resource catalog for The Equilibrium Crisis.
 *
 * This file combines the complete Market Gate and National Ledger catalogs.
 * It has no runtime dependency on either source JavaScript file.
 * External video URLs remain unchanged. Local slide paths point back to the
 * source-game folders so the original files remain authoritative.
 */
(function registerEquilibriumCrisisResources(global) {
    "use strict";

    if (global.EQUILIBRIUM_CRISIS_INSTRUCTIONAL_RESOURCES) {
        console.warn("[Equilibrium Crisis] Instructional resources already registered; keeping the existing catalog.");
        return;
    }

    const catalog = {
    "version": 2,
    "gameId": "equilibrium-crisis",
    "gameTitle": "The Equilibrium Crisis",
    "settings": {
        "maximumRecommendations": 3,
        "enableChapterFallback": true
    },
    "chapters": {
        "1": {
            "title": "Ten Principles of Economics",
            "fallbackResourceIds": [
                "c3jTlBVTvre",
                "cOi0lknUNLr",
                "chapter-1-lecture-slides"
            ],
            "resources": [
                {
                    "id": "c3jTlBVTvre",
                    "chapter": 1,
                    "type": "video",
                    "title": "Ten Principles of Economics",
                    "description": "Review the primary concepts associated with Chapter 1 learning objectives.",
                    "url": "https://wjbyrd.screencasthost.com/watch/c3jTlBVTvre",
                    "actionLabel": "Watch Video",
                    "external": true,
                    "transcript": "ten-principles-of-economics-transcript.srt",
                    "priority": 1,
                    "sourceGame": "marketGate"
                },
                {
                    "id": "cOi0lknUNLr",
                    "chapter": 1,
                    "type": "worked-problem",
                    "title": "Chapter 1 Worked Problems",
                    "description": "Practice applying the Chapter 1 principles through worked problems.",
                    "url": "https://wjbyrd.screencasthost.com/watch/cOi0lknUNLr",
                    "actionLabel": "Watch Video",
                    "external": true,
                    "transcript": "chapter-1-worked-problems-transcript.srt",
                    "priority": 2,
                    "sourceGame": "marketGate"
                },
                {
                    "id": "chapter-1-lecture-slides",
                    "chapter": 1,
                    "type": "slides",
                    "title": "Chapter 1 Lecture Slides",
                    "description": "Review trade-offs, opportunity cost, incentives, trade, and markets.",
                    "url": "../The Market Gate/resources/slides/chapter-1-ten-principles-of-economics.pdf",
                    "actionLabel": "Open Slides",
                    "external": false,
                    "downloadable": true,
                    "priority": 3,
                    "sourceGame": "marketGate"
                }
            ],
            "sourceGame": "marketGate"
        },
        "2": {
            "title": "Thinking Like an Economist",
            "fallbackResourceIds": [
                "cr6j2rVXFzG",
                "chapter-2-lecture-slides"
            ],
            "resources": [
                {
                    "id": "c3jT26VTvAg",
                    "chapter": 2,
                    "type": "video",
                    "title": "Circular Flow Diagram",
                    "description": "Review the circular-flow model and how it represents economic activity.",
                    "url": "https://wjbyrd.screencasthost.com/watch/c3jT26VTvAg",
                    "actionLabel": "Watch Video",
                    "external": true,
                    "transcript": "circular-flow-diagram-transcript.srt",
                    "priority": 1,
                    "sourceGame": "marketGate"
                },
                {
                    "id": "cr6jouVXFdS",
                    "chapter": 2,
                    "type": "video",
                    "title": "Reading and Analyzing a Production Possibilities Curve",
                    "description": "Practice analyzing choices and trade-offs with a production possibilities curve.",
                    "url": "https://wjbyrd.screencasthost.com/watch/cr6jouVXFdS",
                    "actionLabel": "Watch Video",
                    "external": true,
                    "transcript": "reading-and-analyzing-a-production-possibilities-curve-transcript.srt",
                    "priority": 2,
                    "sourceGame": "marketGate"
                },
                {
                    "id": "cr6j2rVXFzG",
                    "chapter": 2,
                    "type": "worked-problem",
                    "title": "Chapter 2 Worked Problems",
                    "description": "Practice applying the methods and models used in Chapter 2.",
                    "url": "https://wjbyrd.screencasthost.com/watch/cr6j2rVXFzG",
                    "actionLabel": "Watch Video",
                    "external": true,
                    "transcript": "chapter-2-worked-problems-transcript.srt",
                    "priority": 3,
                    "sourceGame": "marketGate"
                },
                {
                    "id": "chapter-2-lecture-slides",
                    "chapter": 2,
                    "type": "slides",
                    "title": "Chapter 2 Lecture Slides",
                    "description": "Review economic models, the circular-flow diagram, the PPF, and economic reasoning.",
                    "url": "../The Market Gate/resources/slides/chapter-2-thinking-like-an-economist.pdf",
                    "actionLabel": "Open Slides",
                    "external": false,
                    "downloadable": true,
                    "priority": 4,
                    "sourceGame": "marketGate"
                }
            ],
            "sourceGame": "marketGate"
        },
        "4": {
            "title": "The Market Forces of Supply and Demand",
            "fallbackResourceIds": [
                "cT60q9nbK8I",
                "cT60Yxnb7cL",
                "chapter-4-lecture-slides"
            ],
            "resources": [
                {
                    "id": "cT60qNnbKN7",
                    "chapter": 4,
                    "type": "video",
                    "title": "Demand",
                    "description": "Review demand and the law of demand in a competitive market.",
                    "url": "https://wjbyrd.screencasthost.com/watch/cT60qNnbKN7",
                    "actionLabel": "Watch Video",
                    "external": true,
                    "transcript": "demand-transcript.srt",
                    "priority": 1,
                    "sourceGame": "marketGate"
                },
                {
                    "id": "cT60qRnbK8O",
                    "chapter": 4,
                    "type": "video",
                    "title": "Supply",
                    "description": "Review supply and the law of supply in a competitive market.",
                    "url": "https://wjbyrd.screencasthost.com/watch/cT60qRnbK8O",
                    "actionLabel": "Watch Video",
                    "external": true,
                    "transcript": "supply-transcript.srt",
                    "priority": 1,
                    "sourceGame": "marketGate"
                },
                {
                    "id": "cT60q9nbK8I",
                    "chapter": 4,
                    "type": "video",
                    "title": "Demand and Supply",
                    "description": "Review how demand and supply interact in a competitive market.",
                    "url": "https://wjbyrd.screencasthost.com/watch/cT60q9nbK8I",
                    "actionLabel": "Watch Video",
                    "external": true,
                    "transcript": "demand-and-supply-transcript.srt",
                    "priority": 2,
                    "sourceGame": "marketGate"
                },
                {
                    "id": "cT60Yxnb7cL",
                    "chapter": 4,
                    "type": "worked-problem",
                    "title": "Chapter 4 Worked Problems",
                    "description": "Practice applying competitive-market concepts through worked problems.",
                    "url": "https://wjbyrd.screencasthost.com/watch/cT60Yxnb7cL",
                    "actionLabel": "Watch Video",
                    "external": true,
                    "transcript": "chapter-4-worked-problems-transcript.srt",
                    "priority": 3,
                    "sourceGame": "marketGate"
                },
                {
                    "id": "chapter-4-lecture-slides",
                    "chapter": 4,
                    "type": "slides",
                    "title": "Chapter 4 Lecture Slides",
                    "description": "Review demand, supply, equilibrium, and government intervention in markets.",
                    "url": "../The Market Gate/resources/slides/chapter-4-the-market-forces-of-supply-and-demand.pdf",
                    "actionLabel": "Open Slides",
                    "external": false,
                    "downloadable": true,
                    "priority": 4,
                    "sourceGame": "marketGate"
                }
            ],
            "sourceGame": "marketGate"
        },
        "6": {
            "title": "Supply, Demand, and Government Policies",
            "fallbackResourceIds": [
                "cT60YKnb7ex",
                "chapter-6-lecture-slides"
            ],
            "resources": [
                {
                    "id": "cT60YQnbK9q",
                    "chapter": 6,
                    "type": "video",
                    "title": "Price Ceilings",
                    "description": "Review the effects of government policies that place a ceiling on prices.",
                    "url": "https://wjbyrd.screencasthost.com/watch/cT60YQnbK9q",
                    "actionLabel": "Watch Video",
                    "external": true,
                    "transcript": "price-ceilings-transcript.srt",
                    "priority": 1,
                    "sourceGame": "marketGate"
                },
                {
                    "id": "cT60Y6nbK9H",
                    "chapter": 6,
                    "type": "video",
                    "title": "Price Floors",
                    "description": "Review the effects of government policies that put a floor under prices.",
                    "url": "https://wjbyrd.screencasthost.com/watch/cT60Y6nbK9H",
                    "actionLabel": "Watch Video",
                    "external": true,
                    "transcript": "price-floors-transcript.srt",
                    "priority": 1,
                    "sourceGame": "marketGate"
                },
                {
                    "id": "cT60YInbKR4",
                    "chapter": 6,
                    "type": "video",
                    "title": "Tax Incidence",
                    "description": "Review how taxes affect prices, quantities, and the burden on buyers and sellers.",
                    "url": "https://wjbyrd.screencasthost.com/watch/cT60YInbKR4",
                    "actionLabel": "Watch Video",
                    "external": true,
                    "transcript": "tax-incidence-transcript.srt",
                    "priority": 2,
                    "sourceGame": "marketGate"
                },
                {
                    "id": "cT60YKnb7ex",
                    "chapter": 6,
                    "type": "worked-problem",
                    "title": "Chapter 6 Worked Problems",
                    "description": "Practice applying price-control and tax concepts through worked problems.",
                    "url": "https://wjbyrd.screencasthost.com/watch/cT60YKnb7ex",
                    "actionLabel": "Watch Video",
                    "external": true,
                    "transcript": "chapter-6-worked-problems-transcript.srt",
                    "priority": 3,
                    "sourceGame": "marketGate"
                },
                {
                    "id": "chapter-6-lecture-slides",
                    "chapter": 6,
                    "type": "slides",
                    "title": "Chapter 6 Lecture Slides",
                    "description": "Review price controls, taxes, and their effects on markets.",
                    "url": "../The Market Gate/resources/slides/chapter-6-supply-demand-and-government-policies.pdf",
                    "actionLabel": "Open Slides",
                    "external": false,
                    "downloadable": true,
                    "priority": 4,
                    "sourceGame": "marketGate"
                }
            ],
            "sourceGame": "marketGate"
        },
        "24": {
            "title": "Measuring a Nation's Income",
            "fallbackResourceIds": [
                "cT6uFXnFejF",
                "chapter-24-lecture-slides"
            ],
            "resources": [
                {
                    "id": "cT6uFGnFe2H",
                    "chapter": 24,
                    "type": "video",
                    "title": "Gross Domestic Product",
                    "description": "Review GDP, the income-expenditure identity, and GDP components.",
                    "url": "https://wjbyrd.screencasthost.com/watch/cT6uFGnFe2H",
                    "actionLabel": "Watch Video",
                    "external": true,
                    "transcript": "gross-domestic-product-transcript.srt",
                    "priority": 1,
                    "sourceGame": "nationalLedger"
                },
                {
                    "id": "cr6toqVlD2g",
                    "chapter": 24,
                    "type": "video",
                    "title": "Nominal vs. Real GDP",
                    "description": "Review the distinction between nominal GDP and real GDP.",
                    "url": "https://wjbyrd.screencasthost.com/watch/cr6toqVlD2g",
                    "actionLabel": "Watch Video",
                    "external": true,
                    "transcript": "nominal-vs-real-gdp-transcript.srt",
                    "priority": 1,
                    "sourceGame": "nationalLedger"
                },
                {
                    "id": "cT6uFXnFejF",
                    "chapter": 24,
                    "type": "worked-problem",
                    "title": "Chapter 24 Worked Problems",
                    "description": "Practice applying the Chapter 24 GDP concepts through worked problems.",
                    "url": "https://wjbyrd.screencasthost.com/watch/cT6uFXnFejF",
                    "actionLabel": "Watch Video",
                    "external": true,
                    "transcript": "chapter-24-worked-problems-transcript.srt",
                    "priority": 3,
                    "sourceGame": "nationalLedger"
                },
                {
                    "id": "chapter-24-lecture-slides",
                    "chapter": 24,
                    "type": "slides",
                    "title": "Chapter 24 Lecture Slides",
                    "description": "Review national income accounting, GDP, and economic well-being.",
                    "url": "../The National Ledger/resources/slides/chapter-24-measuring-a-nations-income.pdf",
                    "actionLabel": "Open Slides",
                    "external": false,
                    "downloadable": true,
                    "priority": 4,
                    "sourceGame": "nationalLedger"
                }
            ],
            "sourceGame": "nationalLedger"
        },
        "25": {
            "title": "Measuring the Cost of Living",
            "fallbackResourceIds": [
                "cT6uFknFeIa",
                "chapter-25-lecture-slides"
            ],
            "resources": [
                {
                    "id": "cT6uFCnFeIN",
                    "chapter": 25,
                    "type": "video",
                    "title": "Inflation",
                    "description": "Review the CPI, inflation, and price-level measurement.",
                    "url": "https://wjbyrd.screencasthost.com/watch/cT6uFCnFeIN",
                    "actionLabel": "Watch Video",
                    "external": true,
                    "transcript": "inflation-transcript.srt",
                    "priority": 1,
                    "sourceGame": "nationalLedger"
                },
                {
                    "id": "crl1qKV2l2a",
                    "chapter": 25,
                    "type": "video",
                    "title": "Converting Dollars Across Time",
                    "description": "Practice converting dollar figures with price indexes.",
                    "url": "https://wjbyrd.screencasthost.com/watch/crl1qKV2l2a",
                    "actionLabel": "Watch Video",
                    "external": true,
                    "transcript": "converting-dollars-across-time-transcript.srt",
                    "priority": 1,
                    "sourceGame": "nationalLedger"
                },
                {
                    "id": "cT6uFknFeIa",
                    "chapter": 25,
                    "type": "worked-problem",
                    "title": "Chapter 25 Worked Problems",
                    "description": "Practice applying inflation and cost-of-living concepts through worked problems.",
                    "url": "https://wjbyrd.screencasthost.com/watch/cT6uFknFeIa",
                    "actionLabel": "Watch Video",
                    "external": true,
                    "transcript": "chapter-25-worked-problems-transcript.srt",
                    "priority": 3,
                    "sourceGame": "nationalLedger"
                },
                {
                    "id": "chapter-25-lecture-slides",
                    "chapter": 25,
                    "type": "slides",
                    "title": "Chapter 25 Lecture Slides",
                    "description": "Review the CPI, inflation, price indexes, and interest rates.",
                    "url": "../The National Ledger/resources/slides/chapter-25-measuring-the-cost-of-living.pdf",
                    "actionLabel": "Open Slides",
                    "external": false,
                    "downloadable": true,
                    "priority": 4,
                    "sourceGame": "nationalLedger"
                }
            ],
            "sourceGame": "nationalLedger"
        },
        "26": {
            "title": "Production and Growth",
            "fallbackResourceIds": [
                "cT6vqhnFXUp",
                "chapter-26-lecture-slides"
            ],
            "resources": [
                {
                    "id": "cT6vDZnFXcV",
                    "chapter": 26,
                    "type": "video",
                    "title": "Productivity and Growth",
                    "description": "Review productivity and economic growth across countries.",
                    "url": "https://wjbyrd.screencasthost.com/watch/cT6vDZnFXcV",
                    "actionLabel": "Watch Video",
                    "external": true,
                    "transcript": "productivity-and-growth-transcript.srt",
                    "priority": 1,
                    "sourceGame": "nationalLedger"
                },
                {
                    "id": "cT6vDunFXcp",
                    "chapter": 26,
                    "type": "video",
                    "title": "The Catch-Up Effect",
                    "description": "Review the catch-up effect and differences in economic growth.",
                    "url": "https://wjbyrd.screencasthost.com/watch/cT6vDunFXcp",
                    "actionLabel": "Watch Video",
                    "external": true,
                    "transcript": "the-catch-up-effect-transcript.srt",
                    "priority": 2,
                    "sourceGame": "nationalLedger"
                },
                {
                    "id": "cT6vqhnFXUp",
                    "chapter": 26,
                    "type": "worked-problem",
                    "title": "Chapter 26 Worked Problems",
                    "description": "Practice applying production and growth concepts through worked problems.",
                    "url": "https://wjbyrd.screencasthost.com/watch/cT6vqhnFXUp",
                    "actionLabel": "Watch Video",
                    "external": true,
                    "transcript": "chapter-26-worked-problems-transcript.srt",
                    "priority": 3,
                    "sourceGame": "nationalLedger"
                },
                {
                    "id": "chapter-26-lecture-slides",
                    "chapter": 26,
                    "type": "slides",
                    "title": "Chapter 26 Lecture Slides",
                    "description": "Review productivity, growth, and the policies that influence them.",
                    "url": "../The National Ledger/resources/slides/chapter-26-production-and-growth.pdf",
                    "actionLabel": "Open Slides",
                    "external": false,
                    "downloadable": true,
                    "priority": 4,
                    "sourceGame": "nationalLedger"
                }
            ],
            "sourceGame": "nationalLedger"
        },
        "29": {
            "title": "Unemployment",
            "fallbackResourceIds": [
                "cT6vFAnFXZJ",
                "chapter-29-lecture-slides"
            ],
            "resources": [
                {
                    "id": "cT6vFqnFXrU",
                    "chapter": 29,
                    "type": "video",
                    "title": "Labor Force Statistics",
                    "description": "Review labor-force statistics and employment categories.",
                    "url": "https://wjbyrd.screencasthost.com/watch/cT6vFqnFXrU",
                    "actionLabel": "Watch Video",
                    "external": true,
                    "transcript": "labor-force-statistics-transcript.srt",
                    "priority": 1,
                    "sourceGame": "nationalLedger"
                },
                {
                    "id": "cTiYbZnInbF",
                    "chapter": 29,
                    "type": "video",
                    "title": "Frictional Unemployment",
                    "description": "Review types of unemployment and the natural rate.",
                    "url": "https://wjbyrd.screencasthost.com/watch/cTiYbZnInbF",
                    "actionLabel": "Watch Video",
                    "external": true,
                    "transcript": "frictional-unemployment-transcript.srt",
                    "priority": 1,
                    "sourceGame": "nationalLedger"
                },
                {
                    "id": "cTiYbEnInFz",
                    "chapter": 29,
                    "type": "video",
                    "title": "Structural Unemployment",
                    "description": "Review structural unemployment and labor-market policies.",
                    "url": "https://wjbyrd.screencasthost.com/watch/cTiYbEnInFz",
                    "actionLabel": "Watch Video",
                    "external": true,
                    "transcript": "structural-unemployment-transcript.srt",
                    "priority": 2,
                    "sourceGame": "nationalLedger"
                },
                {
                    "id": "cT6vFAnFXZJ",
                    "chapter": 29,
                    "type": "worked-problem",
                    "title": "Chapter 29 Worked Problems",
                    "description": "Practice applying unemployment concepts through worked problems.",
                    "url": "https://wjbyrd.screencasthost.com/watch/cT6vFAnFXZJ",
                    "actionLabel": "Watch Video",
                    "external": true,
                    "transcript": "chapter-29-worked-problems-transcript.srt",
                    "priority": 3,
                    "sourceGame": "nationalLedger"
                },
                {
                    "id": "chapter-29-lecture-slides",
                    "chapter": 29,
                    "type": "slides",
                    "title": "Chapter 29 Lecture Slides",
                    "description": "Review labor-force statistics, unemployment, and labor-market policy.",
                    "url": "../The National Ledger/resources/slides/chapter-29-unemployment.pdf",
                    "actionLabel": "Open Slides",
                    "external": false,
                    "downloadable": true,
                    "priority": 4,
                    "sourceGame": "nationalLedger"
                }
            ],
            "sourceGame": "nationalLedger"
        }
    },
    "objectives": {
        "LO1.1": {
            "chapter": 1,
            "title": "Identify how individuals face trade-offs and how to analyze them.",
            "resourceIds": [
                "c3jTlBVTvre",
                "cOi0lknUNLr"
            ],
            "sourceGame": "marketGate"
        },
        "LO1.2": {
            "chapter": 1,
            "title": "Apply the meaning of opportunity cost and how to calculate it.",
            "resourceIds": [
                "c3jTlBVTvre",
                "cOi0lknUNLr"
            ],
            "sourceGame": "marketGate"
        },
        "LO1.3": {
            "chapter": 1,
            "title": "Identify marginal reasoning and calculate decisions at the margin.",
            "resourceIds": [
                "c3jTlBVTvre",
                "cOi0lknUNLr"
            ],
            "sourceGame": "marketGate"
        },
        "LO1.4": {
            "chapter": 1,
            "title": "Recognize how incentives affect people’s behavior.",
            "resourceIds": [
                "c3jTlBVTvre",
                "cOi0lknUNLr"
            ],
            "sourceGame": "marketGate"
        },
        "LO1.5": {
            "chapter": 1,
            "title": "Explain why trade among people or nations can be good for everyone.",
            "resourceIds": [
                "c3jTlBVTvre",
                "cOi0lknUNLr"
            ],
            "sourceGame": "marketGate"
        },
        "LO1.6": {
            "chapter": 1,
            "title": "Enumerate why markets are a good—but not perfect—way to allocate resources.",
            "resourceIds": [
                "c3jTlBVTvre",
                "cOi0lknUNLr"
            ],
            "sourceGame": "marketGate"
        },
        "LO2.1": {
            "chapter": 2,
            "title": "Describe how economists apply the methods of science; explain how models shed light on the world.",
            "resourceIds": [
                "c3jT26VTvAg",
                "cr6jouVXFdS",
                "cr6j2rVXFzG"
            ],
            "sourceGame": "marketGate"
        },
        "LO2.2": {
            "chapter": 2,
            "title": "Apply the circular-flow model and PPF to analyze choices and trade-offs.",
            "resourceIds": [
                "c3jT26VTvAg",
                "cr6jouVXFdS",
                "cr6j2rVXFzG"
            ],
            "sourceGame": "marketGate"
        },
        "LO2.3": {
            "chapter": 2,
            "title": "Distinguish microeconomics from macroeconomics.",
            "resourceIds": [
                "cr6j2rVXFzG"
            ],
            "sourceGame": "marketGate"
        },
        "LO2.4": {
            "chapter": 2,
            "title": "Distinguish positive from normative statements.",
            "resourceIds": [
                "cr6j2rVXFzG"
            ],
            "sourceGame": "marketGate"
        },
        "LO2.5": {
            "chapter": 2,
            "title": "Explain economists’ roles in policy.",
            "resourceIds": [],
            "sourceGame": "marketGate"
        },
        "LO4.1": {
            "chapter": 4,
            "title": "Define what a competitive market is.",
            "resourceIds": [
                "cT60Yxnb7cL"
            ],
            "sourceGame": "marketGate"
        },
        "LO4.2": {
            "chapter": 4,
            "title": "Label the demand for a good in a competitive market and apply the law of demand.",
            "resourceIds": [
                "cT60qNnbKN7",
                "cT60q9nbK8I",
                "cT60Yxnb7cL"
            ],
            "sourceGame": "marketGate"
        },
        "LO4.3": {
            "chapter": 4,
            "title": "Label the supply of a good in a competitive market and apply the law of supply.",
            "resourceIds": [
                "cT60qRnbK8O",
                "cT60q9nbK8I",
                "cT60Yxnb7cL"
            ],
            "sourceGame": "marketGate"
        },
        "LO4.4": {
            "chapter": 4,
            "title": "Illustrate and apply how supply and demand together set the price of a good and the quantity sold and analyze market changes.",
            "resourceIds": [
                "cT60q9nbK8I",
                "cT60Yxnb7cL"
            ],
            "sourceGame": "marketGate"
        },
        "LO4.5": {
            "chapter": 4,
            "title": "Demonstrate the key role of prices in allocating scarce resources in market economies.",
            "resourceIds": [
                "cT60q9nbK8I",
                "cT60Yxnb7cL"
            ],
            "sourceGame": "marketGate"
        },
        "LO6.1": {
            "chapter": 6,
            "title": "Identify and calculate the effects of government policies that place a ceiling on prices.",
            "resourceIds": [
                "cT60YQnbK9q",
                "cT60YKnb7ex"
            ],
            "sourceGame": "marketGate"
        },
        "LO6.2": {
            "chapter": 6,
            "title": "Identify and calculate the effects of government policies that put a floor under prices.",
            "resourceIds": [
                "cT60Y6nbK9H",
                "cT60YKnb7ex"
            ],
            "sourceGame": "marketGate"
        },
        "LO6.3": {
            "chapter": 6,
            "title": "Illustrate and apply how a tax on a good affects the price of the good and the quantity sold.",
            "resourceIds": [
                "cT60YInbKR4",
                "cT60YKnb7ex"
            ],
            "sourceGame": "marketGate"
        },
        "LO6.4": {
            "chapter": 6,
            "title": "Illustrate and apply how taxes levied on sellers and taxes levied on buyers are equivalent.",
            "resourceIds": [
                "cT60YInbKR4",
                "cT60YKnb7ex"
            ],
            "sourceGame": "marketGate"
        },
        "LO6.5": {
            "chapter": 6,
            "title": "Recognize how the burden of a tax is split between buyers and sellers.",
            "resourceIds": [
                "cT60YInbKR4",
                "cT60YKnb7ex"
            ],
            "sourceGame": "marketGate"
        },
        "LO24.1": {
            "chapter": 24,
            "title": "Calculate how an economy’s total income equals its total expenditure.",
            "resourceIds": [
                "cT6uFGnFe2H",
                "cT6uFXnFejF"
            ],
            "sourceGame": "nationalLedger"
        },
        "LO24.2": {
            "chapter": 24,
            "title": "Define and calculate gross domestic product (GDP).",
            "resourceIds": [
                "cT6uFGnFe2H",
                "cT6uFXnFejF"
            ],
            "sourceGame": "nationalLedger"
        },
        "LO24.3": {
            "chapter": 24,
            "title": "Identify and break down GDP into its four major components.",
            "resourceIds": [
                "cT6uFGnFe2H",
                "cT6uFXnFejF"
            ],
            "sourceGame": "nationalLedger"
        },
        "LO24.4": {
            "chapter": 24,
            "title": "Define and calculate real GDP and nominal GDP.",
            "resourceIds": [
                "cr6toqVlD2g",
                "cT6uFXnFejF"
            ],
            "sourceGame": "nationalLedger"
        },
        "LO24.5": {
            "chapter": 24,
            "title": "Evaluate whether GDP is a good measure of economic well-being.",
            "resourceIds": [],
            "sourceGame": "nationalLedger"
        },
        "LO25.1": {
            "chapter": 25,
            "title": "Calculate the consumer price index (CPI) and relate CPI to inflation.",
            "resourceIds": [
                "cT6uFCnFeIN",
                "cT6uFknFeIa"
            ],
            "sourceGame": "nationalLedger"
        },
        "LO25.2": {
            "chapter": 25,
            "title": "Explain why the CPI is an imperfect measure of the cost of living.",
            "resourceIds": [
                "cT6uFCnFeIN",
                "cT6uFknFeIa"
            ],
            "sourceGame": "nationalLedger"
        },
        "LO25.3": {
            "chapter": 25,
            "title": "Define the CPI and the GDP Deflator and describe how they measure the overall price level.",
            "resourceIds": [
                "cT6uFCnFeIN",
                "cT6uFknFeIa"
            ],
            "sourceGame": "nationalLedger"
        },
        "LO25.4": {
            "chapter": 25,
            "title": "Convert dollar figures from different times using price indexes.",
            "resourceIds": [
                "crl1qKV2l2a",
                "cT6uFknFeIa"
            ],
            "sourceGame": "nationalLedger"
        },
        "LO25.5": {
            "chapter": 25,
            "title": "Describe the relationship between the nominal interest rate, inflation, and the real interest rate.",
            "resourceIds": [
                "cT6uFknFeIa"
            ],
            "sourceGame": "nationalLedger"
        },
        "LO26.1": {
            "chapter": 26,
            "title": "Recognize how much economic growth differs around the world.",
            "resourceIds": [
                "cT6vDZnFXcV",
                "cT6vDunFXcp",
                "cT6vqhnFXUp"
            ],
            "sourceGame": "nationalLedger"
        },
        "LO26.2": {
            "chapter": 26,
            "title": "Identify why productivity is the key determinant of a country’s standard of living and illustrate how to calculate it.",
            "resourceIds": [
                "cT6vDZnFXcV",
                "cT6vDunFXcp",
                "cT6vqhnFXUp"
            ],
            "sourceGame": "nationalLedger"
        },
        "LO26.3": {
            "chapter": 26,
            "title": "Define and apply the factors that determine a country’s productivity.",
            "resourceIds": [
                "cT6vqhnFXUp"
            ],
            "sourceGame": "nationalLedger"
        },
        "LO26.4": {
            "chapter": 26,
            "title": "List how a country’s policies influence its productivity growth.",
            "resourceIds": [
                "cT6vqhnFXUp"
            ],
            "sourceGame": "nationalLedger"
        },
        "LO29.1": {
            "chapter": 29,
            "title": "Calculate the labor force statistics using economic data.",
            "resourceIds": [
                "cT6vFqnFXrU",
                "cT6vFAnFXZJ"
            ],
            "sourceGame": "nationalLedger"
        },
        "LO29.2": {
            "chapter": 29,
            "title": "Distinguish between employment categories.",
            "resourceIds": [
                "cT6vFqnFXrU",
                "cT6vFAnFXZJ"
            ],
            "sourceGame": "nationalLedger"
        },
        "LO29.3": {
            "chapter": 29,
            "title": "Differentiate among types of unemployment—frictional, structural, and cyclical—and analyze their causes.",
            "resourceIds": [
                "cTiYbZnInbF",
                "cTiYbEnInFz",
                "cT6vFAnFXZJ"
            ],
            "sourceGame": "nationalLedger"
        },
        "LO29.4": {
            "chapter": 29,
            "title": "Evaluate policies and institutions (e.g., unemployment insurance, unions, and collective bargaining) and their effects on unemployment.",
            "resourceIds": [
                "cTiYbZnInbF",
                "cTiYbEnInFz",
                "cT6vFAnFXZJ"
            ],
            "sourceGame": "nationalLedger"
        },
        "LO29.5": {
            "chapter": 29,
            "title": "Explain why the economy experiences a natural rate of unemployment even in the long run.",
            "resourceIds": [
                "cTiYbZnInbF",
                "cT6vFAnFXZJ"
            ],
            "sourceGame": "nationalLedger"
        }
    }
};

    global.EQUILIBRIUM_CRISIS_INSTRUCTIONAL_RESOURCES = catalog;
    global.INSTRUCTIONAL_RESOURCES = catalog;
}(window));
