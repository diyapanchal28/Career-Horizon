/**
 * Career Horizon — Transparent Rule-Based Recommendation Engine
 *
 * Scoring model:
 * - Field Match: 40% (40 points)
 * - Specialisation / Subfield Match: 30% (30 points)
 * - Work Interest Match: 20% (20 points)
 * - Work Style / Preference Match: 10% (10 points)
 * Total: 100% (100 points)
 */

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
    const careerPreferences = (career.workPreferences || []).map((p) =>
        String(p).trim().toLowerCase()
    );

    // 1. FIELD MATCH (Max 40 points)
    let fieldScore = 0;
    if (userFieldIds.length > 0) {
        const fieldIndex = userFieldIds.indexOf(careerFieldId);
        if (fieldIndex === 0) {
            fieldScore = 40; // 1st choice
            reasons.push(`You selected ${careerFieldName} as your top area of interest.`);
        } else if (fieldIndex === 1) {
            fieldScore = 35; // 2nd choice
            reasons.push(`You selected ${careerFieldName} as an area of interest.`);
        } else if (fieldIndex === 2) {
            fieldScore = 30; // 3rd choice
            reasons.push(`You selected ${careerFieldName} as one of your focus areas.`);
        } else {
            fieldScore = 0;
        }
    } else {
        fieldScore = 20; // Baseline when not specified
    }

    // 2. SUBFIELD MATCH (Max 30 points)
    let subfieldScore = 0;
    if (userSubfieldIds.length > 0) {
        if (userSubfieldIds.includes(careerSubfieldId)) {
            subfieldScore = 30;
            reasons.push(`You selected ${careerSubfieldName}, which is directly what this role sits in.`);
        } else if (fieldScore > 0) {
            // Sits in a neighbouring subfield within the user's chosen field
            subfieldScore = 15;
            reasons.push(`Sits in a related specialisation within ${careerFieldName}.`);
        } else {
            subfieldScore = 0;
        }
    } else {
        subfieldScore = fieldScore > 0 ? 15 : 10;
    }

    // 3. WORK INTEREST MATCH (Max 20 points)
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
            interestScore = Math.min(20, Math.round(ratio * 20) + (matchedInterests.length >= 2 ? 4 : 0));
            matchedInterests.slice(0, 2).forEach((item) => {
                reasons.push(`You selected "${item}", which is central to this career.`);
            });
        } else {
            interestScore = 4;
        }
    } else {
        interestScore = 10;
    }

    // 4. WORK STYLE / PREFERENCE MATCH (Max 10 points)
    let preferenceScore = 0;
    const matchedPreferences = [];
    if (userPreferences.length > 0 && careerPreferences.length > 0) {
        career.workPreferences.forEach((pref) => {
            if (userPreferences.includes(String(pref).trim().toLowerCase())) {
                matchedPreferences.push(pref);
            }
        });

        if (matchedPreferences.length > 0) {
            const ratio = matchedPreferences.length / careerPreferences.length;
            preferenceScore = Math.min(10, Math.round(ratio * 10) + 2);
            reasons.push(`Your preferred work style (${matchedPreferences[0]}) fits how this role is structured.`);
        } else {
            preferenceScore = 2;
        }
    } else {
        preferenceScore = 5;
    }

    const totalScore = Math.min(100, Math.max(10, fieldScore + subfieldScore + interestScore + preferenceScore));

    // Fallback reason if none matched
    if (reasons.length === 0) {
        reasons.push(`Explores high-demand skills in ${careerFieldName}.`);
    }

    return {
        score: totalScore,
        components: {
            field: fieldScore,
            subfield: subfieldScore,
            workInterest: interestScore,
            workPreference: preferenceScore
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
