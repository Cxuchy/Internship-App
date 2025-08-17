const axios = require('axios');
const Resume = require('../models/cv.model');
const Offer = require('../models/offer.model');

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




  const response = await axios.post(`${process.env.OLLAMA_ENDPOINT}`, {
    model: 'gemma3:1b', // or llama2 etc.
    prompt: prompt,
    stream: false
  },
    {
      timeout: 600000       // 10 minutes in milliseconds
    }
  );

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

  const response = await axios.post(`${process.env.OLLAMA_ENDPOINT}`, {
    model: 'gemma3:1b', // or other local model
    prompt: prompt,
    stream: false
  },
    {
      timeout: 600000       // 10 minutes in milliseconds
    }
  );

  return response.data.response;
}



async function askOllamaWithResumeAndOffer(resume, offer) {
  const prompt = `
You are a job matching assistant.

Given the following RESUME and JOB OFFER, evaluate the candidate’s suitability. Return valid JSON with:
{
  "matchScore": number (0-100),
  "feedback": string (summary of fit, strengths, and gaps be short),
  "isStrongMatch": boolean (true if score >= 75)
}

RESUME:
${JSON.stringify(resume)}

JOB OFFER:
${JSON.stringify(offer)}

Rules:
- Consider education, skills, experience, and soft skills.
- Penalize gaps in must-have requirements or skills.
- Be concise but informative in feedback.
- JSON only, no markdown or extra text.
`;

  try {
    const response = await axios.post(`${process.env.OLLAMA_ENDPOINT}`, {
      model: 'gemma3:1b', // or llama2, mixtral etc.
      prompt: prompt,
      stream: false
    },
      {
        timeout: 600000       // 10 minutes in milliseconds
      }
    );

    return response.data.response.trim();
  } catch (error) {
    console.error('Error calling Ollama:', error.message);
    return null;
  }
}

async function matchOffersToResume(userEmail) {
  const resume = await Resume.findOne({ userEmail });
  if (!resume) throw new Error('Resume not found');

  const offers = await Offer.find({ userEmail });

  for (const offer of offers) {
    // Skip if feedback and score already exist
    if (offer.matchScore !== undefined && offer.feedback) {
      console.log(`✅ Offer ${offer._id} already has feedback and score. Skipping...`);
      continue;
    }

    const rawResult = await askOllamaWithResumeAndOffer(resume, offer);
    if (!rawResult) continue;

    const cleanedResult = cleanJsonResponse(rawResult);

    try {
      const { matchScore, feedback, isStrongMatch } = JSON.parse(cleanedResult);

      await Offer.updateOne(
        { _id: offer._id },
        {
          $set: {
            matchScore,
            feedback,
            isStrongMatch
          }
        }
      );
      console.log(`✅ Offer ${offer._id} updated with feedback and score.`);
    } catch (err) {
      console.error(`❌ Failed to parse or update offer ${offer._id}`, err.message);
    }
  }

  return { message: 'Matching complete' };
}


async function clearMatchedOffers(userEmail) {
  const offers = await Offer.find({ userEmail });

  for (const offer of offers) {
    // Skip if fields are already not set
    if (
      offer.matchScore === undefined &&
      offer.feedback === undefined &&
      offer.isStrongMatch === undefined
    ) {
      console.log(`⏭️ Offer ${offer._id} has no extra fields. Skipping...`);
      continue;
    }

    try {
      await Offer.updateOne(
        { _id: offer._id },
        {
          $unset: {
            matchScore: "",
            feedback: "",
            isStrongMatch: ""
          }
        }
      );
      console.log(`🧹 Offer ${offer._id} cleaned.`);
    } catch (err) {
      console.error(`❌ Failed to clean offer ${offer._id}`, err.message);
    }
  }

  return { message: 'Clearing complete' };
}

async function generateCoverLetter(resume, offer) {
  const prompt = `
You are a professional career assistant.

Given the following RESUME and JOB OFFER, write a personalized, professional cover letter. 
The letter should:
- Be tailored specifically to the job offer.
- Highlight the candidate's most relevant skills, experience, and achievements.
- Show enthusiasm for the role and company.
- Use a formal but engaging tone.
- Be around 250-350 words.
- Do not include placeholders (like [Company Name]) — use information from the offer if available.

RESUME:
${JSON.stringify(resume)}

JOB OFFER:
${JSON.stringify(offer)}

Return only the cover letter text, no JSON, no extra formatting.
`;

  try {
    const response = await axios.post(`${process.env.OLLAMA_ENDPOINT}`, {
      model: 'gemma3:1b', // or llama2, mixtral, etc.
      prompt: prompt,
      stream: false
    },
      {
        timeout: 600000       // 10 minutes in milliseconds
      }
    );

    return response.data.response.trim();
  } catch (error) {
    console.error('Error calling Ollama:', error.message);
    return null;
  }
}




function cleanJsonResponse(text) {
  return text
    .replace(/^```json\s*/i, '')  // Remove ```json at start (case-insensitive)
    .replace(/^```/, '')          // Or plain ```
    .replace(/```$/, '')          // Remove closing ```
    .trim();
}


module.exports = { askOllama, analyzeCVDetailed, askOllamaWithResumeAndOffer, matchOffersToResume, clearMatchedOffers, generateCoverLetter };
