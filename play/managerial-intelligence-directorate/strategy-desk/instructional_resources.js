/*
 * Student-facing instructional-resource catalog for The Strategy Desk.
 * Generated from resources/instructional-resource-catalog.csv, the official
 * learning-objective document, verified transcripts, and supplied slide PDFs.
 * Transcript filenames and local authoring paths are intentionally not exposed.
 */
(function registerInstructionalResources(global) {
    "use strict";
    if (global.STRATEGY_DESK_INSTRUCTIONAL_RESOURCES) {
        console.warn("[The Strategy Desk] Instructional resources already registered; keeping the existing catalog.");
        return;
    }
    const catalog = {
    "version": 2,
    "gameId": "strategy-desk",
    "gameTitle": "The Strategy Desk",
    "settings": {
        "maximumRecommendations": 3,
        "enableChapterFallback": true
    },
    "chapters": {
        "6": {
            "title": "Simple Pricing",
            "fallbackResourceIds": [
                "c3iUorVZtbn",
                "cT1I27nX0iX",
                "cT1qbsnXkpp",
                "chapter-6-lecture-slides"
            ],
            "resources": [
                {
                    "id": "cTfqcvnjCfy",
                    "chapter": 6,
                    "type": "video",
                    "title": "Price Elasticity of Demand",
                    "description": "Review Price Elasticity of Demand for the Chapter 6 learning objectives it covers.",
                    "url": "https://wjbyrd.screencasthost.com/watch/cTfqcvnjCfy",
                    "actionLabel": "Watch Video",
                    "external": true,
                    "priority": 1
                },
                {
                    "id": "cT1I27nX0iX",
                    "chapter": 6,
                    "type": "video",
                    "title": "Understanding Demand and Setting Optimal Prices",
                    "description": "Review Understanding Demand and Setting Optimal Prices for the Chapter 6 learning objectives it covers.",
                    "url": "https://wjbyrd.screencasthost.com/watch/cT1I27nX0iX",
                    "actionLabel": "Watch Video",
                    "external": true,
                    "priority": 1
                },
                {
                    "id": "c3iuF5VZZ94",
                    "chapter": 6,
                    "type": "video",
                    "title": "Calculating the Elasticity of Demand",
                    "description": "Review Calculating the Elasticity of Demand for the Chapter 6 learning objectives it covers.",
                    "url": "https://wjbyrd.screencasthost.com/watch/c3iuF5VZZ94",
                    "actionLabel": "Watch Video",
                    "external": true,
                    "priority": 1
                },
                {
                    "id": "c3iUorVZtbn",
                    "chapter": 6,
                    "type": "video",
                    "title": "Elasticity and Total Revenue",
                    "description": "Review Elasticity and Total Revenue for the Chapter 6 learning objectives it covers.",
                    "url": "https://wjbyrd.screencasthost.com/watch/c3iUorVZtbn",
                    "actionLabel": "Watch Video",
                    "external": true,
                    "priority": 1
                },
                {
                    "id": "c3iUruVZuVd",
                    "chapter": 6,
                    "type": "video",
                    "title": "Income and Cross Price Elasticity",
                    "description": "Review Income and Cross Price Elasticity for the Chapter 6 learning objectives it covers.",
                    "url": "https://wjbyrd.screencasthost.com/watch/c3iUruVZuVd",
                    "actionLabel": "Watch Video",
                    "external": true,
                    "priority": 1
                },
                {
                    "id": "cT1IoZnX0Ia",
                    "chapter": 6,
                    "type": "video",
                    "title": "Stay-Even Analysis",
                    "description": "Review Stay-Even Analysis for the Chapter 6 learning objectives it covers.",
                    "url": "https://wjbyrd.screencasthost.com/watch/cT1IoZnX0Ia",
                    "actionLabel": "Watch Video",
                    "external": true,
                    "priority": 1
                },
                {
                    "id": "cT1qbsnXkpp",
                    "chapter": 6,
                    "type": "worked-problem",
                    "title": "Chapter 6 Worked Problems",
                    "description": "Practice applying Chapter 6 concepts through worked problems.",
                    "url": "https://wjbyrd.screencasthost.com/watch/cT1qbsnXkpp",
                    "actionLabel": "Watch Video",
                    "external": true,
                    "priority": 3
                },
                {
                    "id": "chapter-6-lecture-slides",
                    "chapter": 6,
                    "type": "slides",
                    "title": "Chapter 6 Lecture Slides",
                    "description": "Review the official Chapter 6 lecture slides for Simple Pricing.",
                    "url": "resources/slides/Chapter 6.pdf",
                    "actionLabel": "Open Slides",
                    "external": false,
                    "downloadable": true,
                    "priority": 4
                }
            ]
        },
        "12": {
            "title": "More Realistic and Complex Pricing",
            "fallbackResourceIds": [
                "cTf6q8njbZq",
                "cTf6qvnjbqA",
                "cT1qFinXk5p",
                "chapter-12-lecture-slides"
            ],
            "resources": [
                {
                    "id": "cTf6qvnjbqA",
                    "chapter": 12,
                    "type": "video",
                    "title": "Commonly Owned Complements and Substitutes",
                    "description": "Review Commonly Owned Complements and Substitutes for the Chapter 12 learning objectives it covers.",
                    "url": "https://wjbyrd.screencasthost.com/watch/cTf6qvnjbqA",
                    "actionLabel": "Watch Video",
                    "external": true,
                    "priority": 1
                },
                {
                    "id": "cTi3opnIQQ8",
                    "chapter": 12,
                    "type": "video",
                    "title": "Pricing Commonoly Owned Substitutes and Complements",
                    "description": "Review Pricing Commonoly Owned Substitutes and Complements for the Chapter 12 learning objectives it covers.",
                    "url": "https://wjbyrd.screencasthost.com/watch/cTi3opnIQQ8",
                    "actionLabel": "Watch Video",
                    "external": true,
                    "priority": 1
                },
                {
                    "id": "cT1jrxnX1uK",
                    "chapter": 12,
                    "type": "video",
                    "title": "Pricing When Capacity and Forecasts Matter",
                    "description": "Review Pricing When Capacity and Forecasts Matter for the Chapter 12 learning objectives it covers.",
                    "url": "https://wjbyrd.screencasthost.com/watch/cT1jrxnX1uK",
                    "actionLabel": "Watch Video",
                    "external": true,
                    "priority": 1
                },
                {
                    "id": "cTf6q8njbZq",
                    "chapter": 12,
                    "type": "video",
                    "title": "Advertising and Promotional Pricing",
                    "description": "Review Advertising and Promotional Pricing for the Chapter 12 learning objectives it covers.",
                    "url": "https://wjbyrd.screencasthost.com/watch/cTf6q8njbZq",
                    "actionLabel": "Watch Video",
                    "external": true,
                    "priority": 1
                },
                {
                    "id": "cTi3o6nIQfN",
                    "chapter": 12,
                    "type": "video",
                    "title": "Psychological Pricing",
                    "description": "Review Psychological Pricing for the Chapter 12 learning objectives it covers.",
                    "url": "https://wjbyrd.screencasthost.com/watch/cTi3o6nIQfN",
                    "actionLabel": "Watch Video",
                    "external": true,
                    "priority": 1
                },
                {
                    "id": "cT1qFinXk5p",
                    "chapter": 12,
                    "type": "worked-problem",
                    "title": "Chapter 12 Worked Problems",
                    "description": "Practice applying Chapter 12 concepts through worked problems.",
                    "url": "https://wjbyrd.screencasthost.com/watch/cT1qFinXk5p",
                    "actionLabel": "Watch Video",
                    "external": true,
                    "priority": 3
                },
                {
                    "id": "chapter-12-lecture-slides",
                    "chapter": 12,
                    "type": "slides",
                    "title": "Chapter 12 Lecture Slides",
                    "description": "Review the official Chapter 12 lecture slides for More Realistic and Complex Pricing.",
                    "url": "resources/slides/Chapter 12.pdf",
                    "actionLabel": "Open Slides",
                    "external": false,
                    "downloadable": true,
                    "priority": 4
                }
            ]
        },
        "13": {
            "title": "Direct Price Discrimination",
            "fallbackResourceIds": [
                "cTVU3onfpT1",
                "cT1qFDnXkEW",
                "chapter-13-lecture-slides"
            ],
            "resources": [
                {
                    "id": "cTVU3onfpT1",
                    "chapter": 13,
                    "type": "video",
                    "title": "Price Discrimination and Welfare",
                    "description": "Review Price Discrimination and Welfare for the Chapter 13 learning objectives it covers.",
                    "url": "https://wjbyrd.screencasthost.com/watch/cTVU3onfpT1",
                    "actionLabel": "Watch Video",
                    "external": true,
                    "priority": 1
                },
                {
                    "id": "cThbbQn6h3l",
                    "chapter": 13,
                    "type": "video",
                    "title": "Robinston-Patman Act",
                    "description": "Review Robinston-Patman Act for the Chapter 13 learning objectives it covers.",
                    "url": "https://wjbyrd.screencasthost.com/watch/cThbbQn6h3l",
                    "actionLabel": "Watch Video",
                    "external": true,
                    "priority": 1
                },
                {
                    "id": "cT1qFDnXkEW",
                    "chapter": 13,
                    "type": "worked-problem",
                    "title": "Chapter 13 Worked Problems",
                    "description": "Practice applying Chapter 13 concepts through worked problems.",
                    "url": "https://wjbyrd.screencasthost.com/watch/cT1qFDnXkEW",
                    "actionLabel": "Watch Video",
                    "external": true,
                    "priority": 3
                },
                {
                    "id": "chapter-13-lecture-slides",
                    "chapter": 13,
                    "type": "slides",
                    "title": "Chapter 13 Lecture Slides",
                    "description": "Review the official Chapter 13 lecture slides for Direct Price Discrimination.",
                    "url": "resources/slides/Chapter 13.pdf",
                    "actionLabel": "Open Slides",
                    "external": false,
                    "downloadable": true,
                    "priority": 4
                }
            ]
        },
        "14": {
            "title": "Indirect Price Discrimination",
            "fallbackResourceIds": [
                "c3QXquVOliV",
                "cT1FognXzHz",
                "cT1qFCnXkHR",
                "chapter-14-lecture-slides"
            ],
            "resources": [
                {
                    "id": "cT1FoKnXzdp",
                    "chapter": 14,
                    "type": "video",
                    "title": "Product Design and Price Discrimination",
                    "description": "Review Product Design and Price Discrimination for the Chapter 14 learning objectives it covers.",
                    "url": "https://wjbyrd.screencasthost.com/watch/cT1FoKnXzdp",
                    "actionLabel": "Watch Video",
                    "external": true,
                    "priority": 1
                },
                {
                    "id": "cT1FognXzHz",
                    "chapter": 14,
                    "type": "video",
                    "title": "How Pricing Menus Reveal Consumer Willingness to Pay",
                    "description": "Review How Pricing Menus Reveal Consumer Willingness to Pay for the Chapter 14 learning objectives it covers.",
                    "url": "https://wjbyrd.screencasthost.com/watch/cT1FognXzHz",
                    "actionLabel": "Watch Video",
                    "external": true,
                    "priority": 1
                },
                {
                    "id": "c3QXquVOliV",
                    "chapter": 14,
                    "type": "video",
                    "title": "Antitrust Laws and Questionable Business Practices",
                    "description": "Review Antitrust Laws and Questionable Business Practices for the Chapter 14 learning objectives it covers.",
                    "url": "https://wjbyrd.screencasthost.com/watch/c3QXquVOliV",
                    "actionLabel": "Watch Video",
                    "external": true,
                    "priority": 1
                },
                {
                    "id": "cT1qFCnXkHR",
                    "chapter": 14,
                    "type": "worked-problem",
                    "title": "Chapter 14 Worked Problems",
                    "description": "Practice applying Chapter 14 concepts through worked problems.",
                    "url": "https://wjbyrd.screencasthost.com/watch/cT1qFCnXkHR",
                    "actionLabel": "Watch Video",
                    "external": true,
                    "priority": 3
                },
                {
                    "id": "chapter-14-lecture-slides",
                    "chapter": 14,
                    "type": "slides",
                    "title": "Chapter 14 Lecture Slides",
                    "description": "Review the official Chapter 14 lecture slides for Indirect Price Discrimination.",
                    "url": "resources/slides/Chapter 14.pdf",
                    "actionLabel": "Open Slides",
                    "external": false,
                    "downloadable": true,
                    "priority": 4
                }
            ]
        },
        "15": {
            "title": "Game Theory",
            "fallbackResourceIds": [
                "cTihbOnl3y7",
                "c06OrCVEAb9",
                "chapter-15-lecture-slides"
            ],
            "resources": [
                {
                    "id": "cTihbinl3x9",
                    "chapter": 15,
                    "type": "video",
                    "title": "Game Theory Basics Part 1",
                    "description": "Review Game Theory Basics Part 1 for the Chapter 15 learning objectives it covers.",
                    "url": "https://wjbyrd.screencasthost.com/watch/cTihbinl3x9",
                    "actionLabel": "Watch Video",
                    "external": true,
                    "priority": 1
                },
                {
                    "id": "cTihbOnl3y7",
                    "chapter": 15,
                    "type": "video",
                    "title": "Game Theory Basics Part 2",
                    "description": "Review Game Theory Basics Part 2 for the Chapter 15 learning objectives it covers.",
                    "url": "https://wjbyrd.screencasthost.com/watch/cTihbOnl3y7",
                    "actionLabel": "Watch Video",
                    "external": true,
                    "priority": 1
                },
                {
                    "id": "c06OqtVEz9r",
                    "chapter": 15,
                    "type": "video",
                    "title": "Beyond 2 Strategies",
                    "description": "Review Beyond 2 Strategies for the Chapter 15 learning objectives it covers.",
                    "url": "https://wjbyrd.screencasthost.com/watch/c06OqtVEz9r",
                    "actionLabel": "Watch Video",
                    "external": true,
                    "priority": 1
                },
                {
                    "id": "c06OrCVEAb9",
                    "chapter": 15,
                    "type": "video",
                    "title": "Sequential Games",
                    "description": "Review Sequential Games for the Chapter 15 learning objectives it covers.",
                    "url": "https://wjbyrd.screencasthost.com/watch/c06OrCVEAb9",
                    "actionLabel": "Watch Video",
                    "external": true,
                    "priority": 1
                },
                {
                    "id": "cTheY1nQ0CK",
                    "chapter": 15,
                    "type": "video",
                    "title": "Repeated Games - Finite and Infinite",
                    "description": "Review Repeated Games - Finite and Infinite for the Chapter 15 learning objectives it covers.",
                    "url": "https://wjbyrd.screencasthost.com/watch/cTheY1nQ0CK",
                    "actionLabel": "Watch Video",
                    "external": true,
                    "priority": 1
                },
                {
                    "id": "chapter-15-lecture-slides",
                    "chapter": 15,
                    "type": "slides",
                    "title": "Chapter 15 Lecture Slides",
                    "description": "Review the official Chapter 15 lecture slides for Game Theory.",
                    "url": "resources/slides/Chapter 15.pdf",
                    "actionLabel": "Open Slides",
                    "external": false,
                    "downloadable": true,
                    "priority": 4
                }
            ]
        },
        "16": {
            "title": "Bargaining",
            "fallbackResourceIds": [
                "c06OF9VEzs7",
                "cT1IDhnX0Y3",
                "chapter-16-lecture-slides"
            ],
            "resources": [
                {
                    "id": "c0Xi2pVGj7B",
                    "chapter": 16,
                    "type": "video",
                    "title": "Strategic Bargaining",
                    "description": "Review Strategic Bargaining for the Chapter 16 learning objectives it covers.",
                    "url": "https://wjbyrd.screencasthost.com/watch/c0Xi2pVGj7B",
                    "actionLabel": "Watch Video",
                    "external": true,
                    "priority": 1
                },
                {
                    "id": "c06OF9VEzs7",
                    "chapter": 16,
                    "type": "video",
                    "title": "Nonstrategic Bargaining",
                    "description": "Review Nonstrategic Bargaining for the Chapter 16 learning objectives it covers.",
                    "url": "https://wjbyrd.screencasthost.com/watch/c06OF9VEzs7",
                    "actionLabel": "Watch Video",
                    "external": true,
                    "priority": 1
                },
                {
                    "id": "cT1IDhnX0Y3",
                    "chapter": 16,
                    "type": "video",
                    "title": "Nonstrategic Bargaining and the Gains from Trade",
                    "description": "Review Nonstrategic Bargaining and the Gains from Trade for the Chapter 16 learning objectives it covers.",
                    "url": "https://wjbyrd.screencasthost.com/watch/cT1IDhnX0Y3",
                    "actionLabel": "Watch Video",
                    "external": true,
                    "priority": 1
                },
                {
                    "id": "chapter-16-lecture-slides",
                    "chapter": 16,
                    "type": "slides",
                    "title": "Chapter 16 Lecture Slides",
                    "description": "Review the official Chapter 16 lecture slides for Bargaining.",
                    "url": "resources/slides/Chapter 16.pdf",
                    "actionLabel": "Open Slides",
                    "external": false,
                    "downloadable": true,
                    "priority": 4
                }
            ]
        }
    },
    "objectives": {
        "LO6.1": {
            "chapter": 6,
            "title": "Define individual demand and aggregate (or market) demand.",
            "resourceIds": [
                "cT1I27nX0iX",
                "cT1qbsnXkpp",
                "chapter-6-lecture-slides"
            ]
        },
        "LO6.2": {
            "chapter": 6,
            "title": "Describe pricing and the steps to arrive at an optimal price.",
            "resourceIds": [
                "c3iUorVZtbn",
                "cT1I27nX0iX",
                "cT1qbsnXkpp",
                "chapter-6-lecture-slides"
            ]
        },
        "LO6.3": {
            "chapter": 6,
            "title": "Estimate the price elasticity of demand using the appropriate formula and explain the factors affecting elasticity.",
            "resourceIds": [
                "c3iuF5VZZ94",
                "cTfqcvnjCfy",
                "c3iUorVZtbn",
                "cT1qbsnXkpp",
                "chapter-6-lecture-slides"
            ]
        },
        "LO6.4": {
            "chapter": 6,
            "title": "Explain how to use different elasticities including income elasticity, cross-price elasticity, and advertising elasticity to forecast changes in demand.",
            "resourceIds": [
                "c3iUruVZuVd",
                "cT1qbsnXkpp",
                "chapter-6-lecture-slides"
            ]
        },
        "LO6.5": {
            "chapter": 6,
            "title": "Use stay-even analysis to determine the quantity change required to offset a price change.",
            "resourceIds": [
                "cT1IoZnX0Ia",
                "cT1qbsnXkpp",
                "chapter-6-lecture-slides"
            ]
        },
        "LO12.1": {
            "chapter": 12,
            "title": "Understand the process of pricing commonly owned substitutes.",
            "resourceIds": [
                "cTf6qvnjbqA",
                "cTi3opnIQQ8",
                "cT1qFinXk5p",
                "chapter-12-lecture-slides"
            ]
        },
        "LO12.2": {
            "chapter": 12,
            "title": "Understand the process of pricing commonly owned complements.",
            "resourceIds": [
                "cTf6qvnjbqA",
                "cTi3opnIQQ8",
                "cT1qFinXk5p",
                "chapter-12-lecture-slides"
            ]
        },
        "LO12.3": {
            "chapter": 12,
            "title": "Understand the process of setting price to fill available capacity.",
            "resourceIds": [
                "cT1jrxnX1uK",
                "cT1qFinXk5p",
                "chapter-12-lecture-slides"
            ]
        },
        "LO12.4": {
            "chapter": 12,
            "title": "Infer how forecast of demands influence pricing.",
            "resourceIds": [
                "cT1jrxnX1uK",
                "cT1qFinXk5p",
                "chapter-12-lecture-slides"
            ]
        },
        "LO12.5": {
            "chapter": 12,
            "title": "Interpret the role of promotional expenditure on demand and thereby, the price of a product.",
            "resourceIds": [
                "cTf6q8njbZq",
                "cT1qFinXk5p",
                "chapter-12-lecture-slides"
            ]
        },
        "LO12.6": {
            "chapter": 12,
            "title": "Investigate the role of psychological biases in formulating pricing strategy.",
            "resourceIds": [
                "cTi3o6nIQfN",
                "cTf6q8njbZq",
                "cT1qFinXk5p",
                "chapter-12-lecture-slides"
            ]
        },
        "LO13.1": {
            "chapter": 13,
            "title": "Describe the motivation for price discrimination.",
            "resourceIds": [
                "cTVU3onfpT1",
                "cT1qFDnXkEW",
                "chapter-13-lecture-slides"
            ]
        },
        "LO13.2": {
            "chapter": 13,
            "title": "Discuss the practice of direct price discrimination.",
            "resourceIds": [
                "cTVU3onfpT1",
                "cT1qFDnXkEW",
                "chapter-13-lecture-slides"
            ]
        },
        "LO13.3": {
            "chapter": 13,
            "title": "Explain how arbitrage can be prevented using direct price discrimination.",
            "resourceIds": [
                "cTVU3onfpT1",
                "cT1qFDnXkEW",
                "chapter-13-lecture-slides"
            ]
        },
        "LO13.4": {
            "chapter": 13,
            "title": "Describe how the Robinson-Patman Act prohibits price discrimination against small retailers.",
            "resourceIds": [
                "cThbbQn6h3l",
                "cT1qFDnXkEW",
                "chapter-13-lecture-slides"
            ]
        },
        "LO13.5": {
            "chapter": 13,
            "title": "Interpret how price discrimination is implemented using real-life business cases.",
            "resourceIds": [
                "cTVU3onfpT1",
                "cT1qFDnXkEW",
                "chapter-13-lecture-slides"
            ]
        },
        "LO14.1": {
            "chapter": 14,
            "title": "Explain conditions in which sellers practice indirect price discrimination.",
            "resourceIds": [
                "cT1FoKnXzdp",
                "cT1qFCnXkHR",
                "chapter-14-lecture-slides"
            ]
        },
        "LO14.2": {
            "chapter": 14,
            "title": "Discuss how sellers can prevent cannibalization of high-priced products using damaged good strategy and metering strategy.",
            "resourceIds": [
                "c3QXquVOliV",
                "cT1FoKnXzdp",
                "cT1qFCnXkHR",
                "chapter-14-lecture-slides"
            ]
        },
        "LO14.3": {
            "chapter": 14,
            "title": "Identify pricing strategies that allow firms to extract more consumer surplus by encouraging customers to self-select based on willingness to pay.",
            "resourceIds": [
                "cT1FognXzHz",
                "cT1qFCnXkHR",
                "chapter-14-lecture-slides"
            ]
        },
        "LO14.4": {
            "chapter": 14,
            "title": "Explain how bundling different goods together can generate profits.",
            "resourceIds": [
                "c3QXquVOliV",
                "cT1FognXzHz",
                "cT1qFCnXkHR",
                "chapter-14-lecture-slides"
            ]
        },
        "LO15.1": {
            "chapter": 15,
            "title": "Understand the use of game theory to analyze situations where the profit of one firm depends critically on the actions of others.",
            "resourceIds": [
                "cTihbinl3x9",
                "c06OqtVEz9r",
                "cTheY1nQ0CK",
                "cTihbOnl3y7",
                "c06OrCVEAb9",
                "chapter-15-lecture-slides"
            ]
        },
        "LO15.2": {
            "chapter": 15,
            "title": "Distinguish between sequential-move games and simultaneous-move games.",
            "resourceIds": [
                "cTihbOnl3y7",
                "c06OrCVEAb9",
                "chapter-15-lecture-slides"
            ]
        },
        "LO15.3": {
            "chapter": 15,
            "title": "Analyze the likely outcome of a game known as Nash equilibrium.",
            "resourceIds": [
                "cTihbinl3x9",
                "c06OqtVEz9r",
                "cTheY1nQ0CK",
                "cTihbOnl3y7",
                "c06OrCVEAb9",
                "chapter-15-lecture-slides"
            ]
        },
        "LO15.4": {
            "chapter": 15,
            "title": "Identify equilibria in different types of games and how to change the rules of the game to your advantage.",
            "resourceIds": [
                "c06OqtVEz9r",
                "cTheY1nQ0CK",
                "cTihbOnl3y7",
                "c06OrCVEAb9",
                "chapter-15-lecture-slides"
            ]
        },
        "LO16.1": {
            "chapter": 16,
            "title": "Explain the strategic view of bargaining.",
            "resourceIds": [
                "c0Xi2pVGj7B",
                "chapter-16-lecture-slides"
            ]
        },
        "LO16.2": {
            "chapter": 16,
            "title": "Explain the nonstrategic view of bargaining",
            "resourceIds": [
                "c06OF9VEzs7",
                "cT1IDhnX0Y3",
                "chapter-16-lecture-slides"
            ]
        }
    }
};
    global.STRATEGY_DESK_INSTRUCTIONAL_RESOURCES = catalog;
    if (!global.INSTRUCTIONAL_RESOURCES) global.INSTRUCTIONAL_RESOURCES = catalog;
}(window));
