const axios = require('axios');
require('dotenv').config();
const AI_API_KEY = process.env.GEMINI_API_KEY;

const run = async () => {
    try {
        const response = await axios.post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${AI_API_KEY}`, {
            systemInstruction: {
                parts: [{ text: "You are an expert resume writer. Generate a professional, ATS-friendly resume based on the user's requirements. CRITICAL INSTRUCTION: Generate the content using highly natural, humanized language. Avoid robotic AI phrasing, predictable sentence structures, and empty buzzwords. The resume must sound completely authentic, genuine, and as if a real human professional wrote it. Return the resume as a JSON object with sections: personalInfo, summary, experience, education, skills, certifications, projects." }]
            },
            contents: [{
                parts: [{ text: "Software engineer" }]
            }],
            generationConfig: {
                temperature: 0.7,
                responseMimeType: "application/json"
            }
        });

        console.log(response.data.candidates[0].content.parts[0].text);
    } catch (err) {
        console.error(err.response ? err.response.data : err.message);
    }
}
run();
