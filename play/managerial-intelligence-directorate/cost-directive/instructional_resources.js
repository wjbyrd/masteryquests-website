/*
 * Student-facing instructional-resource catalog for The Cost Directive.
 * Generated from resources/instructional-resource-catalog.csv, the official
 * learning-objective document, verified transcripts, and supplied slide PDFs.
 * Transcript filenames and local authoring paths are intentionally not exposed.
 */
(function registerInstructionalResources(global) {
    "use strict";
    if (global.COST_DIRECTIVE_INSTRUCTIONAL_RESOURCES) {
        console.warn("[The Cost Directive] Instructional resources already registered; keeping the existing catalog.");
        return;
    }
    const catalog = {
    "version": 2,
    "gameId": "cost-directive",
    "gameTitle": "The Cost Directive",
    "settings": {
        "maximumRecommendations": 3,
        "enableChapterFallback": true
    },
    "chapters": {
        "1": {
            "title": "Introduction: What This Book Is About",
            "fallbackResourceIds": [
                "cThXqlnQm9q",
                "chapter-1-lecture-slides"
            ],
            "resources": [
                {
                    "id": "cThXqlnQm9q",
                    "chapter": 1,
                    "type": "video",
                    "title": "Incentive Alignment",
                    "description": "Review Incentive Alignment for the Chapter 1 learning objectives it covers.",
                    "url": "https://wjbyrd.screencasthost.com/watch/cThXqlnQm9q",
                    "actionLabel": "Watch Video",
                    "external": true,
                    "priority": 1
                },
                {
                    "id": "chapter-1-lecture-slides",
                    "chapter": 1,
                    "type": "slides",
                    "title": "Chapter 1 Lecture Slides",
                    "description": "Review the official Chapter 1 lecture slides for Introduction: What This Book Is About.",
                    "url": "resources/slides/chapter-1-introduction.pdf",
                    "actionLabel": "Open Slides",
                    "external": false,
                    "downloadable": true,
                    "priority": 4
                }
            ]
        },
        "2": {
            "title": "The One Lesson of Business",
            "fallbackResourceIds": [
                "cThnYinQ3oV",
                "cT1D2ZnXUcN",
                "chapter-2-lecture-slides"
            ],
            "resources": [
                {
                    "id": "cThnYinQ3oV",
                    "chapter": 2,
                    "type": "video",
                    "title": "Surplus",
                    "description": "Review Surplus for the Chapter 2 learning objectives it covers.",
                    "url": "https://wjbyrd.screencasthost.com/watch/cThnYinQ3oV",
                    "actionLabel": "Watch Video",
                    "external": true,
                    "priority": 1
                },
                {
                    "id": "cThnYrnQ3D8",
                    "chapter": 2,
                    "type": "video",
                    "title": "Taxes and Subsidies",
                    "description": "Review Taxes and Subsidies for the Chapter 2 learning objectives it covers.",
                    "url": "https://wjbyrd.screencasthost.com/watch/cThnYrnQ3D8",
                    "actionLabel": "Watch Video",
                    "external": true,
                    "priority": 1
                },
                {
                    "id": "cThnYZnQ3bD",
                    "chapter": 2,
                    "type": "video",
                    "title": "Price Ceilings and Price Floors",
                    "description": "Review Price Ceilings and Price Floors for the Chapter 2 learning objectives it covers.",
                    "url": "https://wjbyrd.screencasthost.com/watch/cThnYZnQ3bD",
                    "actionLabel": "Watch Video",
                    "external": true,
                    "priority": 1
                },
                {
                    "id": "cT1D2ZnXUcN",
                    "chapter": 2,
                    "type": "worked-problem",
                    "title": "Chapter 2 Worked Problems",
                    "description": "Practice applying Chapter 2 concepts through worked problems.",
                    "url": "https://wjbyrd.screencasthost.com/watch/cT1D2ZnXUcN",
                    "actionLabel": "Watch Video",
                    "external": true,
                    "priority": 3
                },
                {
                    "id": "chapter-2-lecture-slides",
                    "chapter": 2,
                    "type": "slides",
                    "title": "Chapter 2 Lecture Slides",
                    "description": "Review the official Chapter 2 lecture slides for The One Lesson of Business.",
                    "url": "resources/slides/chapter-2-the-one-lesson-of-business.pdf",
                    "actionLabel": "Open Slides",
                    "external": false,
                    "downloadable": true,
                    "priority": 4
                }
            ]
        },
        "3": {
            "title": "Benefits, Costs and Decisions",
            "fallbackResourceIds": [
                "cTh1rtnQyVP",
                "cT1DIOnXuJz",
                "chapter-3-lecture-slides"
            ],
            "resources": [
                {
                    "id": "c3j2F4VTVkx",
                    "chapter": 3,
                    "type": "video",
                    "title": "Fixed, Variable and Total Costs",
                    "description": "Review Fixed, Variable and Total Costs for the Chapter 3 learning objectives it covers.",
                    "url": "https://wjbyrd.screencasthost.com/watch/c3j2F4VTVkx",
                    "actionLabel": "Watch Video",
                    "external": true,
                    "priority": 1
                },
                {
                    "id": "c3j1FDVZGRa",
                    "chapter": 3,
                    "type": "video",
                    "title": "Accounting versus Economic Profit",
                    "description": "Review Accounting versus Economic Profit for the Chapter 3 learning objectives it covers.",
                    "url": "https://wjbyrd.screencasthost.com/watch/c3j1FDVZGRa",
                    "actionLabel": "Watch Video",
                    "external": true,
                    "priority": 1
                },
                {
                    "id": "cTh1rtnQyVP",
                    "chapter": 3,
                    "type": "video",
                    "title": "Sunk and Hidden Cost Fallacies",
                    "description": "Review Sunk and Hidden Cost Fallacies for the Chapter 3 learning objectives it covers.",
                    "url": "https://wjbyrd.screencasthost.com/watch/cTh1rtnQyVP",
                    "actionLabel": "Watch Video",
                    "external": true,
                    "priority": 1
                },
                {
                    "id": "cT1DIOnXuJz",
                    "chapter": 3,
                    "type": "worked-problem",
                    "title": "Chapter 3 Worked Problems",
                    "description": "Practice applying Chapter 3 concepts through worked problems.",
                    "url": "https://wjbyrd.screencasthost.com/watch/cT1DIOnXuJz",
                    "actionLabel": "Watch Video",
                    "external": true,
                    "priority": 3
                },
                {
                    "id": "chapter-3-lecture-slides",
                    "chapter": 3,
                    "type": "slides",
                    "title": "Chapter 3 Lecture Slides",
                    "description": "Review the official Chapter 3 lecture slides for Benefits, Costs and Decisions.",
                    "url": "resources/slides/chapter-3-benefits-costs-and-decisions.pdf",
                    "actionLabel": "Open Slides",
                    "external": false,
                    "downloadable": true,
                    "priority": 4
                }
            ]
        },
        "4": {
            "title": "Extent (How Much) Decisions",
            "fallbackResourceIds": [
                "cTh133nQyQo",
                "c3j2YGVTVd8",
                "cT1DIGnXuMO",
                "chapter-4-lecture-slides"
            ],
            "resources": [
                {
                    "id": "c3j2YGVTVd8",
                    "chapter": 4,
                    "type": "video",
                    "title": "Marginal and Average Costs",
                    "description": "Review Marginal and Average Costs for the Chapter 4 learning objectives it covers.",
                    "url": "https://wjbyrd.screencasthost.com/watch/c3j2YGVTVd8",
                    "actionLabel": "Watch Video",
                    "external": true,
                    "priority": 1
                },
                {
                    "id": "cTh133nQyQo",
                    "chapter": 4,
                    "type": "video",
                    "title": "Decisions at the Margin",
                    "description": "Review Decisions at the Margin for the Chapter 4 learning objectives it covers.",
                    "url": "https://wjbyrd.screencasthost.com/watch/cTh133nQyQo",
                    "actionLabel": "Watch Video",
                    "external": true,
                    "priority": 1
                },
                {
                    "id": "cTh10InQy20",
                    "chapter": 4,
                    "type": "video",
                    "title": "Incentive Pay",
                    "description": "Review Incentive Pay for the Chapter 4 learning objectives it covers.",
                    "url": "https://wjbyrd.screencasthost.com/watch/cTh10InQy20",
                    "actionLabel": "Watch Video",
                    "external": true,
                    "priority": 1
                },
                {
                    "id": "cT1DIGnXuMO",
                    "chapter": 4,
                    "type": "worked-problem",
                    "title": "Chapter 4 Worked Problems",
                    "description": "Practice applying Chapter 4 concepts through worked problems.",
                    "url": "https://wjbyrd.screencasthost.com/watch/cT1DIGnXuMO",
                    "actionLabel": "Watch Video",
                    "external": true,
                    "priority": 3
                },
                {
                    "id": "chapter-4-lecture-slides",
                    "chapter": 4,
                    "type": "slides",
                    "title": "Chapter 4 Lecture Slides",
                    "description": "Review the official Chapter 4 lecture slides for Extent (How Much) Decisions.",
                    "url": "resources/slides/chapter-4-extent-decisions.pdf",
                    "actionLabel": "Open Slides",
                    "external": false,
                    "downloadable": true,
                    "priority": 4
                }
            ]
        },
        "7": {
            "title": "Economies of Scale and Scope",
            "fallbackResourceIds": [
                "c3j23jVTVNP",
                "cT1D2XnXuR7",
                "chapter-7-lecture-slides"
            ],
            "resources": [
                {
                    "id": "c3j23jVTVNP",
                    "chapter": 7,
                    "type": "video",
                    "title": "Scale Economies",
                    "description": "Review Scale Economies for the Chapter 7 learning objectives it covers.",
                    "url": "https://wjbyrd.screencasthost.com/watch/c3j23jVTVNP",
                    "actionLabel": "Watch Video",
                    "external": true,
                    "priority": 1
                },
                {
                    "id": "cThiqYnQzyJ",
                    "chapter": 7,
                    "type": "video",
                    "title": "Learning Curves and Rates",
                    "description": "Review Learning Curves and Rates for the Chapter 7 learning objectives it covers.",
                    "url": "https://wjbyrd.screencasthost.com/watch/cThiqYnQzyJ",
                    "actionLabel": "Watch Video",
                    "external": true,
                    "priority": 1
                },
                {
                    "id": "cThiFonQz0F",
                    "chapter": 7,
                    "type": "video",
                    "title": "Economies of Scope",
                    "description": "Review Economies of Scope for the Chapter 7 learning objectives it covers.",
                    "url": "https://wjbyrd.screencasthost.com/watch/cThiFonQz0F",
                    "actionLabel": "Watch Video",
                    "external": true,
                    "priority": 1
                },
                {
                    "id": "cT1D2XnXuR7",
                    "chapter": 7,
                    "type": "worked-problem",
                    "title": "Chapter 7 Worked Problems",
                    "description": "Practice applying Chapter 7 concepts through worked problems.",
                    "url": "https://wjbyrd.screencasthost.com/watch/cT1D2XnXuR7",
                    "actionLabel": "Watch Video",
                    "external": true,
                    "priority": 3
                },
                {
                    "id": "chapter-7-lecture-slides",
                    "chapter": 7,
                    "type": "slides",
                    "title": "Chapter 7 Lecture Slides",
                    "description": "Review the official Chapter 7 lecture slides for Economies of Scale and Scope.",
                    "url": "resources/slides/chapter-7-economies-of-scale-and-scope.pdf",
                    "actionLabel": "Open Slides",
                    "external": false,
                    "downloadable": true,
                    "priority": 4
                }
            ]
        }
    },
    "objectives": {
        "LO1.1": {
            "chapter": 1,
            "title": "Identify the steps in problem solving.",
            "resourceIds": [
                "cThXqlnQm9q",
                "chapter-1-lecture-slides"
            ]
        },
        "LO1.2": {
            "chapter": 1,
            "title": "Explain the rational-actor paradigm.",
            "resourceIds": [
                "cThXqlnQm9q",
                "chapter-1-lecture-slides"
            ]
        },
        "LO1.3": {
            "chapter": 1,
            "title": "Identify the components of an incentive.",
            "resourceIds": [
                "cThXqlnQm9q",
                "chapter-1-lecture-slides"
            ]
        },
        "LO1.4": {
            "chapter": 1,
            "title": "Define a well-designed organization.",
            "resourceIds": [
                "cThXqlnQm9q",
                "chapter-1-lecture-slides"
            ]
        },
        "LO1.5": {
            "chapter": 1,
            "title": "Analyze and solve problems by asking and answering questions.",
            "resourceIds": [
                "cThXqlnQm9q",
                "chapter-1-lecture-slides"
            ]
        },
        "LO2.1": {
            "chapter": 2,
            "title": "Understand how voluntary transactions create wealth.",
            "resourceIds": [
                "cThnYinQ3oV",
                "cT1D2ZnXUcN",
                "chapter-2-lecture-slides"
            ]
        },
        "LO2.2": {
            "chapter": 2,
            "title": "Describe factors impeding the movement of assets to higher-valued uses.",
            "resourceIds": [
                "cT1D2ZnXUcN",
                "chapter-2-lecture-slides"
            ]
        },
        "LO2.3": {
            "chapter": 2,
            "title": "Infer how efficiency helps business.",
            "resourceIds": [
                "cThnYZnQ3bD",
                "cThnYrnQ3D8",
                "cThnYinQ3oV",
                "cT1D2ZnXUcN",
                "chapter-2-lecture-slides"
            ]
        },
        "LO2.4": {
            "chapter": 2,
            "title": "Identify transactions that create money-making opportunities.",
            "resourceIds": [
                "cThnYZnQ3bD",
                "cThnYrnQ3D8",
                "cThnYinQ3oV",
                "cT1D2ZnXUcN",
                "chapter-2-lecture-slides"
            ]
        },
        "LO2.5": {
            "chapter": 2,
            "title": "Interpret the role of design of an organization in its wealth creation.",
            "resourceIds": [
                "cT1D2ZnXUcN",
                "chapter-2-lecture-slides"
            ]
        },
        "LO3.1": {
            "chapter": 3,
            "title": "Identify the costs associated with decisions and the opportunity costs of alternatives.",
            "resourceIds": [
                "c3j1FDVZGRa",
                "cT1DIOnXuJz",
                "chapter-3-lecture-slides"
            ]
        },
        "LO3.2": {
            "chapter": 3,
            "title": "Identify the relevant costs and benefits of a decision.",
            "resourceIds": [
                "cTh1rtnQyVP",
                "cT1DIOnXuJz",
                "chapter-3-lecture-slides"
            ]
        },
        "LO3.3": {
            "chapter": 3,
            "title": "Differentiate between fixed and variable costs and how decisions that change output influence variable costs.",
            "resourceIds": [
                "c3j2F4VTVkx",
                "cT1DIOnXuJz",
                "chapter-3-lecture-slides"
            ]
        },
        "LO3.4": {
            "chapter": 3,
            "title": "Differentiate between accounting profit and economic profit.",
            "resourceIds": [
                "c3j1FDVZGRa",
                "cT1DIOnXuJz",
                "chapter-3-lecture-slides"
            ]
        },
        "LO3.5": {
            "chapter": 3,
            "title": "Describe the fixed-cost fallacy of considering irrelevant costs.",
            "resourceIds": [
                "cTh1rtnQyVP",
                "cT1DIOnXuJz",
                "chapter-3-lecture-slides"
            ]
        },
        "LO3.6": {
            "chapter": 3,
            "title": "Describe the hidden-cost fallacy of ignoring relevant costs.",
            "resourceIds": [
                "cTh1rtnQyVP",
                "cT1DIOnXuJz",
                "chapter-3-lecture-slides"
            ]
        },
        "LO4.1": {
            "chapter": 4,
            "title": "Differentiate between average and marginal costs.",
            "resourceIds": [
                "c3j2YGVTVd8",
                "cT1DIGnXuMO",
                "chapter-4-lecture-slides"
            ]
        },
        "LO4.2": {
            "chapter": 4,
            "title": "Compute average cost (AC), marginal cost (MC), and marginal revenue (MR).",
            "resourceIds": [
                "cTh133nQyQo",
                "c3j2YGVTVd8",
                "cT1DIGnXuMO",
                "chapter-4-lecture-slides"
            ]
        },
        "LO4.3": {
            "chapter": 4,
            "title": "Identify MR and MC as the relevant costs of an extent decision.",
            "resourceIds": [
                "cTh133nQyQo",
                "cT1DIGnXuMO",
                "chapter-4-lecture-slides"
            ]
        },
        "LO4.4": {
            "chapter": 4,
            "title": "Identify the effect of incentive compensation and fixed fees on effort.",
            "resourceIds": [
                "cTh10InQy20",
                "cT1DIGnXuMO",
                "chapter-4-lecture-slides"
            ]
        },
        "LO7.1": {
            "chapter": 7,
            "title": "Explain the law of diminishing marginal returns.",
            "resourceIds": [
                "cT1D2XnXuR7",
                "chapter-7-lecture-slides"
            ]
        },
        "LO7.2": {
            "chapter": 7,
            "title": "Describe the importance of knowing what the cost curves look like while negotiating contracts.",
            "resourceIds": [
                "c3j23jVTVNP",
                "cT1D2XnXuR7",
                "chapter-7-lecture-slides"
            ]
        },
        "LO7.3": {
            "chapter": 7,
            "title": "Describe the relationship between average costs and output.",
            "resourceIds": [
                "cThiqYnQzyJ",
                "cT1D2XnXuR7",
                "chapter-7-lecture-slides"
            ]
        },
        "LO7.4": {
            "chapter": 7,
            "title": "Determine whether returns to scale will be increasing, constant, or decreasing.",
            "resourceIds": [
                "c3j23jVTVNP",
                "cT1D2XnXuR7",
                "chapter-7-lecture-slides"
            ]
        },
        "LO7.5": {
            "chapter": 7,
            "title": "Identify the cost advantage of operating near a minimum efficient scale.",
            "resourceIds": [
                "c3j23jVTVNP",
                "cT1D2XnXuR7",
                "chapter-7-lecture-slides"
            ]
        },
        "LO7.6": {
            "chapter": 7,
            "title": "Explain the importance of looking over the life cycle of a product characterized by learning curves.",
            "resourceIds": [
                "cThiqYnQzyJ",
                "cT1D2XnXuR7",
                "chapter-7-lecture-slides"
            ]
        },
        "LO7.7": {
            "chapter": 7,
            "title": "Describe how economies of scope between two products can be a source of competitive advantage and shape acquisition strategy.",
            "resourceIds": [
                "cThiFonQz0F",
                "cT1D2XnXuR7",
                "chapter-7-lecture-slides"
            ]
        }
    }
};
    global.COST_DIRECTIVE_INSTRUCTIONAL_RESOURCES = catalog;
    if (!global.INSTRUCTIONAL_RESOURCES) global.INSTRUCTIONAL_RESOURCES = catalog;
}(window));
