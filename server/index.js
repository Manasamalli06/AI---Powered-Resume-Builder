const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('./db');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key';

// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Access denied' }); // Changed to 401 conceptually but let's keep it robust

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid token' });
        req.user = user;
        next();
    });
};

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
    const { email, password, fullName } = req.body;

    // Password validation
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < 8 || !hasLetter || !hasNumber || !hasSymbol) {
        return res.status(400).json({ error: 'Password must be at least 8 characters and contain letters, numbers, and symbols' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await pool.query(
            'INSERT INTO users (email, password, full_name) VALUES (?, ?, ?)',
            [email, hashedPassword, fullName]
        );
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Registration failed or user already exists' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) return res.status(400).json({ error: 'User not found' });

        const user = users[0];
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(400).json({ error: 'Invalid password' });

        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
        res.json({ token, user: { id: user.id, email: user.email, fullName: user.full_name } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Resume Routes
app.get('/api/resumes', authenticateToken, async (req, res) => {
    try {
        const [resumes] = await pool.query('SELECT * FROM resumes WHERE user_id = ? ORDER BY created_at DESC', [req.user.id]);

        // Ensure content is parsed if the DB returned it as a string
        const parsedResumes = resumes.map(r => {
            let parsedContent = r.content;
            if (typeof r.content === 'string') {
                try {
                    parsedContent = JSON.parse(r.content);
                } catch (e) { }
            }
            return { ...r, content: parsedContent };
        });

        res.json(parsedResumes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch resumes' });
    }
});

app.post('/api/resumes', authenticateToken, async (req, res) => {
    const { title, prompt, content } = req.body;
    try {
        const [result] = await pool.query(
            'INSERT INTO resumes (user_id, title, prompt, content) VALUES (?, ?, ?, ?)',
            [req.user.id, title, prompt, JSON.stringify(content)]
        );
        res.status(201).json({ id: result.insertId, title, prompt, content });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create resume' });
    }
});

app.put('/api/resumes/:id', authenticateToken, async (req, res) => {
    const { title, content, prompt } = req.body;
    try {
        await pool.query(
            'UPDATE resumes SET title = ?, content = ?, prompt = ? WHERE id = ? AND user_id = ?',
            [title, JSON.stringify(content), prompt, req.params.id, req.user.id]
        );
        res.json({ message: 'Resume updated' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update resume' });
    }
});

app.delete('/api/resumes/:id', authenticateToken, async (req, res) => {
    try {
        await pool.query(
            'DELETE FROM resumes WHERE id = ? AND user_id = ?',
            [req.params.id, req.user.id]
        );
        res.json({ message: 'Resume deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete resume' });
    }
});

// AI Generation Logic (Ported from Supabase Function)
app.post('/api/generate-resume', authenticateToken, async (req, res) => {
    const { prompt, existingResume } = req.body;
    const AI_API_KEY = process.env.GEMINI_API_KEY;

    if (!AI_API_KEY) return res.status(500).json({ error: 'GEMINI_API_KEY not configured' });

    try {
        const systemPrompt = existingResume
            ? `You are an expert resume writer. The user has an existing resume and wants to make changes to it.
              Here is their current resume: ${JSON.stringify(existingResume, null, 2)}
              Based on their edit request, update the resume accordingly.
              CRITICAL INSTRUCTION: Generate the content using highly natural, humanized language. Avoid robotic AI phrasing, predictable sentence structures, and empty buzzwords. The resume must sound completely authentic, genuine, and as if a real human professional wrote it.
              Return the COMPLETE updated resume in the exact same JSON format.`
            : `You are an expert resume writer. Generate a professional, ATS-friendly resume based on the user's requirements.
              CRITICAL INSTRUCTION: Generate the content using highly natural, humanized language. Avoid robotic AI phrasing, predictable sentence structures, and empty buzzwords. The resume must sound completely authentic, genuine, and as if a real human professional wrote it.
              Return the resume as a JSON object with sections: personalInfo, summary, experience, education, skills, certifications, projects.`;

        const response = await axios.post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${AI_API_KEY}`, {
            systemInstruction: {
                parts: [{ text: systemPrompt }]
            },
            contents: [{
                parts: [{ text: prompt }]
            }],
            generationConfig: {
                temperature: 0.7,
                responseMimeType: "application/json"
            }
        });

        if (!response.data.candidates || !response.data.candidates[0] || !response.data.candidates[0].content) {
            console.error("Gemini returned invalid response: ", JSON.stringify(response.data));
            return res.status(500).json({ error: 'AI blocked the content or returned empty response' });
        }

        const generatedContent = response.data.candidates[0].content.parts[0].text;

        let cleanContent = generatedContent;
        // Clean markdown JSON ticks just in case, though responseMimeType usually prevents them
        cleanContent = cleanContent.replace(/^```json/i, '').replace(/```$/i, '').trim();

        try {
            const resumeData = JSON.parse(cleanContent);
            res.json({ resumeData });
        } catch (parseError) {
            console.error("JSON Parse Error:", parseError);
            console.error("Raw Content:", cleanContent);
            res.status(500).json({ error: 'AI generated invalid formatting' });
        }
    } catch (error) {
        console.error('AI Error:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: error.response?.data?.error?.message || 'AI Generation failed' });
    }
});


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
