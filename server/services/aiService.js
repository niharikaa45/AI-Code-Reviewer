import axios from "axios";

export const reviewCode = async ({code, language, reviewType}) => {
   console.log("Code:", code);
   console.log("Language:", language);
    console.log("Review Type:", reviewType);

  const prompt = `
You are an expert code reviewer.

Analyze this ${language} code.

Review Type: ${reviewType}

Return ONLY valid JSON in this exact format:

{
  "rating": "",
  "bugs": [],
  "improvements": [],
  "securityIssues": [],
  "optimizedCode": ""
}

IMPORTANT:
- Return ONLY JSON.
- Do NOT use markdown.
- Do NOT write \`\`\`json.
- Do NOT write explanations.
- Do NOT include any text before or after the JSON.

Code:
${code}
`;

  try {
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.2,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const content = response.data.choices[0].message.content;

    const cleaned = content
     .replace(/^```json\s*/i, "")
     .replace(/^```\s*/i, "")
     .replace(/\s*```$/, "")
     .trim();

    console.log("AI Response:");
    console.log(cleaned);

    let parsedReview = null;
    try {
      parsedReview = JSON.parse(cleaned);
    } catch (err) {
      const jsonMatch = cleaned.match(/(\{[\s\S]*\})/);
      if (jsonMatch) {
        try {
          parsedReview = JSON.parse(jsonMatch[1]);
        } catch (parseError) {
          console.log("Failed to parse extracted JSON:", parseError);
        }
      }
    }

    if (parsedReview) {
      return parsedReview;
    }

    return {
      rating: "A number between 1 and 10",
      bugs: ["AI returned invalid JSON"],
      improvements: [],
      securityIssues: [],
      optimizedCode: cleaned,
    };
  } catch (error) {
    console.error("Error calling Groq API:", error.message);
    return {
      rating: "A number between 1 and 10",
      bugs: ["API request failed"],
      improvements: [],
      securityIssues: [],
      optimizedCode: "",
    };
  }
};
