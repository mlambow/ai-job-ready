export const AIResponseFormat = `
You must return a JSON object with the following structure:

{
  "overallScore": number,

  "ATS": {
    "score": number,
    "tips": [
      {
        "type": "good" | "improve" | "unsatisfactory",
        "tip": string
      }
    ]
  },

  "toneAndStyle": {
    "score": number
  },

  "content": {
    "score": number,
    "tips": [
      {
        "type": "good" | "improve" | "unsatisfactory",
        "explanation": string
      }
    ]
  },

  "structure": {
    "score": number
  },

  "skills": {
    "score": number,
    "matchedSkills": string[],
    "missingSkills": string[],
    "tips": [
      {
        "type": "good" | "improve" | "unsatisfactory",
        "explanation": string
      }
    ]
  },

  "experience": {
    "analysis": string,
    "recommendedMetrics": string[]
  },

  "keywords": {
    "missingKeywords": string[],
    "tips": string[]
  },

  "summary": {
    "alignmentScore": number,
    "tips": [
      {
        "type": "good" | "improve" | "unsatisfactory",
        "explanation": string
      }
    ]
  },

  "aiSuggestions": {
    "improvedSummary": string
  }
}
`;