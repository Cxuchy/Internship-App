const axios = require('axios');

async function askOllama(text) {
const prompt = `
Here is a text describing an internship offer. Extract and summarize the key information into a clean and valid JSON object using the following fields if available:

{
  "title": "",
  "company": "",
  "location": "",
  "duration": "",
  "startDate": "",
  "responsibilities": [],
  "profile": [],
  "requiredDocuments": [],
  "notes": "",
  "website": "",
  "contactEmail": ""
}

Instructions:
- Include additional fields if the text contains other relevant information.
- DO NOT use markdown formatting (no \`\`\`json or code blocks).
- DO NOT return any explanation, comments, or text — only the raw JSON.
- Make sure the JSON is syntactically valid and properly structured.
- Don't return any text if i give you an empty string.

Text:
${text}
`;




  const response = await axios.post('http://localhost:11434/api/generate', {
    model: 'gemma3', // or llama2 etc.
    prompt: prompt,
    stream: false
  });

  return response.data.response;
}

async function analyzeCVDetailed(text) {
  if (!text.trim()) return "";

  const prompt = `
You are analyzing a candidate's CV. Extract detailed structured information and return a valid JSON using the format below:

{
  "summary": "",
  "field": "",
  "experienceLevel": "",
  "strengths": [],
  "weaknesses": [],
  "technicalSkills": [],
  "softSkills": [],
  "certifications": [],
  "education": "",
  "languages": [],
  "recommendations": ""
}

Instructions:
- "summary" should be a 1-2 sentence overview.
- "field" is the professional area like IT, Marketing, Engineering, etc.
- "experienceLevel" should be one of: Junior, Mid-Level, Senior, Intern.
- Fill all arrays based on content found (use empty arrays if not mentioned).
- "recommendations" should suggest clear, actionable improvements (e.g., learn backend, improve communication).
- DO NOT include any explanation or comments.
- DO NOT use markdown formatting.
- Return nothing if the input is empty.
- Ensure the JSON is syntactically valid with double quotes.

CV:
${text}
  `;

  const response = await axios.post('http://localhost:11434/api/generate', {
    model: 'gemma3', // or other local model
    prompt: prompt,
    stream: false
  });

  return response.data.response;
}



module.exports = { askOllama,analyzeCVDetailed };
