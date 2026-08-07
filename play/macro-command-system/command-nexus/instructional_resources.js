/* Student-facing instructional resource catalog. */
(function registerInstructionalResources(global){
  "use strict";
  const catalog = {
  "gameIdentifier": "command-nexus",
  "settings": {
    "maximumRecommendations": 3,
    "exactObjectiveMatchFirst": true,
    "chapterFallbackEnabled": true
  },
  "chapters": {
    "12": {
      "title": "Chapter 12",
      "resourceIds": [
        "video-c0fbFMVzVG5",
        "video-c0fY2MVzXdx",
        "video-cThvbsn6GNZ",
        "video-c3VDrGVoGTQ",
        "slides-chapter-12"
      ],
      "fallbackResourceIds": [
        "video-c0fY2MVzXdx",
        "video-cThvbsn6GNZ",
        "video-c0fbFMVzVG5",
        "video-c3VDrGVoGTQ",
        "slides-chapter-12"
      ]
    },
    "13": {
      "title": "Chapter 13",
      "resourceIds": [
        "video-c0XYrXVGHMS",
        "video-c0XYrlVGHLq",
        "video-c0XYriVGHMr",
        "video-c0XrF3VG7Fg",
        "video-c3f1rwVqBpG",
        "slides-chapter-13"
      ],
      "fallbackResourceIds": [
        "video-c0XrF3VG7Fg",
        "video-c0XYrXVGHMS",
        "video-c0XYrlVGHLq",
        "video-c0XYriVGHMr",
        "video-c3f1rwVqBpG",
        "slides-chapter-13"
      ]
    }
  },
  "resources": [
    {
      "id": "video-c0fbFMVzVG5",
      "title": "Planned versus Actual Expenditures",
      "description": "Lecture video for Chapter 12.",
      "type": "lecture-video",
      "typeLabel": "Lecture video",
      "url": "https://wjbyrd.screencasthost.com/watch/c0fbFMVzVG5",
      "chapter": 12,
      "objectiveIds": [
        "LO12.1"
      ],
      "priority": 10,
      "actionLabel": "Watch Video"
    },
    {
      "id": "video-c0fY2MVzXdx",
      "title": "The IS Curve",
      "description": "Lecture video for Chapter 12.",
      "type": "lecture-video",
      "typeLabel": "Lecture video",
      "url": "https://wjbyrd.screencasthost.com/watch/c0fY2MVzXdx",
      "chapter": 12,
      "objectiveIds": [
        "LO12.1",
        "LO12.3"
      ],
      "priority": 10,
      "actionLabel": "Watch Video"
    },
    {
      "id": "video-cThvbsn6GNZ",
      "title": "The LM Curve",
      "description": "Lecture video for Chapter 12.",
      "type": "lecture-video",
      "typeLabel": "Lecture video",
      "url": "https://wjbyrd.screencasthost.com/watch/cThvbsn6GNZ",
      "chapter": 12,
      "objectiveIds": [
        "LO12.2",
        "LO12.3"
      ],
      "priority": 10,
      "actionLabel": "Watch Video"
    },
    {
      "id": "video-c3VDrGVoGTQ",
      "title": "Chapter 12 Worked Problems",
      "description": "Worked-problem video for Chapter 12.",
      "type": "worked-problem-video",
      "typeLabel": "Worked-problem video",
      "url": "https://wjbyrd.screencasthost.com/watch/c3VDrGVoGTQ",
      "chapter": 12,
      "objectiveIds": [
        "LO12.1",
        "LO12.2",
        "LO12.3"
      ],
      "priority": 30,
      "actionLabel": "Watch Worked Problems"
    },
    {
      "id": "video-c0XYrXVGHMS",
      "title": "IS-LM Analysis Part 1",
      "description": "Lecture video for Chapter 13.",
      "type": "lecture-video",
      "typeLabel": "Lecture video",
      "url": "https://wjbyrd.screencasthost.com/watch/c0XYrXVGHMS",
      "chapter": 13,
      "objectiveIds": [
        "LO13.1"
      ],
      "priority": 10,
      "actionLabel": "Watch Video"
    },
    {
      "id": "video-c0XYrlVGHLq",
      "title": "IS-LM Analysis Part 2",
      "description": "Lecture video for Chapter 13.",
      "type": "lecture-video",
      "typeLabel": "Lecture video",
      "url": "https://wjbyrd.screencasthost.com/watch/c0XYrlVGHLq",
      "chapter": 13,
      "objectiveIds": [
        "LO13.2"
      ],
      "priority": 10,
      "actionLabel": "Watch Video"
    },
    {
      "id": "video-c0XYriVGHMr",
      "title": "IS-LM Analysis Part 3",
      "description": "Lecture video for Chapter 13.",
      "type": "lecture-video",
      "typeLabel": "Lecture video",
      "url": "https://wjbyrd.screencasthost.com/watch/c0XYriVGHMr",
      "chapter": 13,
      "objectiveIds": [
        "LO13.3"
      ],
      "priority": 10,
      "actionLabel": "Watch Video"
    },
    {
      "id": "video-c0XrF3VG7Fg",
      "title": "IS-LM Aggregate Demand and Short-Run and Long-Run Aggregate Supply",
      "description": "Lecture video for Chapter 13.",
      "type": "lecture-video",
      "typeLabel": "Lecture video",
      "url": "https://wjbyrd.screencasthost.com/watch/c0XrF3VG7Fg",
      "chapter": 13,
      "objectiveIds": [
        "LO13.4"
      ],
      "priority": 10,
      "actionLabel": "Watch Video"
    },
    {
      "id": "video-c3f1rwVqBpG",
      "title": "Chapter 13 Worked Problems",
      "description": "Worked-problem video for Chapter 13.",
      "type": "worked-problem-video",
      "typeLabel": "Worked-problem video",
      "url": "https://wjbyrd.screencasthost.com/watch/c3f1rwVqBpG",
      "chapter": 13,
      "objectiveIds": [
        "LO13.1",
        "LO13.2",
        "LO13.3",
        "LO13.4",
        "LO13.5"
      ],
      "priority": 30,
      "actionLabel": "Watch Worked Problems"
    },
    {
      "id": "slides-chapter-12",
      "title": "Chapter 12 Lecture Slides",
      "description": "Lecture slides for Chapter 12.",
      "type": "lecture-slides",
      "typeLabel": "Lecture slides",
      "url": "resources/slides/chapter-12-aggregate-demand-I.pdf",
      "chapter": 12,
      "objectiveIds": [],
      "priority": 40,
      "actionLabel": "Open Slides"
    },
    {
      "id": "slides-chapter-13",
      "title": "Chapter 13 Lecture Slides",
      "description": "Lecture slides for Chapter 13.",
      "type": "lecture-slides",
      "typeLabel": "Lecture slides",
      "url": "resources/slides/chapter-13-aggregate-demand-II.pdf",
      "chapter": 13,
      "objectiveIds": [],
      "priority": 40,
      "actionLabel": "Open Slides"
    }
  ],
  "objectiveMappings": {
    "LO12.1": {
      "title": "LO12.1",
      "chapter": 12,
      "resourceIds": [
        "video-c0fbFMVzVG5",
        "video-c0fY2MVzXdx",
        "video-c3VDrGVoGTQ"
      ],
      "fallbackResourceIds": [
        "video-c0fY2MVzXdx",
        "video-cThvbsn6GNZ",
        "video-c0fbFMVzVG5",
        "video-c3VDrGVoGTQ",
        "slides-chapter-12"
      ]
    },
    "LO12.3": {
      "title": "LO12.3",
      "chapter": 12,
      "resourceIds": [
        "video-c0fY2MVzXdx",
        "video-cThvbsn6GNZ",
        "video-c3VDrGVoGTQ"
      ],
      "fallbackResourceIds": [
        "video-c0fY2MVzXdx",
        "video-cThvbsn6GNZ",
        "video-c0fbFMVzVG5",
        "video-c3VDrGVoGTQ",
        "slides-chapter-12"
      ]
    },
    "LO12.2": {
      "title": "LO12.2",
      "chapter": 12,
      "resourceIds": [
        "video-cThvbsn6GNZ",
        "video-c3VDrGVoGTQ"
      ],
      "fallbackResourceIds": [
        "video-c0fY2MVzXdx",
        "video-cThvbsn6GNZ",
        "video-c0fbFMVzVG5",
        "video-c3VDrGVoGTQ",
        "slides-chapter-12"
      ]
    },
    "LO13.1": {
      "title": "LO13.1",
      "chapter": 13,
      "resourceIds": [
        "video-c0XYrXVGHMS",
        "video-c3f1rwVqBpG"
      ],
      "fallbackResourceIds": [
        "video-c0XrF3VG7Fg",
        "video-c0XYrXVGHMS",
        "video-c0XYrlVGHLq",
        "video-c0XYriVGHMr",
        "video-c3f1rwVqBpG",
        "slides-chapter-13"
      ]
    },
    "LO13.2": {
      "title": "LO13.2",
      "chapter": 13,
      "resourceIds": [
        "video-c0XYrlVGHLq",
        "video-c3f1rwVqBpG"
      ],
      "fallbackResourceIds": [
        "video-c0XrF3VG7Fg",
        "video-c0XYrXVGHMS",
        "video-c0XYrlVGHLq",
        "video-c0XYriVGHMr",
        "video-c3f1rwVqBpG",
        "slides-chapter-13"
      ]
    },
    "LO13.3": {
      "title": "LO13.3",
      "chapter": 13,
      "resourceIds": [
        "video-c0XYriVGHMr",
        "video-c3f1rwVqBpG"
      ],
      "fallbackResourceIds": [
        "video-c0XrF3VG7Fg",
        "video-c0XYrXVGHMS",
        "video-c0XYrlVGHLq",
        "video-c0XYriVGHMr",
        "video-c3f1rwVqBpG",
        "slides-chapter-13"
      ]
    },
    "LO13.4": {
      "title": "LO13.4",
      "chapter": 13,
      "resourceIds": [
        "video-c0XrF3VG7Fg",
        "video-c3f1rwVqBpG"
      ],
      "fallbackResourceIds": [
        "video-c0XrF3VG7Fg",
        "video-c0XYrXVGHMS",
        "video-c0XYrlVGHLq",
        "video-c0XYriVGHMr",
        "video-c3f1rwVqBpG",
        "slides-chapter-13"
      ]
    },
    "LO13.5": {
      "title": "LO13.5",
      "chapter": 13,
      "resourceIds": [
        "video-c3f1rwVqBpG"
      ],
      "fallbackResourceIds": [
        "video-c0XrF3VG7Fg",
        "video-c0XYrXVGHMS",
        "video-c0XYrlVGHLq",
        "video-c0XYriVGHMr",
        "video-c3f1rwVqBpG",
        "slides-chapter-13"
      ]
    }
  },
  "fallbackResourceIds": {
    "12": [
      "video-c0fY2MVzXdx",
      "video-cThvbsn6GNZ",
      "video-c0fbFMVzVG5",
      "video-c3VDrGVoGTQ",
      "slides-chapter-12"
    ],
    "13": [
      "video-c0XrF3VG7Fg",
      "video-c0XYrXVGHMS",
      "video-c0XYrlVGHLq",
      "video-c0XYriVGHMr",
      "video-c3f1rwVqBpG",
      "slides-chapter-13"
    ]
  }
};
  global.COMMAND_NEXUS_INSTRUCTIONAL_RESOURCES = catalog;
  global.INSTRUCTIONAL_RESOURCES = catalog;
})(window);
