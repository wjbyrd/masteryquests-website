/* Student-facing instructional resource catalog. */
(function registerInstructionalResources(global){
  "use strict";
  const catalog = {
  "gameIdentifier": "national-engine",
  "settings": {
    "maximumRecommendations": 3,
    "exactObjectiveMatchFirst": true,
    "chapterFallbackEnabled": true
  },
  "chapters": {
    "2": {
      "title": "Chapter 2",
      "resourceIds": [
        "video-cT6uFGnFe2H",
        "video-cr6toqVlD2g",
        "video-cT6uFCnFeIN",
        "video-cr6Yo5VXNzL",
        "video-crlFY8V2Hua",
        "slides-chapter-2"
      ],
      "fallbackResourceIds": [
        "video-cT6uFGnFe2H",
        "video-cT6uFCnFeIN",
        "video-cr6toqVlD2g",
        "video-cr6Yo5VXNzL",
        "video-crlFY8V2Hua",
        "slides-chapter-2"
      ]
    },
    "3": {
      "title": "Chapter 3",
      "resourceIds": [
        "video-c3e3rIVFNYo",
        "video-c3e0YaVF9dg",
        "video-c3eTFQVqeld",
        "video-c3fVnvVqrEM",
        "video-c3fnbEVqTpw",
        "video-c3VV38VoiHr",
        "slides-chapter-3"
      ],
      "fallbackResourceIds": [
        "video-c3eTFQVqeld",
        "video-c3fnbEVqTpw",
        "video-c3e0YaVF9dg",
        "video-c3e3rIVFNYo",
        "video-c3fVnvVqrEM",
        "video-c3VV38VoiHr",
        "slides-chapter-3"
      ]
    },
    "7": {
      "title": "Chapter 7",
      "resourceIds": [
        "video-c06eruV5tcC",
        "video-cTiYbZnInbF",
        "video-cTiYbEnInFz",
        "video-crlF32V2HyD",
        "slides-chapter-7"
      ],
      "fallbackResourceIds": [
        "video-c06eruV5tcC",
        "video-cTiYbZnInbF",
        "video-cTiYbEnInFz",
        "video-crlF32V2HyD",
        "slides-chapter-7"
      ]
    }
  },
  "resources": [
    {
      "id": "video-cT6uFGnFe2H",
      "title": "Gross Domestic Product",
      "description": "Lecture video for Chapter 2.",
      "type": "lecture-video",
      "typeLabel": "Lecture video",
      "url": "https://wjbyrd.screencasthost.com/watch/cT6uFGnFe2H",
      "chapter": 2,
      "objectiveIds": [
        "LO2.1",
        "LO2.2"
      ],
      "priority": 10,
      "actionLabel": "Watch Video"
    },
    {
      "id": "video-cr6toqVlD2g",
      "title": "Nominal v Real GDP",
      "description": "Lecture video for Chapter 2.",
      "type": "lecture-video",
      "typeLabel": "Lecture video",
      "url": "https://wjbyrd.screencasthost.com/watch/cr6toqVlD2g",
      "chapter": 2,
      "objectiveIds": [
        "LO2.1",
        "LO2.2"
      ],
      "priority": 10,
      "actionLabel": "Watch Video"
    },
    {
      "id": "video-cT6uFCnFeIN",
      "title": "Inflation",
      "description": "Lecture video for Chapter 2.",
      "type": "lecture-video",
      "typeLabel": "Lecture video",
      "url": "https://wjbyrd.screencasthost.com/watch/cT6uFCnFeIN",
      "chapter": 2,
      "objectiveIds": [
        "LO2.1",
        "LO2.2"
      ],
      "priority": 10,
      "actionLabel": "Watch Video"
    },
    {
      "id": "video-cr6Yo5VXNzL",
      "title": "Unemployment and Labor Force Participation Rates",
      "description": "Lecture video for Chapter 2.",
      "type": "lecture-video",
      "typeLabel": "Lecture video",
      "url": "https://wjbyrd.screencasthost.com/watch/cr6Yo5VXNzL",
      "chapter": 2,
      "objectiveIds": [
        "LO2.1",
        "LO2.2"
      ],
      "priority": 10,
      "actionLabel": "Watch Video"
    },
    {
      "id": "video-crlFY8V2Hua",
      "title": "Chapter 2 Worked Problems",
      "description": "Worked-problem video for Chapter 2.",
      "type": "worked-problem-video",
      "typeLabel": "Worked-problem video",
      "url": "https://wjbyrd.screencasthost.com/watch/crlFY8V2Hua",
      "chapter": 2,
      "objectiveIds": [
        "LO2.2"
      ],
      "priority": 30,
      "actionLabel": "Watch Worked Problems"
    },
    {
      "id": "video-c06eruV5tcC",
      "title": "Steady-state Unemployment",
      "description": "Lecture video for Chapter 7.",
      "type": "lecture-video",
      "typeLabel": "Lecture video",
      "url": "https://wjbyrd.screencasthost.com/watch/c06eruV5tcC",
      "chapter": 7,
      "objectiveIds": [
        "LO7.1",
        "LO7.2",
        "LO7.3"
      ],
      "priority": 10,
      "actionLabel": "Watch Video"
    },
    {
      "id": "video-cTiYbZnInbF",
      "title": "Frictional Unemployment",
      "description": "Lecture video for Chapter 7.",
      "type": "lecture-video",
      "typeLabel": "Lecture video",
      "url": "https://wjbyrd.screencasthost.com/watch/cTiYbZnInbF",
      "chapter": 7,
      "objectiveIds": [
        "LO7.1",
        "LO7.3"
      ],
      "priority": 10,
      "actionLabel": "Watch Video"
    },
    {
      "id": "video-cTiYbEnInFz",
      "title": "Structural Unemployment",
      "description": "Lecture video for Chapter 7.",
      "type": "lecture-video",
      "typeLabel": "Lecture video",
      "url": "https://wjbyrd.screencasthost.com/watch/cTiYbEnInFz",
      "chapter": 7,
      "objectiveIds": [
        "LO7.1",
        "LO7.3"
      ],
      "priority": 10,
      "actionLabel": "Watch Video"
    },
    {
      "id": "video-crlF32V2HyD",
      "title": "Chapter 7 Worked Problems",
      "description": "Worked-problem video for Chapter 7.",
      "type": "worked-problem-video",
      "typeLabel": "Worked-problem video",
      "url": "https://wjbyrd.screencasthost.com/watch/crlF32V2HyD",
      "chapter": 7,
      "objectiveIds": [
        "LO7.1",
        "LO7.2",
        "LO7.3"
      ],
      "priority": 30,
      "actionLabel": "Watch Worked Problems"
    },
    {
      "id": "video-c3e3rIVFNYo",
      "title": "Marginal Product of Labor",
      "description": "Lecture video for Chapter 3.",
      "type": "lecture-video",
      "typeLabel": "Lecture video",
      "url": "https://wjbyrd.screencasthost.com/watch/c3e3rIVFNYo",
      "chapter": 3,
      "objectiveIds": [
        "LO3.2"
      ],
      "priority": 10,
      "actionLabel": "Watch Video"
    },
    {
      "id": "video-c3e0YaVF9dg",
      "title": "Marginal Product of Capital",
      "description": "Lecture video for Chapter 3.",
      "type": "lecture-video",
      "typeLabel": "Lecture video",
      "url": "https://wjbyrd.screencasthost.com/watch/c3e0YaVF9dg",
      "chapter": 3,
      "objectiveIds": [
        "LO3.2"
      ],
      "priority": 10,
      "actionLabel": "Watch Video"
    },
    {
      "id": "video-c3eTFQVqeld",
      "title": "Cobb-Douglas Production Function",
      "description": "Lecture video for Chapter 3.",
      "type": "lecture-video",
      "typeLabel": "Lecture video",
      "url": "https://wjbyrd.screencasthost.com/watch/c3eTFQVqeld",
      "chapter": 3,
      "objectiveIds": [
        "LO3.1",
        "LO3.2",
        "LO3.3"
      ],
      "priority": 10,
      "actionLabel": "Watch Video"
    },
    {
      "id": "video-c3fVnvVqrEM",
      "title": "The Consumption Function and Taxes",
      "description": "Lecture video for Chapter 3.",
      "type": "lecture-video",
      "typeLabel": "Lecture video",
      "url": "https://wjbyrd.screencasthost.com/watch/c3fVnvVqrEM",
      "chapter": 3,
      "objectiveIds": [
        "LO3.4"
      ],
      "priority": 10,
      "actionLabel": "Watch Video"
    },
    {
      "id": "video-c3fnbEVqTpw",
      "title": "National Saving and Investment",
      "description": "Lecture video for Chapter 3.",
      "type": "lecture-video",
      "typeLabel": "Lecture video",
      "url": "https://wjbyrd.screencasthost.com/watch/c3fnbEVqTpw",
      "chapter": 3,
      "objectiveIds": [
        "LO3.4",
        "LO3.5"
      ],
      "priority": 10,
      "actionLabel": "Watch Video"
    },
    {
      "id": "video-c3VV38VoiHr",
      "title": "Chapter 3 Worked Problems",
      "description": "Worked-problem video for Chapter 3.",
      "type": "worked-problem-video",
      "typeLabel": "Worked-problem video",
      "url": "https://wjbyrd.screencasthost.com/watch/c3VV38VoiHr",
      "chapter": 3,
      "objectiveIds": [
        "LO3.1",
        "LO3.2",
        "LO3.3",
        "LO3.4",
        "LO3.5"
      ],
      "priority": 30,
      "actionLabel": "Watch Worked Problems"
    },
    {
      "id": "slides-chapter-2",
      "title": "Chapter 2 Lecture Slides",
      "description": "Lecture slides for Chapter 2.",
      "type": "lecture-slides",
      "typeLabel": "Lecture slides",
      "url": "resources/slides/chapter-2-the-data-of-macroeconomics.pdf",
      "chapter": 2,
      "objectiveIds": [],
      "priority": 40,
      "actionLabel": "Open Slides"
    },
    {
      "id": "slides-chapter-3",
      "title": "Chapter 3 Lecture Slides",
      "description": "Lecture slides for Chapter 3.",
      "type": "lecture-slides",
      "typeLabel": "Lecture slides",
      "url": "resources/slides/chapter-3-national-income.pdf",
      "chapter": 3,
      "objectiveIds": [],
      "priority": 40,
      "actionLabel": "Open Slides"
    },
    {
      "id": "slides-chapter-7",
      "title": "Chapter 7 Lecture Slides",
      "description": "Lecture slides for Chapter 7.",
      "type": "lecture-slides",
      "typeLabel": "Lecture slides",
      "url": "resources/slides/chapter-7-unemployment-and-the-labor-market.pdf",
      "chapter": 7,
      "objectiveIds": [],
      "priority": 40,
      "actionLabel": "Open Slides"
    }
  ],
  "objectiveMappings": {
    "LO2.1": {
      "title": "LO2.1",
      "chapter": 2,
      "resourceIds": [
        "video-cT6uFGnFe2H",
        "video-cT6uFCnFeIN",
        "video-cr6toqVlD2g",
        "video-cr6Yo5VXNzL"
      ],
      "fallbackResourceIds": [
        "video-cT6uFGnFe2H",
        "video-cT6uFCnFeIN",
        "video-cr6toqVlD2g",
        "video-cr6Yo5VXNzL",
        "video-crlFY8V2Hua",
        "slides-chapter-2"
      ]
    },
    "LO2.2": {
      "title": "LO2.2",
      "chapter": 2,
      "resourceIds": [
        "video-crlFY8V2Hua",
        "video-cT6uFGnFe2H",
        "video-cT6uFCnFeIN",
        "video-cr6toqVlD2g",
        "video-cr6Yo5VXNzL"
      ],
      "fallbackResourceIds": [
        "video-cT6uFGnFe2H",
        "video-cT6uFCnFeIN",
        "video-cr6toqVlD2g",
        "video-cr6Yo5VXNzL",
        "video-crlFY8V2Hua",
        "slides-chapter-2"
      ]
    },
    "LO7.1": {
      "title": "LO7.1",
      "chapter": 7,
      "resourceIds": [
        "video-cTiYbZnInbF",
        "video-cTiYbEnInFz",
        "video-c06eruV5tcC",
        "video-crlF32V2HyD"
      ],
      "fallbackResourceIds": [
        "video-c06eruV5tcC",
        "video-cTiYbZnInbF",
        "video-cTiYbEnInFz",
        "video-crlF32V2HyD",
        "slides-chapter-7"
      ]
    },
    "LO7.2": {
      "title": "LO7.2",
      "chapter": 7,
      "resourceIds": [
        "video-c06eruV5tcC",
        "video-crlF32V2HyD"
      ],
      "fallbackResourceIds": [
        "video-c06eruV5tcC",
        "video-cTiYbZnInbF",
        "video-cTiYbEnInFz",
        "video-crlF32V2HyD",
        "slides-chapter-7"
      ]
    },
    "LO7.3": {
      "title": "LO7.3",
      "chapter": 7,
      "resourceIds": [
        "video-cTiYbZnInbF",
        "video-cTiYbEnInFz",
        "video-c06eruV5tcC",
        "video-crlF32V2HyD"
      ],
      "fallbackResourceIds": [
        "video-c06eruV5tcC",
        "video-cTiYbZnInbF",
        "video-cTiYbEnInFz",
        "video-crlF32V2HyD",
        "slides-chapter-7"
      ]
    },
    "LO3.2": {
      "title": "LO3.2",
      "chapter": 3,
      "resourceIds": [
        "video-c3e0YaVF9dg",
        "video-c3e3rIVFNYo",
        "video-c3eTFQVqeld",
        "video-c3VV38VoiHr"
      ],
      "fallbackResourceIds": [
        "video-c3eTFQVqeld",
        "video-c3fnbEVqTpw",
        "video-c3e0YaVF9dg",
        "video-c3e3rIVFNYo",
        "video-c3fVnvVqrEM",
        "video-c3VV38VoiHr",
        "slides-chapter-3"
      ]
    },
    "LO3.1": {
      "title": "LO3.1",
      "chapter": 3,
      "resourceIds": [
        "video-c3eTFQVqeld",
        "video-c3VV38VoiHr"
      ],
      "fallbackResourceIds": [
        "video-c3eTFQVqeld",
        "video-c3fnbEVqTpw",
        "video-c3e0YaVF9dg",
        "video-c3e3rIVFNYo",
        "video-c3fVnvVqrEM",
        "video-c3VV38VoiHr",
        "slides-chapter-3"
      ]
    },
    "LO3.3": {
      "title": "LO3.3",
      "chapter": 3,
      "resourceIds": [
        "video-c3eTFQVqeld",
        "video-c3VV38VoiHr"
      ],
      "fallbackResourceIds": [
        "video-c3eTFQVqeld",
        "video-c3fnbEVqTpw",
        "video-c3e0YaVF9dg",
        "video-c3e3rIVFNYo",
        "video-c3fVnvVqrEM",
        "video-c3VV38VoiHr",
        "slides-chapter-3"
      ]
    },
    "LO3.4": {
      "title": "LO3.4",
      "chapter": 3,
      "resourceIds": [
        "video-c3fVnvVqrEM",
        "video-c3fnbEVqTpw",
        "video-c3VV38VoiHr"
      ],
      "fallbackResourceIds": [
        "video-c3eTFQVqeld",
        "video-c3fnbEVqTpw",
        "video-c3e0YaVF9dg",
        "video-c3e3rIVFNYo",
        "video-c3fVnvVqrEM",
        "video-c3VV38VoiHr",
        "slides-chapter-3"
      ]
    },
    "LO3.5": {
      "title": "LO3.5",
      "chapter": 3,
      "resourceIds": [
        "video-c3fnbEVqTpw",
        "video-c3VV38VoiHr"
      ],
      "fallbackResourceIds": [
        "video-c3eTFQVqeld",
        "video-c3fnbEVqTpw",
        "video-c3e0YaVF9dg",
        "video-c3e3rIVFNYo",
        "video-c3fVnvVqrEM",
        "video-c3VV38VoiHr",
        "slides-chapter-3"
      ]
    }
  },
  "fallbackResourceIds": {
    "2": [
      "video-cT6uFGnFe2H",
      "video-cT6uFCnFeIN",
      "video-cr6toqVlD2g",
      "video-cr6Yo5VXNzL",
      "video-crlFY8V2Hua",
      "slides-chapter-2"
    ],
    "3": [
      "video-c3eTFQVqeld",
      "video-c3fnbEVqTpw",
      "video-c3e0YaVF9dg",
      "video-c3e3rIVFNYo",
      "video-c3fVnvVqrEM",
      "video-c3VV38VoiHr",
      "slides-chapter-3"
    ],
    "7": [
      "video-c06eruV5tcC",
      "video-cTiYbZnInbF",
      "video-cTiYbEnInFz",
      "video-crlF32V2HyD",
      "slides-chapter-7"
    ]
  }
};
  global.NATIONAL_ENGINE_INSTRUCTIONAL_RESOURCES = catalog;
  global.INSTRUCTIONAL_RESOURCES = catalog;
})(window);
