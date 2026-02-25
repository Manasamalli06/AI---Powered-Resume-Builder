const axios = require('axios');

async function testBackend() {
    try {
        // Register or login first to get token
        const user = { email: 'test.gemini@example.com', password: 'Password1!', fullName: 'Test User' };

        let token;
        try {
            await axios.post('http://localhost:5000/api/auth/register', user);
        } catch (e) { } // ignore if already exists

        const loginRes = await axios.post('http://localhost:5000/api/auth/login', { email: user.email, password: user.password });
        token = loginRes.data.token;

        // Make AI request
        const aiRes = await axios.post('http://localhost:5000/api/generate-resume', {
            prompt: 'Test prompt software engineer'
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log("SUCCESS");
        console.log(aiRes.data);
    } catch (err) {
        console.error("ERROR:");
        console.error(err.response ? err.response.data : err.message);
    }
}
testBackend();
