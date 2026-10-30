/**
 * Career Horizon AI — Dedicated AI Service
 * Supports Google Gemini and OpenAI / compatible endpoints.
 * Includes timeout protection, token management, error handling, and strict prompt grounding.
 */

const FALLBACK_GEMINI_MODELS = [
    "gemini-3-flash-preview",
    "gemini-3.5-flash",
    "gemini-flash-latest"
];

const callGemini = async ({
    apiKey,
    systemPrompt,
    conversationHistory,
    userPrompt,
    modelName = "gemini-3-flash-preview",
    triedModels = []
}) => {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

    const currentTried = [...triedModels, modelName];

    // Map conversation history to Gemini format (user -> user, assistant -> model)
    const contents = [];

    // Prepend system instruction as initial context
    if (systemPrompt) {
        contents.push({
            role: "user",
            parts: [{ text: `[SYSTEM INSTRUCTIONS & CAREER CONTEXT]\n${systemPrompt}\n[END SYSTEM INSTRUCTIONS]\nPlease acknowledge and follow these rules for the following conversation.` }]
        });
        contents.push({
            role: "model",
            parts: [{ text: "Understood. I am Career Horizon AI, your Personal Career Assistant. I will follow all instructions, adhere strictly to the verified data provided, and give structured, student-friendly, practical guidance." }]
        });
    }

    // Add recent conversation history (role: user/model)
    if (Array.isArray(conversationHistory)) {
        for (const msg of conversationHistory) {
            const role = msg.role === "assistant" || msg.role === "model" ? "model" : "user";
            contents.push({
                role,
                parts: [{ text: msg.content }]
            });
        }
    }

    // Add current user prompt
    contents.push({
        role: "user",
        parts: [{ text: userPrompt }]
    });

    const requestBody = {
        contents,
        generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 1000,
            topP: 0.95
        }
    };

    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
        signal: AbortSignal.timeout(20000) // 20s timeout
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const status = response.status;
        const msg = errorData.error?.message || response.statusText;

        if (status === 429) {
            throw new Error("AI service rate limit exceeded. Please wait a minute and try again.");
        }

        // Automatic fallback cascade if model is deprecated, not found, or temporary high demand
        if (status === 400 || status === 404 || status === 503) {
            const nextModel = FALLBACK_GEMINI_MODELS.find((m) => !currentTried.includes(m));
            if (nextModel) {
                console.log(`Model ${modelName} returned status ${status}. Falling back to ${nextModel}...`);
                return callGemini({
                    apiKey,
                    systemPrompt,
                    conversationHistory,
                    userPrompt,
                    modelName: nextModel,
                    triedModels: currentTried
                });
            }
        }

        throw new Error(`AI Service returned status ${status}: ${msg}`);
    }

    const data = await response.json();
    const candidate = data.candidates?.[0];
    const text = candidate?.content?.parts?.[0]?.text;

    if (!text) {
        throw new Error("AI Service returned an empty response. Please rephrase your question.");
    }

    return text.trim();
};

const callOpenAI = async ({ apiKey, baseUrl, systemPrompt, conversationHistory, userPrompt, modelName = "gpt-4o-mini" }) => {
    const apiEndpoint = `${baseUrl || "https://api.openai.com/v1"}/chat/completions`;

    const messages = [];

    if (systemPrompt) {
        messages.push({ role: "system", content: systemPrompt });
    }

    if (Array.isArray(conversationHistory)) {
        for (const msg of conversationHistory) {
            messages.push({
                role: msg.role === "assistant" ? "assistant" : "user",
                content: msg.content
            });
        }
    }

    messages.push({ role: "user", content: userPrompt });

    const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: modelName,
            messages,
            temperature: 0.4,
            max_tokens: 1000
        }),
        signal: AbortSignal.timeout(20000)
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const msg = errorData.error?.message || response.statusText;
        if (response.status === 429) {
            throw new Error("AI service rate limit reached. Please wait a moment before asking again.");
        }
        throw new Error(`AI Service returned status ${response.status}: ${msg}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content;

    if (!text) {
        throw new Error("AI Service returned an empty response.");
    }

    return text.trim();
};

/**
 * Generate AI Career Guidance response
 * @param {Object} options
 * @param {string} options.systemPrompt - Grounding context and rules
 * @param {Array} options.conversationHistory - Recent messages
 * @param {string} options.userPrompt - User's current message
 * @returns {Promise<string>}
 */
const generateCareerGuidance = async ({ systemPrompt, conversationHistory = [], userPrompt }) => {
    const geminiKey = process.env.GEMINI_API_KEY || process.env.AI_API_KEY;
    const openAIKey = process.env.OPENAI_API_KEY;

    if (!geminiKey && !openAIKey) {
        const configError = new Error(
            "AI service is not configured. Please add GEMINI_API_KEY (or OPENAI_API_KEY) in the backend .env file to enable intelligent AI career guidance."
        );
        configError.code = "AI_NOT_CONFIGURED";
        throw configError;
    }

    // Limit conversation history to latest 8 messages to reduce token usage and costs
    const trimmedHistory = conversationHistory.slice(-8);

    try {
        if (geminiKey) {
            const geminiModel = process.env.GEMINI_MODEL || "gemini-3-flash-preview";
            return await callGemini({
                apiKey: geminiKey,
                systemPrompt,
                conversationHistory: trimmedHistory,
                userPrompt,
                modelName: geminiModel
            });
        }

        if (openAIKey) {
            const openAIModel = process.env.OPENAI_MODEL || "gpt-4o-mini";
            const baseUrl = process.env.OPENAI_BASE_URL;
            return await callOpenAI({
                apiKey: openAIKey,
                baseUrl,
                systemPrompt,
                conversationHistory: trimmedHistory,
                userPrompt,
                modelName: openAIModel
            });
        }
    } catch (err) {
        console.error("AI Service Error:", err.message);
        throw err;
    }
};

module.exports = {
    generateCareerGuidance
};
