import OpenAI from "openai";

const apiKey = process.env.OPENAI_API_KEY;
const openai = apiKey ? new OpenAI({ apiKey }) : null;

const completion = async (system, userPrompt) => {
  if (!openai) {
    return "AI unavailable: configure OPENAI_API_KEY.";
  }

  const response = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    messages: [
      { role: "system", content: system },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.6,
  });

  return response.choices?.[0]?.message?.content?.trim() || "No AI response generated.";
};

export const summarizeJournal = (text) => completion(
  "You are LifeOS AI. Summarize user journals with empathy and include 3 practical takeaways.",
  `Summarize this journal entry in <140 words, then list takeaways:\n${text}`
);

export const breakdownGoal = (goalText) => completion(
  "You are a goal execution coach.",
  `Break this vision/goal into SMART milestones and weekly tasks:\n${goalText}`
);

export const motivationalInsight = (context) => completion(
  "You provide concise motivational guidance rooted in progress psychology.",
  `Generate a personalized motivational message using this context:\n${context}`
);

export const analyzeLifeTheme = (content) => completion(
  "You analyze life patterns and themes from user data.",
  `Find recurring life themes and growth opportunities from:\n${content}`
);
