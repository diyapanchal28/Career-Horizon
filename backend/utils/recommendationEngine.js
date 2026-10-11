/**
 * Career Horizon — Transparent Rule-Based Recommendation Engine
 *
 * Scoring model:
 * - Field Match: 40% (40 points) — 1st choice = 40, 2nd choice = 30, 3rd choice = 20, other = 0
 * - Specialisation / Subfield Match: 30% (30 points) — direct match = 30, neighbouring/related = 15-20
 * - Interest Match: 20% (20 points) — matched interests / required interests * 20
 * - Activity Match: 10% (10 points) — matched activities / career activities * 10
 * Total: 100% (100 points)
 */

const ACTIVITY_LABELS = [
    "Finding & Solving Problems",
    "Analyzing Data",
    "Creating New Ideas",
    "Designing & Creating",
    "Building Technology",
    "Research & Investigation",
    "Explaining & Communicating",
    "Planning & Organizing"
];

const ACTIVITY_SET_LOWER = new Set(ACTIVITY_LABELS.map((a) => a.toLowerCase()));

/**
 * Derive up to 4 relevant day-to-day activities for a career.
 * Uses explicit activity labels stored in career.workPreferences if present,
 * otherwise infers them deterministically from career name, skills, responsibilities, and interests.
 */
function getCareerActivities(career) {
    const rawPrefs = Array.isArray(career.workPreferences) ? career.workPreferences : [];
    const explicitActivities = rawPrefs.filter((p) =>
        ACTIVITY_SET_LOWER.has(String(p).trim().toLowerCase())
    );
    if (explicitActivities.length > 0) {
        return explicitActivities;
    }

    const nameLower = String(career.name || "").toLowerCase();
    const fieldLower = String(career.fieldId?.name || career.fieldName || "").toLowerCase();
    const subLower = String(career.subfieldId?.name || career.subfieldName || "").toLowerCase();
    const combinedText = [
        nameLower,
        fieldLower,
        subLower,
        ...(career.workInterests || []),
        ...(career.technicalSkills || []),
        ...(career.professionalSkills || []),
        ...(career.responsibilities || [])
    ]
        .join(" ")
        .toLowerCase();

    // Role-specific canonical activity sets
    if (nameLower.includes("data analyst") || nameLower.includes("data scientist") || subLower.includes("data")) {
        return [
            "Analyzing Data",
            "Finding & Solving Problems",
            "Research & Investigation",
            "Explaining & Communicating"
        ];
    }
    if (nameLower.includes("business analyst") || nameLower.includes("product manager") || nameLower.includes("project")) {
        return [
            "Analyzing Data",
            "Finding & Solving Problems",
            "Planning & Organizing",
            "Explaining & Communicating"
        ];
    }
    if (nameLower.includes("design") || nameLower.includes("ui") || nameLower.includes("ux") || fieldLower.includes("design")) {
        return [
            "Designing & Creating",
            "Creating New Ideas",
            "Research & Investigation",
            "Explaining & Communicating"
        ];
    }
    if (
        nameLower.includes("developer") ||
        nameLower.includes("engineer") ||
        nameLower.includes("programmer") ||
        nameLower.includes("architect")
    ) {
        return [
            "Building Technology",
            "Finding & Solving Problems",
            "Creating New Ideas",
            "Analyzing Data"
        ];
    }

    const inferred = [];
    const addIf = (cond, label) => {
        if (cond && !inferred.includes(label) && inferred.length < 4) {
            inferred.push(label);
        }
    };

    addIf(/problem|debug|troubleshoot|solve|fix|optimiz/.test(combinedText), "Finding & Solving Problems");
    addIf(/data|analys|analytics|statistic|metric|sql|numbers|chart|financial/.test(combinedText), "Analyzing Data");
    addIf(/build|develop|code|software|web|app|system|tech|cloud|network/.test(combinedText), "Building Technology");
    addIf(/design|ui|ux|visual|graphic|creative|content|brand|layout/.test(combinedText), "Designing & Creating");
    addIf(/research|investigat|study|scienti|discover|audit|clinical/.test(combinedText), "Research & Investigation");
    addIf(/plan|organiz|manage|coordinat|process|strategy|operations/.test(combinedText), "Planning & Organizing");
    addIf(/communicat|explain|present|teach|client|advise|consult|counsel/.test(combinedText), "Explaining & Communicating");
    addIf(/idea|innovat|concept|brainstorm|campaign/.test(combinedText), "Creating New Ideas");

    for (const fallback of ACTIVITY_LABELS) {
        if (inferred.length >= 4) break;
        if (!inferred.includes(fallback)) inferred.push(fallback);
    }

    return inferred.slice(0, 4);
}

function calculateCareerMatch(user, career) {
    if (!user || !career) {
        return {
            score: 50,
            components: { field: 20, subfield: 15, workInterest: 10, workPreference: 5 },
            reasons: ["Explore this role to see if it matches your goals."]
        };
    }

    const reasons = [];

    // Extract User IDs
    const userFieldIds = (user.selectedFields || []).map((f) =>
        String(f?._id || f)
    );
    const userSubfieldIds = (user.selectedSubfields || []).map((s) =>
        String(s?._id || s)
    );
    const userInterests = (user.workInterests || []).map((i) =>
        String(i).trim().toLowerCase()
    );
    const userPreferences = (user.workPreferences || []).map((p) =>
        String(p).trim().toLowerCase()
    );

    // Extract Career Data
    const careerFieldId = String(career.fieldId?._id || career.fieldId || "");
    const careerSubfieldId = String(career.subfieldId?._id || career.subfieldId || "");
    const careerFieldName = career.fieldId?.name || career.fieldName || "this field";
    const careerSubfieldName = career.subfieldId?.name || career.subfieldName || "this specialisation";

    const careerInterests = (career.workInterests || []).map((i) =>
        String(i).trim().toLowerCase()
    );

    // 1. FIELD MATCH (Max 40 points: 1st = 40, 2nd = 30, 3rd = 20, Other = 0)
    let fieldScore = 0;
    if (userFieldIds.length > 0) {
        const fieldIndex = userFieldIds.indexOf(careerFieldId);
        if (fieldIndex === 0) {
            fieldScore = 40; // 1st choice
            reasons.push(`You selected ${careerFieldName} as your top area of interest.`);
        } else if (fieldIndex === 1) {
            fieldScore = 30; // 2nd choice
            reasons.push(`You selected ${careerFieldName} as your second area of interest.`);
        } else if (fieldIndex === 2) {
            fieldScore = 20; // 3rd choice
            reasons.push(`You selected ${careerFieldName} as one of your focus areas.`);
        } else {
            fieldScore = 0;
        }
    } else {
        fieldScore = 20; // Baseline when not specified
    }

    // 2. SPECIALISATION / SUBFIELD MATCH (Max 30 points)
    let subfieldScore = 0;
    if (userSubfieldIds.length > 0) {
        if (userSubfieldIds.includes(careerSubfieldId)) {
            subfieldScore = 30;
            reasons.push(`Directly matches your selected specialisation (${careerSubfieldName}).`);
        } else if (fieldScore === 40) {
            // Sits in a neighbouring subfield within the user's #1 field
            subfieldScore = 20;
            reasons.push(`Sits in a related specialisation within ${careerFieldName}.`);
        } else if (fieldScore > 0) {
            // Sits in a neighbouring subfield within the user's 2nd/3rd field
            subfieldScore = 15;
            reasons.push(`Sits in a neighbouring specialisation within ${careerFieldName}.`);
        } else {
            subfieldScore = 0;
        }
    } else {
        subfieldScore = fieldScore > 0 ? 15 : 0;
    }

    // 3. INTEREST MATCH (Max 20 points: Matched interests / required interests * 20)
    let interestScore = 0;
    const matchedInterests = [];
    if (userInterests.length > 0 && careerInterests.length > 0) {
        career.workInterests.forEach((interest) => {
            if (userInterests.includes(String(interest).trim().toLowerCase())) {
                matchedInterests.push(interest);
            }
        });

        if (matchedInterests.length > 0) {
            const ratio = matchedInterests.length / careerInterests.length;
            interestScore = Math.min(20, Math.round(ratio * 20));
            matchedInterests.slice(0, 2).forEach((item) => {
                reasons.push(`Matches your interest in "${item}".`);
            });
        } else {
            interestScore = 0;
        }
    } else if (userInterests.length > 0) {
        interestScore = 10;
    }

    // 4. ACTIVITY & PRACTICAL WORK STYLE MATCH (Max 10 points)
    let preferenceScore = 0;
    const careerActivities = getCareerActivities(career);
    const matchedActivities = [];

    if (userPreferences.length > 0) {
        const userHasNewActivities = userPreferences.some((p) => ACTIVITY_SET_LOWER.has(p));

        if (userHasNewActivities) {
            careerActivities.forEach((act) => {
                if (userPreferences.includes(String(act).trim().toLowerCase())) {
                    matchedActivities.push(act);
                }
            });

            if (matchedActivities.length > 0) {
                const denom = Math.max(1, Math.min(4, careerActivities.length));
                preferenceScore = Math.min(10, Math.round((matchedActivities.length / denom) * 10));
                reasons.push(
                    `Includes day-to-day activities you enjoy (${matchedActivities.slice(0, 2).join(", ")}).`
                );
            } else {
                preferenceScore = 0;
            }
        } else if (Array.isArray(career.workPreferences) && career.workPreferences.length > 0) {
            // Legacy fallback if user still has old work-style strings saved
            career.workPreferences.forEach((pref) => {
                if (userPreferences.includes(String(pref).trim().toLowerCase())) {
                    matchedActivities.push(pref);
                }
            });
            if (matchedActivities.length > 0) {
                const ratio = matchedActivities.length / career.workPreferences.length;
                preferenceScore = Math.min(10, Math.round(ratio * 10));
            }
        }

        // Practical Problem-Solving Style & Career Priority alignment
        const nameAndFieldText = `${career.name || ""} ${careerFieldName} ${careerSubfieldName} ${(career.technicalSkills || []).join(" ")}`.toLowerCase();
        const demandLower = String(career.demandLevel || career.marketDemand || "").toLowerCase();

        if (
            userPreferences.includes("style:hands-on technical building") &&
            /developer|engineer|cloud|security|software|data|system|tech/.test(nameAndFieldText)
        ) {
            preferenceScore = Math.min(10, preferenceScore + 2);
            reasons.push("Fits your preference for hands-on technical building.");
        }
        if (
            userPreferences.includes("style:evidence & data-driven analysis") &&
            /data|analy|finance|financial|econom|research|science|statistic|audit/.test(nameAndFieldText)
        ) {
            preferenceScore = Math.min(10, preferenceScore + 2);
            reasons.push("Aligns with your evidence and data-driven analytical approach.");
        }
        if (
            userPreferences.includes("style:user-centric design & empathy") &&
            /design|ux|ui|product|media|creative|content|brand|front/.test(nameAndFieldText)
        ) {
            preferenceScore = Math.min(10, preferenceScore + 2);
            reasons.push("Matches your focus on user-centric design and experience.");
        }
        if (
            userPreferences.includes("style:structured strategy & execution") &&
            /business|manage|product|operations|project|consult|strategy|finance/.test(nameAndFieldText)
        ) {
            preferenceScore = Math.min(10, preferenceScore + 2);
            reasons.push("Suits your structured strategy and project execution style.");
        }
        if (
            userPreferences.includes("priority:high market demand & rapid growth") &&
            (demandLower.includes("high") || demandLower.includes("very high"))
        ) {
            preferenceScore = Math.min(10, preferenceScore + 2);
            reasons.push("Matches your priority for high market demand and growth.");
        }
    }

    const totalScore = Math.min(100, Math.max(5, fieldScore + subfieldScore + interestScore + preferenceScore));

    // Fallback reason if none matched
    if (reasons.length === 0) {
        reasons.push(`Explores career pathways in ${careerFieldName}.`);
    }

    return {
        score: totalScore,
        components: {
            field: fieldScore,
            subfield: subfieldScore,
            workInterest: interestScore,
            workPreference: preferenceScore,
            activity: preferenceScore
        },
        reasons: reasons.slice(0, 4)
    };
}

/**
 * Score all careers for a given user and return them sorted by match percentage descending
 */
function rankCareersForUser(user, careers) {
    if (!careers || !Array.isArray(careers)) return [];

    return careers
        .map((career) => {
            const matchData = calculateCareerMatch(user, career);
            return {
                career,
                matchPercentage: matchData.score,
                matchComponents: matchData.components,
                matchReasons: matchData.reasons
            };
        })
        .sort((a, b) => b.matchPercentage - a.matchPercentage);
}

module.exports = {
    calculateCareerMatch,
    rankCareersForUser
};
