/*
 * Student-facing instructional-resource catalog for The Agency Protocol.
 * Generated from resources/instructional-resource-catalog.csv, the official
 * learning-objective document, verified transcripts, and supplied slide PDFs.
 * Transcript filenames and local authoring paths are intentionally not exposed.
 */
(function registerInstructionalResources(global) {
    "use strict";
    if (global.AGENCY_PROTOCOL_INSTRUCTIONAL_RESOURCES) {
        console.warn("[The Agency Protocol] Instructional resources already registered; keeping the existing catalog.");
        return;
    }
    const catalog = {
    "version": 2,
    "gameId": "agency-protocol",
    "gameTitle": "The Agency Protocol",
    "settings": {
        "maximumRecommendations": 3,
        "enableChapterFallback": true
    },
    "chapters": {
        "19": {
            "title": "The Problem of Adverse Selection",
            "fallbackResourceIds": [
                "pUkRo9COd38",
                "sXPXpJ5vMnU",
                "cZhVYtVMBVw",
                "chapter-19-lecture-slides"
            ],
            "resources": [
                {
                    "id": "pUkRo9COd38",
                    "chapter": 19,
                    "type": "video",
                    "title": "Asymmetric Information and Health Insurance",
                    "description": "Review Asymmetric Information and Health Insurance for the Chapter 19 learning objectives it covers.",
                    "url": "https://www.youtube.com/watch?v=pUkRo9COd38",
                    "actionLabel": "Watch Video",
                    "external": true,
                    "priority": 1
                },
                {
                    "id": "sXPXpJ5vMnU",
                    "chapter": 19,
                    "type": "video",
                    "title": "Asymmetric Information and Used Cars",
                    "description": "Review Asymmetric Information and Used Cars for the Chapter 19 learning objectives it covers.",
                    "url": "https://www.youtube.com/watch?v=sXPXpJ5vMnU",
                    "actionLabel": "Watch Video",
                    "external": true,
                    "priority": 1
                },
                {
                    "id": "F8ZHZRMSxKg",
                    "chapter": 19,
                    "type": "video",
                    "title": "Signaling",
                    "description": "Review Signaling for the Chapter 19 learning objectives it covers.",
                    "url": "https://www.youtube.com/watch?v=F8ZHZRMSxKg",
                    "actionLabel": "Watch Video",
                    "external": true,
                    "priority": 1
                },
                {
                    "id": "cZhVYtVMBVw",
                    "chapter": 19,
                    "type": "worked-problem",
                    "title": "Chapter 19 Worked Problems",
                    "description": "Practice applying Chapter 19 concepts through worked problems.",
                    "url": "https://wjbyrd.screencasthost.com/watch/cZhVYtVMBVw",
                    "actionLabel": "Watch Video",
                    "external": true,
                    "priority": 3
                },
                {
                    "id": "chapter-19-lecture-slides",
                    "chapter": 19,
                    "type": "slides",
                    "title": "Chapter 19 Lecture Slides",
                    "description": "Review the official Chapter 19 lecture slides for The Problem of Adverse Selection.",
                    "url": "resources/slides/chapter-19-the-problem-of-adverse-selection.pdf",
                    "actionLabel": "Open Slides",
                    "external": false,
                    "downloadable": true,
                    "priority": 4
                }
            ]
        },
        "20": {
            "title": "The Problem of Moral Hazard",
            "fallbackResourceIds": [
                "5v7TWKlYoN0",
                "6faL76QZ2AA",
                "cZhVqLVMA94",
                "chapter-20-lecture-slides"
            ],
            "resources": [
                {
                    "id": "5v7TWKlYoN0",
                    "chapter": 20,
                    "type": "video",
                    "title": "Moral Hazard",
                    "description": "Review Moral Hazard for the Chapter 20 learning objectives it covers.",
                    "url": "https://www.youtube.com/watch?v=5v7TWKlYoN0",
                    "actionLabel": "Watch Video",
                    "external": true,
                    "priority": 1
                },
                {
                    "id": "6faL76QZ2AA",
                    "chapter": 20,
                    "type": "video",
                    "title": "Solutions to Moral Hazard",
                    "description": "Review Solutions to Moral Hazard for the Chapter 20 learning objectives it covers.",
                    "url": "https://www.youtube.com/watch?v=6faL76QZ2AA",
                    "actionLabel": "Watch Video",
                    "external": true,
                    "priority": 1
                },
                {
                    "id": "cZhVqLVMA94",
                    "chapter": 20,
                    "type": "worked-problem",
                    "title": "Chapter 20 Worked Problems",
                    "description": "Practice applying Chapter 20 concepts through worked problems.",
                    "url": "https://wjbyrd.screencasthost.com/watch/cZhVqLVMA94",
                    "actionLabel": "Watch Video",
                    "external": true,
                    "priority": 3
                },
                {
                    "id": "chapter-20-lecture-slides",
                    "chapter": 20,
                    "type": "slides",
                    "title": "Chapter 20 Lecture Slides",
                    "description": "Review the official Chapter 20 lecture slides for The Problem of Moral Hazard.",
                    "url": "resources/slides/chapter-20-the-problem-of-moral-hazard.pdf",
                    "actionLabel": "Open Slides",
                    "external": false,
                    "downloadable": true,
                    "priority": 4
                }
            ]
        },
        "21": {
            "title": "Getting Employees to Work in the Firm's Best Interests",
            "fallbackResourceIds": [
                "cT1n2nn6KWZ",
                "chapter-21-lecture-slides"
            ],
            "resources": [
                {
                    "id": "cThFDXn61x7",
                    "chapter": 21,
                    "type": "video",
                    "title": "Employee vs Company Interest",
                    "description": "Review Employee vs Company Interest for the Chapter 21 learning objectives it covers.",
                    "url": "https://wjbyrd.screencasthost.com/watch/cThFDXn61x7",
                    "actionLabel": "Watch Video",
                    "external": true,
                    "priority": 1
                },
                {
                    "id": "cT1n2nn6KWZ",
                    "chapter": 21,
                    "type": "video",
                    "title": "Aligning Incentives",
                    "description": "Review Aligning Incentives for the Chapter 21 learning objectives it covers.",
                    "url": "https://wjbyrd.screencasthost.com/watch/cT1n2nn6KWZ",
                    "actionLabel": "Watch Video",
                    "external": true,
                    "priority": 1
                },
                {
                    "id": "chapter-21-lecture-slides",
                    "chapter": 21,
                    "type": "slides",
                    "title": "Chapter 21 Lecture Slides",
                    "description": "Review the official Chapter 21 lecture slides for Getting Employees to Work in the Firm's Best Interests.",
                    "url": "resources/slides/chapter-21-getting-employees-to-work-in-the-firms-best-interest.pdf",
                    "actionLabel": "Open Slides",
                    "external": false,
                    "downloadable": true,
                    "priority": 4
                }
            ]
        },
        "22": {
            "title": "Getting Divisions to Work in the Firm's Best Interests",
            "fallbackResourceIds": [
                "cTijbJnlv4h",
                "cTihb7nl3aT",
                "chapter-22-lecture-slides"
            ],
            "resources": [
                {
                    "id": "cTihbBnl34w",
                    "chapter": 22,
                    "type": "video",
                    "title": "Why Good Divisions Make Bad Decisions",
                    "description": "Review Why Good Divisions Make Bad Decisions for the Chapter 22 learning objectives it covers.",
                    "url": "https://wjbyrd.screencasthost.com/watch/cTihbBnl34w",
                    "actionLabel": "Watch Video",
                    "external": true,
                    "priority": 1
                },
                {
                    "id": "cTihb7nl3aT",
                    "chapter": 22,
                    "type": "video",
                    "title": "Transfer Pricing and System-Wide Profit",
                    "description": "Review Transfer Pricing and System-Wide Profit for the Chapter 22 learning objectives it covers.",
                    "url": "https://wjbyrd.screencasthost.com/watch/cTihb7nl3aT",
                    "actionLabel": "Watch Video",
                    "external": true,
                    "priority": 1
                },
                {
                    "id": "cTijbJnlv4h",
                    "chapter": 22,
                    "type": "video",
                    "title": "Silos, Teams and the Myth of Autonomy",
                    "description": "Review Silos, Teams and the Myth of Autonomy for the Chapter 22 learning objectives it covers.",
                    "url": "https://wjbyrd.screencasthost.com/watch/cTijbJnlv4h",
                    "actionLabel": "Watch Video",
                    "external": true,
                    "priority": 1
                },
                {
                    "id": "cTijF1nlvz7",
                    "chapter": 22,
                    "type": "video",
                    "title": "Budget Battles and the Cost of Gaming the System",
                    "description": "Review Budget Battles and the Cost of Gaming the System for the Chapter 22 learning objectives it covers.",
                    "url": "https://wjbyrd.screencasthost.com/watch/cTijF1nlvz7",
                    "actionLabel": "Watch Video",
                    "external": true,
                    "priority": 1
                },
                {
                    "id": "chapter-22-lecture-slides",
                    "chapter": 22,
                    "type": "slides",
                    "title": "Chapter 22 Lecture Slides",
                    "description": "Review the official Chapter 22 lecture slides for Getting Divisions to Work in the Firm's Best Interests.",
                    "url": "resources/slides/chapter-22-getting-divisions-to-work-in-the-firms-best-interest.pdf",
                    "actionLabel": "Open Slides",
                    "external": false,
                    "downloadable": true,
                    "priority": 4
                }
            ]
        }
    },
    "objectives": {
        "LO19.1": {
            "chapter": 19,
            "title": "Explain insurance and how it works as a wealth-creating transaction.",
            "resourceIds": [
                "pUkRo9COd38",
                "sXPXpJ5vMnU",
                "cZhVYtVMBVw",
                "chapter-19-lecture-slides"
            ]
        },
        "LO19.2": {
            "chapter": 19,
            "title": "Define and anticipate adverse selection.",
            "resourceIds": [
                "cZhVYtVMBVw",
                "chapter-19-lecture-slides"
            ]
        },
        "LO19.3": {
            "chapter": 19,
            "title": "Provide solution to the problem of adverse selection.",
            "resourceIds": [
                "cZhVYtVMBVw",
                "chapter-19-lecture-slides"
            ]
        },
        "LO19.4": {
            "chapter": 19,
            "title": "Explain screening and signaling.",
            "resourceIds": [
                "F8ZHZRMSxKg",
                "cZhVYtVMBVw",
                "chapter-19-lecture-slides"
            ]
        },
        "LO19.5": {
            "chapter": 19,
            "title": "Explain how online auction and sale sites address adverse selection.",
            "resourceIds": [
                "chapter-19-lecture-slides"
            ]
        },
        "LO20.1": {
            "chapter": 20,
            "title": "Define moral hazard and explain how it is different from adverse selection.",
            "resourceIds": [
                "5v7TWKlYoN0",
                "cZhVqLVMA94",
                "chapter-20-lecture-slides"
            ]
        },
        "LO20.2": {
            "chapter": 20,
            "title": "Identify how to anticipate moral hazard and consummate the implied wealth-creating transaction.",
            "resourceIds": [
                "5v7TWKlYoN0",
                "cZhVqLVMA94",
                "chapter-20-lecture-slides"
            ]
        },
        "LO20.3": {
            "chapter": 20,
            "title": "Identify solutions to the problem of moral hazard centering on efforts to eliminate information asymmetry.",
            "resourceIds": [
                "6faL76QZ2AA",
                "cZhVqLVMA94",
                "chapter-20-lecture-slides"
            ]
        },
        "LO20.4": {
            "chapter": 20,
            "title": "Describe shirking as a form of moral hazard.",
            "resourceIds": [
                "6faL76QZ2AA",
                "cZhVqLVMA94",
                "chapter-20-lecture-slides"
            ]
        },
        "LO20.5": {
            "chapter": 20,
            "title": "Explain moral hazard in the context of lending.",
            "resourceIds": [
                "cZhVqLVMA94",
                "chapter-20-lecture-slides"
            ]
        },
        "LO21.1": {
            "chapter": 21,
            "title": "Describe the principal–agent relationships in incentive conflict.",
            "resourceIds": [
                "cThFDXn61x7",
                "cT1n2nn6KWZ",
                "chapter-21-lecture-slides"
            ]
        },
        "LO21.2": {
            "chapter": 21,
            "title": "Explain how the incentive conflict between principals and agents along with information asymmetry leads to moral hazard and adverse selection.",
            "resourceIds": [
                "cThFDXn61x7",
                "cT1n2nn6KWZ",
                "chapter-21-lecture-slides"
            ]
        },
        "LO21.3": {
            "chapter": 21,
            "title": "Describe how to reduce the costs of controlling incentive conflict and the three alternatives to controlling principal-agent conflicts.",
            "resourceIds": [
                "cT1n2nn6KWZ",
                "chapter-21-lecture-slides"
            ]
        },
        "LO21.4": {
            "chapter": 21,
            "title": "Identify the necessary factors for making decisions in a decentralized and centralized organization structure.",
            "resourceIds": [
                "cT1n2nn6KWZ",
                "chapter-21-lecture-slides"
            ]
        },
        "LO21.5": {
            "chapter": 21,
            "title": "Identify how agents may game incentives and how to foresee how incentives may be gamed.",
            "resourceIds": [
                "cT1n2nn6KWZ",
                "chapter-21-lecture-slides"
            ]
        },
        "LO21.6": {
            "chapter": 21,
            "title": "Analyze principal-agent conflicts by focusing on key questions and describe three approaches to controlling incentive conflicts.",
            "resourceIds": [
                "cT1n2nn6KWZ",
                "chapter-21-lecture-slides"
            ]
        },
        "LO22.1": {
            "chapter": 22,
            "title": "Know the ulterior motto of parent companies.",
            "resourceIds": [
                "cTihb7nl3aT",
                "cTihbBnl34w",
                "chapter-22-lecture-slides"
            ]
        },
        "LO22.2": {
            "chapter": 22,
            "title": "Describe transfer pricing and explain its importance.",
            "resourceIds": [
                "cTihb7nl3aT",
                "chapter-22-lecture-slides"
            ]
        },
        "LO22.3": {
            "chapter": 22,
            "title": "Define profit center and cost center.",
            "resourceIds": [
                "cTihbBnl34w",
                "chapter-22-lecture-slides"
            ]
        },
        "LO22.4": {
            "chapter": 22,
            "title": "Describe the advantages of having functional units.",
            "resourceIds": [
                "cTijbJnlv4h",
                "chapter-22-lecture-slides"
            ]
        },
        "LO22.5": {
            "chapter": 22,
            "title": "Explain the importance of coordination between various functional divisions.",
            "resourceIds": [
                "cTijbJnlv4h",
                "cTihbBnl34w",
                "chapter-22-lecture-slides"
            ]
        },
        "LO22.6": {
            "chapter": 22,
            "title": "Describe multidivisional structure.",
            "resourceIds": [
                "cTijbJnlv4h",
                "cTihb7nl3aT",
                "chapter-22-lecture-slides"
            ]
        },
        "LO22.7": {
            "chapter": 22,
            "title": "Explain budget games played by division managers.",
            "resourceIds": [
                "cTijF1nlvz7",
                "chapter-22-lecture-slides"
            ]
        }
    }
};
    global.AGENCY_PROTOCOL_INSTRUCTIONAL_RESOURCES = catalog;
    if (!global.INSTRUCTIONAL_RESOURCES) global.INSTRUCTIONAL_RESOURCES = catalog;
}(window));
