/* Student-facing instructional resource catalog. */
(function registerInstructionalResources(global){
  "use strict";
  const catalog = {
  "gameIdentifier": "mint-ash-gold",
  "settings": {
    "maximumRecommendations": 3,
    "exactObjectiveMatchFirst": true,
    "chapterFallbackEnabled": true
  },
  "chapters": {
    "4": {
      "title": "Chapter 4",
      "resourceIds": [
        "video-c0fe2vVaT9t",
        "video-c0febsVaOzu",
        "video-c3Vn0AVojm5",
        "slides-chapter-4"
      ],
      "fallbackResourceIds": [
        "video-c0febsVaOzu",
        "video-c0fe2vVaT9t",
        "video-c3Vn0AVojm5",
        "slides-chapter-4"
      ]
    },
    "5": {
      "title": "Chapter 5",
      "resourceIds": [
        "video-rljbCV2qcO",
        "video-cTX6YxnFEfv",
        "video-c3fjIuVqEjp",
        "video-c3VDbdVoGec",
        "slides-chapter-5"
      ],
      "fallbackResourceIds": [
        "video-c3fjIuVqEjp",
        "video-rljbCV2qcO",
        "video-cTX6YxnFEfv",
        "video-c3VDbdVoGec",
        "slides-chapter-5"
      ]
    },
    "8": {
      "title": "Chapter 8",
      "resourceIds": [
        "video-c0f6YFVaE3c",
        "video-cT6vDunFXcp",
        "video-c0fXlfVambw",
        "video-cTQoqGnodLO",
        "slides-chapter-8"
      ],
      "fallbackResourceIds": [
        "video-c0f6YFVaE3c",
        "video-c0fXlfVambw",
        "video-cT6vDunFXcp",
        "video-cTQoqGnodLO",
        "slides-chapter-8"
      ]
    },
    "11": {
      "title": "Chapter 11",
      "resourceIds": [
        "video-crlicsV2IVp",
        "video-crlibBV2o4X",
        "video-crliqTV2oLX",
        "video-crlVoJVIRb7",
        "video-crlw3xVoien",
        "slides-chapter-11"
      ],
      "fallbackResourceIds": [
        "video-crlVoJVIRb7",
        "video-crlicsV2IVp",
        "video-crliqTV2oLX",
        "video-crlibBV2o4X",
        "video-crlw3xVoien",
        "slides-chapter-11"
      ]
    }
  },
  "resources": [
    {
      "id": "video-c0fe2vVaT9t",
      "title": "Bank Capital and Leverage",
      "description": "Lecture video for Chapter 4.",
      "type": "lecture-video",
      "typeLabel": "Lecture video",
      "url": "https://wjbyrd.screencasthost.com/watch/c0fe2vVaT9t",
      "chapter": 4,
      "objectiveIds": [
        "LO4.2"
      ],
      "priority": 10,
      "actionLabel": "Watch Video"
    },
    {
      "id": "video-c0febsVaOzu",
      "title": "The Money Supply",
      "description": "Lecture video for Chapter 4.",
      "type": "lecture-video",
      "typeLabel": "Lecture video",
      "url": "https://wjbyrd.screencasthost.com/watch/c0febsVaOzu",
      "chapter": 4,
      "objectiveIds": [
        "LO4.1",
        "LO4.2",
        "LO4.3"
      ],
      "priority": 10,
      "actionLabel": "Watch Video"
    },
    {
      "id": "video-c3Vn0AVojm5",
      "title": "Chapter 4 Worked Problems",
      "description": "Worked-problem video for Chapter 4.",
      "type": "worked-problem-video",
      "typeLabel": "Worked-problem video",
      "url": "https://wjbyrd.screencasthost.com/watch/c3Vn0AVojm5",
      "chapter": 4,
      "objectiveIds": [
        "LO4.1",
        "LO4.2",
        "LO4.3"
      ],
      "priority": 30,
      "actionLabel": "Watch Worked Problems"
    },
    {
      "id": "video-rljbCV2qcO",
      "title": "Quantity Equation",
      "description": "Lecture video for Chapter 5.",
      "type": "lecture-video",
      "typeLabel": "Lecture video",
      "url": "https://wjbyrd.screencasthost.com/watch/crljbCV2qcO",
      "chapter": 5,
      "objectiveIds": [
        "LO5.1",
        "LO5.3"
      ],
      "priority": 10,
      "actionLabel": "Watch Video"
    },
    {
      "id": "video-cTX6YxnFEfv",
      "title": "Interest Rates",
      "description": "Lecture video for Chapter 5.",
      "type": "lecture-video",
      "typeLabel": "Lecture video",
      "url": "https://wjbyrd.screencasthost.com/watch/cTX6YxnFEfv",
      "chapter": 5,
      "objectiveIds": [
        "LO5.2"
      ],
      "priority": 10,
      "actionLabel": "Watch Video"
    },
    {
      "id": "video-c3fjIuVqEjp",
      "title": "Costs of Inflation",
      "description": "Lecture video for Chapter 5.",
      "type": "lecture-video",
      "typeLabel": "Lecture video",
      "url": "https://wjbyrd.screencasthost.com/watch/c3fjIuVqEjp",
      "chapter": 5,
      "objectiveIds": [
        "LO5.2",
        "LO5.4"
      ],
      "priority": 10,
      "actionLabel": "Watch Video"
    },
    {
      "id": "video-c3VDbdVoGec",
      "title": "Chapter 5 Worked Problems",
      "description": "Worked-problem video for Chapter 5.",
      "type": "worked-problem-video",
      "typeLabel": "Worked-problem video",
      "url": "https://wjbyrd.screencasthost.com/watch/c3VDbdVoGec",
      "chapter": 5,
      "objectiveIds": [
        "LO5.1",
        "LO5.3"
      ],
      "priority": 30,
      "actionLabel": "Watch Worked Problems"
    },
    {
      "id": "video-c0f6YFVaE3c",
      "title": "The Solow Growth Model",
      "description": "Lecture video for Chapter 8.",
      "type": "lecture-video",
      "typeLabel": "Lecture video",
      "url": "https://wjbyrd.screencasthost.com/watch/c0f6YFVaE3c",
      "chapter": 8,
      "objectiveIds": [
        "LO8.1",
        "LO8.2"
      ],
      "priority": 10,
      "actionLabel": "Watch Video"
    },
    {
      "id": "video-cT6vDunFXcp",
      "title": "The Catch-Up Effect",
      "description": "Lecture video for Chapter 8.",
      "type": "lecture-video",
      "typeLabel": "Lecture video",
      "url": "https://wjbyrd.screencasthost.com/watch/cT6vDunFXcp",
      "chapter": 8,
      "objectiveIds": [
        "LO8.2"
      ],
      "priority": 10,
      "actionLabel": "Watch Video"
    },
    {
      "id": "video-c0fXlfVambw",
      "title": "The Steady-State",
      "description": "Lecture video for Chapter 8.",
      "type": "lecture-video",
      "typeLabel": "Lecture video",
      "url": "https://wjbyrd.screencasthost.com/watch/c0fXlfVambw",
      "chapter": 8,
      "objectiveIds": [
        "LO8.1",
        "LO8.2"
      ],
      "priority": 10,
      "actionLabel": "Watch Video"
    },
    {
      "id": "video-cTQoqGnodLO",
      "title": "Chapter 8 Worked Problems",
      "description": "Worked-problem video for Chapter 8.",
      "type": "worked-problem-video",
      "typeLabel": "Worked-problem video",
      "url": "https://wjbyrd.screencasthost.com/watch/cTQoqGnodLO",
      "chapter": 8,
      "objectiveIds": [
        "LO8.1",
        "LO8.2"
      ],
      "priority": 30,
      "actionLabel": "Watch Worked Problems"
    },
    {
      "id": "video-crlicsV2IVp",
      "title": "Aggregate Demand",
      "description": "Lecture video for Chapter 11.",
      "type": "lecture-video",
      "typeLabel": "Lecture video",
      "url": "https://wjbyrd.screencasthost.com/watch/crlicsV2IVp",
      "chapter": 11,
      "objectiveIds": [
        "LO11.2"
      ],
      "priority": 10,
      "actionLabel": "Watch Video"
    },
    {
      "id": "video-crlibBV2o4X",
      "title": "Short-Run Aggregate Supply",
      "description": "Lecture video for Chapter 11.",
      "type": "lecture-video",
      "typeLabel": "Lecture video",
      "url": "https://wjbyrd.screencasthost.com/watch/crlibBV2o4X",
      "chapter": 11,
      "objectiveIds": [
        "LO11.1"
      ],
      "priority": 10,
      "actionLabel": "Watch Video"
    },
    {
      "id": "video-crliqTV2oLX",
      "title": "Long-Run Aggregate Supply",
      "description": "Lecture video for Chapter 11.",
      "type": "lecture-video",
      "typeLabel": "Lecture video",
      "url": "https://wjbyrd.screencasthost.com/watch/crliqTV2oLX",
      "chapter": 11,
      "objectiveIds": [
        "LO11.1"
      ],
      "priority": 10,
      "actionLabel": "Watch Video"
    },
    {
      "id": "video-crlVoJVIRb7",
      "title": "Aggregate Demand and Aggregate Supply",
      "description": "Lecture video for Chapter 11.",
      "type": "lecture-video",
      "typeLabel": "Lecture video",
      "url": "https://wjbyrd.screencasthost.com/watch/crlVoJVIRb7",
      "chapter": 11,
      "objectiveIds": [
        "LO11.1",
        "LO11.2",
        "LO11.3"
      ],
      "priority": 10,
      "actionLabel": "Watch Video"
    },
    {
      "id": "video-crlw3xVoien",
      "title": "Chapter 11 Worked Problems",
      "description": "Worked-problem video for Chapter 11.",
      "type": "worked-problem-video",
      "typeLabel": "Worked-problem video",
      "url": "https://wjbyrd.screencasthost.com/watch/crlw3xVoien",
      "chapter": 11,
      "objectiveIds": [
        "LO11.1",
        "LO11.2",
        "LO11.3"
      ],
      "priority": 30,
      "actionLabel": "Watch Worked Problems"
    },
    {
      "id": "slides-chapter-11",
      "title": "Chapter 11 Lecture Slides",
      "description": "Lecture slides for Chapter 11.",
      "type": "lecture-slides",
      "typeLabel": "Lecture slides",
      "url": "resources/slides/chapter-11-introduction-to-economic-fluctuations.pdf",
      "chapter": 11,
      "objectiveIds": [],
      "priority": 40,
      "actionLabel": "Open Slides"
    },
    {
      "id": "slides-chapter-4",
      "title": "Chapter 4 Lecture Slides",
      "description": "Lecture slides for Chapter 4.",
      "type": "lecture-slides",
      "typeLabel": "Lecture slides",
      "url": "resources/slides/chapter-4-the-monetary-system.pdf",
      "chapter": 4,
      "objectiveIds": [],
      "priority": 40,
      "actionLabel": "Open Slides"
    },
    {
      "id": "slides-chapter-5",
      "title": "Chapter 5 Lecture Slides",
      "description": "Lecture slides for Chapter 5.",
      "type": "lecture-slides",
      "typeLabel": "Lecture slides",
      "url": "resources/slides/chapter-5-Inflation-its-causes-effects-and-social-costs.pdf",
      "chapter": 5,
      "objectiveIds": [],
      "priority": 40,
      "actionLabel": "Open Slides"
    },
    {
      "id": "slides-chapter-8",
      "title": "Chapter 8 Lecture Slides",
      "description": "Lecture slides for Chapter 8.",
      "type": "lecture-slides",
      "typeLabel": "Lecture slides",
      "url": "resources/slides/chapter-8-economic-growth-1.pdf",
      "chapter": 8,
      "objectiveIds": [],
      "priority": 40,
      "actionLabel": "Open Slides"
    }
  ],
  "objectiveMappings": {
    "LO4.2": {
      "title": "LO4.2",
      "chapter": 4,
      "resourceIds": [
        "video-c0fe2vVaT9t",
        "video-c0febsVaOzu",
        "video-c3Vn0AVojm5"
      ],
      "fallbackResourceIds": [
        "video-c0febsVaOzu",
        "video-c0fe2vVaT9t",
        "video-c3Vn0AVojm5",
        "slides-chapter-4"
      ]
    },
    "LO4.1": {
      "title": "LO4.1",
      "chapter": 4,
      "resourceIds": [
        "video-c0febsVaOzu",
        "video-c3Vn0AVojm5"
      ],
      "fallbackResourceIds": [
        "video-c0febsVaOzu",
        "video-c0fe2vVaT9t",
        "video-c3Vn0AVojm5",
        "slides-chapter-4"
      ]
    },
    "LO4.3": {
      "title": "LO4.3",
      "chapter": 4,
      "resourceIds": [
        "video-c0febsVaOzu",
        "video-c3Vn0AVojm5"
      ],
      "fallbackResourceIds": [
        "video-c0febsVaOzu",
        "video-c0fe2vVaT9t",
        "video-c3Vn0AVojm5",
        "slides-chapter-4"
      ]
    },
    "LO5.1": {
      "title": "LO5.1",
      "chapter": 5,
      "resourceIds": [
        "video-rljbCV2qcO",
        "video-c3VDbdVoGec"
      ],
      "fallbackResourceIds": [
        "video-c3fjIuVqEjp",
        "video-rljbCV2qcO",
        "video-cTX6YxnFEfv",
        "video-c3VDbdVoGec",
        "slides-chapter-5"
      ]
    },
    "LO5.3": {
      "title": "LO5.3",
      "chapter": 5,
      "resourceIds": [
        "video-rljbCV2qcO",
        "video-c3VDbdVoGec"
      ],
      "fallbackResourceIds": [
        "video-c3fjIuVqEjp",
        "video-rljbCV2qcO",
        "video-cTX6YxnFEfv",
        "video-c3VDbdVoGec",
        "slides-chapter-5"
      ]
    },
    "LO5.2": {
      "title": "LO5.2",
      "chapter": 5,
      "resourceIds": [
        "video-cTX6YxnFEfv",
        "video-c3fjIuVqEjp"
      ],
      "fallbackResourceIds": [
        "video-c3fjIuVqEjp",
        "video-rljbCV2qcO",
        "video-cTX6YxnFEfv",
        "video-c3VDbdVoGec",
        "slides-chapter-5"
      ]
    },
    "LO5.4": {
      "title": "LO5.4",
      "chapter": 5,
      "resourceIds": [
        "video-c3fjIuVqEjp"
      ],
      "fallbackResourceIds": [
        "video-c3fjIuVqEjp",
        "video-rljbCV2qcO",
        "video-cTX6YxnFEfv",
        "video-c3VDbdVoGec",
        "slides-chapter-5"
      ]
    },
    "LO8.1": {
      "title": "LO8.1",
      "chapter": 8,
      "resourceIds": [
        "video-c0f6YFVaE3c",
        "video-c0fXlfVambw",
        "video-cTQoqGnodLO"
      ],
      "fallbackResourceIds": [
        "video-c0f6YFVaE3c",
        "video-c0fXlfVambw",
        "video-cT6vDunFXcp",
        "video-cTQoqGnodLO",
        "slides-chapter-8"
      ]
    },
    "LO8.2": {
      "title": "LO8.2",
      "chapter": 8,
      "resourceIds": [
        "video-cT6vDunFXcp",
        "video-c0f6YFVaE3c",
        "video-c0fXlfVambw",
        "video-cTQoqGnodLO"
      ],
      "fallbackResourceIds": [
        "video-c0f6YFVaE3c",
        "video-c0fXlfVambw",
        "video-cT6vDunFXcp",
        "video-cTQoqGnodLO",
        "slides-chapter-8"
      ]
    },
    "LO11.2": {
      "title": "LO11.2",
      "chapter": 11,
      "resourceIds": [
        "video-crlicsV2IVp",
        "video-crlVoJVIRb7",
        "video-crlw3xVoien"
      ],
      "fallbackResourceIds": [
        "video-crlVoJVIRb7",
        "video-crlicsV2IVp",
        "video-crliqTV2oLX",
        "video-crlibBV2o4X",
        "video-crlw3xVoien",
        "slides-chapter-11"
      ]
    },
    "LO11.1": {
      "title": "LO11.1",
      "chapter": 11,
      "resourceIds": [
        "video-crliqTV2oLX",
        "video-crlibBV2o4X",
        "video-crlVoJVIRb7",
        "video-crlw3xVoien"
      ],
      "fallbackResourceIds": [
        "video-crlVoJVIRb7",
        "video-crlicsV2IVp",
        "video-crliqTV2oLX",
        "video-crlibBV2o4X",
        "video-crlw3xVoien",
        "slides-chapter-11"
      ]
    },
    "LO11.3": {
      "title": "LO11.3",
      "chapter": 11,
      "resourceIds": [
        "video-crlVoJVIRb7",
        "video-crlw3xVoien"
      ],
      "fallbackResourceIds": [
        "video-crlVoJVIRb7",
        "video-crlicsV2IVp",
        "video-crliqTV2oLX",
        "video-crlibBV2o4X",
        "video-crlw3xVoien",
        "slides-chapter-11"
      ]
    }
  },
  "fallbackResourceIds": {
    "4": [
      "video-c0febsVaOzu",
      "video-c0fe2vVaT9t",
      "video-c3Vn0AVojm5",
      "slides-chapter-4"
    ],
    "5": [
      "video-c3fjIuVqEjp",
      "video-rljbCV2qcO",
      "video-cTX6YxnFEfv",
      "video-c3VDbdVoGec",
      "slides-chapter-5"
    ],
    "8": [
      "video-c0f6YFVaE3c",
      "video-c0fXlfVambw",
      "video-cT6vDunFXcp",
      "video-cTQoqGnodLO",
      "slides-chapter-8"
    ],
    "11": [
      "video-crlVoJVIRb7",
      "video-crlicsV2IVp",
      "video-crliqTV2oLX",
      "video-crlibBV2o4X",
      "video-crlw3xVoien",
      "slides-chapter-11"
    ]
  }
};
  global.MINT_ASH_GOLD_INSTRUCTIONAL_RESOURCES = catalog;
  global.INSTRUCTIONAL_RESOURCES = catalog;
})(window);
