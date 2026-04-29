import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import Groq from "groq-sdk";

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
    const { concept, context, persona } = await req.json();

    if (!concept) {
      return NextResponse.json(
        { error: "Concept is required." },
        { status: 400, headers: corsHeaders }
      );
    }

    const hasGroqKey = process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== "YOUR_API_KEY_HERE";
    const hasGeminiKey = process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "YOUR_API_KEY_HERE";

    if (!hasGroqKey && !hasGeminiKey) {
      return NextResponse.json({
        report: "### Mock Study Guide\n\nIt looks like you're preparing to explain **" + concept + "**. Here is a simple breakdown:\n\n1. **Core Idea**: ...\n2. **Analogy**: ...\n\n*(Add your API key to generate real dynamic reports!)*"
      }, { headers: corsHeaders });
    }

    const prompt = `
The user is preparing to explain the concept of "${concept}" to a "${persona}". 
Your task is to generate a highly detailed, encouraging, and structured "Practice Study Guide" to help them prepare their explanation.

${context ? `Use this textbook context as the absolute ground truth to base your explanation on:\n"${context}"` : ""}

Write the report in Markdown format. Use headers, bullet points, and clear analogies. 
Address the user directly. Explain the concept beautifully so they can easily teach it to a ${persona}. Provide tips on what to focus on and what to avoid for this specific audience.

Respond ONLY with a valid JSON object matching this exact schema:
{
  "report": "<The detailed markdown report string>"
}
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

    const jsonResult = JSON.parse(cleanedResult);

    return NextResponse.json(jsonResult, { headers: corsHeaders });
  } catch (error: any) {
    console.error("Report generation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate report." },
      { status: 500, headers: corsHeaders }
    );
  }
}
