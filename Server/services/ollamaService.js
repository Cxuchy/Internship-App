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

module.exports = { askOllama };
