import OpenAI from "openai";

let client;

function getClient() {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error("AI question generation is not configured on this server");
  }

  if (!client) {
    client = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: process.env.OPENROUTER_API_KEY,
    });
  }

  return client;
}

export async function generateQuestionsFromPrompt(prompt) {
  const completion = await getClient().chat.completions.create({
    model: "tencent/hy3:free",
    messages: [
      {
        role: "system",
        content:
          "You generate questions for a party game where each player answers about themselves and others guess who wrote each answer. Respond with ONLY a JSON array of question strings (e.g. [\"Question one?\", \"Question two?\"]) and nothing else - no markdown, no explanation.",
      },
      { role: "user", content: prompt },
    ],
  });

  const raw = completion.choices[0]?.message?.content?.trim() || "";
  const jsonText = raw.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();

  let parsed;
  try {
    parsed = JSON.parse(jsonText);
  } catch {
    throw new Error("AI returned an invalid response");
  }

  if (!Array.isArray(parsed)) {
    throw new Error("AI returned an invalid response");
  }

  return parsed.map((q) => String(q).trim()).filter(Boolean);
}
