/* Faculty-editable instructional-resource catalog for The National Ledger. */
(function registerNationalLedgerResources(global) {
    "use strict";
    if (global.INSTRUCTIONAL_RESOURCES) return;
    const chapters = {
        "24": { title: "Measuring a Nation's Income", fallbackResourceIds: ["cT6uFXnFejF", "chapter-24-lecture-slides"], resources: [
            { id:"cT6uFGnFe2H", chapter:24, type:"video", title:"Gross Domestic Product", description:"Review GDP, the income-expenditure identity, and GDP components.", url:"https://wjbyrd.screencasthost.com/watch/cT6uFGnFe2H", actionLabel:"Watch Video", external:true, transcript:"gross-domestic-product-transcript.srt", priority:1 },
            { id:"cr6toqVlD2g", chapter:24, type:"video", title:"Nominal vs. Real GDP", description:"Review the distinction between nominal GDP and real GDP.", url:"https://wjbyrd.screencasthost.com/watch/cr6toqVlD2g", actionLabel:"Watch Video", external:true, transcript:"nominal-vs-real-gdp-transcript.srt", priority:1 },
            { id:"cT6uFXnFejF", chapter:24, type:"worked-problem", title:"Chapter 24 Worked Problems", description:"Practice applying the Chapter 24 GDP concepts through worked problems.", url:"https://wjbyrd.screencasthost.com/watch/cT6uFXnFejF", actionLabel:"Watch Video", external:true, transcript:"chapter-24-worked-problems-transcript.srt", priority:3 },
            { id:"chapter-24-lecture-slides", chapter:24, type:"slides", title:"Chapter 24 Lecture Slides", description:"Review national income accounting, GDP, and economic well-being.", url:"resources/slides/chapter-24-measuring-a-nations-income.pdf", actionLabel:"Open Slides", external:false, downloadable:true, priority:4 }
        ] },
        "25": { title: "Measuring the Cost of Living", fallbackResourceIds: ["cT6uFknFeIa", "chapter-25-lecture-slides"], resources: [
            { id:"cT6uFCnFeIN", chapter:25, type:"video", title:"Inflation", description:"Review the CPI, inflation, and price-level measurement.", url:"https://wjbyrd.screencasthost.com/watch/cT6uFCnFeIN", actionLabel:"Watch Video", external:true, transcript:"inflation-transcript.srt", priority:1 },
            { id:"crl1qKV2l2a", chapter:25, type:"video", title:"Converting Dollars Across Time", description:"Practice converting dollar figures with price indexes.", url:"https://wjbyrd.screencasthost.com/watch/crl1qKV2l2a", actionLabel:"Watch Video", external:true, transcript:"converting-dollars-across-time-transcript.srt", priority:1 },
            { id:"cT6uFknFeIa", chapter:25, type:"worked-problem", title:"Chapter 25 Worked Problems", description:"Practice applying inflation and cost-of-living concepts through worked problems.", url:"https://wjbyrd.screencasthost.com/watch/cT6uFknFeIa", actionLabel:"Watch Video", external:true, transcript:"chapter-25-worked-problems-transcript.srt", priority:3 },
            { id:"chapter-25-lecture-slides", chapter:25, type:"slides", title:"Chapter 25 Lecture Slides", description:"Review the CPI, inflation, price indexes, and interest rates.", url:"resources/slides/chapter-25-measuring-the-cost-of-living.pdf", actionLabel:"Open Slides", external:false, downloadable:true, priority:4 }
        ] },
        "26": { title: "Production and Growth", fallbackResourceIds: ["cT6vqhnFXUp", "chapter-26-lecture-slides"], resources: [
            { id:"cT6vDZnFXcV", chapter:26, type:"video", title:"Productivity and Growth", description:"Review productivity and economic growth across countries.", url:"https://wjbyrd.screencasthost.com/watch/cT6vDZnFXcV", actionLabel:"Watch Video", external:true, transcript:"productivity-and-growth-transcript.srt", priority:1 },
            { id:"cT6vDunFXcp", chapter:26, type:"video", title:"The Catch-Up Effect", description:"Review the catch-up effect and differences in economic growth.", url:"https://wjbyrd.screencasthost.com/watch/cT6vDunFXcp", actionLabel:"Watch Video", external:true, transcript:"the-catch-up-effect-transcript.srt", priority:2 },
            { id:"cT6vqhnFXUp", chapter:26, type:"worked-problem", title:"Chapter 26 Worked Problems", description:"Practice applying production and growth concepts through worked problems.", url:"https://wjbyrd.screencasthost.com/watch/cT6vqhnFXUp", actionLabel:"Watch Video", external:true, transcript:"chapter-26-worked-problems-transcript.srt", priority:3 },
            { id:"chapter-26-lecture-slides", chapter:26, type:"slides", title:"Chapter 26 Lecture Slides", description:"Review productivity, growth, and the policies that influence them.", url:"resources/slides/chapter-26-production-and-growth.pdf", actionLabel:"Open Slides", external:false, downloadable:true, priority:4 }
        ] },
        "29": { title: "Unemployment", fallbackResourceIds: ["cT6vFAnFXZJ", "chapter-29-lecture-slides"], resources: [
            { id:"cT6vFqnFXrU", chapter:29, type:"video", title:"Labor Force Statistics", description:"Review labor-force statistics and employment categories.", url:"https://wjbyrd.screencasthost.com/watch/cT6vFqnFXrU", actionLabel:"Watch Video", external:true, transcript:"labor-force-statistics-transcript.srt", priority:1 },
            { id:"cTiYbZnInbF", chapter:29, type:"video", title:"Frictional Unemployment", description:"Review types of unemployment and the natural rate.", url:"https://wjbyrd.screencasthost.com/watch/cTiYbZnInbF", actionLabel:"Watch Video", external:true, transcript:"frictional-unemployment-transcript.srt", priority:1 },
            { id:"cTiYbEnInFz", chapter:29, type:"video", title:"Structural Unemployment", description:"Review structural unemployment and labor-market policies.", url:"https://wjbyrd.screencasthost.com/watch/cTiYbEnInFz", actionLabel:"Watch Video", external:true, transcript:"structural-unemployment-transcript.srt", priority:2 },
            { id:"cT6vFAnFXZJ", chapter:29, type:"worked-problem", title:"Chapter 29 Worked Problems", description:"Practice applying unemployment concepts through worked problems.", url:"https://wjbyrd.screencasthost.com/watch/cT6vFAnFXZJ", actionLabel:"Watch Video", external:true, transcript:"chapter-29-worked-problems-transcript.srt", priority:3 },
            { id:"chapter-29-lecture-slides", chapter:29, type:"slides", title:"Chapter 29 Lecture Slides", description:"Review labor-force statistics, unemployment, and labor-market policy.", url:"resources/slides/chapter-29-unemployment.pdf", actionLabel:"Open Slides", external:false, downloadable:true, priority:4 }
        ] }
    };
    global.INSTRUCTIONAL_RESOURCES = { version:1, gameId:"national-ledger", gameTitle:"The National Ledger", settings:{maximumRecommendations:3,enableChapterFallback:true}, chapters, objectives:{
        "LO24.1":{chapter:24,title:"Calculate how an economy’s total income equals its total expenditure.",resourceIds:["cT6uFGnFe2H","cT6uFXnFejF"]},
        "LO24.2":{chapter:24,title:"Define and calculate gross domestic product (GDP).",resourceIds:["cT6uFGnFe2H","cT6uFXnFejF"]},
        "LO24.3":{chapter:24,title:"Identify and break down GDP into its four major components.",resourceIds:["cT6uFGnFe2H","cT6uFXnFejF"]},
        "LO24.4":{chapter:24,title:"Define and calculate real GDP and nominal GDP.",resourceIds:["cr6toqVlD2g","cT6uFXnFejF"]},
        "LO24.5":{chapter:24,title:"Evaluate whether GDP is a good measure of economic well-being.",resourceIds:[]},
        "LO25.1":{chapter:25,title:"Calculate the consumer price index (CPI) and relate CPI to inflation.",resourceIds:["cT6uFCnFeIN","cT6uFknFeIa"]},
        "LO25.2":{chapter:25,title:"Explain why the CPI is an imperfect measure of the cost of living.",resourceIds:["cT6uFCnFeIN","cT6uFknFeIa"]},
        "LO25.3":{chapter:25,title:"Define the CPI and the GDP Deflator and describe how they measure the overall price level.",resourceIds:["cT6uFCnFeIN","cT6uFknFeIa"]},
        "LO25.4":{chapter:25,title:"Convert dollar figures from different times using price indexes.",resourceIds:["crl1qKV2l2a","cT6uFknFeIa"]},
        "LO25.5":{chapter:25,title:"Describe the relationship between the nominal interest rate, inflation, and the real interest rate.",resourceIds:["cT6uFknFeIa"]},
        "LO26.1":{chapter:26,title:"Recognize how much economic growth differs around the world.",resourceIds:["cT6vDZnFXcV","cT6vDunFXcp","cT6vqhnFXUp"]},
        "LO26.2":{chapter:26,title:"Identify why productivity is the key determinant of a country’s standard of living and illustrate how to calculate it.",resourceIds:["cT6vDZnFXcV","cT6vDunFXcp","cT6vqhnFXUp"]},
        "LO26.3":{chapter:26,title:"Define and apply the factors that determine a country’s productivity.",resourceIds:["cT6vqhnFXUp"]},
        "LO26.4":{chapter:26,title:"List how a country’s policies influence its productivity growth.",resourceIds:["cT6vqhnFXUp"]},
        "LO29.1":{chapter:29,title:"Calculate the labor force statistics using economic data.",resourceIds:["cT6vFqnFXrU","cT6vFAnFXZJ"]},
        "LO29.2":{chapter:29,title:"Distinguish between employment categories.",resourceIds:["cT6vFqnFXrU","cT6vFAnFXZJ"]},
        "LO29.3":{chapter:29,title:"Differentiate among types of unemployment—frictional, structural, and cyclical—and analyze their causes.",resourceIds:["cTiYbZnInbF","cTiYbEnInFz","cT6vFAnFXZJ"]},
        "LO29.4":{chapter:29,title:"Evaluate policies and institutions (e.g., unemployment insurance, unions, and collective bargaining) and their effects on unemployment.",resourceIds:["cTiYbZnInbF","cTiYbEnInFz","cT6vFAnFXZJ"]},
        "LO29.5":{chapter:29,title:"Explain why the economy experiences a natural rate of unemployment even in the long run.",resourceIds:["cTiYbZnInbF","cT6vFAnFXZJ"]}
    }};
}(window));
