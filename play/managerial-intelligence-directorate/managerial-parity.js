/* Presentation/Daily port from build/faculty-build-composer/template/mastery-quests-faculty-template-composer-ready.html.
 * Core scheduler is copied verbatim. Existing gameplay and telemetry remain authoritative. */
const MANAGERIAL_DAILY_MODE_REQUIREMENTS = typeof FACULTY_MODE_REQUIREMENTS !== "undefined" ? FACULTY_MODE_REQUIREMENTS : {
    standard:["easy","medium","hard","easyBoss","mediumBoss","finalBoss"],
    score:["easy","medium","hard","easyBoss","mediumBoss","finalBoss"],
    legendary:["legendary","legendaryBoss"], exam:["easy","medium","hard"], timed:["easy","medium","hard"],
    unlimited:["easy","medium","hard"], quiz:["easy","medium","hard"], fadingFortune:["easy","medium","hard"], riskReward:["easy","medium","hard"]
};

const DailyChallengesCore = (() => {
    const FAMILY_ORDER = [
        "correct_answers",
        "streak",
        "accuracy_window",
        "perfect_stretch",
        "graph_questions",
        "concept_variety"
    ];
    const MILESTONES = [1,3,5,10,20,30,50,75,100];
    const UNIVERSAL_FAMILIES = FAMILY_ORDER.slice(0, 4);
    const GRAMMAR = {
        correct_answers: [
            {target:5,tier:"quick"},{target:8,tier:"standard"},{target:10,tier:"standard"},{target:12,tier:"stretch"}
        ],
        streak: [
            {target:4,tier:"quick"},{target:5,tier:"standard"},{target:6,tier:"standard"},{target:8,tier:"stretch"}
        ],
        accuracy_window: [
            {target:4,windowSize:5,tier:"quick"},{target:6,windowSize:8,tier:"standard"},{target:8,windowSize:10,tier:"stretch"}
        ],
        perfect_stretch: [
            {target:3,tier:"quick"},{target:5,tier:"standard"},{target:7,tier:"stretch"}
        ],
        graph_questions: [
            {target:2,tier:"quick",minimumAccessible:4},{target:3,tier:"standard",minimumAccessible:6},{target:5,tier:"stretch",minimumAccessible:10}
        ],
        concept_variety: [
            {target:2,tier:"quick"},{target:3,tier:"standard"},{target:4,tier:"stretch"}
        ]
    };

    function localDateKey(value = new Date()){
        const date = value instanceof Date ? value : new Date(value);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    }

    function hash32(input){
        let hash = 2166136261;
        const text = String(input || "");
        for(let index = 0; index < text.length; index++){
            hash ^= text.charCodeAt(index);
            hash = Math.imul(hash, 16777619);
        }
        return hash >>> 0;
    }

    function stableQuestionIdentity(question){
        return String(question?.id ?? question?.questionId ?? `${question?.q || ""}:${JSON.stringify(question?.options || [])}`);
    }

    function isGraphQuestion(question){
        return Boolean(
            question?.image
            || question?.graph
            || question?.requiresGraph
            || /(?:^|[_\s-])graph(?:$|[_\s-])/i.test(String(question?.type || ""))
        );
    }

    function conceptIdentity(question){
        return String(
            question?.primaryConceptId
            || question?.conceptId
            || question?.objective
            || question?.tag
            || ""
        ).trim();
    }

    function getAccessibleQuestions(banks, supportedModes, modeRequirements){
        const poolNames = new Set();
        (supportedModes || []).forEach(mode => {
            (modeRequirements?.[mode] || []).forEach(poolName => {
                if(poolName !== "repair" && poolName !== "bridge") poolNames.add(poolName);
            });
        });
        const seen = new Set();
        const questions = [];
        poolNames.forEach(poolName => {
            (Array.isArray(banks?.[poolName]) ? banks[poolName] : []).forEach(question => {
                if(!question || !Array.isArray(question.options) || question.options.length < 2) return;
                const identity = stableQuestionIdentity(question);
                if(seen.has(identity)) return;
                seen.add(identity);
                questions.push(question);
            });
        });
        return questions;
    }

    function getEligibilityContext(banks, supportedModes, modeRequirements){
        const accessibleQuestions = getAccessibleQuestions(banks, supportedModes, modeRequirements);
        const graphQuestionCount = accessibleQuestions.filter(isGraphQuestion).length;
        const concepts = new Set(accessibleQuestions.map(conceptIdentity).filter(Boolean));
        return {
            accessibleQuestionCount: accessibleQuestions.length,
            graphQuestionCount,
            conceptCount: concepts.size
        };
    }

    function getEligibleFamilies(context){
        const eligible = [...UNIVERSAL_FAMILIES];
        if(Number(context?.graphQuestionCount || 0) >= 4) eligible.push("graph_questions");
        if(Number(context?.conceptCount || 0) >= 2) eligible.push("concept_variety");
        return eligible;
    }

    function getParameterOptions(family, context){
        const options = [...(GRAMMAR[family] || [])];
        if(family === "graph_questions"){
            return options.filter(option => Number(context?.graphQuestionCount || 0) >= option.minimumAccessible);
        }
        if(family === "concept_variety"){
            return options.filter(option => Number(context?.conceptCount || 0) >= option.target);
        }
        return options;
    }

    function selectFamily(eligibleFamilies, seed, history = [], date){
        const eligible = FAMILY_ORDER.filter(family => (eligibleFamilies || []).includes(family));
        if(!eligible.length) return "correct_answers";
        const recent = [...history]
            .filter(item => item?.family && item?.date !== date)
            .sort((a,b) => String(b.date || "").localeCompare(String(a.date || "")))
            .map(item => item.family);
        let candidates = [...eligible];
        const cooldownDepth = eligible.length >= 4 ? 2 : eligible.length >= 2 ? 1 : 0;
        for(let index = 0; index < cooldownDepth; index++){
            const filtered = candidates.filter(family => family !== recent[index]);
            if(filtered.length) candidates = filtered;
        }
        return candidates[hash32(`${seed}:family`) % candidates.length];
    }

    function selectParameters(family, context, seed){
        const options = getParameterOptions(family, context);
        const fallback = GRAMMAR[family]?.[0] || {target:5,tier:"quick"};
        if(!options.length) return {...fallback};
        const tierRotation = ["quick","standard","standard","stretch"];
        const desiredTier = tierRotation[hash32(`${seed}:tier`) % tierRotation.length];
        const tierOptions = options.filter(option => option.tier === desiredTier);
        const candidates = tierOptions.length ? tierOptions : options;
        return {...candidates[hash32(`${seed}:parameters`) % candidates.length]};
    }

    function previousDateKey(date, offset = 1){
        const parts = String(date || "").split("-").map(Number);
        if(parts.length !== 3 || parts.some(part => !Number.isFinite(part))) return date;
        const previous = new Date(parts[0], parts[1] - 1, parts[2]);
        previous.setDate(previous.getDate() - offset);
        return localDateKey(previous);
    }

    function describe(family, parameters){
        const target = Number(parameters?.target || 0);
        if(family === "correct_answers") return `Get ${target} correct answers`;
        if(family === "streak") return `Reach a streak of ${target}`;
        if(family === "accuracy_window") return `Get ${target} of the next ${parameters.windowSize} correct`;
        if(family === "perfect_stretch") return `Get ${target} correct without a miss`;
        if(family === "graph_questions") return `Get ${target} graph questions correct`;
        if(family === "concept_variety") return `Get correct answers from ${target} different concepts`;
        return `Get ${target} correct answers`;
    }

    function resolveDaily({identity,date,eligibleFamilies,history = [],context = {}}){
        const seed = `${identity}|${date}`;
        // Derive the cooldown window from the same deterministic rotation so a
        // fresh browser and a returning browser resolve the same Quest/date alike.
        // Persisted history remains available for diagnostics and migration, but
        // cannot make today's locked Daily differ across devices.
        const deterministicHistory = [];
        for(let offset = 2; offset >= 1; offset--){
            const priorDate = previousDateKey(date, offset);
            const priorFamily = selectFamily(
                eligibleFamilies,
                `${identity}|${priorDate}`,
                deterministicHistory,
                priorDate
            );
            deterministicHistory.push({date:priorDate,family:priorFamily});
        }
        const cooldownHistory = deterministicHistory.length ? deterministicHistory : history;
        let family = selectFamily(eligibleFamilies, seed, cooldownHistory, date);
        let parameters = selectParameters(family, context, seed);
        if(!parameters?.target){
            family = "correct_answers";
            parameters = selectParameters(family, context, seed);
        }
        return {
            id: `${date}:${hash32(`${seed}:${family}:${parameters.target}:${parameters.windowSize || 0}`).toString(36)}`,
            date,
            family,
            target:Number(parameters.target),
            windowSize:Number(parameters.windowSize || 0),
            tier:parameters.tier || "standard",
            description:describe(family, parameters),
            eligibleFamilies:[...(eligibleFamilies || [])],
            eligibility:{
                accessibleQuestionCount:Number(context.accessibleQuestionCount || 0),
                graphQuestionCount:Number(context.graphQuestionCount || 0),
                conceptCount:Number(context.conceptCount || 0)
            }
        };
    }

    function createProgress(){
        return {
            value:0,
            completed:false,
            startedAt:null,
            completedAt:null,
            qualifyingQuestions:0,
            perfectCurrent:0,
            windowAttempts:0,
            windowCorrect:0,
            windowNumber:1,
            uniqueConcepts:[],
            postCompletionQuestions:0,
            lastQuestionAt:null
        };
    }

    function applyProgress(daily, existingProgress, event){
        const progress = {...createProgress(), ...(existingProgress || {})};
        progress.uniqueConcepts = Array.isArray(progress.uniqueConcepts) ? [...progress.uniqueConcepts] : [];
        const before = Number(progress.value || 0);
        const alreadyComplete = Boolean(progress.completed);
        const now = event?.timestamp || new Date().toISOString();
        const windowAttemptBefore = Number(progress.windowNumber || 1);
        const result = {progress,before,after:before,completedNow:false,alreadyComplete,windowFailed:false,windowAttemptBefore};
        if(alreadyComplete){
            progress.postCompletionQuestions = Number(progress.postCompletionQuestions || 0) + 1;
            progress.lastQuestionAt = now;
            return result;
        }

        if(!progress.startedAt) progress.startedAt = now;
        progress.qualifyingQuestions = Number(progress.qualifyingQuestions || 0) + 1;
        progress.lastQuestionAt = now;
        const correct = Boolean(event?.correct);

        if(daily.family === "correct_answers"){
            if(correct) progress.value = before + 1;
        } else if(daily.family === "streak"){
            progress.value = Math.max(before, Number(event?.streak || 0));
        } else if(daily.family === "perfect_stretch"){
            progress.perfectCurrent = correct ? Number(progress.perfectCurrent || 0) + 1 : 0;
            progress.value = progress.perfectCurrent;
        } else if(daily.family === "graph_questions"){
            if(correct && event?.isGraph) progress.value = before + 1;
        } else if(daily.family === "concept_variety"){
            if(correct && event?.concept && !progress.uniqueConcepts.includes(event.concept)){
                progress.uniqueConcepts.push(event.concept);
            }
            progress.value = progress.uniqueConcepts.length;
        } else if(daily.family === "accuracy_window"){
            progress.windowAttempts = Number(progress.windowAttempts || 0) + 1;
            if(correct) progress.windowCorrect = Number(progress.windowCorrect || 0) + 1;
            progress.value = progress.windowCorrect;
            if(progress.windowAttempts >= daily.windowSize){
                if(progress.windowCorrect >= daily.target){
                    progress.value = daily.target;
                } else {
                    result.windowFailed = true;
                    progress.windowNumber = Number(progress.windowNumber || 1) + 1;
                    progress.windowAttempts = 0;
                    progress.windowCorrect = 0;
                    progress.value = 0;
                }
            }
        }

        const accuracyWindowReady = daily.family !== "accuracy_window"
            || progress.windowAttempts >= daily.windowSize;
        if(Number(progress.value || 0) >= daily.target && accuracyWindowReady){
            progress.value = daily.target;
            progress.completed = true;
            progress.completedAt = now;
            result.completedNow = true;
        }
        result.after = Number(progress.value || 0);
        return result;
    }

    return {
        FAMILY_ORDER,
        MILESTONES,
        localDateKey,
        hash32,
        isGraphQuestion,
        conceptIdentity,
        getAccessibleQuestions,
        getEligibilityContext,
        getEligibleFamilies,
        getParameterOptions,
        selectFamily,
        resolveDaily,
        createProgress,
        applyProgress
    };
})();
globalThis.MQDailyChallengesCore = DailyChallengesCore;


// =============================================
// DAILY CHALLENGES V1 — BROWSER ADAPTER
// =============================================
const DAILY_STORAGE_KEY = `${STORAGE_PREFIX}:daily:v1`;
const DAILY_ANNOUNCEMENT_SESSION_PREFIX = `${STORAGE_PREFIX}:daily:announced:`;
let dailyState = null;
let dailyToastTimer = null;
let dailyRolloverTimer = null;

function dailyChallengesAreEnabled(){
    return FACULTY_COMPOSITION_CONFIG.dailyChallengesEnabled !== false;
}

function readDailyState(){
    try {
        const raw = localStorage.getItem(DAILY_STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch(error){
        console.warn("Daily task state could not be read:", error);
        return null;
    }
}

function persistDailyState(){
    if(!dailyState) return;
    try {
        localStorage.setItem(DAILY_STORAGE_KEY, JSON.stringify(dailyState));
    } catch(error){
        console.warn("Daily task state could not be saved:", error);
    }
}

function getDailyQuestIdentity(){
    return FACULTY_COMPOSITION_CONFIG.compositionFingerprint
        || FACULTY_COMPOSITION_CONFIG.compositionId
        || FACULTY_COMPOSITION_CONFIG.slug
        || FACULTY_COMPOSITION_CONFIG.title
        || "mastery-quest";
}

function getDailyEligibility(){
    const supportedModes = (FACULTY_COMPOSITION_CONFIG.supportedModes || [])
        .filter(mode => MANAGERIAL_DAILY_MODE_REQUIREMENTS[mode]);
    const eligibilityBanks = {...questionBanks};
    const eligibilityRequirements = {...MANAGERIAL_DAILY_MODE_REQUIREMENTS};
    if(supportedModes.includes("trialGraph") && typeof getTrialGraphCandidates === "function"){
        eligibilityBanks.trialGraph = getTrialGraphCandidates();
        eligibilityRequirements.trialGraph = ["trialGraph"];
    }
    if(supportedModes.includes("fadingFortune") && typeof getFadingFortuneCandidates === "function"){
        eligibilityBanks.fadingFortune = getFadingFortuneCandidates();
        eligibilityRequirements.fadingFortune = ["fadingFortune"];
    }
    if(supportedModes.includes("riskReward") && typeof getRiskRewardCandidates === "function"){
        eligibilityBanks.riskReward = getRiskRewardCandidates();
        eligibilityRequirements.riskReward = ["riskReward"];
    }
    const context = DailyChallengesCore.getEligibilityContext(
        eligibilityBanks,
        supportedModes,
        eligibilityRequirements
    );
    // A visual/image flag alone is not graph-safe content. Require the title's
    // actual supported graph candidate pool; no graph pool is manufactured.
    const graphSafe = supportedModes.includes("trialGraph") && typeof getTrialGraphCandidates === "function"
        ? getTrialGraphCandidates() : [];
    context.graphQuestionCount = Math.min(context.graphQuestionCount, graphSafe.length);
    return {context, families:DailyChallengesCore.getEligibleFamilies(context)};
}

function normalizeDailyState(stored){
    const creditedDates = Array.isArray(stored?.creditedDates)
        ? [...new Set(stored.creditedDates.map(String))]
        : [];
    return {
        version:1,
        totalCompleted:Math.max(Number(stored?.totalCompleted || 0), creditedDates.length),
        creditedDates,
        familyHistory:Array.isArray(stored?.familyHistory) ? stored.familyHistory.slice(-8) : [],
        today:stored?.today || null
    };
}

function initializeDailyChallenges(now = new Date()){
    const dock = document.getElementById("dailyTaskDock");
    if(!dailyChallengesAreEnabled()){
        if(dock) dock.hidden = true;
        dailyState = null;
        return null;
    }

    const date = DailyChallengesCore.localDateKey(now);
    dailyState = normalizeDailyState(readDailyState());
    if(!dailyState.today || dailyState.today.date !== date){
        const eligibility = getDailyEligibility();
        const daily = DailyChallengesCore.resolveDaily({
            identity:getDailyQuestIdentity(),
            date,
            eligibleFamilies:eligibility.families,
            history:dailyState.familyHistory,
            context:eligibility.context
        });
        daily.progress = DailyChallengesCore.createProgress();
        dailyState.today = daily;
        dailyState.familyHistory = [
            ...dailyState.familyHistory.filter(item => item?.date !== date),
            {date,family:daily.family}
        ].slice(-8);
        persistDailyState();
    } else {
        dailyState.today.progress = {
            ...DailyChallengesCore.createProgress(),
            ...(dailyState.today.progress || {})
        };
    }
    bindDailyUI();
    updateDailyUI();
    scheduleDailyRollover(now);
    return dailyState.today;
}

function scheduleDailyRollover(now = new Date()){
    if(dailyRolloverTimer) clearTimeout(dailyRolloverTimer);
    const nextMidnight = new Date(now);
    nextMidnight.setHours(24,0,0,100);
    dailyRolloverTimer = setTimeout(() => initializeDailyChallenges(new Date()), Math.max(1000, nextMidnight - now));
}

function getNextDailyMilestone(total = 0){
    return DailyChallengesCore.MILESTONES.find(value => value > total)
        || DailyChallengesCore.MILESTONES[DailyChallengesCore.MILESTONES.length - 1];
}

function getDailyProgressText(daily = dailyState?.today){
    if(!daily) return "";
    const progress = daily.progress || DailyChallengesCore.createProgress();
    if(daily.family === "accuracy_window" && !progress.completed){
        return `${progress.windowCorrect}/${daily.target} · question ${progress.windowAttempts}/${daily.windowSize} · window ${progress.windowNumber}`;
    }
    return `${Math.min(Number(progress.value || 0), daily.target)} / ${daily.target}`;
}

function updateDailyUI(){
    const daily = dailyState?.today;
    const dock = document.getElementById("dailyTaskDock");
    if(!dock || !dailyChallengesAreEnabled() || !daily){
        if(dock) dock.hidden = true;
        return;
    }
    dock.hidden = false;
    const progress = daily.progress || DailyChallengesCore.createProgress();
    const total = Number(dailyState.totalCompleted || 0);
    const milestone = getNextDailyMilestone(total);
    const pill = document.getElementById("dailyTaskPill");
    pill.textContent = progress.completed
        ? "DAILY COMPLETE ✓"
        : `DAILY TASK · ${Math.min(Number(progress.value || 0), daily.target)}/${daily.target}`;
    pill.classList.toggle("is-complete", Boolean(progress.completed));
    document.getElementById("dailyDetailsTitle").textContent = daily.description;
    document.getElementById("dailyDetailsMeta").textContent = progress.completed
        ? `Complete · ${getDailyProgressText(daily)}`
        : `In progress · ${getDailyProgressText(daily)}`;
    const percent = progress.completed
        ? 100
        : Math.min(95, Math.round((Number(progress.value || 0) / Math.max(1, daily.target)) * 100));
    document.getElementById("dailyDetailsProgress").style.width = `${percent}%`;
    document.getElementById("dailyLifetimeValue").textContent = String(total);
    document.getElementById("dailyMilestoneValue").textContent = total >= DailyChallengesCore.MILESTONES.at(-1)
        ? `${total}+`
        : String(milestone);
    document.getElementById("dailyMilestoneMeta").textContent = total >= DailyChallengesCore.MILESTONES.at(-1)
        ? "All current milestones reached. Your lifetime total keeps growing."
        : `${total} of ${milestone} lifetime Dailies completed.`;
    if(typeof updateGameMenuDailyAction === "function") updateGameMenuDailyAction();
}

function closeDailyDetailsPanel(restoreFocus = true){
    const dock = document.getElementById("dailyTaskDock");
    const pill = document.getElementById("dailyTaskPill");
    const panel = document.getElementById("dailyDetailsPanel");
    if(panel) panel.hidden = true;
    if(dock) dock.classList.remove("daily-panel-open");
    if(pill){
        pill.setAttribute("aria-expanded", "false");
        if(restoreFocus) document.getElementById("returnMenuBtn")?.focus();
    }
}

function openDailyDetailsFromGameMenu(){
    if(!dailyState?.today) initializeDailyChallenges();
    const dock = document.getElementById("dailyTaskDock");
    const pill = document.getElementById("dailyTaskPill");
    const panel = document.getElementById("dailyDetailsPanel");
    if(!dock || !pill || !panel || !dailyState?.today) return;
    dock.hidden = false;
    dock.classList.add("daily-panel-open");
    panel.hidden = false;
    pill.setAttribute("aria-expanded", "true");
    updateDailyUI();
    document.getElementById("dailyDetailsClose")?.focus();
}

function bindDailyUI(){
    const pill = document.getElementById("dailyTaskPill");
    const panel = document.getElementById("dailyDetailsPanel");
    const closeButton = document.getElementById("dailyDetailsClose");
    if(!pill || !panel || pill.dataset.dailyBound === "true") return;
    pill.dataset.dailyBound = "true";
    pill.addEventListener("click", () => {
        const shouldOpen = panel.hidden;
        if(shouldOpen){
            panel.hidden = false;
            pill.setAttribute("aria-expanded", "true");
            updateDailyUI();
        } else {
            closeDailyDetailsPanel(false);
        }
    });
    if(closeButton) closeButton.addEventListener("click", () => closeDailyDetailsPanel(true));
    document.addEventListener("keydown", event => {
        if(event.key === "Escape" && !panel.hidden){
            closeDailyDetailsPanel(true);
        }
    });
}

function dismissDailyToast(){
    const region = document.getElementById("dailyToastRegion");
    const toast = region?.querySelector(".daily-toast");
    if(!toast) return;
    if(dailyToastTimer) clearTimeout(dailyToastTimer);
    toast.classList.add("is-leaving");
    setTimeout(() => { if(toast.isConnected) toast.remove(); }, 250);
}

function showDailyToast({kicker,title,progress,copy,complete = false,duration = 5200}){
    const region = document.getElementById("dailyToastRegion");
    if(!region) return;
    region.innerHTML = "";
    const toast = document.createElement("div");
    toast.className = `daily-toast${complete ? " is-complete" : ""}`;
    toast.setAttribute("role", "status");
    toast.setAttribute("tabindex", "0");
    toast.setAttribute("aria-label", `${kicker}. ${title}. ${progress}. ${copy}`);
    const kickerElement = document.createElement("div");
    kickerElement.className = "daily-toast-kicker";
    kickerElement.textContent = kicker;
    const titleElement = document.createElement("div");
    titleElement.className = "daily-toast-title";
    titleElement.textContent = title;
    const progressElement = document.createElement("div");
    progressElement.className = "daily-toast-progress";
    progressElement.textContent = progress;
    const copyElement = document.createElement("div");
    copyElement.className = "daily-toast-copy";
    copyElement.textContent = copy;
    toast.append(kickerElement,titleElement,progressElement,copyElement);
    toast.addEventListener("click", dismissDailyToast);
    toast.addEventListener("keydown", event => {
        if(event.key === "Enter" || event.key === " ") dismissDailyToast();
    });
    region.appendChild(toast);
    if(dailyToastTimer) clearTimeout(dailyToastTimer);
    dailyToastTimer = setTimeout(dismissDailyToast, duration);
}

function maybeShowDailyAnnouncement(){
    const daily = initializeDailyChallenges();
    if(!daily || daily.progress?.completed) return;
    const key = `${DAILY_ANNOUNCEMENT_SESSION_PREFIX}${daily.date}`;
    try {
        if(sessionStorage.getItem(key) === "true") return;
        sessionStorage.setItem(key, "true");
    } catch(error){
        if(document.body.dataset.dailyAnnounced === daily.date) return;
        document.body.dataset.dailyAnnounced = daily.date;
    }
    showDailyToast({
        kicker:"Today's Daily",
        title:daily.description,
        progress:getDailyProgressText(daily),
        copy:"Complete today's task in normal gameplay. Details are in Game Menu."
    });
}

function creditDailyCompletion(date){
    if(dailyState.creditedDates.includes(date)) return false;
    dailyState.creditedDates.push(date);
    dailyState.totalCompleted = Number(dailyState.totalCompleted || 0) + 1;
    return true;
}

function recordDailyGameplayEvent({correct,streak:currentStreak,question,timestamp = new Date().toISOString()}){
    if(!dailyChallengesAreEnabled()) return {};
    const today = DailyChallengesCore.localDateKey();
    if(!dailyState?.today || dailyState.today.date !== today) initializeDailyChallenges();
    const daily = dailyState?.today;
    if(!daily) return {};
    const concept = DailyChallengesCore.conceptIdentity(question);
    const result = DailyChallengesCore.applyProgress(daily,daily.progress,{
        correct,
        streak:currentStreak,
        isGraph:DailyChallengesCore.isGraphQuestion(question),
        concept,
        timestamp
    });
    daily.progress = result.progress;
    let creditedNow = false;
    if(result.completedNow){
        creditedNow = creditDailyCompletion(daily.date);
    }
    persistDailyState();
    updateDailyUI();

    if(result.completedNow){
        const total = Number(dailyState.totalCompleted || 0);
        const nextMilestone = getNextDailyMilestone(total);
        showDailyToast({
            kicker:"Daily Complete",
            title:daily.description,
            progress:`${daily.target} / ${daily.target} · ${total} Dailies completed`,
            copy:total >= DailyChallengesCore.MILESTONES.at(-1)
                ? "All current milestones reached. Keep building your lifetime total."
                : `Next milestone: ${nextMilestone}`,
            complete:true
        });
    }

    return {};
}

initializeDailyChallenges();
document.addEventListener("visibilitychange", () => {
    if(!document.hidden) initializeDailyChallenges();
});


function isGameFullscreen(){
    return Boolean(document.fullscreenElement || document.webkitFullscreenElement);
}

function updateGameMenuFullscreenAction(){
    const button = document.getElementById("gameMenuFullscreen");
    if(button) button.textContent = isGameFullscreen() ? "Exit Fullscreen" : "Enter Fullscreen";
}

function toggleGameMenuFullscreen(){
    goFullscreen();
}

function updateGameMenuDailyAction(){
    const button = document.getElementById("gameMenuDaily");
    if(!button) return;
    const daily = dailyState?.today;
    const available = Boolean(dailyChallengesAreEnabled() && daily);
    button.hidden = !available;
    if(!available) return;
    const progress = daily.progress || DailyChallengesCore.createProgress();
    button.textContent = progress.completed
        ? "Daily Task ✓"
        : `Daily Task · ${Math.min(Number(progress.value || 0), daily.target)}/${daily.target}`;
}

function openGameMenu(){
    const modal = document.getElementById("gameModal");
    const titleEl = document.getElementById("gameModalTitle");
    const textEl = document.getElementById("gameModalText");
    const menuOptions = document.getElementById("gameMenuOptions");
    const actions = document.getElementById("gameModalActions");
    const confirmBtn = document.getElementById("gameModalConfirm");
    const cancelBtn = document.getElementById("gameModalCancel");
    if(!modal || !titleEl || !textEl || !menuOptions || !actions || !confirmBtn || !cancelBtn) return;

    activeModalConfirmAction = null;
    activeModalCancelAction = null;
    titleEl.textContent = "Game Menu";
    textEl.textContent = "Choose a utility or return to mode selection.";
    menuOptions.hidden = false;
    actions.style.display = "flex";
    confirmBtn.style.display = "none";
    cancelBtn.textContent = "Close";
    cancelBtn.style.display = "inline-block";
    cancelBtn.onclick = closeGameModal;
    updateGameMenuFullscreenAction();
    updateGameMenuDailyAction();
    modal.style.display = "flex";
    pauseFadingFortune("game-modal");
    document.getElementById("gameMenuModeSelect")?.focus();
}

function chooseGameMenuModeSelection(){
    closeGameModal();
    confirmReturnToModeMenu();
}

function openDailyFromGameMenu(){
    closeGameModal();
    openDailyDetailsFromGameMenu();
}
function humanizeBossObjective(value){
    const text = String(value || "").trim();
    if(!text || /^LO\d+(?:\.\d+)*(?:[_-].*)?$/i.test(text) || text === "unassigned_objective") return "";
    return text.replace(/[_-]+/g," ").replace(/\b([a-z])([A-Z])/g,"$1 $2").replace(/\s+/g," ").trim();
}

function getBossObjectiveLabel(objective, bank){
    const match = (bank || []).find(question => getBossObjectiveKey(question) === objective) || null;
    const candidates = [match?.objectiveLabel,match?.learningObjectiveLabel,match?.conceptLabel,match?.tag,match?.conceptId,objective];
    for(const candidate of candidates){
        const label = humanizeBossObjective(candidate);
        if(label) return label;
    }
    return "";
}

function getBossIntroPresentationState(objective){
    const objectiveStats = getObjectiveFamilyStats(objective);
    const objectiveMisses = Math.max(0, objectiveStats.attempts - objectiveStats.correct);
    const recent = Array.isArray(masteryState.recent) ? masteryState.recent : [];
    const recentCorrect = recent.filter(item => item.correct).length;
    const recentAccuracy = recent.length ? recentCorrect / recent.length : null;
    const hasClearTargetedWeakness = Boolean(objective)
        && objectiveStats.attempts >= 2
        && objectiveMisses >= 2
        && objectiveStats.accuracy <= (2 / 3);

    if(hasClearTargetedWeakness) return "targeted-weakness";
    if(recentAccuracy === null || recentAccuracy >= 0.80) return "strong-no-clear-weakness";
    return "mixed-non-specific";
}

// Managerial adapter: reuse selected questions and existing mode callbacks.
// There is deliberately no new telemetry event, scoring, or routing here.
const GUIDE_INTRO_SEEN_KEY = `${STORAGE_PREFIX}:guideIntroSeen`;
const MANAGERIAL_REVEAL_KEY = `${STORAGE_PREFIX}:bossReveals:v1`;
let activeGuideIntroduction = null;
let managerialGuideSeenInMemory = false;
const managerialRevealsInMemory = new Set();
let activeBossReveal = null;
let managerialObservedBossTarget = null;
let managerialModalFocus = null;
let managerialInertElements = [];

function hasSeenGuideIntroduction(){
    if(managerialGuideSeenInMemory)return true;
    try { return localStorage.getItem(GUIDE_INTRO_SEEN_KEY) === "true"; } catch (_) { return false; }
}
function lockManagerialCinematic(screen){
    managerialModalFocus = document.activeElement;
    managerialInertElements = [...document.body.children].filter(node => node !== screen && !node.inert);
    managerialInertElements.forEach(node => { node.inert = true; });
}
function unlockManagerialCinematic(){
    managerialInertElements.forEach(node => { node.inert = false; });
    managerialInertElements = [];
    if(managerialModalFocus?.isConnected) managerialModalFocus.focus();
}
function openGuideIntroduction({replay=false,onProceed=null}={}){
    if(activeGuideIntroduction || activeBossReveal) return;
    const screen=document.getElementById("guideIntroScreen");
    const guide=document.getElementById("wizardImage");
    const image=document.getElementById("guideIntroImage");
    const name=guide?.alt || "The Principal";
    const lines={
        "cost-directive":"Read the evidence. Separate relevant costs, then make your decision.",
        "market-signal":"Read the market signals. Test the incentives behind every decision.",
        "strategy-desk":"Examine the tradeoffs. Build a strategy you can defend.",
        "agency-protocol":"Follow the incentives. Make decisions that hold up under scrutiny."
    };
    const slug=location.pathname.split("/").filter(Boolean).at(-1)?.replace("index.html","") || "";
    const game=Object.keys(lines).find(key=>location.pathname.includes('/'+key+'/')) || slug;
    document.getElementById("guideIntroName").textContent=name;
    document.getElementById("guideIntroPrimary").textContent=lines[game] || "Read the evidence carefully. Make a decision you can defend.";
    document.getElementById("guideIntroSecondary").textContent="";
    image.src=guide.src;image.alt=name;image.hidden=false;
    document.getElementById("guideIntroFallback").hidden=true;
    activeGuideIntroduction={replay,onProceed};
    screen.hidden=false;document.body.classList.add("guide-intro-active");
    pauseFadingFortune("guide-intro");lockManagerialCinematic(screen);
    document.getElementById("guideIntroProceed").focus();
}
function proceedGuideIntroduction(){
    const intro=activeGuideIntroduction;if(!intro)return;
    activeGuideIntroduction=null;
    managerialGuideSeenInMemory=true;
    try {localStorage.setItem(GUIDE_INTRO_SEEN_KEY,"true");} catch (_) {}
    document.getElementById("guideIntroScreen").hidden=true;
    document.body.classList.remove("guide-intro-active");unlockManagerialCinematic();
    resumeFadingFortune("guide-intro");
    if(intro.onProceed)intro.onProceed();
    else document.getElementById("returnMenuBtn")?.focus();
}
function replayGuideIntroduction(){closeGameModal();openGuideIntroduction({replay:true});}

// Curated presentation only; the objective comes from the engine's completed selection.
function getBossChallengeLine(label,presentationState){
    if(presentationState!=="targeted-weakness") return "Show that your reasoning holds up at this checkpoint.";
    const key=String(label||"").toLowerCase();
    const lines=[
        [/cost|production|scale|scope|learning/,"Let's see if you understand the costs behind this decision."],
        [/marginal|relevant|trade.?off|opportunity/,"Separate the relevant tradeoffs. Then defend your decision."],
        [/price|elastic|demand|supply|market/,"Read the market evidence carefully. Defend your conclusion."],
        [/strateg|game|competition|rival|entry/,"Anticipate the response. Show why your strategy holds."],
        [/agency|incentive|contract|information|risk|moral|adverse/,"Follow the incentives. Show where the decision can go wrong."]
    ];
    return lines.find(([pattern])=>pattern.test(key))?.[1] || "Review the evidence. Make a decision you can defend.";
}
function readManagerialReveals(){
    try{return JSON.parse(localStorage.getItem(MANAGERIAL_REVEAL_KEY)||'{}');}catch(_){return {};}
}
function openBossReveal(onProceed){
    if(activeGuideIntroduction || activeBossReveal || !currentQuestion || !isBossRoomForMode(room))return false;
    const key=`${runID}:${gameMode}:${room}`;
    const shown=readManagerialReveals();if(shown[key] || managerialRevealsInMemory.has(key))return false;
    const portrait=document.querySelector('#question .bossIcon');
    const title=document.querySelector('#question .boss-title');
    if(!portrait)return false;
    const objective=managerialObservedBossTarget?.runID===runID && managerialObservedBossTarget.room===room
        ? managerialObservedBossTarget.objective : getBossObjectiveKey(currentQuestion);
    const label=getBossObjectiveLabel(objective,bossPool?.length?bossPool:[currentQuestion]);
    const line=getBossChallengeLine(label,getBossIntroPresentationState(objective));
    const screen=document.getElementById('bossRevealScreen');
    const name=title?.textContent || portrait.alt || 'Checkpoint';
    document.getElementById('bossRevealName').textContent=name;
    document.getElementById('bossRevealKicker').textContent=room===30?'Final Checkpoint':room===20?'Checkpoint Two':'Checkpoint One';
    document.getElementById('bossRevealDialogue').textContent=line;
    const image=document.getElementById('bossRevealImage');image.src=portrait.src;image.alt=name;image.hidden=false;
    document.getElementById('bossRevealFallback').hidden=true;
    activeBossReveal={key,runID,onProceed};
    shown[key]=true;managerialRevealsInMemory.add(key);
    // Bound presentation history; this is independent of the engine's save data.
    try{localStorage.setItem(MANAGERIAL_REVEAL_KEY,JSON.stringify(Object.fromEntries(Object.entries(shown).slice(-90))));}catch(_){}
    screen.hidden=false;document.body.classList.add('boss-reveal-active');
    lockManagerialCinematic(screen);document.getElementById('bossRevealProceed').focus();
    return true;
}
function proceedBossReveal(){
    const encounter=activeBossReveal;if(!encounter)return;
    activeBossReveal=null;document.getElementById('bossRevealScreen').hidden=true;
    document.body.classList.remove('boss-reveal-active');unlockManagerialCinematic();
    // Render the already-selected encounter exactly once, without calling loadQuestion again.
    if(encounter.runID===runID && !runEnding){encounter.onProceed();document.querySelector('#answers button')?.focus();}
}

const managerialStartGame=window.startGame;
window.startGame=function(shouldResume=false,...args){
    if(!shouldResume && !hasSeenGuideIntroduction()){
        openGuideIntroduction({onProceed:()=>window.startGame(shouldResume,...args)});return;
    }
    const result=managerialStartGame.call(this,shouldResume,...args);
    if(document.body.classList.contains('game-active'))maybeShowDailyAnnouncement();
    return result;
};
const managerialBuildBoss=window.buildBossQuestionSet;
window.buildBossQuestionSet=function(bank,diff,objective,...args){
    const result=managerialBuildBoss.call(this,bank,diff,objective,...args);
    managerialObservedBossTarget={runID,room,objective};return result;
};
const managerialDisplayQuestion=window.displayQuestion;
window.displayQuestion=function(...args){
    const render=()=>managerialDisplayQuestion.apply(this,args);
    if(openBossReveal(render))return;
    return render();
};
const managerialSendGameData=window.sendGameData;
window.sendGameData=function(data={}){
    const result=managerialSendGameData.apply(this,arguments);
    // Existing accepted-answer branch only; rejected rapid guesses do not progress a Daily.
    if(data.event==='question' && isFacultyModeSupported(gameMode)){
        try{recordDailyGameplayEvent({correct:Boolean(Number(data.correct)),streak:Number(data.streak||0),question:currentQuestion});}catch(error){console.warn('Daily progress unavailable',error);}
    }
    return result;
};
const managerialShowModal=window.showGameModal;
window.showGameModal=function(...args){document.getElementById('gameMenuOptions').hidden=true;document.getElementById('gameModalConfirm').style.display='inline-block';return managerialShowModal.apply(this,args);};
const managerialCloseModal=window.closeGameModal;
window.closeGameModal=function(...args){document.getElementById('gameMenuOptions').hidden=true;const result=managerialCloseModal.apply(this,args);document.getElementById('returnMenuBtn')?.focus();return result;};
const soundButton=document.getElementById('soundToggle');
if(soundButton){soundButton.className='game-menu-option';document.getElementById('gameMenuOptions').appendChild(soundButton);}
document.addEventListener('fullscreenchange',updateGameMenuFullscreenAction);
document.addEventListener('webkitfullscreenchange',updateGameMenuFullscreenAction);
document.addEventListener('keydown',event=>{
    if(event.key!=='Escape')return;
    if(activeGuideIntroduction){event.preventDefault();proceedGuideIntroduction();}
    else if(activeBossReveal){event.preventDefault();proceedBossReveal();}
    else if(!document.getElementById('gameMenuOptions').hidden){event.preventDefault();closeGameModal();}
});
