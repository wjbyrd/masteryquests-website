/* Student-facing instructional resource catalog. */
(function registerInstructionalResources(global){
  "use strict";
  const catalog = {
  "gameIdentifier": "exchange-citadel",
  "settings": {
    "maximumRecommendations": 3,
    "exactObjectiveMatchFirst": true,
    "chapterFallbackEnabled": true
  },
  "chapters": {
    "6": {
      "title": "Chapter 6",
      "resourceIds": [
        "video-c0XrFPVG7TU",
        "video-c3f0bpVY35I",
        "video-c3hhlRVYNHG",
        "video-c0X3qhVGNXq",
        "video-c0X3quVGNoz",
        "video-c0X3qPVGNrq",
        "video-c3fXbLVq7Y3",
        "slides-chapter-6"
      ],
      "fallbackResourceIds": [
        "video-c0X3qhVGNXq",
        "video-c0X3quVGNoz",
        "video-c3hhlRVYNHG",
        "video-c0XrFPVG7TU",
        "video-c3f0bpVY35I",
        "video-c0X3qPVGNrq",
        "video-c3fXbLVq7Y3",
        "slides-chapter-6"
      ]
    },
    "14": {
      "title": "Chapter 14",
      "resourceIds": [
        "video-c0XZYyVGWDk",
        "video-c0XZYNVGWF0",
        "video-c0XT2uVmcew",
        "video-c0XT2GVmcf2",
        "video-c0XTFyVmcFk",
        "video-c0XTFNVmcYl",
        "video-c3hjomVrcN8",
        "slides-chapter-14"
      ],
      "fallbackResourceIds": [
        "video-c0XTFyVmcFk",
        "video-c0XZYNVGWF0",
        "video-c0XZYyVGWDk",
        "video-c0XTFNVmcYl",
        "video-c0XT2uVmcew",
        "video-c0XT2GVmcf2",
        "video-c3hjomVrcN8",
        "slides-chapter-14"
      ]
    }
  },
  "resources": [
    {
      "id": "video-c0XrFPVG7TU",
      "title": "Net Capital Outflows",
      "description": "Lecture video for Chapter 6.",
      "type": "lecture-video",
      "typeLabel": "Lecture video",
      "url": "https://wjbyrd.screencasthost.com/watch/c0XrFPVG7TU",
      "chapter": 6,
      "objectiveIds": [
        "LO6.1"
      ],
      "priority": 10,
      "actionLabel": "Watch Video"
    },
    {
      "id": "video-c3f0bpVY35I",
      "title": "Real Exchange Rates",
      "description": "Lecture video for Chapter 6.",
      "type": "lecture-video",
      "typeLabel": "Lecture video",
      "url": "https://wjbyrd.screencasthost.com/watch/c3f0bpVY35I",
      "chapter": 6,
      "objectiveIds": [
        "LO6.4"
      ],
      "priority": 10,
      "actionLabel": "Watch Video"
    },
    {
      "id": "video-c3hhlRVYNHG",
      "title": "Real Exchange Rates and Net Exports",
      "description": "Lecture video for Chapter 6.",
      "type": "lecture-video",
      "typeLabel": "Lecture video",
      "url": "https://wjbyrd.screencasthost.com/watch/c3hhlRVYNHG",
      "chapter": 6,
      "objectiveIds": [
        "LO6.2",
        "LO6.4"
      ],
      "priority": 10,
      "actionLabel": "Watch Video"
    },
    {
      "id": "video-c0X3qhVGNXq",
      "title": "Fiscal Policy and Real Exchange Rates",
      "description": "Lecture video for Chapter 6.",
      "type": "lecture-video",
      "typeLabel": "Lecture video",
      "url": "https://wjbyrd.screencasthost.com/watch/c0X3qhVGNXq",
      "chapter": 6,
      "objectiveIds": [
        "LO6.3",
        "LO6.5"
      ],
      "priority": 10,
      "actionLabel": "Watch Video"
    },
    {
      "id": "video-c0X3quVGNoz",
      "title": "Investment Demand, Trade, and Real Exchange Rates",
      "description": "Lecture video for Chapter 6.",
      "type": "lecture-video",
      "typeLabel": "Lecture video",
      "url": "https://wjbyrd.screencasthost.com/watch/c0X3quVGNoz",
      "chapter": 6,
      "objectiveIds": [
        "LO6.4",
        "LO6.5"
      ],
      "priority": 10,
      "actionLabel": "Watch Video"
    },
    {
      "id": "video-c0X3qPVGNrq",
      "title": "The Large Open Economy",
      "description": "Lecture video for Chapter 6.",
      "type": "lecture-video",
      "typeLabel": "Lecture video",
      "url": "https://wjbyrd.screencasthost.com/watch/c0X3qPVGNrq",
      "chapter": 6,
      "objectiveIds": [
        "LO6.5"
      ],
      "priority": 10,
      "actionLabel": "Watch Video"
    },
    {
      "id": "video-c3fXbLVq7Y3",
      "title": "Chapter 6 Worked Problems",
      "description": "Worked-problem video for Chapter 6.",
      "type": "worked-problem-video",
      "typeLabel": "Worked-problem video",
      "url": "https://wjbyrd.screencasthost.com/watch/c3fXbLVq7Y3",
      "chapter": 6,
      "objectiveIds": [
        "LO6.1",
        "LO6.2",
        "LO6.3",
        "LO6.4",
        "LO6.5"
      ],
      "priority": 30,
      "actionLabel": "Watch Worked Problems"
    },
    {
      "id": "video-c0XZYyVGWDk",
      "title": "The Mundell-Fleming Model",
      "description": "Lecture video for Chapter 14.",
      "type": "lecture-video",
      "typeLabel": "Lecture video",
      "url": "https://wjbyrd.screencasthost.com/watch/c0XZYyVGWDk",
      "chapter": 14,
      "objectiveIds": [
        "LO14.1",
        "LO14.2"
      ],
      "priority": 10,
      "actionLabel": "Watch Video"
    },
    {
      "id": "video-c0XZYNVGWF0",
      "title": "Floating Exchange Rates and Fiscal Policy",
      "description": "Lecture video for Chapter 14.",
      "type": "lecture-video",
      "typeLabel": "Lecture video",
      "url": "https://wjbyrd.screencasthost.com/watch/c0XZYNVGWF0",
      "chapter": 14,
      "objectiveIds": [
        "LO14.1",
        "LO14.4"
      ],
      "priority": 10,
      "actionLabel": "Watch Video"
    },
    {
      "id": "video-c0XT2uVmcew",
      "title": "Floating Exchange Rates and Monetary Policy",
      "description": "Lecture video for Chapter 14.",
      "type": "lecture-video",
      "typeLabel": "Lecture video",
      "url": "https://wjbyrd.screencasthost.com/watch/c0XT2uVmcew",
      "chapter": 14,
      "objectiveIds": [
        "LO14.1"
      ],
      "priority": 10,
      "actionLabel": "Watch Video"
    },
    {
      "id": "video-c0XT2GVmcf2",
      "title": "Floating Exchange Rates and Trade Restrictions",
      "description": "Lecture video for Chapter 14.",
      "type": "lecture-video",
      "typeLabel": "Lecture video",
      "url": "https://wjbyrd.screencasthost.com/watch/c0XT2GVmcf2",
      "chapter": 14,
      "objectiveIds": [
        "LO14.4"
      ],
      "priority": 10,
      "actionLabel": "Watch Video"
    },
    {
      "id": "video-c0XTFyVmcFk",
      "title": "Consumer Preferences and Money Demand",
      "description": "Lecture video for Chapter 14.",
      "type": "lecture-video",
      "typeLabel": "Lecture video",
      "url": "https://wjbyrd.screencasthost.com/watch/c0XTFyVmcFk",
      "chapter": 14,
      "objectiveIds": [
        "LO14.1",
        "LO14.2"
      ],
      "priority": 10,
      "actionLabel": "Watch Video"
    },
    {
      "id": "video-c0XTFNVmcYl",
      "title": "Aggregate Demand and Aggregate Supply",
      "description": "Lecture video for Chapter 14.",
      "type": "lecture-video",
      "typeLabel": "Lecture video",
      "url": "https://wjbyrd.screencasthost.com/watch/c0XTFNVmcYl",
      "chapter": 14,
      "objectiveIds": [
        "LO14.4"
      ],
      "priority": 10,
      "actionLabel": "Watch Video"
    },
    {
      "id": "video-c3hjomVrcN8",
      "title": "Chapter 14 Worked Problems",
      "description": "Worked-problem video for Chapter 14.",
      "type": "worked-problem-video",
      "typeLabel": "Worked-problem video",
      "url": "https://wjbyrd.screencasthost.com/watch/c3hjomVrcN8",
      "chapter": 14,
      "objectiveIds": [
        "LO14.1",
        "LO14.2",
        "LO14.3",
        "LO14.4"
      ],
      "priority": 30,
      "actionLabel": "Watch Worked Problems"
    },
    {
      "id": "slides-chapter-14",
      "title": "Chapter 14 Lecture Slides",
      "description": "Lecture slides for Chapter 14.",
      "type": "lecture-slides",
      "typeLabel": "Lecture slides",
      "url": "resources/slides/chapter-14-the-open-economy-revisited.pdf",
      "chapter": 14,
      "objectiveIds": [],
      "priority": 40,
      "actionLabel": "Open Slides"
    },
    {
      "id": "slides-chapter-6",
      "title": "Chapter 6 Lecture Slides",
      "description": "Lecture slides for Chapter 6.",
      "type": "lecture-slides",
      "typeLabel": "Lecture slides",
      "url": "resources/slides/chapter-6-the-open-economy.pdf",
      "chapter": 6,
      "objectiveIds": [],
      "priority": 40,
      "actionLabel": "Open Slides"
    }
  ],
  "objectiveMappings": {
    "LO6.1": {
      "title": "LO6.1",
      "chapter": 6,
      "resourceIds": [
        "video-c0XrFPVG7TU",
        "video-c3fXbLVq7Y3"
      ],
      "fallbackResourceIds": [
        "video-c0X3qhVGNXq",
        "video-c0X3quVGNoz",
        "video-c3hhlRVYNHG",
        "video-c0XrFPVG7TU",
        "video-c3f0bpVY35I",
        "video-c0X3qPVGNrq",
        "video-c3fXbLVq7Y3",
        "slides-chapter-6"
      ]
    },
    "LO6.4": {
      "title": "LO6.4",
      "chapter": 6,
      "resourceIds": [
        "video-c3f0bpVY35I",
        "video-c0X3quVGNoz",
        "video-c3hhlRVYNHG",
        "video-c3fXbLVq7Y3"
      ],
      "fallbackResourceIds": [
        "video-c0X3qhVGNXq",
        "video-c0X3quVGNoz",
        "video-c3hhlRVYNHG",
        "video-c0XrFPVG7TU",
        "video-c3f0bpVY35I",
        "video-c0X3qPVGNrq",
        "video-c3fXbLVq7Y3",
        "slides-chapter-6"
      ]
    },
    "LO6.2": {
      "title": "LO6.2",
      "chapter": 6,
      "resourceIds": [
        "video-c3hhlRVYNHG",
        "video-c3fXbLVq7Y3"
      ],
      "fallbackResourceIds": [
        "video-c0X3qhVGNXq",
        "video-c0X3quVGNoz",
        "video-c3hhlRVYNHG",
        "video-c0XrFPVG7TU",
        "video-c3f0bpVY35I",
        "video-c0X3qPVGNrq",
        "video-c3fXbLVq7Y3",
        "slides-chapter-6"
      ]
    },
    "LO6.3": {
      "title": "LO6.3",
      "chapter": 6,
      "resourceIds": [
        "video-c0X3qhVGNXq",
        "video-c3fXbLVq7Y3"
      ],
      "fallbackResourceIds": [
        "video-c0X3qhVGNXq",
        "video-c0X3quVGNoz",
        "video-c3hhlRVYNHG",
        "video-c0XrFPVG7TU",
        "video-c3f0bpVY35I",
        "video-c0X3qPVGNrq",
        "video-c3fXbLVq7Y3",
        "slides-chapter-6"
      ]
    },
    "LO6.5": {
      "title": "LO6.5",
      "chapter": 6,
      "resourceIds": [
        "video-c0X3qPVGNrq",
        "video-c0X3qhVGNXq",
        "video-c0X3quVGNoz",
        "video-c3fXbLVq7Y3"
      ],
      "fallbackResourceIds": [
        "video-c0X3qhVGNXq",
        "video-c0X3quVGNoz",
        "video-c3hhlRVYNHG",
        "video-c0XrFPVG7TU",
        "video-c3f0bpVY35I",
        "video-c0X3qPVGNrq",
        "video-c3fXbLVq7Y3",
        "slides-chapter-6"
      ]
    },
    "LO14.1": {
      "title": "LO14.1",
      "chapter": 14,
      "resourceIds": [
        "video-c0XT2uVmcew",
        "video-c0XTFyVmcFk",
        "video-c0XZYNVGWF0",
        "video-c0XZYyVGWDk",
        "video-c3hjomVrcN8"
      ],
      "fallbackResourceIds": [
        "video-c0XTFyVmcFk",
        "video-c0XZYNVGWF0",
        "video-c0XZYyVGWDk",
        "video-c0XTFNVmcYl",
        "video-c0XT2uVmcew",
        "video-c0XT2GVmcf2",
        "video-c3hjomVrcN8",
        "slides-chapter-14"
      ]
    },
    "LO14.2": {
      "title": "LO14.2",
      "chapter": 14,
      "resourceIds": [
        "video-c0XTFyVmcFk",
        "video-c0XZYyVGWDk",
        "video-c3hjomVrcN8"
      ],
      "fallbackResourceIds": [
        "video-c0XTFyVmcFk",
        "video-c0XZYNVGWF0",
        "video-c0XZYyVGWDk",
        "video-c0XTFNVmcYl",
        "video-c0XT2uVmcew",
        "video-c0XT2GVmcf2",
        "video-c3hjomVrcN8",
        "slides-chapter-14"
      ]
    },
    "LO14.4": {
      "title": "LO14.4",
      "chapter": 14,
      "resourceIds": [
        "video-c0XTFNVmcYl",
        "video-c0XT2GVmcf2",
        "video-c0XZYNVGWF0",
        "video-c3hjomVrcN8"
      ],
      "fallbackResourceIds": [
        "video-c0XTFyVmcFk",
        "video-c0XZYNVGWF0",
        "video-c0XZYyVGWDk",
        "video-c0XTFNVmcYl",
        "video-c0XT2uVmcew",
        "video-c0XT2GVmcf2",
        "video-c3hjomVrcN8",
        "slides-chapter-14"
      ]
    },
    "LO14.3": {
      "title": "LO14.3",
      "chapter": 14,
      "resourceIds": [
        "video-c3hjomVrcN8"
      ],
      "fallbackResourceIds": [
        "video-c0XTFyVmcFk",
        "video-c0XZYNVGWF0",
        "video-c0XZYyVGWDk",
        "video-c0XTFNVmcYl",
        "video-c0XT2uVmcew",
        "video-c0XT2GVmcf2",
        "video-c3hjomVrcN8",
        "slides-chapter-14"
      ]
    }
  },
  "fallbackResourceIds": {
    "6": [
      "video-c0X3qhVGNXq",
      "video-c0X3quVGNoz",
      "video-c3hhlRVYNHG",
      "video-c0XrFPVG7TU",
      "video-c3f0bpVY35I",
      "video-c0X3qPVGNrq",
      "video-c3fXbLVq7Y3",
      "slides-chapter-6"
    ],
    "14": [
      "video-c0XTFyVmcFk",
      "video-c0XZYNVGWF0",
      "video-c0XZYyVGWDk",
      "video-c0XTFNVmcYl",
      "video-c0XT2uVmcew",
      "video-c0XT2GVmcf2",
      "video-c3hjomVrcN8",
      "slides-chapter-14"
    ]
  }
};
  global.EXCHANGE_CITADEL_INSTRUCTIONAL_RESOURCES = catalog;
  global.INSTRUCTIONAL_RESOURCES = catalog;
})(window);
