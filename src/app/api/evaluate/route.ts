import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import Groq from "groq-sdk";

// Enable CORS for external frontends to call this endpoint
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Support both old 'explanation' key for internal demo and new 'clean_text' for Team Flow
    const userExplanation = body.clean_text || body.explanation;
    const concept = body.concept || "the current topic";
    const context = body.context || "No specific textbook context provided.";
    const persona = body.persona || "a strict but fair educational AI judge";

    if (!userExplanation) {
      return NextResponse.json(
        { error: "Explanation (clean_text) is required." },
        { status: 400, headers: corsHeaders }
      );
    }

    const hasGroqKey = process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== "YOUR_API_KEY_HERE";
    const hasGeminiKey = process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "YOUR_API_KEY_HERE";

    if (!hasGroqKey && !hasGeminiKey) {
      // Mock response for when no API key is set
      return NextResponse.json({
        clarity: { score: 80, explanation: "The explanation was easy to follow." },
        structure: { score: 75, explanation: "Good flow, but could use more step-by-step logic." },
        correctness: { score: 90, explanation: "The core facts were completely accurate." },
        final_score: 82,
        mistakes: ["No major mistakes found."],
        improved_explanation: "This is a mock improved explanation.",
        win: true
      }, { headers: corsHeaders });
    }

    const prompt = `
You are acting as: ${persona}
The user is playing "Explain-to-Win" where they must teach a concept to you.

Concept to teach: "${concept}"
RAG Textbook Context (Ground Truth): "${context}"

User's Explanation (clean_text): "${userExplanation}"

Your task is to evaluate their explanation.
You must respond in valid JSON matching this exact schema:
{
  "clarity": {
    "score": <number 0-100>,
    "explanation": "<1-2 sentences explaining why they got this clarity score>"
  },
  "structure": {
    "score": <number 0-100>,
    "explanation": "<1-2 sentences explaining why they got this structure score>"
  },
  "correctness": {
    "score": <number 0-100>,
    "explanation": "<1-2 sentences explaining why they got this correctness score, comparing to the RAG context>"
  },
  "final_score": <number 0-100>,
  "mistakes": ["<Array of string strings pointing out specific misconceptions or errors. Empty array if perfect>"],
  "improved_explanation": "<How you, the AI, would explain it perfectly>",
  "win": <boolean - true if all scores are >= 75 AND correctness is >= 85, else false>
}

Return ONLY the raw JSON object. Do not include markdown formatting or backticks.
`;

    let textResult = "";

    if (hasGroqKey) {
      const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
      const response = await groq.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "llama-3.1-8b-instant",
        response_format: { type: "json_object" }
      });
      textResult = response.choices[0]?.message?.content || "";
    } else {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });
      textResult = response.text() || "";
    }

    if (!textResult) {
      throw new Error("No response from AI");
    }

    let cleanedResult = textResult.trim();
    if (cleanedResult.startsWith("\`\`\`")) {
      cleanedResult = cleanedResult.replace(/^\`\`\`(?:json)?\n/, "").replace(/\n\`\`\`$/, "").trim();
    }

    let jsonResult;
    try {
      jsonResult = JSON.parse(cleanedResult);
    } catch (parseError) {
      console.error("JSON Parse Error. Raw text:", textResult);
      throw new Error("Failed to parse AI response as JSON");
    }

    if (typeof jsonResult.win === "string") {
      jsonResult.win = jsonResult.win.toLowerCase() === "true";
    }

    return NextResponse.json(jsonResult, { headers: corsHeaders });
  } catch (error: any) {
    console.error("Evaluation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to evaluate explanation." },
      { status: 500, headers: corsHeaders }
    );
  }
}
