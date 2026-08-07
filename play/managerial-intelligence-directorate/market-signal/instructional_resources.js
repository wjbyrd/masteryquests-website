/*
 * Student-facing instructional-resource catalog for The Market Signal.
 * Generated from resources/instructional-resource-catalog.csv, the official
 * learning-objective document, verified transcripts, and supplied slide PDFs.
 * Transcript filenames and local authoring paths are intentionally not exposed.
 */
(function registerInstructionalResources(global) {
    "use strict";
    if (global.MARKET_SIGNAL_INSTRUCTIONAL_RESOURCES) {
        console.warn("[The Market Signal] Instructional resources already registered; keeping the existing catalog.");
        return;
    }
    const catalog = {
    "version": 2,
    "gameId": "market-signal",
    "gameTitle": "The Market Signal",
    "settings": {
        "maximumRecommendations": 3,
        "enableChapterFallback": true
    },
    "chapters": {
        "5": {
            "title": "Investment Decisions, Look Ahead and Reason Back",
            "fallbackResourceIds": [
                "c0jYYPVpY5D",
                "cT1DDonXUTQ",
                "chapter-5-lecture-slides"
            ],
            "resources": [
                {
                    "id": "c0jYYoVpYkh",
                    "chapter": 5,
                    "type": "video",
                    "title": "Compounding and Discounting",
                    "description": "Review Compounding and Discounting for the Chapter 5 learning objectives it covers.",
                    "url": "https://wjbyrd.screencasthost.com/watch/c0jYYoVpYkh",
                    "actionLabel": "Watch Video",
                    "external": true,
                    "priority": 1
                },
                {
                    "id": "c0jYYPVpY5D",
                    "chapter": 5,
                    "type": "video",
                    "title": "Net Present Value",
                    "description": "Review Net Present Value for the Chapter 5 learning objectives it covers.",
                    "url": "https://wjbyrd.screencasthost.com/watch/c0jYYPVpY5D",
                    "actionLabel": "Watch Video",
                    "external": true,
                    "priority": 1
                },
                {
                    "id": "c0Q1qAVC1PA",
                    "chapter": 5,
                    "type": "video",
                    "title": "Breakeven Analysis",
                    "description": "Review Breakeven Analysis for the Chapter 5 learning objectives it covers.",
                    "url": "https://wjbyrd.screencasthost.com/watch/c0Q1qAVC1PA",
                    "actionLabel": "Watch Video",
                    "external": true,
                    "priority": 1
                },
                {
                    "id": "cThirtnQzsH",
                    "chapter": 5,
                    "type": "video",
                    "title": "Post-Investment Holdup",
                    "description": "Review Post-Investment Holdup for the Chapter 5 learning objectives it covers.",
                    "url": "https://wjbyrd.screencasthost.com/watch/cThirtnQzsH",
                    "actionLabel": "Watch Video",
                    "external": true,
                    "priority": 1
                },
                {
                    "id": "cT1DDonXUTQ",
                    "chapter": 5,
                    "type": "worked-problem",
                    "title": "Chapter 5 Worked Problems",
                    "description": "Practice applying Chapter 5 concepts through worked problems.",
                    "url": "https://wjbyrd.screencasthost.com/watch/cT1DDonXUTQ",
                    "actionLabel": "Watch Video",
                    "external": true,
                    "priority": 3
                },
                {
                    "id": "chapter-5-lecture-slides",
                    "chapter": 5,
                    "type": "slides",
                    "title": "Chapter 5 Lecture Slides",
                    "description": "Review the official Chapter 5 lecture slides for Investment Decisions, Look Ahead and Reason Back.",
                    "url": "resources/slides/chapter-5-investment-decisions.pdf",
                    "actionLabel": "Open Slides",
                    "external": false,
                    "downloadable": true,
                    "priority": 4
                }
            ]
        },
        "8": {
            "title": "Understanding Markets and Industry Changes",
            "fallbackResourceIds": [
                "cT60q9nbK8I",
                "c0Q1Y8VCiQh",
                "cT1FqDnXAqX",
                "chapter-8-lecture-slides"
            ],
            "resources": [
                {
                    "id": "cT60qNnbKN7",
                    "chapter": 8,
                    "type": "video",
                    "title": "Demand",
                    "description": "Review Demand for the Chapter 8 learning objectives it covers.",
                    "url": "https://wjbyrd.screencasthost.com/watch/cT60qNnbKN7",
                    "actionLabel": "Watch Video",
                    "external": true,
                    "priority": 1
                },
                {
                    "id": "cT60qRnbK8O",
                    "chapter": 8,
                    "type": "video",
                    "title": "Supply",
                    "description": "Review Supply for the Chapter 8 learning objectives it covers.",
                    "url": "https://wjbyrd.screencasthost.com/watch/cT60qRnbK8O",
                    "actionLabel": "Watch Video",
                    "external": true,
                    "priority": 1
                },
                {
                    "id": "cT60q9nbK8I",
                    "chapter": 8,
                    "type": "video",
                    "title": "Demand and Supply",
                    "description": "Review Demand and Supply for the Chapter 8 learning objectives it covers.",
                    "url": "https://wjbyrd.screencasthost.com/watch/cT60q9nbK8I",
                    "actionLabel": "Watch Video",
                    "external": true,
                    "priority": 1
                },
                {
                    "id": "c0Q1Y8VCiQh",
                    "chapter": 8,
                    "type": "video",
                    "title": "Demand and Supply: Math",
                    "description": "Review Demand and Supply: Math for the Chapter 8 learning objectives it covers.",
                    "url": "https://wjbyrd.screencasthost.com/watch/c0Q1Y8VCiQh",
                    "actionLabel": "Watch Video",
                    "external": true,
                    "priority": 1
                },
                {
                    "id": "cT1FqDnXAqX",
                    "chapter": 8,
                    "type": "worked-problem",
                    "title": "Chapter 8 Worked Problems",
                    "description": "Practice applying Chapter 8 concepts through worked problems.",
                    "url": "https://wjbyrd.screencasthost.com/watch/cT1FqDnXAqX",
                    "actionLabel": "Watch Video",
                    "external": true,
                    "priority": 3
                },
                {
                    "id": "chapter-8-lecture-slides",
                    "chapter": 8,
                    "type": "slides",
                    "title": "Chapter 8 Lecture Slides",
                    "description": "Review the official Chapter 8 lecture slides for Understanding Markets and Industry Changes.",
                    "url": "resources/slides/chapter-8-understanding-market-and-industry-change.pdf",
                    "actionLabel": "Open Slides",
                    "external": false,
                    "downloadable": true,
                    "priority": 4
                }
            ]
        },
        "9": {
            "title": "Relationships Between Industries: The Forces Moving Us Toward Long-Run Equilibrium",
            "fallbackResourceIds": [
                "c3jOo7VT4fG",
                "cT1iq4nXh2P",
                "cT1FqvnXAre",
                "chapter-9-lecture-slides"
            ],
            "resources": [
                {
                    "id": "c3jO2vVTy7C",
                    "chapter": 9,
                    "type": "video",
                    "title": "Total Revenue and Total Cost",
                    "description": "Review Total Revenue and Total Cost for the Chapter 9 learning objectives it covers.",
                    "url": "https://wjbyrd.screencasthost.com/watch/c3jO2vVTy7C",
                    "actionLabel": "Watch Video",
                    "external": true,
                    "priority": 1
                },
                {
                    "id": "c3jOo7VT4fG",
                    "chapter": 9,
                    "type": "video",
                    "title": "Profit Maximization and Loss Minimization",
                    "description": "Review Profit Maximization and Loss Minimization for the Chapter 9 learning objectives it covers.",
                    "url": "https://wjbyrd.screencasthost.com/watch/c3jOo7VT4fG",
                    "actionLabel": "Watch Video",
                    "external": true,
                    "priority": 1
                },
                {
                    "id": "c3jUFdVTkcm",
                    "chapter": 9,
                    "type": "video",
                    "title": "Short and Long Run Equilibrium",
                    "description": "Review Short and Long Run Equilibrium for the Chapter 9 learning objectives it covers.",
                    "url": "https://wjbyrd.screencasthost.com/watch/c3jUFdVTkcm",
                    "actionLabel": "Watch Video",
                    "external": true,
                    "priority": 1
                },
                {
                    "id": "cT1iq4nXh2P",
                    "chapter": 9,
                    "type": "video",
                    "title": "Tradeoffs in Labor and Capital Markets",
                    "description": "Review Tradeoffs in Labor and Capital Markets for the Chapter 9 learning objectives it covers.",
                    "url": "https://wjbyrd.screencasthost.com/watch/cT1iq4nXh2P",
                    "actionLabel": "Watch Video",
                    "external": true,
                    "priority": 1
                },
                {
                    "id": "cTVU3enfp0t",
                    "chapter": 9,
                    "type": "video",
                    "title": "The Monopoly Model and Welfare",
                    "description": "Review The Monopoly Model and Welfare for the Chapter 9 learning objectives it covers.",
                    "url": "https://wjbyrd.screencasthost.com/watch/cTVU3enfp0t",
                    "actionLabel": "Watch Video",
                    "external": true,
                    "priority": 1
                },
                {
                    "id": "cTVU3XnfpZx",
                    "chapter": 9,
                    "type": "video",
                    "title": "Natural Monopoly and Public Policy",
                    "description": "Review Natural Monopoly and Public Policy for the Chapter 9 learning objectives it covers.",
                    "url": "https://wjbyrd.screencasthost.com/watch/cTVU3XnfpZx",
                    "actionLabel": "Watch Video",
                    "external": true,
                    "priority": 1
                },
                {
                    "id": "cT1FqvnXAre",
                    "chapter": 9,
                    "type": "worked-problem",
                    "title": "Chapter 9 Worked Problems",
                    "description": "Practice applying Chapter 9 concepts through worked problems.",
                    "url": "https://wjbyrd.screencasthost.com/watch/cT1FqvnXAre",
                    "actionLabel": "Watch Video",
                    "external": true,
                    "priority": 3
                },
                {
                    "id": "chapter-9-lecture-slides",
                    "chapter": 9,
                    "type": "slides",
                    "title": "Chapter 9 Lecture Slides",
                    "description": "Review the official Chapter 9 lecture slides for Relationships Between Industries: The Forces Moving Us Toward Long-Run Equilibrium.",
                    "url": "resources/slides/chapter-9-relationships-between-industries.pdf",
                    "actionLabel": "Open Slides",
                    "external": false,
                    "downloadable": true,
                    "priority": 4
                }
            ]
        },
        "17": {
            "title": "Uncertainty",
            "fallbackResourceIds": [
                "cTflb7nj3bm",
                "cT1FFsnXAoO",
                "chapter-17-lecture-slides"
            ],
            "resources": [
                {
                    "id": "cTflb7nj3bm",
                    "chapter": 17,
                    "type": "video",
                    "title": "Uncertainty",
                    "description": "Review Uncertainty for the Chapter 17 learning objectives it covers.",
                    "url": "https://wjbyrd.screencasthost.com/watch/cTflb7nj3bm",
                    "actionLabel": "Watch Video",
                    "external": true,
                    "priority": 1
                },
                {
                    "id": "c0QYDPVCdet",
                    "chapter": 17,
                    "type": "video",
                    "title": "Pricing and Price Discrimination",
                    "description": "Review Pricing and Price Discrimination for the Chapter 17 learning objectives it covers.",
                    "url": "https://wjbyrd.screencasthost.com/watch/c0QYDPVCdet",
                    "actionLabel": "Watch Video",
                    "external": true,
                    "priority": 1
                },
                {
                    "id": "c0Q0YsVC9y8",
                    "chapter": 17,
                    "type": "video",
                    "title": "Experiments and Difference in Difference",
                    "description": "Review Experiments and Difference in Difference for the Chapter 17 learning objectives it covers.",
                    "url": "https://wjbyrd.screencasthost.com/watch/c0Q0YsVC9y8",
                    "actionLabel": "Watch Video",
                    "external": true,
                    "priority": 1
                },
                {
                    "id": "cT1FFsnXAoO",
                    "chapter": 17,
                    "type": "worked-problem",
                    "title": "Chapter 17 Worked Problems",
                    "description": "Practice applying Chapter 17 concepts through worked problems.",
                    "url": "https://wjbyrd.screencasthost.com/watch/cT1FFsnXAoO",
                    "actionLabel": "Watch Video",
                    "external": true,
                    "priority": 3
                },
                {
                    "id": "chapter-17-lecture-slides",
                    "chapter": 17,
                    "type": "slides",
                    "title": "Chapter 17 Lecture Slides",
                    "description": "Review the official Chapter 17 lecture slides for Uncertainty.",
                    "url": "resources/slides/chapter-17-uncertainty.pdf",
                    "actionLabel": "Open Slides",
                    "external": false,
                    "downloadable": true,
                    "priority": 4
                }
            ]
        }
    },
    "objectives": {
        "LO5.1": {
            "chapter": 5,
            "title": "Calculate discount rate to figure out the trade-off between current sacrifice and future gain.",
            "resourceIds": [
                "c0jYYoVpYkh",
                "cT1DDonXUTQ",
                "chapter-5-lecture-slides"
            ]
        },
        "LO5.2": {
            "chapter": 5,
            "title": "Identify that discount rates are determined by the cost of capital, which is compared to returns to make decisions about investing in projects.",
            "resourceIds": [
                "c0jYYPVpY5D",
                "cT1DDonXUTQ",
                "chapter-5-lecture-slides"
            ]
        },
        "LO5.3": {
            "chapter": 5,
            "title": "Describe the NPV rule and other shortcuts like pay-back periods used by companies to analyze investments.",
            "resourceIds": [
                "c0jYYPVpY5D",
                "cT1DDonXUTQ",
                "chapter-5-lecture-slides"
            ]
        },
        "LO5.4": {
            "chapter": 5,
            "title": "Calculate break-even quantity and break-even prices and determine how these affect decisions to invest or shut down.",
            "resourceIds": [
                "c0Q1qAVC1PA",
                "cT1DDonXUTQ",
                "chapter-5-lecture-slides"
            ]
        },
        "LO5.5": {
            "chapter": 5,
            "title": "Describe how to choose contracts involving sunk cost",
            "resourceIds": [
                "cThirtnQzsH",
                "cT1DDonXUTQ",
                "chapter-5-lecture-slides"
            ]
        },
        "LO17.1": {
            "chapter": 17,
            "title": "Assign simple probability distribution to random variables and compute expected costs and benefits.",
            "resourceIds": [
                "cTflb7nj3bm",
                "cT1FFsnXAoO",
                "chapter-17-lecture-slides"
            ]
        },
        "LO17.2": {
            "chapter": 17,
            "title": "Explain the use of price discrimination to model pricing uncertainty.",
            "resourceIds": [
                "c0QYDPVCdet",
                "cT1FFsnXAoO",
                "chapter-17-lecture-slides"
            ]
        },
        "LO17.3": {
            "chapter": 17,
            "title": "Examine the use of selection bias and randomized experiments to resolve the uncertainty around business decisions.",
            "resourceIds": [
                "c0Q0YsVC9y8",
                "cT1FFsnXAoO",
                "chapter-17-lecture-slides"
            ]
        },
        "LO17.4": {
            "chapter": 17,
            "title": "Analyze situations that minimize expected error costs.",
            "resourceIds": [
                "cTflb7nj3bm",
                "cT1FFsnXAoO",
                "chapter-17-lecture-slides"
            ]
        },
        "LO17.5": {
            "chapter": 17,
            "title": "Assess situations to get accurate estimates of uncertainty.",
            "resourceIds": [
                "cTflb7nj3bm",
                "cT1FFsnXAoO",
                "chapter-17-lecture-slides"
            ]
        },
        "LO17.6": {
            "chapter": 17,
            "title": "Design institutions to deal with unforeseen contingencies.",
            "resourceIds": [
                "cT1FFsnXAoO",
                "chapter-17-lecture-slides"
            ]
        },
        "LO8.1": {
            "chapter": 8,
            "title": "Know how to define the market before using supply-demand analysis.",
            "resourceIds": [
                "cT60q9nbK8I",
                "c0Q1Y8VCiQh",
                "cT1FqDnXAqX",
                "chapter-8-lecture-slides"
            ]
        },
        "LO8.2": {
            "chapter": 8,
            "title": "Describe buyer behavior and seller behavior in a competitive market.",
            "resourceIds": [
                "cT60qNnbKN7",
                "cT60qRnbK8O",
                "cT1FqDnXAqX",
                "chapter-8-lecture-slides"
            ]
        },
        "LO8.3": {
            "chapter": 8,
            "title": "Explain the demand and supply curves and how they relate to the market equilibrium.",
            "resourceIds": [
                "cT60q9nbK8I",
                "c0Q1Y8VCiQh",
                "cT1FqDnXAqX",
                "chapter-8-lecture-slides"
            ]
        },
        "LO8.4": {
            "chapter": 8,
            "title": "Describe the changes that occur at the industry level by using supply and demand curves.",
            "resourceIds": [
                "cT60q9nbK8I",
                "c0Q1Y8VCiQh",
                "cT1FqDnXAqX",
                "chapter-8-lecture-slides"
            ]
        },
        "LO9.1": {
            "chapter": 9,
            "title": "Describe the rate of returns for firms in a competitive industry.",
            "resourceIds": [
                "c3jO2vVTy7C",
                "c3jOo7VT4fG",
                "cT1FqvnXAre",
                "chapter-9-lecture-slides"
            ]
        },
        "LO9.2": {
            "chapter": 9,
            "title": "Identify the mean reversion exhibited by profits.",
            "resourceIds": [
                "c3jUFdVTkcm",
                "c3jOo7VT4fG",
                "cT1FqvnXAre",
                "chapter-9-lecture-slides"
            ]
        },
        "LO9.3": {
            "chapter": 9,
            "title": "Differentiate between compensating wage differentials and compensating risk differentials.",
            "resourceIds": [
                "cT1iq4nXh2P",
                "cT1FqvnXAre",
                "chapter-9-lecture-slides"
            ]
        },
        "LO9.4": {
            "chapter": 9,
            "title": "Explain the investor’s decision to move out of risky assets when the risk premia become too small.",
            "resourceIds": [
                "cT1iq4nXh2P",
                "cT1FqvnXAre",
                "chapter-9-lecture-slides"
            ]
        },
        "LO9.5": {
            "chapter": 9,
            "title": "Summarize the impact of entry and imitation on eroding profits for monopoly firms.",
            "resourceIds": [
                "cTVU3XnfpZx",
                "cTVU3enfp0t",
                "cT1FqvnXAre",
                "chapter-9-lecture-slides"
            ]
        }
    }
};
    global.MARKET_SIGNAL_INSTRUCTIONAL_RESOURCES = catalog;
    if (!global.INSTRUCTIONAL_RESOURCES) global.INSTRUCTIONAL_RESOURCES = catalog;
}(window));
